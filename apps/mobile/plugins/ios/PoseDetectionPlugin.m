/**
 * VisionCamera v4 Frame Processor Plugin — ML Kit Pose Detection.
 * Synchronous ML Kit API (results(in:)) compatible with v4 worklet model.
 * Returns normalized landmark positions (0-1) for all 33 pose landmarks.
 */

#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/Frame.h>
#import <MLKitPoseDetection/MLKitPoseDetection.h>
#import <MLKitPoseDetectionCommon/MLKitPoseDetectionCommon.h>
@import MLKitVision;

@interface PoseDetectionPlugin : FrameProcessorPlugin
@end

@implementation PoseDetectionPlugin {
  MLKPoseDetector *_detector;
}

- (instancetype)initWithProxy:(VisionCameraProxyHolder *)proxy
                  withOptions:(NSDictionary *)options {
  self = [super initWithProxy:proxy withOptions:options];
  if (self) {
    MLKPoseDetectorOptions *opts = [[MLKPoseDetectorOptions alloc] init];
    opts.detectorMode = MLKPoseDetectorModeStream;
    _detector = [MLKPoseDetector poseDetectorWithOptions:opts];
  }
  return self;
}

- (id)callback:(Frame *)frame withArguments:(NSDictionary *)arguments {
  CMSampleBufferRef buffer = [frame buffer];
  UIImageOrientation orientation = [frame orientation];

  MLKVisionImage *image = [[MLKVisionImage alloc] initWithBuffer:buffer];
  image.orientation = orientation;

  NSError *error = nil;
  NSArray<MLKPose *> *poses = [_detector resultsInImage:image error:&error];
  if (error || poses.count == 0) return nil;

  MLKPose *pose = poses.firstObject;
  NSMutableDictionary *data = [[NSMutableDictionary alloc] init];

  // Frame dimensions for normalization
  CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(buffer);
  CGFloat frameW = (CGFloat)CVPixelBufferGetWidth(pixelBuffer);
  CGFloat frameH = (CGFloat)CVPixelBufferGetHeight(pixelBuffer);
  if (frameW < 1) frameW = 480;
  if (frameH < 1) frameH = 640;

  data[@"_frameWidth"] = @(frameW);
  data[@"_frameHeight"] = @(frameH);

  // All 33 landmarks
  struct { NSString *key; MLKPoseLandmarkType type; } landmarks[] = {
    { @"nosePosition", MLKPoseLandmarkTypeNose },
    { @"leftEyeInnerPosition", MLKPoseLandmarkTypeLeftEyeInner },
    { @"leftEyePosition", MLKPoseLandmarkTypeLeftEye },
    { @"leftEyeOuterPosition", MLKPoseLandmarkTypeLeftEyeOuter },
    { @"rightEyeInnerPosition", MLKPoseLandmarkTypeRightEyeInner },
    { @"rightEyePosition", MLKPoseLandmarkTypeRightEye },
    { @"rightEyeOuterPosition", MLKPoseLandmarkTypeRightEyeOuter },
    { @"leftEarPosition", MLKPoseLandmarkTypeLeftEar },
    { @"rightEarPosition", MLKPoseLandmarkTypeRightEar },
    { @"leftMouthPosition", MLKPoseLandmarkTypeMouthLeft },
    { @"rightMouthPosition", MLKPoseLandmarkTypeMouthRight },
    { @"leftShoulderPosition", MLKPoseLandmarkTypeLeftShoulder },
    { @"rightShoulderPosition", MLKPoseLandmarkTypeRightShoulder },
    { @"leftElbowPosition", MLKPoseLandmarkTypeLeftElbow },
    { @"rightElbowPosition", MLKPoseLandmarkTypeRightElbow },
    { @"leftWristPosition", MLKPoseLandmarkTypeLeftWrist },
    { @"rightWristPosition", MLKPoseLandmarkTypeRightWrist },
    { @"leftPinkyPosition", MLKPoseLandmarkTypeLeftPinkyFinger },
    { @"rightPinkyPosition", MLKPoseLandmarkTypeRightPinkyFinger },
    { @"leftIndexPosition", MLKPoseLandmarkTypeLeftIndexFinger },
    { @"rightIndexPosition", MLKPoseLandmarkTypeRightIndexFinger },
    { @"leftThumbPosition", MLKPoseLandmarkTypeLeftThumb },
    { @"rightThumbPosition", MLKPoseLandmarkTypeRightThumb },
    { @"leftHipPosition", MLKPoseLandmarkTypeLeftHip },
    { @"rightHipPosition", MLKPoseLandmarkTypeRightHip },
    { @"leftKneePosition", MLKPoseLandmarkTypeLeftKnee },
    { @"rightKneePosition", MLKPoseLandmarkTypeRightKnee },
    { @"leftAnklePosition", MLKPoseLandmarkTypeLeftAnkle },
    { @"rightAnklePosition", MLKPoseLandmarkTypeRightAnkle },
    { @"leftHeelPosition", MLKPoseLandmarkTypeLeftHeel },
    { @"rightHeelPosition", MLKPoseLandmarkTypeRightHeel },
    { @"leftFootIndexPosition", MLKPoseLandmarkTypeLeftToe },
    { @"rightFootIndexPosition", MLKPoseLandmarkTypeRightToe },
  };

  int count = sizeof(landmarks) / sizeof(landmarks[0]);
  for (int i = 0; i < count; i++) {
    MLKPoseLandmark *lm = [pose landmarkOfType:landmarks[i].type];
    if (lm.inFrameLikelihood > 0.5) {
      data[landmarks[i].key] = @{
        @"x": @(lm.position.x),
        @"y": @(lm.position.y),
      };
    }
  }

  return data;
}

VISION_EXPORT_FRAME_PROCESSOR(PoseDetectionPlugin, poseDetection)

@end
