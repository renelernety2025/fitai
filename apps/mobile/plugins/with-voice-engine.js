/**
 * Expo config plugin: VoiceEngine native module (hardware-AEC voice coaching).
 *
 * Creates a local CocoaPod (VoiceEngine) with a Swift-based React Native
 * bridge module that exposes AVAudioEngine playback + SFSpeechRecognizer
 * input via a single shared engine with voiceProcessingEnabled = true.
 *
 * This replaces the Voice Coaching v1.x config plugin (with-audio-session)
 * by owning the audio session setup itself — VoiceEngine becomes the
 * single source of truth for FitAI's iOS audio stack.
 *
 * Idempotent: re-running prebuild is safe; already-patched outputs are
 * detected via a marker string in the Podfile. For a clean rebuild, use
 * `npx expo prebuild --clean`.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const POD_NAME = 'VoiceEngine';
const PODFILE_MARKER = `pod '${POD_NAME}'`;
const POST_INSTALL_MARKER = '# FitAI VoiceEngine: Swift setup';

// Source file names that must exist in plugins/ios/VoiceEngine/ and get
// copied into the generated ios/VoiceEngine/ directory at prebuild time.
const SOURCE_FILES = [
  'VoiceEngine.swift',
  'VoiceEngineBridge.m',
  'VoiceEngine.podspec',
];

function withVoiceEngine(config) {
  config = withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const pluginIosDir = path.join(projectRoot, 'plugins', 'ios', POD_NAME);
      const iosDir = cfg.modRequest.platformProjectRoot;
      const localPodDir = path.join(iosDir, POD_NAME);

      // 1. Create the target pod directory in the generated ios/ tree.
      if (!fs.existsSync(localPodDir)) {
        fs.mkdirSync(localPodDir, { recursive: true });
      }

      // 2. Copy source files from plugins/ios/VoiceEngine/ into ios/VoiceEngine/.
      //    Missing source files are a hard error — without them the pod
      //    will fail to compile and the developer deserves to know why.
      for (const fileName of SOURCE_FILES) {
        const src = path.join(pluginIosDir, fileName);
        const dst = path.join(localPodDir, fileName);
        if (!fs.existsSync(src)) {
          throw new Error(
            `[with-voice-engine] Missing source file: ${src}\n` +
              `Expected all of: ${SOURCE_FILES.join(', ')}\n` +
              `Did someone accidentally delete plugins/ios/${POD_NAME}/?`,
          );
        }
        fs.copyFileSync(src, dst);
        console.log(`[with-voice-engine] Copied ${fileName} to local pod`);
      }

      // 3. Patch the Podfile to register the local pod. Idempotent: if the
      //    marker is already present, skip — prebuild was already run and
      //    the Podfile knows about VoiceEngine.
      const podfilePath = path.join(iosDir, 'Podfile');
      if (!fs.existsSync(podfilePath)) {
        console.warn(
          '[with-voice-engine] Podfile not found — cannot register pod. ' +
            'Expected at: ' +
            podfilePath,
        );
        return cfg;
      }

      let podfile = fs.readFileSync(podfilePath, 'utf8');
      if (podfile.includes(PODFILE_MARKER)) {
        console.log('[with-voice-engine] Podfile already registers VoiceEngine, skipping');
        return cfg;
      }

      // Insert the pod declaration right after `use_expo_modules!` — this
      // matches the pattern used by with-mlkit-pose.js and places the local
      // pod within the main target scope where it can see React-Core.
      const marker = 'use_expo_modules!';
      const markerIdx = podfile.indexOf(marker);
      if (markerIdx === -1) {
        throw new Error(
          '[with-voice-engine] Could not find `use_expo_modules!` anchor ' +
            'in Podfile. The Expo SDK may have changed the Podfile layout.',
        );
      }
      const insertAt = podfile.indexOf('\n', markerIdx) + 1;
      podfile =
        podfile.slice(0, insertAt) +
        `  pod '${POD_NAME}', :path => './${POD_NAME}'\n` +
        podfile.slice(insertAt);
      console.log('[with-voice-engine] Added VoiceEngine pod to Podfile');

      // 4. Add a post_install hook to set Swift version for the VoiceEngine
      //    target explicitly. Without this, Xcode sometimes picks a different
      //    default that collides with the podspec's swift_version setting.
      if (!podfile.includes(POST_INSTALL_MARKER)) {
        const postInstallMarker = 'post_install do |installer|';
        const piIdx = podfile.indexOf(postInstallMarker);
        if (piIdx !== -1) {
          const piInsert = podfile.indexOf('\n', piIdx) + 1;
          const hookLines = `    ${POST_INSTALL_MARKER}
    installer.pods_project.targets.each do |target|
      if target.name == '${POD_NAME}'
        target.build_configurations.each do |config|
          config.build_settings['SWIFT_VERSION'] = '5.0'
          config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
          config.build_settings['DEFINES_MODULE'] = 'YES'
        end
      end
    end
`;
          podfile =
            podfile.slice(0, piInsert) + hookLines + podfile.slice(piInsert);
          console.log(
            '[with-voice-engine] Added Swift version post_install hook',
          );
        }
      }

      fs.writeFileSync(podfilePath, podfile, 'utf8');
      return cfg;
    },
  ]);

  return config;
}

module.exports = withVoiceEngine;
