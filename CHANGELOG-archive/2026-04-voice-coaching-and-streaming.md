# FitAI Changelog Archive — Voice Coaching v2 + Streaming + Exercises

> Archived: 2026-04-22
> Covers: 2026-04-11 to 2026-04-19 (Voice Coaching v2, Phase E streaming, VoiceEngine, 60 exercises, doc infrastructure)
> Back-pointer: See @CHANGELOG.md for active/recent entries

---

## [Phase E streaming + VoiceEngine rollback + Bible audit + 60 exercises] 2026-04-19

### Backend streaming pipeline (deployed, verified)
- `POST /api/coaching/ask-stream` — Claude SSE text streaming + ElevenLabs PCM audio streaming
- Sentence-boundary flushing (`.!?` → flush to TTS). First audio chunk <2s (curl verified)
- Backend PCM opt-in via `audioFormat` DTO field (backwards compat, default MP3)
- SDK event iteration fix (`stream.textStream` → raw `AsyncIterable<MessageStreamEvent>`)
- `/coaching/tts` + `/coaching/ask` accept optional `audioFormat:'pcm'`

### VoiceEngine native module (ROLLED BACK)
- Multiple Swift fix attempts: format mismatch → int16→float32 → AVAudioConverter → overrideOutputAudioPort
- Debug instrumentation revealed: engine resolves to stereo 44.1kHz float32, converter produces frames, but no audible output
- **Decision: rollback to expo-audio** (known working). VoiceEngine stays in binary, unused. Debug with Xcode in separate session.
- Circuit breaker leak fixed (error handler was resetting counter before end handler checked it)

### Doc infrastructure (Bible v4.2 audit)
- CHANGELOG archived: 74→18 KB (-76%). `CHANGELOG-archive/2026-04-foundation-and-infra.md`
- ROADMAP archived: 11→5 KB (-55%). `ROADMAP-archive/2026-04-completed-phases.md`
- ADR table: 15 entries in ARCHITECTURE.md
- `scripts/verify-docs-integrity.sh` — 6 automated checks
- `/resume-session` skill for post-/clear orientation
- `memory/project_summary.md` created
- Bible v4.2 + standalone patterns in `docs/`

### Content explosion: 14 → 60 exercises
- 46 new exercises across all muscle groups (chest, back, shoulders, arms, legs, calves, core, compound, bodyweight, stretching)
- Full Czech instructions, phases with MediaPipe angle rules, equipment mapping
- `prisma/exercises-data.ts` (2275 LOC data file) extracted from seed.ts
- Seed run via ECS migrate task, cache invalidated, 60 exercises live on production

### ROADMAP aktualizovan na 2026-04-19
- Voice coaching + Phase E work zapsan
- Stats: 29 modulu, 61 testu, 15 ADRs, 60 cviku
- Priorities: VoiceEngine debug → App Store → Scale Readiness

---

## [Voice Coaching v2 — Phase A v2 VoiceEngine + user-ID throttler] 2026-04-12 pozdne vecer
### Shipped
**Voice Coaching v2 + Phase A v2 final state.** Two-phase rollout dotazen, hardware AEC live na zarizeni, backend rate limity ted per-user.

**Commits v teto iteraci (chronologicky):**
- `3a54dab` — `feat(api): user-ID based throttler tracker` — Task #10: nova `UserIdThrottlerGuard` subclass co override-ne `getTracker()` na `req.user?.id ?? req.ip`. Registrovana jako `APP_GUARD` v `app.module.ts`, automaticky ovlivni vsechny `@Throttle()` dekoratory napric projektem (auth, coaching, nutrition, ai-insights, progress-photos). Fixuje NAT sharing bug: dva clenove rodiny na stejne WiFi uz nesdili budget na drahe AI endpointy. Fallback na `req.ip` pro unauthenticated endpointy (login/register) pro brute-force ochranu.
- `3a92c11` — `feat(mobile): VoiceEngine native module — hardware AEC via AVAudioEngine` — Task #6: novy Swift native modul (`VoiceEngine.swift` + `VoiceEngineBridge.m` + `VoiceEngine.podspec`). Initial commit mel **flag-day migraci** voice-coach.ts + voice-input.ts na VoiceEngine.
- `4d096d9` — `fix(mobile): revert voice-coach/voice-input to v6/v2` — Flag-day rollout spadl. Revert na ed2ac4c verze (expo-audio + expo-speech-recognition). Zmena rollout strategie z flag-day na **two-phase**.
- `40c9cfe` — `fix(mobile): voice-input continuous mode — single rearm timer + error circuit breaker` — Fix stacking bug + error 209 infinite loop. Novy `scheduleReArm()` + `consecutiveErrorsRef` circuit breaker.
- `b2a8bba` — `feat(mobile): Phase 2 flip — voice-coach/voice-input use VoiceEngine native module` — Flip na VoiceEngine po uspesnem EAS buildu.

### Known limitace po shipnuti
- Grace window nadbytecny (hardware AEC fyzicky filtruje)
- `POST_CANCEL_SETTLE_MS = 350ms` nadbytecny
- `expo-audio` a `expo-speech-recognition` zustavaji jako emergency rollback
- Android support — VoiceEngine je iOS-only

---

## [Voice Coaching v2 — code review follow-ups] 2026-04-12
### Fixed
Kompletni sada fixes z independent code review session — vsechny 3 critical items a 8 quality items.

**Critical fixes:**
- `/coaching/ask` dostal DTO + prompt injection fix (AskCoachDto)
- `voice-coach.ts` single-flight drain + paused re-check
- `voice-input.ts` `continuousRef` sync pres `useEffect`

**Quality fixes:**
- `voice-coach.ts` refactor: 108-LOC `playNext()` rozpadnut do mensich funkci
- `voice-input.ts` refactor: 155-LOC `internalStart()` rozpadnut + SessionState objekt
- `with-audio-session.js` footgun fix: idempotency guard
- `coaching-prompt.ts` empty header fix
- `user-context.builder.ts` fallback name fix
- `answerQuestion()` personalizace pres shared builder

---

## [Voice Coaching v2 — final state after device testing] 2026-04-11 late night
### Shipped
AI trener Alex plne funkcni v push-to-talk modu na realnem iPhonu. Echo loop fixnuty, speech recognition spolehliva, personalizovany coaching prompt.

- v1.2: `isSpeaking()` getter, echo gate
- v1.3: POST_CANCEL_SETTLE_MS = 350ms delay
- v1.4: `isSpeakingOrJustStopped()` s 1.2s grace window

---

## [fix(mobile): Phase A v1.1 — remove voiceChat mode] 2026-04-11
### Fixed
Odstranen `.voiceChat` mode z `with-audio-session.js` Expo config pluginu. Speech recognition spolehliva, echo loop pretrvava — vyzaduje Phase A v2.

---

## [Voice Coaching v2 — pipeline redesign] 2026-04-11
### Added
- **Phase A:** iOS hardware echo cancellation (config plugin, AVAudioSession PlayAndRecord)
- **Phase B:** Listener-based voice-coach playback (expo-audio didJustFinish)
- **Phase C:** Always-on listening + auto-pause (continuousMode, 3-state MIC)
- **Phase D:** Personalized coaching prompt (user-context.builder.ts, skillTier, age/injuries)

---
