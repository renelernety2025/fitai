Pod::Spec.new do |s|
  s.name         = "FitAIPoseDetection"
  s.version      = "1.0.0"
  s.summary      = "ML Kit Pose Detection frame processor for VisionCamera v4"
  s.homepage     = "https://github.com/renelernety2025/fitai"
  s.license      = "MIT"
  s.author       = "FitAI"
  s.source       = { :path => "." }
  s.platforms    = { :ios => "16.0" }

  s.source_files = "*.m"

  s.dependency "VisionCamera"
  s.dependency "GoogleMLKit/PoseDetection"

  # Enable clang modules so @import works
  s.pod_target_xcconfig = {
    'CLANG_ENABLE_MODULES' => 'YES',
    'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES' => 'YES',
  }
end
