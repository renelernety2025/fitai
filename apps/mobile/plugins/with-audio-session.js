/**
 * Expo config plugin: AVAudioSession voiceChat mode.
 *
 * Patches AppDelegate.swift to configure the iOS audio session for
 * hardware echo cancellation (PlayAndRecord category + VoiceChat mode).
 *
 * Without this, the microphone picks up the coach's own TTS output
 * from the speaker, creating an echo loop during voice coaching.
 * VoiceChat mode enables iOS hardware echo cancellation (AEC).
 *
 * The setup MUST run at app startup before any React Native audio
 * module (expo-audio, expo-speech-recognition) initializes, otherwise
 * expo-audio will install its own PlayAndRecord config without AEC.
 *
 * Idempotent: safe to run multiple times during prebuild.
 */
const { withAppDelegate } = require('expo/config-plugins');

const MARKER = '// FitAI: AVAudioSession voiceChat mode';
const SWIFT_IMPORT = 'import AVFoundation';
const ANCHOR = 'let delegate = ReactNativeDelegate()';

// Note: the ANCHOR line in AppDelegate.swift already carries its own 4-space
// indent, which prefixes the first line of this block on replacement. So the
// template's first line starts WITHOUT leading spaces; subsequent lines carry
// their own 4-space indent; the trailing `    ` re-indents the ANCHOR itself.
const SWIFT_SETUP_BLOCK = `${MARKER}
    // Hardware echo cancellation for voice coaching.
    // Must run before expo-audio / expo-speech-recognition init.
    do {
      let audioSession = AVAudioSession.sharedInstance()
      try audioSession.setCategory(
        .playAndRecord,
        mode: .voiceChat,
        options: [.defaultToSpeaker, .allowBluetoothA2DP, .allowBluetooth]
      )
      try audioSession.setActive(true)
      NSLog("[FitAI] AVAudioSession configured: playAndRecord + voiceChat")
    } catch {
      NSLog("[FitAI] AVAudioSession setup failed: \\(error.localizedDescription)")
    }

    `;

function patchSwiftAppDelegate(contents) {
  if (contents.includes(MARKER)) {
    console.log('[with-audio-session] Already patched, skipping');
    return contents;
  }

  // 1. Add `import AVFoundation` after the existing Expo imports.
  if (!contents.includes(SWIFT_IMPORT)) {
    const importAnchor = 'import ReactAppDependencyProvider';
    if (!contents.includes(importAnchor)) {
      throw new Error(
        '[with-audio-session] Import anchor not found in AppDelegate.swift. ' +
          'Expected: "import ReactAppDependencyProvider". ' +
          'Expo SDK may have changed — plugin needs update.',
      );
    }
    contents = contents.replace(
      importAnchor,
      `${importAnchor}\n${SWIFT_IMPORT}`,
    );
    console.log('[with-audio-session] Added import AVFoundation');
  }

  // 2. Inject audio session setup at the start of didFinishLaunchingWithOptions,
  //    before React Native factory setup.
  if (!contents.includes(ANCHOR)) {
    throw new Error(
      '[with-audio-session] Function anchor not found in AppDelegate.swift. ' +
        `Expected: "${ANCHOR}". ` +
        'Expo SDK may have changed — plugin needs update.',
    );
  }
  contents = contents.replace(ANCHOR, `${SWIFT_SETUP_BLOCK}${ANCHOR}`);
  console.log(
    '[with-audio-session] Injected AVAudioSession setup into didFinishLaunchingWithOptions',
  );

  return contents;
}

function withAudioSession(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error(
        `[with-audio-session] Expected Swift AppDelegate, got ${cfg.modResults.language}. ` +
          'Plugin only supports Expo SDK 53+ Swift AppDelegate.',
      );
    }
    cfg.modResults.contents = patchSwiftAppDelegate(cfg.modResults.contents);
    return cfg;
  });
}

module.exports = withAudioSession;
// Exported so the pure transform can be dry-run against a Swift string
// without invoking expo prebuild (useful for ad-hoc verification).
module.exports.patchSwiftAppDelegate = patchSwiftAppDelegate;
