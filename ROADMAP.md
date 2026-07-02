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

## Hotovo (2026-05-04)

> Wave 1 backend + Oura + mobile detaily: `ROADMAP-archive/2026-05-wave1-completed.md`

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

### 2b. Backlog z 2026-07 platform auditu (po hardening vlnách 0-5)

Hotovo 2026-07-01→02: CI oprava (pnpm→npm) + build/test/tf gaty, jest (95+ testů),
prisma migrate cutover (ADR-22, canary ověřen), deploy safety (circuit breaker,
rollout gate, runbook, deploy tagy), TF↔prod reconcile + Redis obnoven, 7 alarmů,
VPC endpoints, ClaudeService (ADR-23), shared api typy 3 domén (ADR-24),
mobile ErrorBoundary + api hardening. Detaily: CHANGELOG + docs/AUDIT-2026-07-PLATFORM.md.

| Item | Effort | Pozn. |
|---|---|---|
| **[USER] IAM grant rds-predeploy-snapshots** + flip snapshot kroku na hard-fail | 5 min | příkaz v docs/RUNBOOK-rollback.md |
| **[USER] RDS Multi-AZ flip** (`multi_az=true` v tfvars + apply, okno ~2 min) | 15 min | kód ready |
| Kontrakt bugy odhalené typováním (11× `TODO(shared-types)`: routine-builder, drops, experiences, supplements, maintenance, gym-finder, duels, clips, squads) | ~4h | typy = realita, opravit STRÁNKY |
| Sentry: web (@sentry/nextjs) + mobile (@sentry/react-native, EAS build) | ~2h | DSN pending (user) |
| Playwright e2e (login, gym session, food log) | ~4h | |
| Smoke test shape assertions (jq) top 20 endpointů | ~1h | |
| Backend strictNullChecks/noImplicitAny burn-down (545 any) | ~2 dny | per-modul |
| Shared typy zbývající domény (social 19, user 13, …) + mobile api.ts (154 any) | ~1 den | pattern ADR-24 |
| Claude response cache — zapnout cacheKey na vhodných callerech (daily-brief má vlastní, kandidáti: recovery/nutrition tips) | ~2h | infra ready v ClaudeService |
| Redis HA replication group + encryption (recreate okno) | ~3h | security H3 |
| React Query na webu, DataState abstrakce, next/image, mediapipe dynamic import, SEO metadata | ~2 dny | |
| npm audit majors (next@16, @nestjs/platform-express), Node 20 actions deprecation | ~1 den | breaking |
| Root package.json anti-hoist pin cleanup (vyžaduje EAS verifikaci) | s buildem | docs/MOBILE-BUILD-CHECKLIST.md |
| Staging environment | ~2 dny | |
| Soft-delete na UGC modelech | ~1 den | |

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

## Další priorita

> Tier 1-3 / Instagram / Cross-industry: většina ✅ hotová — detaily v `ROADMAP-archive/2026-04-tier-features-completed.md`. Otevřené: AI Form Coach split-screen, dark/light mode přepínač.

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
