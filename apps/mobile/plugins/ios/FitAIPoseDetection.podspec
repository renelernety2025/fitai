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

  s.pod_target_xcconfig = {
    'CLANG_ENABLE_MODULES' => 'YES',
    'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES' => 'YES',
    # VisionCamera doesn't expose FrameProcessorPlugin.h as public header.
    # Point directly to its source directory.
    'HEADER_SEARCH_PATHS' => '"${PODS_ROOT}/../../node_modules/react-native-vision-camera/ios/FrameProcessors" "${PODS_ROOT}/../../node_modules/react-native-vision-camera/ios/React"',
  }
end
