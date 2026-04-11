Pod::Spec.new do |s|
  s.name         = "VoiceEngine"
  s.version      = "1.0.0"
  s.summary      = "Hardware-AEC voice coaching pipeline via AVAudioEngine"
  s.description  = <<-DESC
    Unified Swift native module that replaces expo-audio + expo-speech-recognition
    for FitAI's voice coaching. Routes TTS playback and mic input through a single
    AVAudioEngine with inputNode.setVoiceProcessingEnabled(true), engaging iOS
    hardware Acoustic Echo Cancellation (VoiceProcessingIO audio unit). This
    physically subtracts speaker output from mic input before our recognition tap
    sees the signal, eliminating the echo loop that software gates in
    Voice Coaching v2 could only mitigate.
  DESC
  s.homepage     = "https://github.com/renelernety2025/fitai"
  s.license      = "MIT"
  s.author       = "FitAI"
  s.source       = { :path => "." }
  s.platforms    = { :ios => "16.0" }
  s.swift_version = "5.0"

  s.source_files = "*.swift", "*.m"

  # React-Core gives us RCTEventEmitter + RCT_EXTERN_MODULE.
  # AVFoundation + Speech are system frameworks, auto-linked by the `.frameworks`
  # declaration below so we don't need any external CocoaPods dependencies.
  s.dependency "React-Core"
  s.frameworks = "AVFoundation", "Speech"

  s.pod_target_xcconfig = {
    'CLANG_ENABLE_MODULES' => 'YES',
    'DEFINES_MODULE' => 'YES',
  }
end
