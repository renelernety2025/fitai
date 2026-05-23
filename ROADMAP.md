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

> Detail: `ROADMAP-archive/2026-04-completed-phases.md` (čti přímo — není auto-load)
> Recent: see `CHANGELOG.md` for 2026-04-20+ entries

---

## Hotovo (recent)

> 2026-05-02 Expert QA Audit + Mobile QA Audit · 2026-05-04 Wave 1 backend + Oura · 2026-05-11 6-slice audit · 2026-05-14 → 2026-05-23 monster audit + 14 fix slices
> Detaily v `CHANGELOG.md` + `CHANGELOG-archive/2026-05-wave-and-mobile-qa.md`.

---

## Hotovo (2026-05-04 — odkaz)

### Wave 1 backend (tech-uplift) ✅
Plán: `~/.claude/plans/super-m-e-se-pros-m-snazzy-nebula.md`. Wave 1 backend dokončený:
- **pgvector setup**, HNSW indexy, Prisma schema (Exercise/Recipe/WorkoutSession `embedding vector(1536)`)
- **EmbeddingsService** (@Global, OpenAI text-embedding-3-small)
- **Semantic exercise search**: `POST /api/exercises/search/semantic`
- **RAG history query**: `POST /api/ai-insights/history-query` (top-10 sessions → Claude Haiku, cache 24h, throttle 10/h) + weekly cron pro re-embed
- **HealthKit-aware Daily Brief**: `calcRecoveryScoreSmart` preferuje HRV/sleep/restingHR z `WearableData` před self-reported `DailyCheckIn`
- **Wearables DTO**: přidány providery `google_fit` + `health_connect`

### Wave 3 sneak — Oura Ring OAuth ✅
- `WearableConnection` model + `OuraOAuthService` (CSRF přes JWT state) + `OuraSyncService` + daily cron `@Cron('0 4 * * *')`
- 5 new endpointů: `oauth/oura/{authorize,callback,sync}`, DELETE, `wearables/connections`
- Mobile `HealthSyncScreen` rozšířený o Oura sekci s `expo-web-browser` OAuth flow
- Production deploy: env `OURA_CLIENT_ID/SECRET/REDIRECT_URI` přes Secrets Manager
- Wave 2 #20/#21 (VisionCamera mobile pose) — **už shipped** v `apps/mobile/src/lib/pose/` + `CameraWorkoutProScreen`

### Wave 1 mobile ✅
- `@kingstinct/react-native-healthkit` + `react-native-health-connect` installed + plugin config v `app.json`
- Cross-platform `health-sync.ts` wrapper + `HealthSyncScreen` + ProfileScreen entry
- Code-complete; user-driven: `expo prebuild --clean` + `pod install` + EAS dev build + device test

### Wave 1 zbývá pro produkci (user-driven)
- EAS development build (iOS + Android, ~15 min každá)
- Device test HealthKit/Health Connect permissions + initial 7d sync
- RDS: `CREATE EXTENSION vector;` + schema push (Exercise/Recipe/WorkoutSession `embedding` column) přes ECS migrate task
- Embedding seed přes ECS task (`OPENAI_API_KEY` ze Secrets Manager, ~$0.05)
- Smoke test prod (`bash test-production.sh` → 115/115)

---

## Aktuální priorita (2026-05-23)

### 1. App Store launch — odblokovany po audit follow-up

Po 14 fix slicech (2026-05-14 → 2026-05-20) jsou Apple guideline blockery hotove:
- ✅ Apple 5.1.1 (account deletion) — mobile AccountScreen
- ✅ Apple 1.2 (UGC moderation) — report + block + admin queue + ban + JWT reject
- ✅ Banned-user enforcement at login + request layer
- ✅ Stub pages deleted (reviewer crawl risk eliminated)

| Fáze | Co | Status |
|---|---|---|
| 1. Dev build | EAS development build na iPhonu | ✅ Máme (stará verze) |
| 2. EAS rebuild | Pick up Slice 7 (account screen, forgot pw) + Slice 13 (expo-video) | **Pending (user-driven)** |
| 3. Bug fixes | QA na novem buildu | Pending |
| 4. TestFlight | 5-10 beta testerů | Pending |
| 5. TestFlight iterace | Feedback → fixy → new builds | Pending |
| 6. Compliance | Privacy policy, TOS, AI disclaimer | **Pending (user — externi pravnik)** |
| 7. Sentry DSN | Provision project, set ECS env | **Pending (user)** |
| 8. CDN URL env | NEXT_PUBLIC_CDN_URL pro post photos | **Pending (user)** |
| 9. Production build | `eas submit --profile production` | Pending |
| 10. Apple Review | Čekání, možná rejection fixes | Pending |
| 11. Release | Veřejně v App Store | Pending |

### 2. VoiceEngine debug + hardware AEC (~4h, potřeba Xcode)

VoiceEngine native modul (Swift, AVAudioEngine + VoiceProcessingIO) je v EAS binárce ale **nefunkční** — silent playback bug (AVAudioConverter produkuje frames ale žádný zvuk). Rollback na expo-audio (funguje). Debug vyžaduje Xcode attached k iPhone pro native breakpointy.

**Po opravě:** Hardware AEC eliminuje echo loop, Phase E-3 mobile streaming playback se odblokuje, cílová latence <1.5s first word.

### 3. Backlog z 2026-05-14 monster auditu (zbyvajicich items)

| Item | Effort | Status |
|---|---|---|
| Mobile parity 15+ screens (Marketplace, Creators, Body Portfolio, Courses, …) | ~15h | Pending |
| HLS pipeline pro clips (MediaConvert) | ~6h | Pending (signed S3 URL works as MVP) |
| 4 high-freq feed crons wrap (sampled) | ~1h | Pending |
| Marketplace seed data | TBD | **Pending (user — business decision)** |
| Admin user list / search UI | ~2h | Pending |
| External pen-test ~$2-5k | externi | Pending |
| KMS encryption for WearableConnection tokens | 2 dny | Pending |

### 4. Scale Readiness (~3 dny)

Kompletní systematika v [`SCALING.md`](./SCALING.md). Vrstvy 1-3 plánovány ale zatím neimplementovány.

| Vrstva | Co | Effort | Status |
|---|---|---|---|
| 1. Quick wins | Caching, indexy, rate limiting, autoscaling | ~1 den | Pending (cache + throttles ✅) |
| 2. Observability | CloudWatch, Sentry, structured logging | ~0.5 dne | **Partial** — CloudWatch metrics ✅ / Sentry env pending |
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

### Fitness Instagram ✅ Wave 1 + Wave 2
- ~~**Fitness Instagram Wave 1**~~ ✅ — Posts, algorithmic feed (For You/Following/Trending), hashtags, verified badges, promo cards.
- ~~**Fitness Instagram Wave 2**~~ ✅ — Creator Economy (XP subscriptions, tips, subscriber-only posts), Smart Notifications v2 (11 types, batching, dedup), Creator Dashboard (stats, analytics, content tools, scheduled posts).

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

## Stats (2026-05-02)

- **88+ NestJS modules** (canonical list: `apps/api/src/app.module.ts`)
- **120+ DB models** (+ enums)
- **96+ web pages** (v3 design, dark/light mode, EN)
- **47 mobile screens** (v2 design, all audited + EN, all tested against prod API)
- **400+ API endpoints**
- **17 achievements**
- **60 exercises** with 3D animated viewer
- **3 coach personality modes** (Drill/Chill/Motivational)
- **115/115 regression tests**
- **15 ADRs** v ARCHITECTURE.md
- **2 archive files** (CHANGELOG + ROADMAP)
- **Backend SSE streaming** deployed (Claude + ElevenLabs PCM pipeline)
- **Three.js 3D viewer** with phase animation, controls, angle overlay
- **5 cron jobs** (streak reminders, league week-end, flash challenges, weekly digest, season check)
- **QA complete**: 96 web pages + 43 mobile screens audited, 180+ total bugs fixed
- **AWS cost optimized**: $136→$90/month (úsporný režim, autoscale ready)
