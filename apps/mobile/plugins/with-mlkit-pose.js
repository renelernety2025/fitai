/**
 * Expo config plugin: injects custom VisionCamera v4 ML Kit Pose frame processor.
 *
 * 1. Copies ObjC plugin into iOS project
 * 2. Adds it to the Xcode project (.pbxproj)
 * 3. Adds GoogleMLKit/PoseDetection pod to Podfile
 * 4. Adds VisionCamera header search path via Podfile post_install
 */
const {
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const OBJC_FILE = 'PoseDetectionPlugin.m';

function withMlkitPose(config) {
  // Step 1: Copy native file + modify Podfile
  config = withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const pluginIosDir = path.join(projectRoot, 'plugins', 'ios');
      const targetDir = path.join(
        cfg.modRequest.platformProjectRoot,
        cfg.modRequest.projectName,
      );

      // Copy ObjC file
      const src = path.join(pluginIosDir, OBJC_FILE);
      const dst = path.join(targetDir, OBJC_FILE);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log(`[with-mlkit-pose] Copied ${OBJC_FILE}`);
      }

      // Modify Podfile: add ML Kit pod + header search path in post_install
      const podfilePath = path.join(
        cfg.modRequest.platformProjectRoot,
        'Podfile',
      );
      if (fs.existsSync(podfilePath)) {
        let podfile = fs.readFileSync(podfilePath, 'utf8');

        // Add ML Kit pod after use_expo_modules!
        if (!podfile.includes('GoogleMLKit/PoseDetection')) {
          const marker = 'use_expo_modules!';
          const idx = podfile.indexOf(marker);
          if (idx !== -1) {
            const insertAt = podfile.indexOf('\n', idx) + 1;
            podfile =
              podfile.slice(0, insertAt) +
              "  pod 'GoogleMLKit/PoseDetection'\n" +
              podfile.slice(insertAt);
            console.log('[with-mlkit-pose] Added ML Kit pod to Podfile');
          }
        }

        // Add VisionCamera header search path in post_install
        if (!podfile.includes('VisionCamera header search')) {
          const postInstallMarker = 'react_native_post_install(';
          const idx = podfile.indexOf(postInstallMarker);
          if (idx !== -1) {
            const insertAt = podfile.lastIndexOf('\n', idx) + 1;
            const snippet = `    # VisionCamera header search path for PoseDetectionPlugin
    installer.pods_project.targets.each do |target|
      if target.name == 'FitAI'
        target.build_configurations.each do |config|
          config.build_settings['HEADER_SEARCH_PATHS'] ||= ['$(inherited)']
          unless config.build_settings['HEADER_SEARCH_PATHS'].include?('"$(PODS_ROOT)/Headers/Public/VisionCamera"')
            config.build_settings['HEADER_SEARCH_PATHS'] << '"$(PODS_ROOT)/Headers/Public/VisionCamera"'
          end
        end
      end
    end
`;
            podfile =
              podfile.slice(0, insertAt) + snippet + podfile.slice(insertAt);
            console.log('[with-mlkit-pose] Added VisionCamera header search path to post_install');
          }
        }

        fs.writeFileSync(podfilePath, podfile, 'utf8');
      }

      return cfg;
    },
  ]);

  // Step 2: Add source file to Xcode project (no header search path changes here)
  config = withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const projectName = cfg.modRequest.projectName;
    const appGroupKey = project.findPBXGroupKey({ name: projectName });

    const filePath = `${projectName}/${OBJC_FILE}`;
    if (!project.hasFile(filePath)) {
      project.addSourceFile(filePath, { target: project.getFirstTarget().uuid }, appGroupKey);
      console.log(`[with-mlkit-pose] Added ${OBJC_FILE} to Xcode project`);
    }

    return cfg;
  });

  return config;
}

module.exports = withMlkitPose;
