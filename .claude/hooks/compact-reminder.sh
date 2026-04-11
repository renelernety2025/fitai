#!/bin/bash
# SessionStart:compact hook — injects critical FitAI reminders after context compaction
# so Claude doesn't lose patterns that are hard to rediscover from files alone.

cat <<'EOF'
[FitAI compact reminders]
- expo-audio (NE expo-av — deprecated)
- Native moduly v apps/mobile/package.json (NE v root)
- Lazy require pattern pro expo-audio + expo-speech-recognition
- ExpoSpeechRecognitionModule.addListener (NE NativeEventEmitter)
- MIC echo: pauseCoach/resumeCoach workaround
- Voice pipeline: coaching-engine → coaching-phrases → voice-coach → /api/coaching/tts → ElevenLabs (language_code 'cs')
- Prefix /api/* na všech API endpointech
- Claude model: haiku-4-5 pro coaching, sonnet-4-6 pro vision
- Zámčené soubory (viz CLAUDE.md) jsou chráněné PreToolUse hookem
EOF

exit 0
