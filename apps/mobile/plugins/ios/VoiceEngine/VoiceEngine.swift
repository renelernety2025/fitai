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
    //    is routed through the mixer → output → speaker. Connect with
    //    an EXPLICIT int16 mono 16 kHz format so scheduleBuffer() always
    //    matches the player node's declared output format — nil-format
    //    connect was the source of the b2a8bba crash because the
    //    AVAudioFile-decoded buffers came back as 44.1 kHz stereo float32
    //    while VoiceProcessingIO pinned the engine to 16 kHz mono, and
    //    AVAudioEngine hard-asserted on the mismatch. Mixer handles the
    //    downstream conversion to hwFormat automatically.
    engine.attach(playerNode)
    engine.connect(playerNode, to: engine.mainMixerNode, format: ttsFormat())

    // 4. Start the engine. After this point, playerNode can be scheduled
    //    and the input node's tap (installed on first startRecognition)
    //    will receive buffers with echo removed.
    try engine.start()
    playerNode.play()
    isEngineStarted = true

    NSLog("[VoiceEngine] Engine started with voice processing enabled")
  }

  // MARK: - Playback

  /// Shared PCM format for all TTS audio: int16 mono 16 kHz, matching the
  /// hardware format that VoiceProcessingIO forces onto the engine graph.
  /// Using a mismatched format (e.g. 44.1 kHz stereo from an MP3 decode)
  /// causes AVAudioEngine to hard-assert inside CoreAudio, which is NOT
  /// catchable in Swift — the app crashes. The fix is to never let a
  /// mismatched buffer touch the player node in the first place.
  private func ttsFormat() -> AVAudioFormat {
    return AVAudioFormat(
      commonFormat: .pcmFormatInt16,
      sampleRate: 16000,
      channels: 1,
      interleaved: true
    )!
  }

  @objc
  public func play(
    _ base64: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      try ensureEngineStarted()

      // Backend returns raw PCM 16 kHz mono int16 (ElevenLabs
      // output_format=pcm_16000). We do NOT decode MP3 or hit AVAudioFile
      // any more — those paths forced a format mismatch with the
      // VoiceProcessingIO audio unit and crashed the engine.
      guard let data = Data(base64Encoded: base64) else {
        reject("E_BASE64", "Invalid base64 input", nil)
        return
      }

      let format = ttsFormat()
      let frameCount = AVAudioFrameCount(data.count / 2) // int16 = 2 bytes/frame
      guard frameCount > 0 else {
        reject("E_EMPTY", "PCM payload has zero frames", nil)
        return
      }
      guard let buffer = AVAudioPCMBuffer(
        pcmFormat: format,
        frameCapacity: frameCount
      ) else {
        reject("E_BUFFER", "Failed to allocate AVAudioPCMBuffer", nil)
        return
      }
      buffer.frameLength = frameCount
      data.withUnsafeBytes { (rawPtr: UnsafeRawBufferPointer) in
        if let src = rawPtr.baseAddress,
           let dst = buffer.int16ChannelData?[0] {
          memcpy(dst, src, data.count)
        }
      }

      // Single-phrase semantics: stop any previous buffer, then restart.
      // voice-coach.ts queue discipline means only one phrase is live at
      // a time, so resetting the player node here is safe.
      playerNode.stop()
      playerNode.play()

      // Completion callback fires whether playback completes naturally OR
      // is interrupted by stop() — both funnel to the JS `playbackFinished`
      // listener via the same event.
      playerNode.scheduleBuffer(buffer, at: nil, options: []) { [weak self] in
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
