//
//  VoiceEngine.swift
//  FitAI — hardware-AEC voice coaching pipeline
//
//  Replaces expo-audio (TTS playback) + expo-speech-recognition (mic input)
//  with a single shared AVAudioEngine. Enabling voiceProcessingEnabled on
//  the input node routes audio through Apple's VoiceProcessingIO audio unit,
//  which subtracts known speaker output from mic input IN HARDWARE before
//  our recognition tap sees the signal. This is what eliminates the echo
//  loop that Voice Coaching v2 software gates could only mitigate.
//
//  JS is exposed via RCT_EXTERN_MODULE from VoiceEngineBridge.m — this
//  Swift file provides the @objc methods and inherits RCTEventEmitter for
//  the recognition + playback event stream.
//

import Foundation
import AVFoundation
import Speech
import React

@objc(VoiceEngine)
public class VoiceEngine: RCTEventEmitter {

  // MARK: - State
  private let engine = AVAudioEngine()
  private let playerNode = AVAudioPlayerNode()
  private var isEngineStarted = false
  private var isTapInstalled = false

  private var speechRecognizer: SFSpeechRecognizer?
  private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
  private var recognitionTask: SFSpeechRecognitionTask?
  private var isRecognitionContinuous = false

  // MARK: - RCT boilerplate
  @objc
  public override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc
  public override func supportedEvents() -> [String]! {
    return [
      "playbackFinished",
      "recognitionResult",
      "recognitionEnd",
      "recognitionError",
    ]
  }

  public override init() {
    super.init()
  }

  // MARK: - Engine lifecycle (private)

  /// Configures the audio session, enables voice processing on the input node,
  /// attaches the player node, connects the graph, and starts the engine.
  /// Called lazily on first play() or startRecognition() — avoids doing any
  /// audio work until the user actually interacts with voice coaching.
  private func ensureEngineStarted() throws {
    if isEngineStarted { return }

    // 1. Audio session: playAndRecord lets us simultaneously play TTS and
    //    record mic input. DefaultToSpeaker routes playback to the loud
    //    speaker (not the earpiece). Bluetooth options allow headsets.
    let session = AVAudioSession.sharedInstance()
    try session.setCategory(
      .playAndRecord,
      mode: .default,
      options: [.defaultToSpeaker, .allowBluetoothA2DP, .allowBluetooth]
    )
    try session.setActive(true, options: [])

    // 2. Enable voice processing on the input node BEFORE start() —
    //    this is what engages the VoiceProcessingIO audio unit (hardware AEC).
    //    Apple's doc explicitly requires this to be set pre-start.
    try engine.inputNode.setVoiceProcessingEnabled(true)

    // 3. Attach player node and connect it into the graph so its output
    //    is routed through the mixer → output → speaker. The fact that
    //    playback goes through the same engine as the mic input is what
    //    lets the VoiceProcessingIO unit know what to subtract.
    engine.attach(playerNode)
    engine.connect(playerNode, to: engine.mainMixerNode, format: nil)

    // 4. Start the engine. After this point, playerNode can be scheduled
    //    and the input node's tap (installed on first startRecognition)
    //    will receive buffers with echo removed.
    try engine.start()
    playerNode.play()
    isEngineStarted = true

    NSLog("[VoiceEngine] Engine started with voice processing enabled")
  }

  // MARK: - Playback

  @objc
  public func play(
    _ base64: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      try ensureEngineStarted()

      // ElevenLabs TTS comes back as MP3 bytes in base64. AVAudioPlayerNode
      // can only schedule AVAudioPCMBuffer, so we need to decode the MP3
      // into a PCM buffer. The simplest cross-format path is to write the
      // bytes to a temp file and read them back via AVAudioFile, which
      // handles MP3 / AAC / WAV decoding transparently.
      guard let data = Data(base64Encoded: base64) else {
        reject("E_BASE64", "Invalid base64 input", nil)
        return
      }

      let tempURL = FileManager.default.temporaryDirectory
        .appendingPathComponent("fitai-voice-\(UUID().uuidString).mp3")
      try data.write(to: tempURL)

      let audioFile = try AVAudioFile(forReading: tempURL)
      let frameCount = AVAudioFrameCount(audioFile.length)
      guard let buffer = AVAudioPCMBuffer(
        pcmFormat: audioFile.processingFormat,
        frameCapacity: frameCount
      ) else {
        try? FileManager.default.removeItem(at: tempURL)
        reject("E_BUFFER", "Failed to allocate AVAudioPCMBuffer", nil)
        return
      }
      try audioFile.read(into: buffer)

      // Stop any previous buffer before scheduling a new one — mirrors the
      // voice-coach.ts queue discipline where only one phrase plays at a time.
      playerNode.stop()
      playerNode.play()

      // Schedule buffer with completion callback. The callback fires whether
      // playback completes naturally OR is interrupted by stop() — we treat
      // both as "playback finished" from the JS layer's perspective.
      playerNode.scheduleBuffer(buffer, at: nil, options: []) { [weak self] in
        try? FileManager.default.removeItem(at: tempURL)
        DispatchQueue.main.async {
          self?.sendEvent(withName: "playbackFinished", body: nil)
        }
      }

      resolve(nil)
    } catch {
      NSLog("[VoiceEngine] play() error: \(error.localizedDescription)")
      reject("E_PLAY", error.localizedDescription, error)
    }
  }

  @objc
  public func stopPlayback() {
    playerNode.stop()
    // Note: the buffer completion handler fires after stop(), so
    // playbackFinished event is emitted there — no need to emit here.
  }

  // MARK: - Speech recognition

  @objc
  public func startRecognition(
    _ lang: String,
    continuous: Bool,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Request authorization on first use. SFSpeechRecognizer will fail
    // silently if this hasn't been granted.
    SFSpeechRecognizer.requestAuthorization { [weak self] status in
      DispatchQueue.main.async {
        guard status == .authorized else {
          reject("E_PERMISSION", "Speech recognition not authorized", nil)
          return
        }
        AVAudioSession.sharedInstance().requestRecordPermission { granted in
          DispatchQueue.main.async {
            guard granted else {
              reject("E_PERMISSION", "Microphone not authorized", nil)
              return
            }
            self?.startRecognitionInternal(
              lang: lang,
              continuous: continuous,
              resolve: resolve,
              reject: reject
            )
          }
        }
      }
    }
  }

  private func startRecognitionInternal(
    lang: String,
    continuous: Bool,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      try ensureEngineStarted()

      // Cancel any previous recognition session before starting a new one.
      // Two concurrent recognitionTasks would contend for the mic tap.
      recognitionTask?.cancel()
      recognitionTask = nil
      recognitionRequest = nil

      let locale = Locale(identifier: lang)
      guard let recognizer = SFSpeechRecognizer(locale: locale) else {
        reject("E_RECOGNIZER", "SFSpeechRecognizer unavailable for locale \(lang)", nil)
        return
      }
      guard recognizer.isAvailable else {
        reject("E_UNAVAILABLE", "Speech recognizer not available", nil)
        return
      }
      self.speechRecognizer = recognizer
      self.isRecognitionContinuous = continuous

      let request = SFSpeechAudioBufferRecognitionRequest()
      request.shouldReportPartialResults = true
      if #available(iOS 16.0, *) {
        request.addsPunctuation = true
      }
      self.recognitionRequest = request

      // Install the tap once per engine lifetime. The tap forwards every
      // audio buffer from the input node (AFTER hardware AEC has run) to
      // the recognition request.
      if !isTapInstalled {
        let inputNode = engine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: inputFormat) { [weak self] buffer, _ in
          self?.recognitionRequest?.append(buffer)
        }
        isTapInstalled = true
      }

      // Start the recognition task. Results arrive via the callback — we
      // forward them to JS as events.
      recognitionTask = recognizer.recognitionTask(with: request) { [weak self] result, error in
        guard let self = self else { return }

        if let result = result {
          let transcript = result.bestTranscription.formattedString
          let isFinal = result.isFinal
          DispatchQueue.main.async {
            self.sendEvent(
              withName: "recognitionResult",
              body: ["transcript": transcript, "isFinal": isFinal]
            )
          }
          if isFinal {
            self.finishRecognition()
          }
        }

        if let error = error {
          DispatchQueue.main.async {
            self.sendEvent(
              withName: "recognitionError",
              body: ["message": error.localizedDescription]
            )
          }
          self.finishRecognition()
        }
      }

      NSLog("[VoiceEngine] Recognition started (lang=\(lang), continuous=\(continuous))")
      resolve(nil)
    } catch {
      NSLog("[VoiceEngine] startRecognition() error: \(error.localizedDescription)")
      reject("E_START_RECOGNITION", error.localizedDescription, error)
    }
  }

  @objc
  public func stopRecognition() {
    recognitionRequest?.endAudio()
    recognitionTask?.cancel()
    finishRecognition()
  }

  private func finishRecognition() {
    recognitionTask = nil
    recognitionRequest = nil
    DispatchQueue.main.async { [weak self] in
      self?.sendEvent(withName: "recognitionEnd", body: nil)
    }
  }

  // MARK: - Cleanup

  @objc
  public override func invalidate() {
    super.invalidate()
    stopPlayback()
    stopRecognition()
    if isTapInstalled {
      engine.inputNode.removeTap(onBus: 0)
      isTapInstalled = false
    }
    if engine.isRunning {
      engine.stop()
    }
    isEngineStarted = false
  }
}
