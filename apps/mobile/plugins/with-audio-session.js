/**
 * Expo config plugin: AVAudioSession PlayAndRecord category (v1.1).
 *
 * Patches AppDelegate.swift at app startup to configure the iOS audio
 * session for simultaneous playback + recording (PlayAndRecord category)
 * with speaker routing. This lets expo-audio (TTS playback) and
 * expo-speech-recognition (mic input) coexist without session conflicts.
 *
 * WHAT THIS DOES:
 * - Allows simultaneous playback + mic recording
 * - Routes audio through the speaker by default (not earpiece)
 * - Allows Bluetooth A2DP and HFP devices
 *
 * WHAT THIS DOES *NOT* DO — known limitation:
 * An earlier version of this plugin set `mode: .voiceChat` hoping to get
 * hardware AEC (acoustic echo cancellation), but two problems emerged:
 *
 *   1. voiceChat mode caused SFSpeechRecognizer errors
 *      (kAFAssistantErrorDomain 209 / 216 — audio-capture failures),
 *      because expo-speech-recognition's audio engine contends with
 *      the voiceChat session config.
 *
 *   2. Hardware AEC was never actually engaged. AVAudioSession mode
 *      alone is only a "hint" to iOS — real hardware echo cancellation
 *      requires routing both the TTS playback and mic input through
 *      an `AVAudioEngine` with `inputNode.isVoiceProcessingEnabled = true`
 *      (backed by Apple's voiceProcessingIO audio unit). Neither expo-audio
 *      nor expo-speech-recognition use that engine internally, so the
 *      session mode was ineffective for AEC.
 *
 * Both problems are fixed by removing .voiceChat mode. The mic STILL
 * captures the coach's own voice from the speaker though — that's the
 * software reality of echo in this audio stack. Workarounds:
 *   - Push-to-talk mode: tap MIC button while coach is speaking → Phase B
 *     `cancelCurrent()` interrupts playback immediately, user can speak
 *     into silence.
 *   - Continuous mode (Phase C): functional but limited until Phase A v2
 *     ships with proper AVAudioEngine + voiceProcessingEnabled native
 *     integration.
 *
 * Idempotent: safe to run multiple times during prebuild. Idempotency
 * check uses the shared prefix "FitAI: AVAudioSession", so this plugin
 * also correctly skips re-patching any legacy voiceChat version — but
 * when updating between versions always run `expo prebuild --clean` to
 * regenerate ios/ from scratch.
 */
const { withAppDelegate } = require('expo/config-plugins');

const MARKER = '// FitAI: AVAudioSession PlayAndRecord';
// Legacy marker substring — the idempotency guard also matches the v1
// voiceChat marker so re-running prebuild without --clean on an old
// patched file does not create a duplicate block (the old block is
// still there; caller is expected to --clean for the new version).
const LEGACY_MARKER_PREFIX = '// FitAI: AVAudioSession';
const SWIFT_IMPORT = 'import AVFoundation';
const ANCHOR = 'let delegate = ReactNativeDelegate()';

// Note: the ANCHOR line in AppDelegate.swift already carries its own 4-space
// indent, which prefixes the first line of this block on replacement. So the
// template's first line starts WITHOUT leading spaces; subsequent lines carry
// their own 4-space indent; the trailing `    ` re-indents the ANCHOR itself.
const SWIFT_SETUP_BLOCK = `${MARKER}
    // Simultaneous playback + recording via the speaker.
    // Must run before expo-audio / expo-speech-recognition init.
    // NOTE: Does NOT enable hardware AEC — see Phase A v2 for that.
    do {
      let audioSession = AVAudioSession.sharedInstance()
      try audioSession.setCategory(
        .playAndRecord,
        options: [.defaultToSpeaker, .allowBluetoothA2DP, .allowBluetooth]
      )
      try audioSession.setActive(true)
      NSLog("[FitAI] AVAudioSession configured: playAndRecord (no AEC)")
    } catch {
      NSLog("[FitAI] AVAudioSession setup failed: \\(error.localizedDescription)")
    }

    `;

function patchSwiftAppDelegate(contents) {
  if (contents.includes(LEGACY_MARKER_PREFIX)) {
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
