import VisionCamera
import MLKitPoseDetection
import MLKitPoseDetectionCommon
import MLKitVision

@objc(PoseDetectionPlugin)
public class PoseDetectionPlugin: FrameProcessorPlugin {
  private static var detector: PoseDetector = {
    let options = PoseDetectorOptions()
    options.detectorMode = .stream
    return PoseDetector.poseDetector(options: options)
  }()

  public override func callback(
    _ frame: Frame,
    withArguments arguments: [AnyHashable: Any]?
  ) -> Any? {
    let image = VisionImage(buffer: frame.buffer)
    image.orientation = frame.orientation

    guard let poses = try? PoseDetectionPlugin.detector.results(in: image),
          let pose = poses.first else {
      return nil
    }

    var data: [String: Any] = [:]

    let landmarks: [(String, PoseLandmarkType)] = [
      ("nosePosition", .nose),
      ("leftEyeInnerPosition", .leftEyeInner),
      ("leftEyePosition", .leftEye),
      ("leftEyeOuterPosition", .leftEyeOuter),
      ("rightEyeInnerPosition", .rightEyeInner),
      ("rightEyePosition", .rightEye),
      ("rightEyeOuterPosition", .rightEyeOuter),
      ("leftEarPosition", .leftEar),
      ("rightEarPosition", .rightEar),
      ("leftMouthPosition", .mouthLeft),
      ("rightMouthPosition", .mouthRight),
      ("leftShoulderPosition", .leftShoulder),
      ("rightShoulderPosition", .rightShoulder),
      ("leftElbowPosition", .leftElbow),
      ("rightElbowPosition", .rightElbow),
      ("leftWristPosition", .leftWrist),
      ("rightWristPosition", .rightWrist),
      ("leftPinkyPosition", .leftPinkyFinger),
      ("rightPinkyPosition", .rightPinkyFinger),
      ("leftIndexPosition", .leftIndexFinger),
      ("rightIndexPosition", .rightIndexFinger),
      ("leftThumbPosition", .leftThumb),
      ("rightThumbPosition", .rightThumb),
      ("leftHipPosition", .leftHip),
      ("rightHipPosition", .rightHip),
      ("leftKneePosition", .leftKnee),
      ("rightKneePosition", .rightKnee),
      ("leftAnklePosition", .leftAnkle),
      ("rightAnklePosition", .rightAnkle),
      ("leftHeelPosition", .leftHeel),
      ("rightHeelPosition", .rightHeel),
      ("leftFootIndexPosition", .leftToe),
      ("rightFootIndexPosition", .rightToe),
    ]

    for (key, type) in landmarks {
      let lm = pose.landmark(ofType: type)
      if lm.inFrameLikelihood > 0.5 {
        data[key] = [
          "x": lm.position.x,
          "y": lm.position.y,
        ]
      }
    }

    // Include frame dimensions for coordinate normalization
    data["_frameWidth"] = frame.width
    data["_frameHeight"] = frame.height

    return data
  }
}
