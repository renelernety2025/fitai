/**
 * Expo config plugin: ML Kit Pose Detection via local CocoaPod.
 *
 * Creates a local pod (FitAIPoseDetection) that depends on VisionCamera
 * and GoogleMLKit/PoseDetection. This ensures headers are resolved
 * correctly through CocoaPods dependency graph — no manual header
 * search path hacking needed.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withMlkitPose(config) {
  config = withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const pluginIosDir = path.join(projectRoot, 'plugins', 'ios');
      const iosDir = cfg.modRequest.platformProjectRoot;

      // Copy plugin source + podspec into ios/ directory
      const localPodDir = path.join(iosDir, 'FitAIPoseDetection');
      if (!fs.existsSync(localPodDir)) {
        fs.mkdirSync(localPodDir, { recursive: true });
      }

      // Copy .m file
      const srcM = path.join(pluginIosDir, 'PoseDetectionPlugin.m');
      const dstM = path.join(localPodDir, 'PoseDetectionPlugin.m');
      if (fs.existsSync(srcM)) {
        fs.copyFileSync(srcM, dstM);
        console.log('[with-mlkit-pose] Copied PoseDetectionPlugin.m to local pod');
      }

      // Copy podspec
      const srcSpec = path.join(pluginIosDir, 'FitAIPoseDetection.podspec');
      const dstSpec = path.join(localPodDir, 'FitAIPoseDetection.podspec');
      if (fs.existsSync(srcSpec)) {
        fs.copyFileSync(srcSpec, dstSpec);
        console.log('[with-mlkit-pose] Copied FitAIPoseDetection.podspec');
      }

      // Add local pod to Podfile
      const podfilePath = path.join(iosDir, 'Podfile');
      if (fs.existsSync(podfilePath)) {
        let podfile = fs.readFileSync(podfilePath, 'utf8');
        if (!podfile.includes('FitAIPoseDetection')) {
          const marker = 'use_expo_modules!';
          const idx = podfile.indexOf(marker);
          if (idx !== -1) {
            const insertAt = podfile.indexOf('\n', idx) + 1;
            podfile =
              podfile.slice(0, insertAt) +
              "  pod 'FitAIPoseDetection', :path => './FitAIPoseDetection'\n" +
              podfile.slice(insertAt);
            console.log('[with-mlkit-pose] Added local pod to Podfile');
          }

          // Add header search paths for FitAIPoseDetection target in post_install
          const postInstallMarker = 'post_install do |installer|';
          const piIdx = podfile.indexOf(postInstallMarker);
          if (piIdx !== -1) {
            const piInsert = podfile.indexOf('\n', piIdx) + 1;
            podfile =
              podfile.slice(0, piInsert) +
              "    # Add VisionCamera headers to FitAIPoseDetection\n" +
              "    installer.pods_project.targets.each do |target|\n" +
              "      if target.name == 'FitAIPoseDetection'\n" +
              "        target.build_configurations.each do |config|\n" +
              "          hsp = config.build_settings['HEADER_SEARCH_PATHS'] || '$(inherited)'\n" +
              "          unless hsp.include?('VisionCamera')\n" +
              "            config.build_settings['HEADER_SEARCH_PATHS'] = hsp + ' \"${PODS_ROOT}/Headers/Public/VisionCamera\"'\n" +
              "          end\n" +
              "        end\n" +
              "      end\n" +
              "    end\n" +
              podfile.slice(piInsert);
            console.log('[with-mlkit-pose] Added VisionCamera header paths in post_install');
          }

          fs.writeFileSync(podfilePath, podfile, 'utf8');
        }
      }

      return cfg;
    },
  ]);

  return config;
}

module.exports = withMlkitPose;
