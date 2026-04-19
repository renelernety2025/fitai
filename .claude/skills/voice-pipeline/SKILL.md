---
name: voice-pipeline
description: Diagnose and fix FitAI voice coaching pipeline issues — ElevenLabs TTS, expo-audio playback, expo-speech-recognition MIC input, MIC echo loop, pauseCoach/resumeCoach. Use when coach voice is silent, repeats, echoes, or MIC captures the coach's own voice.
---

# Voice Pipeline Skill

FitAI voice coaching runs through this pipeline:

```
coaching-engine.ts  →  coaching-phrases.ts  →  voice-coach.ts  →  /api/coaching/tts  →  ElevenLabs
                                                      ↓
                                                 expo-audio playback

voice-input.ts  →  expo-speech-recognition  →  /api/coaching/ask  →  Claude
       ↑
  User MIC button
```

## Diagnostic order (always top-down)

### 1. Is coaching-engine emitting phrases?
```bash
grep -n "speak(" apps/mobile/src/lib/voice-coach.ts
grep -n "coachingEngine\." apps/mobile/src/screens/
```
Look for stateful calls — engine tracks set/reps/form trend and calls `speak()`.

### 2. Is the API endpoint reachable?
```bash
curl -sS https://fitai.bfevents.cz/api/coaching/tts -X POST \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"text":"test","language":"cs"}' | head -c 200
```
ElevenLabs responses are binary audio; a 200 + binary bytes = OK.

### 3. Is ElevenLabs configured server-side?
- `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` must be in AWS Secrets Manager
- Request body MUST include `language_code: 'cs'` (Czech). Omitting it → English accent.

### 4. Is expo-audio playing?
```bash
grep -rn "require('expo-audio')" apps/mobile/src/
```
Must be **lazy require** (inside function body, not top-of-file):
```ts
let expoAudio: any;
function getAudio() {
  if (!expoAudio) expoAudio = require('expo-audio');
  return expoAudio;
}
```
**expo-av is deprecated** — do not mix it with expo-audio.

### 5. Is MIC echo-looping?
**Symptom:** User presses MIC button → speech recognition transcribes the COACH's voice instead of the user's.
**Root cause:** iPhone speaker output bleeds into the MIC input (no hardware echo cancellation by default).
**Current workaround:** `pauseCoach()` is called when MIC activates, `resumeCoach()` on MIC close.
**Real fix:** VoiceEngine native module with `voiceProcessingEnabled` (attempted 2026-04-12, rolled back due to silent playback bug). Needs Xcode debug session. voiceChat mode was tried and removed (Phase A v1.1). Current stack: expo-audio + pauseCoach/resumeCoach workaround.

Check the workaround is wired up:
```bash
grep -n "pauseCoach\|resumeCoach" apps/mobile/src/lib/voice-input.ts
grep -n "pauseCoach\|resumeCoach" apps/mobile/src/lib/voice-coach.ts
```

## Native module detection

**`NativeModules` runtime check is UNRELIABLE** for expo-audio and expo-speech-recognition. They exist but are sometimes undefined on module import order. **Always use try/require pattern:**

```ts
function getSpeechRecognition() {
  try {
    return require('expo-speech-recognition').ExpoSpeechRecognitionModule;
  } catch {
    return null;
  }
}
```

Do **NOT** do `if (NativeModules.ExpoSpeechRecognition)` — it returns undefined on cold start.

## Event API

`expo-speech-recognition` uses `ExpoSpeechRecognitionModule.addListener(event, cb)` — **not** the EventEmitter pattern from react-native. Common mistake: using `new NativeEventEmitter()` — breaks silently.

Correct:
```ts
const sub = ExpoSpeechRecognitionModule.addListener('result', onResult);
// cleanup: sub.remove()
```

## Known failures

| Symptom | Cause | Fix |
|---|---|---|
| Silent coach, no errors | Lazy require failed → audio module null | Wrap in try/catch + log |
| Coach speaks English | Missing `language_code: 'cs'` in TTS request | Add to API body |
| MIC transcribes coach | Speaker echo loop | pauseCoach on MIC activate |
| "end" event never fires | Wrong listener API | Use `addListener()` not NativeEventEmitter |
| Build error: expo-av | Deprecated mix | Remove expo-av, use expo-audio only |

## Related files (FitAI mobile)

- `apps/mobile/src/lib/voice-coach.ts` — lazy expo-audio, queue, pause/resume
- `apps/mobile/src/lib/voice-input.ts` — lazy expo-speech-recognition
- `apps/mobile/src/lib/coaching-engine.ts` — stateful phrase emission
- `apps/mobile/src/lib/coaching-phrases.ts` — 100+ Czech phrases
- `apps/api/src/coaching/coaching.controller.ts` — `/api/coaching/tts`, `/api/coaching/ask`
