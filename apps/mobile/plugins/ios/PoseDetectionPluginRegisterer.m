#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import "FitAI-Swift.h"

@interface PoseDetectionPlugin (FrameProcessorPluginLoader)
@end

@implementation PoseDetectionPlugin (FrameProcessorPluginLoader)

+ (void)load {
  [FrameProcessorPluginRegistry
      addFrameProcessorPlugin:@"poseDetection"
              withInitializer:^FrameProcessorPlugin* _Nonnull(
                  VisionCameraProxyHolder* _Nonnull proxy,
                  NSDictionary* _Nullable options) {
                return [[PoseDetectionPlugin alloc] initWithProxy:proxy
                                                     withOptions:options];
              }];
}

@end
