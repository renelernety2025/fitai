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
  /// Resolved after engine.start() — the format the mixer actually wants
  /// on its input bus. On modern iPhones with voiceProcessingEnabled, this
  /// is typically float32 mono 48 kHz. We convert every TTS buffer to this
  /// format before scheduling so the mixer never sees a mismatch.
  private var playbackFormat: AVAudioFormat!

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
      "engineDebug",
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

    // Force speaker output — voiceProcessingEnabled puts iOS in VoIP mode
    // which routes audio to the earpiece by default. .defaultToSpeaker in
    // the category options is NOT enough when VoiceProcessingIO is engaged.
    // overrideOutputAudioPort(.speaker) is the nuclear option that FaceTime
    // uses when on speaker — forces the loudspeaker regardless of mode.
    try session.overrideOutputAudioPort(.speaker)

    // 2. Enable voice processing on the input node BEFORE start() —
    //    this is what engages the VoiceProcessingIO audio unit (hardware AEC).
    //    Apple's doc explicitly requires this to be set pre-start.
    try engine.inputNode.setVoiceProcessingEnabled(true)

    // 3. Attach player node and connect into the graph with nil format.
    //    nil tells the engine "negotiate the format yourself based on the
    //    hardware." When voiceProcessingEnabled is true, the engine pins
    //    the graph to whatever format VoiceProcessingIO dictates (48 kHz
    //    mono float32 on modern iPhones). We used to force a specific
    //    format here, but:
    //    - int16 mono 16 kHz → mixer silently produced silence (mixers
    //      require float32)
    //    - float32 mono 16 kHz → silence (sample rate mismatch: engine
    //      graph is 48 kHz, mixer drops frames)
    //    nil-format + dynamically queried playbackFormat (step 5) is the
    //    only robust path: we let the engine decide, then conform our
    //    buffers to whatever it chose.
    engine.attach(playerNode)
    engine.connect(playerNode, to: engine.mainMixerNode, format: nil)

    // 4. Start the engine. After this point, playerNode can be scheduled
    //    and the input node's tap (installed on first startRecognition)
    //    will receive buffers with echo removed.
    try engine.start()
    playerNode.play()

    // 5. Query the resolved format AFTER start. This is whatever the
    //    engine negotiated for the playerNode→mixer bus. Every buffer we
    //    schedule must match this format exactly — the play() method uses
    //    AVAudioConverter to transcode from ElevenLabs pcm_16000 (int16
    //    mono 16 kHz) to playbackFormat at runtime.
    playbackFormat = playerNode.outputFormat(forBus: 0)
    isEngineStarted = true

    let debugInfo: [String: Any] = [
      "event": "engineStarted",
      "sampleRate": playbackFormat.sampleRate,
      "channels": playbackFormat.channelCount,
      "formatType": playbackFormat.commonFormat.rawValue,
      "mixerOutputRate": engine.mainMixerNode.outputFormat(forBus: 0).sampleRate,
      "outputNodeRate": engine.outputNode.inputFormat(forBus: 0).sampleRate,
    ]
    DispatchQueue.main.async { [weak self] in
      self?.sendEvent(withName: "engineDebug", body: debugInfo)
    }
    NSLog("[VoiceEngine] Engine started — playback format: \(playbackFormat.sampleRate) Hz, \(playbackFormat.channelCount) ch, format=\(playbackFormat.commonFormat.rawValue)")
  }

  // MARK: - Playback

  /// The wire format from ElevenLabs pcm_16000: int16 mono 16 kHz.
  /// Used as the SOURCE format for AVAudioConverter in play().
  private func wireFormat() -> AVAudioFormat {
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

      guard let data = Data(base64Encoded: base64) else {
        reject("E_BASE64", "Invalid base64 input", nil)
        return
      }

      // 1. Parse raw PCM int16 mono 16 kHz from the wire
      let srcFormat = wireFormat()
      let srcFrameCount = AVAudioFrameCount(data.count / 2)
      guard srcFrameCount > 0 else {
        reject("E_EMPTY", "PCM payload has zero frames", nil)
        return
      }
      guard let srcBuffer = AVAudioPCMBuffer(
        pcmFormat: srcFormat, frameCapacity: srcFrameCount
      ) else {
        reject("E_BUFFER", "Failed to allocate source buffer", nil)
        return
      }
      srcBuffer.frameLength = srcFrameCount
      data.withUnsafeBytes { (rawPtr: UnsafeRawBufferPointer) in
        if let src = rawPtr.baseAddress,
           let dst = srcBuffer.int16ChannelData?[0] {
          memcpy(dst, src, data.count)
        }
      }

      // 2. Convert to the engine's resolved playback format (typically
      //    float32 mono 48 kHz on modern iPhones with voiceProcessingEnabled).
      //    AVAudioConverter handles both the int16→float32 sample format
      //    conversion AND the 16→48 kHz sample rate conversion in one pass.
      guard let converter = AVAudioConverter(
        from: srcFormat, to: playbackFormat
      ) else {
        reject("E_CONVERTER", "AVAudioConverter init failed", nil)
        return
      }
      let ratio = playbackFormat.sampleRate / srcFormat.sampleRate
      let dstFrameCount = AVAudioFrameCount(
        ceil(Double(srcFrameCount) * ratio)
      )
      guard let dstBuffer = AVAudioPCMBuffer(
        pcmFormat: playbackFormat, frameCapacity: dstFrameCount
      ) else {
        reject("E_BUFFER", "Failed to allocate destination buffer", nil)
        return
      }

      var convError: NSError?
      var inputConsumed = false
      converter.convert(to: dstBuffer, error: &convError) { _, status in
        if inputConsumed {
          status.pointee = .endOfStream
          return nil
        }
        inputConsumed = true
        status.pointee = .haveData
        return srcBuffer
      }
      if let convError = convError {
        reject("E_CONVERT", convError.localizedDescription, convError)
        return
      }

      // 3. Emit debug info so JS Metro log shows what happened
      //    Include first 4 samples from dst buffer to check if converter
      //    produced real audio or just zeros (silence diagnostic).
      var firstSamples = [Float]()
      if let ch0 = dstBuffer.floatChannelData?[0] {
        for i in 0..<min(4, Int(dstBuffer.frameLength)) {
          firstSamples.append(ch0[i])
        }
      }
      let route = AVAudioSession.sharedInstance().currentRoute
      let outputPort = route.outputs.first?.portName ?? "unknown"
      let outputType = route.outputs.first?.portType.rawValue ?? "unknown"

      let playDebug: [String: Any] = [
        "event": "play",
        "srcFrames": srcFrameCount,
        "srcRate": srcFormat.sampleRate,
        "dstFrames": dstBuffer.frameLength,
        "dstRate": playbackFormat.sampleRate,
        "dstChannels": playbackFormat.channelCount,
        "ratio": ratio,
        "convertError": convError?.localizedDescription ?? "none",
        "playerIsPlaying": playerNode.isPlaying,
        "firstSamples": firstSamples.map { String(format: "%.6f", $0) },
        "outputPort": outputPort,
        "outputType": outputType,
      ]
      DispatchQueue.main.async { [weak self] in
        self?.sendEvent(withName: "engineDebug", body: playDebug)
      }

      // 4. Schedule the correctly-formatted buffer
      playerNode.stop()
      playerNode.play()
      playerNode.scheduleBuffer(dstBuffer, at: nil, options: []) { [weak self] in
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
