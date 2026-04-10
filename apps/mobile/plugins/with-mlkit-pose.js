/**
 * Expo config plugin: injects custom VisionCamera v4 ML Kit Pose frame processor.
 *
 * 1. Copies Swift plugin + ObjC registerer + bridging header into iOS project
 * 2. Adds them to the Xcode project (.pbxproj)
 * 3. Adds GoogleMLKit/PoseDetection pod to Podfile
 * 4. Sets bridging header in build settings
 */
const {
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SWIFT_FILE = 'PoseDetectionPlugin.swift';
const OBJC_FILE = 'PoseDetectionPluginRegisterer.m';
const BRIDGING_HEADER = 'PoseDetectionPlugin-Bridging-Header.h';

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

      for (const file of [SWIFT_FILE, OBJC_FILE, BRIDGING_HEADER]) {
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
              "  pod 'GoogleMLKit/PoseDetection', '~> 7.0.0'\n" +
              podfile.slice(insertAt);
            fs.writeFileSync(podfilePath, podfile, 'utf8');
            console.log('[with-mlkit-pose] Added ML Kit pod to Podfile');
          }
        }
      }

      return cfg;
    },
  ]);

  // Step 2: Add files to Xcode project + bridging header
  config = withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const projectName = cfg.modRequest.projectName;

    // Find the app group key by name
    const appGroupKey = project.findPBXGroupKey({ name: projectName });

    // Add source files
    for (const file of [SWIFT_FILE, OBJC_FILE]) {
      const filePath = `${projectName}/${file}`;
      if (!project.hasFile(filePath)) {
        project.addSourceFile(filePath, { target: project.getFirstTarget().uuid }, appGroupKey);
        console.log(`[with-mlkit-pose] Added ${file} to Xcode project`);
      }
    }

    // Add header file (not compiled)
    const headerPath = `${projectName}/${BRIDGING_HEADER}`;
    if (!project.hasFile(headerPath)) {
      project.addHeaderFile(headerPath, {}, appGroupKey);
      console.log(`[with-mlkit-pose] Added ${BRIDGING_HEADER}`);
    }

    // Set bridging header in all build configurations
    const buildConfigs = project.pbxXCBuildConfigurationSection();
    for (const key in buildConfigs) {
      const bc = buildConfigs[key];
      if (bc.buildSettings && bc.buildSettings.PRODUCT_NAME) {
        bc.buildSettings.SWIFT_OBJC_BRIDGING_HEADER =
          `"${projectName}/${BRIDGING_HEADER}"`;
      }
    }
    console.log('[with-mlkit-pose] Set bridging header');

    return cfg;
  });

  return config;
}

module.exports = withMlkitPose;
