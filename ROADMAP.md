# FitAI — Roadmap & Progress

> Aktualizováno: 2026-04-19

## Production
- **Web (HTTPS):** https://fitai.bfevents.cz
- **API:** https://fitai.bfevents.cz/api
- **GitHub:** https://github.com/renelernety2025/fitai
- **AWS:** eu-west-1, account 326334468637, profile `fitai`

## Demo
- demo@fitai.com / demo1234
- admin@fitai.com / demo1234

---

## Hotovo

Phases 1-10 · Sections A-L · Infrastructure · Web 19 pages · Mobile 18 screens · Backend 29 modulů

> Detail: @ROADMAP-archive/2026-04-completed-phases.md

**Navíc od 2026-04-11:**
- Voice Coaching v2 — Phase D personalized coaching (age/injuries/goal/skillTier), AskCoachDto + prompt injection fix, user-ID throttler
- Phase E-1 backend — Claude SSE streaming (`POST /coaching/ask-stream`), deployed + curl verified
- Phase E-2 backend — ElevenLabs PCM streaming pipeline, sentence-boundary flushing, deployed
- Backend PCM opt-in — `audioFormat` DTO field, backwards compat (default MP3)
- Doc infrastructure — archive rhythm, ADR table (15 entries), verify-docs-integrity.sh, /resume-session skill

---

## Aktuální priorita

### 1. VoiceEngine debug + hardware AEC (~4h, potřeba Xcode)

VoiceEngine native modul (Swift, AVAudioEngine + VoiceProcessingIO) je v EAS binárce ale **nefunkční** — silent playback bug (AVAudioConverter produkuje frames ale žádný zvuk). Rollback na expo-audio (funguje). Debug vyžaduje Xcode attached k iPhone pro native breakpointy + audio session inspection.

**Po opravě:**
- Hardware AEC eliminuje echo loop → continuous mode mid-sentence interrupt
- Phase E-3 mobile streaming playback se odblokuje (playChunk + streamSpeak)
- Cílová latence <1.5s first word (backend streaming pipeline ready)

**Known issues:**
- Error 216/209 v SFSpeech recognition (session overlap + circuit breaker leak) — fixnout jako součást VoiceEngine debug
- `expo-audio` + `expo-speech-recognition` zůstávají jako fallback

### 2. App Store launch (~2 týdny)

| Fáze | Co | Status |
|---|---|---|
| 1. Dev build | EAS development build na iPhonu | ✅ Máme |
| 2. Bug fixes | QA issues z device testingu | Probíhá (voice coaching) |
| 3. TestFlight | 5-10 beta testerů | Pending |
| 4. TestFlight iterace | Feedback → fixy → new builds | Pending |
| 5. Compliance | Privacy policy, TOS, AI disclaimer, account deletion | Pending |
| 6. Production build | `eas submit --profile production` | Pending |
| 7. Apple Review | Čekání, možná rejection fixes | Pending |
| 8. Release | Veřejně v App Store | Pending |

### 3. Scale Readiness (~3 dny)

Kompletní systematika v [`SCALING.md`](./SCALING.md). Vrstvy 1-3 plánovány ale zatím neimplementovány.

| Vrstva | Co | Effort | Status |
|---|---|---|---|
| 1. Quick wins | Caching, indexy, rate limiting, autoscaling | ~1 den | Pending |
| 2. Observability | CloudWatch, Sentry, structured logging | ~0.5 dne | Pending |
| 3. Load testing | k6, 4 scenarios, bottleneck identification | ~1 den | Pending |
| 4. Paid upgrades | RDS larger, read replicas, Fargate Spot | Dle dat | Blocked on Vrstva 3 |

---

## Střední priorita

- **Apple HealthKit + Google Fit** — mobile čte sleep/steps/HR/HRV, auto-sync do wearables modulu, recovery score se zlepší. Vyžaduje EAS build.
- **Phase E-3 mobile streaming** — playChunk + finalizeStream (Swift) + streamSpeak (TS) + react-native-sse client. Gated na VoiceEngine fix. TS skeleton už committed (dormant).
- **Phase E-4 fast VAD** — committed (SILENCE_FAST_MS=500), aktivuje se po Metro reload s expo-speech-recognition stackem.

## Nízká priorita / nice to have

- Apple Watch app — quick rep counter + heart rate stream
- Voice activation — "Hey FitAI" → start workout
- Live group classes — WebRTC multi-camera sync
- Trainer marketplace — externí trenéři, revenue split
- Export workout history → CSV/PDF
- Supersety + giant sets v plan editoru
- Custom exercise builder
- Photo-based food recognition (Claude Vision)
- Golf cviky (sport category enum + cyclic phase model)

## Polish / iterace

- Iterace v2 designu podle feedbacku
- Empty states a first-time UX
- Onboarding tooltips
- Animations (Framer Motion / Reanimated)

---

## Technical Debt

### Vyřešeno
- ~~HTTPS~~ · ~~Local Docker~~ · ~~Real AI keys~~ · ~~CodeBuild manual~~ · ~~VAPID keys~~ · ~~S3Service credentials~~

### Aktivní
- **TypeScript `strictNullChecks: false`** — NestJS decorator interop
- **No real seed videos** — 3 picsum placeholdery
- **Weekly volume aggregation** — bez ECS scheduled task
- **VoiceEngine native modul** — silent playback, needs Xcode debug
- **expo-audio + expo-speech-recognition** — legacy deps, uninstall po VoiceEngine fix

---

## Regression Prevention

- **`test-production.sh`** — 61 testů, spouštět po každém deployi
- **`CONTRACTS.md`** — zámčené API shapes + DB modely
- **`scripts/verify-docs-integrity.sh`** — doc health check (size budgets, archive pointers, ADR count)
- **`CHANGELOG-archive/`** — verbatim archive starších entries

---

## Stats (2026-04-19)

- **29 NestJS modules**
- **30+ DB models**
- **19 web pages** (v2 design)
- **18 mobile screens** (v2 design)
- **17 achievements**
- **8 cviků s pose detection**
- **61/61 regression tests**
- **15 ADRs** v ARCHITECTURE.md
- **2 archive files** (CHANGELOG + ROADMAP)
- **55 KB auto-load** (post-archive, down from 116 KB)
- **Backend SSE streaming** deployed (Claude + ElevenLabs PCM pipeline)
