/**
 * Expo config plugin: injects custom VisionCamera v4 ML Kit Pose frame processor.
 *
 * 1. Copies Swift plugin + ObjC registerer into iOS project
 * 2. Adds them to the Xcode project (.pbxproj)
 * 3. Adds GoogleMLKit/PoseDetection pod to Podfile
 *
 * No bridging header needed — Swift uses `import VisionCamera` (module import),
 * ObjC uses `#import <VisionCamera/...>` (framework import after pod install).
 */
const {
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const OBJC_FILE = 'PoseDetectionPlugin.m';

function withMlkitPose(config) {
  // Step 1: Copy native files + add ML Kit pod
  config = withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const pluginIosDir = path.join(projectRoot, 'plugins', 'ios');
      const targetDir = path.join(
        cfg.modRequest.platformProjectRoot,
        cfg.modRequest.projectName,
      );

      for (const file of [OBJC_FILE]) {
        const src = path.join(pluginIosDir, file);
        const dst = path.join(targetDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst);
          console.log(`[with-mlkit-pose] Copied ${file}`);
        }
      }

      // Add ML Kit pod
      const podfilePath = path.join(
        cfg.modRequest.platformProjectRoot,
        'Podfile',
      );
      if (fs.existsSync(podfilePath)) {
        let podfile = fs.readFileSync(podfilePath, 'utf8');
        if (!podfile.includes('GoogleMLKit/PoseDetection')) {
          const marker = 'use_expo_modules!';
          const idx = podfile.indexOf(marker);
          if (idx !== -1) {
            const insertAt = podfile.indexOf('\n', idx) + 1;
            podfile =
              podfile.slice(0, insertAt) +
              "  pod 'GoogleMLKit/PoseDetection'\n" +
              podfile.slice(insertAt);
            fs.writeFileSync(podfilePath, podfile, 'utf8');
            console.log('[with-mlkit-pose] Added ML Kit pod to Podfile');
          }
        }
      }

      return cfg;
    },
  ]);

  // Step 2: Add source files to Xcode project + header search paths
  config = withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const projectName = cfg.modRequest.projectName;
    const appGroupKey = project.findPBXGroupKey({ name: projectName });

    for (const file of [OBJC_FILE]) {
      const filePath = `${projectName}/${file}`;
      if (!project.hasFile(filePath)) {
        project.addSourceFile(filePath, { target: project.getFirstTarget().uuid }, appGroupKey);
        console.log(`[with-mlkit-pose] Added ${file} to Xcode project`);
      }
    }

    // Add VisionCamera headers to search path so #import works
    const buildConfigs = project.pbxXCBuildConfigurationSection();
    for (const key in buildConfigs) {
      const bc = buildConfigs[key];
      if (bc.buildSettings && bc.buildSettings.PRODUCT_NAME) {
        const existing = bc.buildSettings.HEADER_SEARCH_PATHS || ['$(inherited)'];
        const paths = Array.isArray(existing) ? existing : [existing];
        if (!paths.some((p) => typeof p === 'string' && p.includes('VisionCamera'))) {
          paths.push('"${PODS_ROOT}/Headers/Public/VisionCamera"');
          bc.buildSettings.HEADER_SEARCH_PATHS = paths;
        }
      }
    }
    console.log('[with-mlkit-pose] Added VisionCamera header search paths');

    return cfg;
  });

  return config;
}

module.exports = withMlkitPose;
