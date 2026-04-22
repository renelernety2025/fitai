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

**Navíc od 2026-04-21:**
- Security audit fixes — CORS whitelist, motivationCache, auth guard, prompt injection fix, dead props
- AI Daily Motivation — personalized Claude message on dashboard
- Exercise favorites (heart + localStorage filter)
- Workout keyboard shortcuts (Space/N/Escape)
- Landing page features grid + stats section
- Header profile/notification icons
- V2Tooltip onboarding component
- **Tier 1:** AI Chat Coach (/ai-chat, SSE streaming, conversation memory), Activity Heatmap (7x12, recovery colors), "Co dnes?" smart widget (rules-based, 5 scenarios)

**Navíc od 2026-04-20:**
- 3D exercise viewer — Three.js/R3F animated humanoid (Michelle model), phase controls, speed, camera presets, angle overlay, muscle highlighting
- Coach personality modes — Drill Sergeant / Chill / Motivational, per-session selection
- Post-workout confetti — canvas particle celebration on XP overlay
- Streak fear push — escalating urgency notifications (2-6 / 7-13 / 14-29 / 30+ days)
- Micro-workout mode — `/micro-workout` page, 3 random exercises, 5-min challenge, reroll
- Quality audit — 5 critical fixes (perf, error handling, stale state, validation, Docker)

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

## Další priorita (next session)

### Tier 1 — Okamžitá hodnota ✅
- ~~**AI Chat Coach**~~ ✅ — /ai-chat s Claude streaming, hero + suggested prompts, conversation memory
- ~~**Workout streak calendar**~~ ✅ — GitHub-style heatmap 7x12 na /habity, recovery score barvy
- ~~**"Co dnes?" smart widget**~~ ✅ — rules-based karta nad Daily Brief, 5 scénářů, dismiss per day

### Tier 2 — Diferenciace
- **AI Form Coach split-screen** — kamera + 3D model vedle sebe
- ~~**Workout journal**~~ ✅ — /journal s timeline feed, book-style karty, fotky, AI insights, milestones
- ~~**AI food recognition**~~ ✅ — Claude Vision fotka→makra, recipe kniha, food camera, source tracking
- ~~**Superset/Circuit builder**~~ ✅ — DnD editor, superset/circuit/giant/drop grouping, inline edit

### Tier 3 — Škálování
- ~~**Social challenges**~~ ✅ — user-created challenges, invite, detail page, leaderboard
- ~~**Export dat**~~ ✅ — CSV/PDF workout history, journal, nutrition. /export page
- **Dark/light mode** přepínač

### Cross-industry ✅
- ~~**FitAI Wrapped**~~ ✅ — Spotify-style monthly/yearly recap, AI summary, shareable
- ~~**Ligy/Divize**~~ ✅ — Weekly XP competition, 5 tiers, promotion/relegation
- ~~**Skill Tree**~~ ✅ — 21 skills, 4 branches, progressive unlocking
- ~~**Workout Kalendář**~~ ✅ — Monthly calendar, schedule workouts, plan linking
- ~~**Battle Pass / Sezóny**~~ ✅ — 30-day seasons, 10 missions, level progression

## Střední priorita (infrastructure)

- **Apple HealthKit + Google Fit** — mobile čte sleep/steps/HR/HRV. Vyžaduje EAS build.
- **Phase E-3 mobile streaming** — gated na VoiceEngine fix.
- **Mobile parity** — coach personality, micro-workout, search na mobile.
- **3D animace fix** — With Skin FBX pro přímé načtení (bez GLB retarget)

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

- **`test-production.sh`** — 115 testů, spouštět po každém deployi
- **`CONTRACTS.md`** — zámčené API shapes + DB modely
- **`scripts/verify-docs-integrity.sh`** — doc health check (size budgets, archive pointers, ADR count)
- **`CHANGELOG-archive/`** — verbatim archive starších entries

---

## Stats (2026-04-22)

- **51 NestJS modules** (canonical list: `apps/api/src/app.module.ts`)
- **66 DB models** (+ enums: CoachPersonality, JournalMood, LeagueTier, WorkoutPlanType, etc.)
- **42+ web pages** (v2 design, dark/light mode, CSS animations)
- **29 mobile screens** (v2 design, +AI Chat, +Journal, +Calendar, +Leagues)
- **250+ API endpoints**
- **17 achievements**
- **60 exercises** with 3D animated viewer
- **3 coach personality modes** (Drill/Chill/Motivational)
- **115/115 regression tests**
- **15 ADRs** v ARCHITECTURE.md
- **2 archive files** (CHANGELOG + ROADMAP)
- **Backend SSE streaming** deployed (Claude + ElevenLabs PCM pipeline)
- **Three.js 3D viewer** with phase animation, controls, angle overlay
- **5 cron jobs** (streak reminders, league week-end, flash challenges, weekly digest, season check)
