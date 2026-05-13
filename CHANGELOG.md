# FitAI Changelog

Lidsky čitelná historie změn. Aktualizovat při každém deployi.

> **Archive (čti přímo, NEJSOU auto-load):**
> - `CHANGELOG-archive/2026-04-features-and-cross-industry.md` (2026-04-20 to 2026-04-22)
> - `CHANGELOG-archive/2026-04-voice-coaching-and-streaming.md` (2026-04-11 to 2026-04-19)
> - `CHANGELOG-archive/2026-04-foundation-and-infra.md` (2026-04-07 to 2026-04-09)

---

## [SNS signature verification for MediaConvert webhook] 2026-05-13

Replaces the shared-secret query param auth (added in slice-6, `10604b5`) with proper AWS SNS X.509 signature verification via the `sns-validator` package. Closes the second item from the 2026-05-11 audit pre-launch checklist.

**Details:**
- New `SnsVerificationService` (`apps/api/src/videos/sns-verification.service.ts`, 69 lines): wraps `sns-validator` (AWS-maintained, `aws/aws-js-sns-message-validator`), validates X.509 signature + SignatureVersion + canonical string for Notification / SubscriptionConfirmation / UnsubscribeConfirmation. Throws `UnauthorizedException` on invalid signature.
- Optional `MEDIACONVERT_SNS_TOPIC_ARN` env: if set, rejects messages from any other TopicArn (defense-in-depth even if signing cert is somehow trusted).
- `confirmSubscription()` auto-handles `SubscriptionConfirmation` by GETting `SubscribeURL` — only allows HTTPS + `*.amazonaws.com` hosts. SNS sometimes resends confirmation; previously the endpoint logged but never confirmed, which would have silently failed if the subscription got recycled.
- Controller `handleWebhook` switched from `@Body() body: any` + `@Query('secret')` to `@Body() body: unknown` → `snsVerification.verify(body)`. No DTO needed (SNS payload shape is third-party + verified by signature, not by class-validator).
- `MEDIACONVERT_WEBHOOK_SECRET` env var is now unused — leaving it in Secrets Manager until cleanup, code path is fully dead. Old SNS subscription URL still includes `?secret=…` query string but signature verification ignores it.
- `scripts/check-api-conventions.ignore` cleaned: the only exception (SNS webhook raw `@Body()`) is no longer needed since `unknown` passes Check 1 natively.

**Why this matters (audit context):**
Shared-secret in a query string is logged by ALB access logs and CloudTrail (URL captured intact). A leak of a single log row leaks the secret. SNS signature verification is keyless from our side — the cert chain is validated against AWS's published SNS signing cert URLs.

---

## [CI hardening — explicit ECS redeploy step in deploy.yml] 2026-05-13

Closes the gap noted on 2026-05-11: when a commit only touches `.github/` (like `614b5d7`), paths-filter skips `build-api`/`build-web`, so the CodeBuild `post_build` step that normally calls `aws ecs update-service --force-new-deployment` never runs. Previously required manual `aws ecs update-service` from a shell.

**Details:**
- Added `deploy-api` job (after `migrate`) and `deploy-web` job (after `build-web`) in `.github/workflows/deploy.yml`
- `deploy-api` is skipped when migrate failed — prevents shipping new code against a stale schema
- Both jobs also run on `workflow_dispatch` trigger even when the build was skipped, giving an in-workflow recovery path for `.github/`-only commits
- `smoke-test` and `summary` jobs depend on the new deploy jobs so the table reflects redeploy status
- Belt-and-suspenders: buildspec.yml `post_build` retains its own `update-service` call (redundant force-deploy is harmless — ECS just rolls once)
- IAM: extended inline policy `fitai-deploy-policy` on role `fitai-github-actions` to add `ecs:UpdateService` (previously had `RunTask`/`DescribeTasks`/`DescribeServices`/`ListTasks` only). Role is provisioned outside Terraform (one-shot setup per `docs-archive/GITHUB_ACTIONS_SETUP.md`), so change is persistent — `terraform apply` does not own it

---

## [6-slice comprehensive audit + 42 fixes + CI enforcement] 2026-05-11

Six specialized review agents (auth, workouts, AI, nutrition+health, social, marketplace+infra) ran against the entire repo. Confidence-filtered findings: 12 BLOCKER + ~28 HIGH + medium. All applied across slices 1–6 (commits `f7906fa..10604b5`).

### Audit fixes deployed (one commit per slice)
- **slice-1 auth** (`f7906fa`): SaveMeasurements/SubmitFitnessTest/SetManualOneRM DTOs, changePassword MinLength 6→8, login redirect URL-parse hardening
- **slice-2 workouts** (`fb6dafb`): IDOR fix on `GET /gym-sessions/:id` + `/share-card`, completeSet setId belongs-to-session check, endSession idempotency, Vision DTOs + @Throttle, form-check path-traversal guard, getMyStats Prisma aggregate, CameraWorkoutScreen formScore 100→0
- **slice-3 AI** (`a426a91`): SynthesizeDto + precache AdminGuard, history-query context→system prompt (prompt-injection mitigation), ElevenLabs error log truncate
- **slice-4 nutrition+health** (`1b5c2cc`): progress-photos presign 3600s→900s, bloodwork/rehab throttle name fix + ANTHROPIC guard + 15s timeout, Mifflin-St Jeor discrete formula, food error sanitize, photoS3Key prefix regex
- **slice-5 social+gamification** (`7e31cdf`): searchUsers drops email + min 2 chars + throttle, duels race fix, creator tip/subscribe atomic XP debit, streak-freeze MAX 2→4 + TOCTOU transaction, leagues guard tier<7, CreateChallengeDto @IsIn, photoKeys @MaxLength
- **slice-6 marketplace+infra** (`10604b5`): NotifyModule duplicate registration removed, ValidationPipe forbidNonWhitelisted+transform, MediaConvert webhook shared-secret, marketplace purchase TOCTOU into transaction, content/import SSRF guard, gym-finder NaN bounds, experiences XP debit, email digest opt-out filter

### CI enforcement (new, prevents regressions)
- `scripts/check-api-conventions.sh` — greps controllers for: raw `@Body()` types, missing `@Throttle()` on AI endpoints, unknown named throttle keys
- Found and fixed 7 additional violations beyond audit (achievements/intelligence/social/sessions/preprocessing — DTOs added)
- Wired into `.github/workflows/ci.yml` as required step
- `npm run lint:conventions` + `npm run lint:docs` for local dev
- Intentional exceptions tracked in `scripts/check-api-conventions.ignore` (currently 1 — SNS webhook body)

### New docs
- `docs/api-conventions.md` — canonical controller/DTO/service template + raw SQL guidance + SSRF/webhook patterns
- `docs/pre-launch-checklist.md` — what's already done + pen-test recommendation + KMS encryption plan + scale readiness + compliance items
- ADR #20: API convention CI enforcement

### Stats
- 16 commits this session deployed via GitHub Actions, all smoke tests 115/115
- 42 audit fixes + 7 follow-up DTO additions + 4 new scripts/docs
- TypeScript clean (api + mobile + web)
- 0 outstanding BLOCKER/HIGH findings

### Post-deploy fix — fitai-migrate task OOM (commit `614b5d7`)
`ec4fb7d` workflow failed in migrate step with exit 137 (SIGKILL/OOM): `prisma generate` after `prisma db push` exceeded the 512 MB task definition limit. Schema was already in sync (no-op push) — only the codegen step OOMed.

Fix applied:
- Registered new `fitai-migrate:3` revision via `aws ecs register-task-definition` (memory 512→1024 MB, cpu 256→512 — Fargate valid combo)
- Updated `.github/workflows/deploy.yml` to reference `:3` (commit `614b5d7`)
- Force-deployed API service via `aws ecs update-service --force-new-deployment` because that follow-up commit only touched `.github/`, so paths-filter skipped build/migrate jobs and the new `ec4fb7d` API image (already in ECR from the failed prior workflow) was never deployed by ECS

Followup TODOs (documented in pre-launch-checklist):
- Add `aws ecs update-service --force-new-deployment` step to deploy.yml after build-api (independent of migrate result), so this scenario auto-resolves
- Monitor migrate memory under load; bump again if needed

---

## [Wave 1 + 3 review fixes — code + security audit] 2026-05-05

Two-agent review (code-reviewer + security-reviewer) ran proti commitům `1315254`/`f9e2e7a`/`076f0b9`/`4be618d`/`1e1bf67`. Aplikované fixes:

### Code review (BLOCKER + IMPORTANT)
- **`$queryRawUnsafe` → `$queryRaw`** na 4 místech (porušení `.claude/rules/api.md`):
  - `exercises.service.ts` searchSemantic — `Prisma.sql\`SELECT … embedding <=> ${vector}::vector …\``
  - `history-query.service.ts` rankSessions, reembedRecentSessions, updateSessionEmbedding — všude tagged template literals
- **OuraSyncService.replaceWindow atomic** — `prisma.$transaction([deleteMany, createMany])`. Předchozí non-atomic varianta riskovala silent data loss při createMany failu (recovery score → fallback na self-report bez varování)
- **`fetch` timeout 8s** na všech Oura V2 API calls (`AbortSignal.timeout(8000)`) — prevence noisy-neighbor v cronu
- **Sync concurrency 5 batches** s `Promise.allSettled` v cronu (předtím sequential — DoS surface při 1k+ users)
- **`health-sync.ts` lazy require guard** — `loadHealthKit()`/`loadHealthConnect()` helpers s try/catch, syncFromHealthKit/syncFromHealthConnect early-return při MODULE_NOT_FOUND
- **Daily Brief `recoverySignals`** — response shape rozšířený o `{source: 'wearables'|'self-reported', hrv, sleepHours, restingHR}` aby UI mohlo ukázat "měřeno z Apple Watch — HRV 32 ms" a vysvětlit případnou změnu skóre

### Security review (HIGH)
- **OAuth state JWT — audience + issuer claims** — `audience: 'oauth-state'`, `issuer: 'fitai-oauth'` při sign + verify. Zabraňuje budoucímu cross-token-class confusion (auth JWT nemůže být replayed jako OAuth state, i kdyby provider check byl loosened)
- **State TTL `10m → 2m`** — single-use Oura code mitiguje replay, kratší okno snižuje attack surface
- **OAuth callback throttle `30/min → 10/min`**

### Type cleanups (NIT)
- `avg<T>(items: T[], key: keyof T)` — generic typed (předtím `any[]`)
- SVG gradient IDs prefixované `showcase-` aby nebyl ID collision risk

### Deferred (post-MVP, evidováno jako TODO)
- **H2 — KMS envelope encryption** pro `WearableConnection.accessToken/refreshToken`. Aktuálně plaintext (riziko: RDS snapshot leak = mass token leak, Oura grants 7d health PII scopes). Plán: per-row data key + AES-256-GCM, rotation on token refresh
- **M3 — Universal Links / App Links** místo `fitai://` custom scheme pro Oura redirect (Android pre-app-links risk: malicious app může intercept). iOS WebBrowser.openAuthSessionAsync je safer (system-managed callback)
- **M5 — `seed-embeddings.ts` `$executeRawUnsafe`** s table name interpolation. Safe today (tabulky hardcoded v souboru), ale future-proofing TODO když se script rozšíří

### Verifikace
- TypeScript clean (api + mobile + web)
- API build OK + boot test: 9 nových endpointů mapped (`/exercises/search/semantic`, `/ai-insights/history-query`, `/wearables/connections`, `/wearables/oauth/oura/{authorize,callback,sync}`, DELETE oura, `/wearables/sync`)
- Žádný breaking change

### Stats
- 8 modifikovaných souborů: 4× api/src + 1× api/helpers + 1× mobile lib + 1× web showcase
- 0 nových testů (existing testy passují)

---

## [Wave 3 sneak — Oura Ring OAuth + sync] 2026-05-04

Z roadmap-u Wave 3 první deliverable: directní wearable hardware integrace (kromě HealthKit/Health Connect které agreguje od Apple Watch). Oura Ring má best-in-class API + ~$300 hardware base.

### Backend
- **Prisma**: nový `WearableConnection` model (`@@unique([userId, provider])`, `accessToken`, `refreshToken`, `expiresAt`, `scopes`, `lastSyncAt`)
- **`OuraOAuthService`** (`apps/api/src/wearables/providers/oura/oura-oauth.service.ts`):
  - `generateAuthUrl(userId)` — JWT-signed `state` (10min TTL) jako CSRF protection
  - `exchangeCode(code, state)` — validates state, exchanges za access/refresh tokens (Basic auth s `OURA_CLIENT_ID:OURA_CLIENT_SECRET`)
  - `refreshIfNeeded(connectionId)` — auto-refresh 5min před expiry
  - `disconnect(userId)` — delete connection
- **`OuraSyncService`**:
  - Fetch z Oura V2 API: `/usercollection/sleep`, `/usercollection/daily_activity`, `/usercollection/heartrate`
  - Map na `WearableData` shape: sleep (h), HRV (ms), resting_hr (bpm), heart_rate (bpm), steps, calories
  - Idempotentní replace-window pattern (delete existing 7d → insert fresh)
  - `syncAll()` jako daily cron `@Cron('0 4 * * *')` UTC
- **Endpointy** (5 nových):
  - `GET /api/wearables/oauth/oura/authorize` (JWT, throttle 10/min) → `{url, state}`
  - `GET /api/wearables/oauth/oura/callback` (public, signed state, throttle 30/min) → 302 redirect na `fitai://wearables/oura/connected` nebo `error?reason=...`
  - `POST /api/wearables/oauth/oura/sync` (JWT, throttle 6/h) → manual sync trigger
  - `DELETE /api/wearables/oauth/oura` (JWT) → disconnect
  - `GET /api/wearables/connections` (JWT) → list active providers per user

### Mobile
- `expo-web-browser` installed
- `app.json`: `"scheme": "fitai"` pro deep-link callback
- `api.ts`: `ouraAuthorize()`, `ouraSyncNow()`, `ouraDisconnect()`, `getWearableConnections()` + typed `WearableConnectionInfo`
- `HealthSyncScreen` rozšířený o Oura sekci:
  - On mount načte `getWearableConnections()`, ukáže status (connected / lastSyncAt)
  - "Připojit Oura Ring" → `WebBrowser.openAuthSessionAsync(url, 'fitai://wearables/oura/connected')` — auto-zachytí redirect
  - Connected stav: "Synchronizovat teď" + "Odpojit Oura"
  - LoadingState / ErrorState / haptic feedback

### Required env vars (production deploy)
- `OURA_CLIENT_ID`, `OURA_CLIENT_SECRET` (Oura developer portal — viz developer.ouraring.com)
- `OURA_REDIRECT_URI` (Oura redirect — pointuje na `https://fitai.bfevents.cz/api/wearables/oauth/oura/callback`)
- `OURA_SUCCESS_REDIRECT` (default `fitai://wearables/oura/connected`)
- `OURA_ERROR_REDIRECT` (default `fitai://wearables/oura/error`)
- Doplnit do AWS Secrets Manager: `fitai/oura-client-id`, `fitai/oura-client-secret`; ECS task def s env mapping

### Wave 2 mobile pose detection — already shipped ✅
Při review zjištěno: `apps/mobile/src/lib/pose/` (mlkit-adapter, frame-processor, rep-counter, safety-checker, feedback-engine, coaching-engine) + `CameraWorkoutProScreen.tsx` + Expo plugin `with-mlkit-pose.js` (custom FitAIPoseDetection CocoaPod) — **mobile pose parity s webem už existuje**. Wave 2 #20/#21 z plánu už není třeba implementovat.

### Verifikace
- TypeScript clean (api + mobile)
- Build OK (po `rm tsconfig.tsbuildinfo` + tsc — incremental cache invalid)
- Boot: 5 Oura routes mapped (`/oauth/oura/authorize`, `/callback`, `/sync`, `/oura DELETE`, `/connections GET`)

### Stats
- 4 nové soubory: oura-oauth.service.ts, oura-sync.service.ts, oura.controller.ts, wearables-connections.controller.ts
- 7 modifikovaných: schema.prisma (User + WearableConnection model), wearables.module.ts, mobile api.ts + HealthSyncScreen.tsx + app.json + package.json
- 1 cron přidán (daily 04:00 UTC sync)

---

## [Wave 1 backend — pgvector + RAG + HealthKit-aware Daily Brief] 2026-05-04

Tech-uplift "Wave 1" první polovina. Backend je kompletní + lokálně ověřený, mobile native moduly (HealthKit/Health Connect) zbývají na separate session s EAS build.

### pgvector infrastructure
- Local docker-compose postgres image swap: `postgres:16` → `pgvector/pgvector:pg16` (volume `fitai_pgdata` zachován)
- `CREATE EXTENSION vector` (pgvector 0.8.2) + collation refresh + reindex
- Prisma schema: `embedding Unsupported("vector(1536)")?` přidáno na `Exercise`, `Recipe`, `WorkoutSession`
- HNSW indexy s `vector_cosine_ops` + `WHERE embedding IS NOT NULL` partial filter
- Pro produkci: `CREATE EXTENSION vector` na RDS Postgres 16 (out-of-the-box, žádný downtime), pak `prisma db push` přes ECS migrate task

### EmbeddingsService (shared, @Global module)
- `apps/api/src/embeddings/{embeddings.module,embeddings.service}.ts` — lazy OpenAI client, `text-embedding-3-small` (1536 dim)
- API: `embed(text)`, `embedBatch(texts)`, `toVectorString(vector)` — používáno semantic search + RAG + cron

### Embedding seed script
- `apps/api/prisma/seed-embeddings.ts` — embeduje `Exercise.descriptionCs/nameCs/muscleGroups/equipment` a `Recipe.name/ingredients/tags`
- `npm run seed:embeddings` (vyžaduje `OPENAI_API_KEY` env var, ~$0.05 jednorázový náklad pro 60 cviků)
- Idempotentní — skip rows where `embedding IS NOT NULL`

### Semantic exercise search
- `POST /api/exercises/search/semantic` — natural-language query → top-K cosine similarity match
- DTO validace (`query` 2-200 znaků, `limit` 1-20)
- `@Throttle(30/min)`, `@UseGuards(JwtAuthGuard)`, Redis cache 1h per query hash (content-only key)
- Vrací `{ id, name, nameCs, descriptionCs, category, equipment, muscleGroups, relevance }` (relevance 0-1 z `1 - cosine_distance`)

### RAG history query
- `POST /api/ai-insights/history-query` — uživatel pokládá natural-language otázku ("co mi šlo loni v dubnu?"), backend retrieves top-10 nejrelevantnějších `WorkoutSessions` přes pgvector, posílá kontext do Claude Haiku
- Nový `HistoryQueryService` (`apps/api/src/ai-insights/history-query.service.ts`) s:
  - `query(userId, query)` — cached 24h per user+query
  - `reembedRecentSessions()` `@Cron('0 3 * * 0')` — každou neděli 3:00 UTC, batch 100 sessions, 50 per OpenAI batch
- DTO `query` 3-300 znaků, `@Throttle(10/hour)`
- Fallback summary když Claude API nedostupné

### Daily Brief — wearable-aware recovery score
- Nový helper `calcRecoveryScoreSmart(checkIns, wearables)` v `ai-insights.helpers.ts` — preferuje HRV / objective sleep / resting HR z `WearableData` přes `DailyCheckIn` self-report
- `getDailyBrief()` načítá 7d `WearableData` (`hrv`, `sleep`, `resting_hr`) paralelně s checkIns
- Claude prompt obsahuje `zdroj: wearables/self-reported` + konkrétní HealthKit hodnoty když jsou dostupné
- Fallback na původní `calcRecoveryScore` když user nemá wearables data — žádný breaking change pro existing users

### Wearables sync DTO rozšíření
- `apps/api/src/wearables/dto/sync-wearables.dto.ts` — přidány providery `google_fit` + `health_connect` pro Android Health Connect; `sessionId` jako optional UUID
- Existing `POST /api/wearables/sync` endpoint je drop-in pro mobile native moduly (žádný nový endpoint není třeba)

### Verifikace
- TypeScript clean (`npm run lint` 0 errors)
- API build úspěšný (`npm run build`)
- Local boot: `EmbeddingsModule dependencies initialized` + obě nové routes mapped (`Mapped {/api/exercises/search/semantic, POST}`, `Mapped {/api/ai-insights/history-query, POST}`)

### Stats
- 8 nových souborů: `embeddings/{service,module}.ts`, `seed-embeddings.ts`, `history-query.service.ts`, 2 DTO, package.json script, schema vector fields
- 4 modifikované: `app.module.ts`, `exercises/{controller,service}.ts`, `ai-insights/{controller,module,service,helpers}.ts`, `wearables/dto/sync-wearables.dto.ts`, `docker-compose.yml`
- 0 breaking changes (existing users + endpoints fungují beze změny)

### Mobile Wave 1 (HealthKit + Health Connect) ✅
- Packages: `@kingstinct/react-native-healthkit` (TurboModule-ready, kompatibilní s `newArchEnabled: true`) + `react-native-health-connect` (Mateus Ribeiro, Expo plugin)
- `app.json` rozšíření:
  - iOS Info.plist: `NSHealthShareUsageDescription` + `NSHealthUpdateUsageDescription`
  - iOS entitlement `com.apple.developer.healthkit`
  - Android permissions: `READ_HEART_RATE`, `READ_SLEEP`, `READ_STEPS`, `READ_HEART_RATE_VARIABILITY`, `READ_RESTING_HEART_RATE`
  - Plugins: `@kingstinct/react-native-healthkit` (s usage descriptions) + `react-native-health-connect`
- `apps/mobile/src/lib/health-sync.ts` — cross-platform wrapper: `requestHealthPermissions()`, `syncRecent7Days()` (mapuje HealthKit / Health Connect záznamy na backend `WearableData` shape, lazy-require pattern dle mobile.md)
- `apps/mobile/src/lib/api.ts` — přidány `syncWearables()` + `getRecoveryScore()` (typed `WearableEntry` interface)
- Nový screen `HealthSyncScreen.tsx` — onboarding s vysvětlením, connect button, status display, re-sync; haptic feedback (tap/success/warning/error), error state s retry
- Wired v `AppNavigator.tsx` (Stack.Screen `HealthSync`) + `ProfileScreen.tsx` SECONDARY menu

### Co zbývá z Wave 1 (user-driven)
- `cd apps/mobile && npx expo prebuild --clean && cd ios && pod install` (lokální native sync)
- `eas build --profile development --platform ios` + Android (~15 min každá)
- Device test: open `Profile → Health Sync → Připojit Apple Health/Health Connect`, verify permission prompt + initial sync
- Production deploy: `CREATE EXTENSION vector` na RDS, `prisma db push` přes ECS migrate task, embedding seed přes ECS task s `OPENAI_API_KEY` ze Secrets Manager
- Smoke test prod (`bash test-production.sh` → 115/115)

---

## [Mobile iOS native pass — 47 screens + foundation + creator-dashboard fix] 2026-05-03

### Foundation (Phase 0)
- Installed `@gorhom/bottom-sheet`, `expo-blur`, `react-native-gesture-handler`, `expo-linear-gradient`
- App.tsx: wrapped GestureHandlerRootView + SafeAreaProvider + BottomSheetModalProvider
- AppNavigator: native iOS slide_from_right transitions, fullScreenGestureEnabled, dynamic tab bar height via useSafeAreaInsets
- 10 new native primitives in `apps/mobile/src/components/native/`: useHaptic, usePullToRefresh, LoadingState, EmptyState, ErrorState, NativeBlurOverlay, showActionSheet helper, NativeBottomSheet, NativeConfirm, NativeListItem

### Wave 1 — Tier A (9 screens)
AIChatScreen, CalendarScreen, CameraWorkoutScreen, FormCheckScreen, JidelnicekScreen, JournalScreen, LeaguesScreen, ProgressPhotosScreen, VyzivaScreen

### Wave 2 — Tier B (16 screens)
AICoachScreen, BundlesScreen, ClipsScreen, CommunityScreen, DropsScreen, DuelsScreen, ExperiencesScreen, MaintenanceScreen, OnboardingScreen, PlanDetailScreen, ProfileScreen, RoutineBuilderScreen, SquadsScreen, StreaksScreen, SupplementsScreen, VIPScreen

### Wave 3 — Tier C polish (22 screens)
CoachingNotesScreen, DashboardScreen, DomaScreen, ExerciseDetailScreen, ExercisesScreen, GearScreen, HabityScreen, LekceScreen, LessonDetailScreen, LoginScreen, PlansScreen, PlaylistsScreen, ProgressScreen, RecordsScreen, RegisterScreen, SlovnikScreen, TrainersScreen, UspechyScreen, VideoDetailScreen, VideosScreen, WishlistScreen, CameraWorkoutProScreen (verified already-native, no changes needed)

### Anti-iOS patterns eliminated
- 38 instancí `Alert.alert` (non-error confirms) → `NativeConfirm` bottom sheet nebo inline error banner
- 6 `<Modal>` (RN built-in) → `NativeBottomSheet` (`@gorhom/bottom-sheet`)
- ~15 plain "Back" / "← LIST" text → native iOS chevron (‹) s 12pt hit slop
- 0 → semantic `useHaptic` napříč všemi screens (tap/press/heavy/selection/success/warning/error)
- 5 → 30+ screens používají `useSafeAreaInsets()` přes manual SafeAreaView
- 1 → 5+ screens mají RefreshControl pull-to-refresh
- V2Loading generic spinner → `LoadingState` s explicit label
- Plain "no items" texty → `EmptyState` s ikonou + body
- Custom inline retry UI → standardizovaný `ErrorState`
- Pre-existing TS errors v JournalScreen mood (number → string enum)

### Web fix — creator-dashboard
`apps/web/src/app/(app)/creator-dashboard/{page.tsx,ContentTools.tsx}` — opraveno 5 frontend↔backend shape mismatches: stats endpoint (subscriberCount→subscribers, monthlyXP→monthlyXPEarned, totalXP→totalXPEarned, postCount→posts, topPostTitle→topPost), subscriber-growth ({date,newSubs,churn}), earnings ({week,tips,subscriptions}), post-performance (caption→title, likeCount→likes), top-hashtags ({name,count} objekty místo "[object Object]"). Plus přidán "Creator status pending" empty state pro non-creator účty.

### Code + Security review fixes
- **P0** NativeConfirm double-call onCancel (resolvingRef guard)
- **M** VyzivaScreen S3 upload `upload.ok` check before analyzeFoodPhoto
- **L** PlaylistsScreen domain whitelist tightening (`endsWith('.' + d)` místo `endsWith(d)`)
- **L** NativeListItem dead `align` parameter removed

### Stats
- 41 commits, 35 atomic per-screen + foundation + creator-dashboard fix + review fixes
- Files changed: ~50 files, +3000 insertions, -1500 deletions
- TypeScript clean, all native deps audited (no CVEs)
- 4 review findings applied
- Mobile binary requires `eas build --profile development --platform ios` to ship to devices (web auto-deploys via GHA)

---

## [Mobile QA Audit — 43 screens, 120+ bugs fixed, security hardened] 2026-05-02

### Critical Fixes (app-breaking)
- **VIPScreen** — every user shown "You are VIP member" (truthy `{isVip:false}` object check)
- **CalendarScreen** — CRASH on any scheduled workout (flat array vs grouped `{date,workouts[]}` mismatch)
- **LeaguesScreen** — CRASH on `null.toLowerCase()` when user not in league
- **JournalScreen** — mood NEVER saved (frontend sent number 1-5, backend expected enum GREAT/GOOD/NEUTRAL/TIRED/BAD)
- **MaintenanceScreen** — deload button NEVER appeared (wrong enum values: `overloaded` vs `OVERDUE`)
- **ProgressScreen** — 2x crash on `insights.plateaus.length` without optional chaining

### Data Shape Mismatches Fixed (15+ screens)
- DuelsScreen: `challengerName` → `challenger.name`, `opponentScore` → `challengedScore`
- DropsScreen: `price` → `priceXP`, `remaining` → `remainingEditions`, `endsAt` → `endDate`
- ExperiencesScreen: `name` → `title`, `location` → `locationAddress`, `price` → `priceKc`
- GearScreen: `name` field doesn't exist (backend has `brand`+`model`), category icons UPPERCASE
- SupplementsScreen: `item.name` → `item.supplement.name`, timing colors lowercase→UPPERCASE
- RecordsScreen: `deltaKg` → `deltaWeight`, `achievedAt` → `date`
- VIPScreen: 4 nested field mismatches (`eligibility.stats.xpRank` not `eligibility.xpRank`)
- SquadsScreen: `totalXP` → `weeklyXP`

### Security Fixes
- **api.ts**: HTTP 204 No Content crash fix (DELETE endpoints), 401 race condition (parallel requests), query param encoding
- **auth-context**: Only logout on 401, not on network/500 errors (was logging out on transient issues)
- **PlaylistsScreen**: URL domain whitelist on Linking.openURL (open redirect prevention)
- **AIChatScreen**: Input length validation (backend max 1000 chars)
- **DuelsScreen**: Replaced iOS-only Alert.prompt with Alert.alert (Android crash fix)

### Functional Fixes
- ExercisesScreen: 3 missing muscle group filters (HAMSTRINGS, CALVES, FULL_BODY)
- VideosScreen: Client-side filtering → server-side `?category=X`, missing MOBILITY filter
- FormCheckScreen: Upload flow was completely non-functional (no file picker). Added expo-image-picker + S3 upload. Added history display + exercise search.
- ClipsScreen: Like action destroyed paginated data. Fixed with local state update + server response sync.
- StreaksScreen: Freeze button clickable at 0 remaining. Freeze status shape lost after use.
- CameraWorkoutProScreen: Stale phaseName closure, set summary wrong math, rest timer leak on unmount

### Loading/Error States Added (30+ screens)
- Every screen now has V2Loading spinner during fetch
- Error states with retry buttons on primary data loads
- Empty states distinguish "loading" from "no data"

### CZ→EN Translation (all 43 screens)
- All UI text, labels, buttons, alerts, empty states, section headers translated

### Code Review + Security Audit
- Code review agent: confirmed consistent patterns across all 47 screen files
- Security agent: confirmed JWT in expo-secure-store, no Alert.prompt, proper permissions
- Deprecated MediaTypeOptions replaced with SDK 54 string arrays

### Stats
- 41 commits, 44 files changed, 1549 insertions, 884 deletions
- 43 screens audited (each: read → API test → backend verify → fix → commit)
- 120+ bugs found and fixed
- 0 TypeScript errors introduced

---

## [Expert QA Audit — 60+ fixes across 96 pages, 17 domains] 2026-05-02

### Security Fixes
- **S3 upload-url endpoint** was missing AdminGuard — any authenticated user could upload to S3 bucket. Fixed
- **base.ts 401 handler** race condition — redirect and throw ran simultaneously, causing React state updates on unmounting component. Fixed with immediate throw
- **Pricing open redirect** — catch block was navigating to unvalidated URL on parse failure. Now blocks invalid URLs
- **Promo card ctaUrl** — external URLs now open in new tab with noopener,noreferrer

### Critical Functional Fixes
- **Exercise filter chips** were completely non-functional — FILTERS (Strength/Hypertrophy/Cardio) didn't match actual muscleGroups (CHEST/BACK/LEGS). Replaced with real muscle group categories + FILTER_GROUPS mapping
- **Onboarding goal IDs** ('move','strength','run') didn't match backend enum ('STRENGTH','HYPERTROPHY','ENDURANCE'). Every onboarding got 400 error. Added GOAL_MAP
- **Onboarding experience IDs** ('new','returning','experienced') didn't match comparison values. Every user got experienceMonths: 48. Added EXP_MAP
- **Bloodwork 4/8 test types** (hemoglobin, ferritin, vitD, tsh) didn't exist in backend whitelist. Aligned with backend VALID_TESTS
- **Boss-fights completeBoss** sent wrong DTO ({timeSeconds,score} vs backend {score,defeated}). Always 400 error
- **Habits toggle logic** broken for all field types — steps=5 meant 5 steps, sleep=5 meant 5 hours. Added per-field TOGGLE_VALUES with proper thresholds
- **Follow/unfollow** used same API call (POST) for both directions. Now correctly uses DELETE for unfollow
- **Public profile stats** used `profile.stats.X` but backend returns `profile.progress.X`. Added fallback chain
- **Form-check** initial state was 'analysis' showing hardcoded fake data. Changed to 'upload'
- **Marketplace category filter** passed object instead of string to API. URL was `/marketplace?[object Object]`

### Dead Features / Misleading UI Fixed
- 3 dead detail page links (marketplace/[id], experiences/[id], courses/[id]) → 404. Fixed or disabled
- FEATURED/PROGRAMS cards on marketplace were not clickable. Wrapped in Links
- AI chat context panel was 100% hardcoded (recovery 62, fake sleep data). Replaced with real API calls
- Body-report page 100% hardcoded data. Added PREVIEW banner
- Calendar "Add session" button had no onClick. Disabled with "coming soon"
- Live page Join buttons now disabled with "Coming soon" banner
- Progress page body photos were fake 6-week placeholder. Replaced with honest empty state
- Settings notification toggles were local state only. Wired to real API
- Duels "Challenge a friend" button disabled (needs modal — future feature)
- Bundles Gift button removed (not implemented)
- Clips empty state said "Upload first!" with no upload mechanism. Changed to "coming soon"

### UX Improvements
- 20+ pages got missing loading/error/empty states (videos, doma, exercises, glossary, FitnessScore, etc.)
- Auth: forgot-password + reset-password rewritten from V2 to v3 split-screen design
- Register: added password confirm field + password visibility toggle
- AI coach: save() debounced (was firing API call per keystroke), added error on generate
- Meal plan: preferences panel was unreachable (no toggle button). Fixed
- Nutrition: AI tips were fetched but never rendered. Now displayed above meals
- Supplements: add modal now has dosage + timing input fields (was sending empty strings)
- Experiences: booking now has confirm dialog + success/error feedback banner
- Bundles: purchase now has loading state + confirm (prevents double-click)
- Gear: form resets on modal close (was retaining stale data)
- Gym-finder: error banner now clears on retry
- Export print: added res.ok check (was downloading error HTML as file)
- Maintenance: deload/dismiss now have error handling
- Enterprise: email validation on invite (regex check, not just HTML type)
- Shadow-boxing: Expert filter now includes all difficulty tiers (was skipping intermediate)
- Records + multiple pages: fixed grids to responsive auto-fill

### Language & Design Consistency
- 50+ pages translated CZ→EN (all UI text, labels, buttons, error messages)
- 41+ missing v3- CSS class prefixes restored across 10 files (headings/captions had zero styling)
- v3 design system applied to forgot/reset password, sports hub, workout-mode
- Landing page: removed fake social proof (2.4M members), added features section, responsive nav

### Legal & Compliance
- Privacy policy: added account deletion section + data retention section (GDPR)
- Terms: added governing law (Czech Republic) + age restriction clause (16+, Apple review)
- AI disclaimer: fixed typo, confirmed "not medical advice" prominently displayed
- Admin MAU metric was actually newUsersMonth — relabeled to "New users (30d)"

### Code Quality
- base.ts: handles HTTP 204 empty body responses (was crashing on res.json())
- auth-context: distinguishes auth failures from network errors (was logging out on offline)
- Dashboard: gated API calls on auth state (was firing 6 calls before auth resolved)
- Removed dead code: weekly review fetch never rendered, journal milestones/summary unused
- Lesson detail: error state resets on slug change (was permanent)
- Glossary: loading state moved inside debounce (was flickering on every keystroke)
- Trainers: data shape fallback for nested user object (name, avatar, rating, reviewCount)

### Stats
- 45+ commits, 100+ files changed
- 96 pages audited across 17 domains (each domain 2 passes)
- 60+ bugs found and fixed (including 4 security, 15+ critical, 20+ important)
- 0 TypeScript errors introduced

---

## [Fitness Instagram Wave 2 — Creator Economy, Smart Notifications, Creator Dashboard] 2026-04-30

### Creator XP Economy
- XP-based subscriptions (100-5000 XP/month, 70/30 creator/platform split)
- Tip system (preset 50-1000 XP + custom 10-5000 + message)
- Subscriber-only posts (blur overlay for non-subscribers)
- Daily subscription renewal cron (03:00 UTC, auto-deactivate on insufficient XP)

### Smart Notifications v2
- 11 notification types: follower, like, comment, challenge, squad PR, buddy workout, tips, milestones
- Inline triggers in posts (like/comment) and social (follow) services
- Engagement-driven cron (every 2h): buddy workouts, post milestones
- Batching: 5+ same-type in 5 min → single notification
- Deduplication: same actor+target+type within 24h
- Notification page: social tabs, mark read, unread counter

### Creator Dashboard (/creator-dashboard)
- Stats hero: 6 metrics (subscribers, XP earned, posts, engagement rate, top post)
- Analytics: subscriber growth chart (30d), XP earnings (12 weeks), post performance table, top hashtags cloud
- Content tools: scheduled posts (create/edit/publish-now/cancel), pinned post, subscription price setter, bulk subscriber-only toggle
- Scheduled post publisher cron (every 1 min)

### Feed Integration
- Subscriber-only blur: non-subscribers see blurred posts with "Subscribe for X XP" CTA
- Pinned posts: shown first on creator profile
- Scheduled posts excluded from all feed queries

### Backend
- 3 new NestJS modules: creator-economy (7 endpoints), notify (global service), creator-dashboard (13 endpoints)
- 4 new smart-notifications endpoints
- 3 new Prisma models (CreatorSubscription, CreatorTip, SocialNotification), 1 new enum
- Post extended: isSubscriberOnly, isPinned, publishAt, isScheduled
- 3 cron jobs: subscription renewal, engagement check, scheduled publisher

### Frontend
- v3 SubscriberBlur + TipModal components
- PostCard: blur overlay + pinned badge
- /creator-dashboard page (stats + analytics + content tools)
- /notifications refactored with social tabs + mark read
- Mobile: creator economy API + subscriber blur overlay

---

## [Fitness Instagram Wave 1 — Posts, Feed, Hashtags, Badges, Promo] 2026-04-30

### Post System
- New Post model with photos (1-4), captions (2000 chars), auto-cards
- S3 presigned upload for post photos
- Like/unlike toggle, comments, delete own posts
- Hashtag auto-parsing from captions (#BenchPR → clickable links)

### Algorithmic "For You" Feed
- 3 feed tabs: Pro tebe (algorithmic), Sledovani (chronological), Trending
- Scoring: engagement * sourceWeight * timeDecay * diversityBoost
- Background workers: engagement recompute (10 min), trending hashtags (hourly)
- Fallback to chronological for users with < 5 follows

### Hashtags + Trending
- Hashtag model with auto-parse, upsert, postCount tracking
- Trending computation: recent uses / log(total) penalizes evergreen tags
- /trending page: top 3 hero, hashtag grid (24h/7d), hot posts
- Autocomplete search while composing posts

### Verified Badges
- BadgeType enum: NONE / CREATOR (orange star) / VERIFIED (blue check)
- Auto-set CREATOR on creator approval (won't downgrade VERIFIED)
- Admin endpoints: verify/unverify user

### Promo Cards
- PromoCard model with audience targeting + priority
- Feed injection at positions 5, 12, 20 (max 3 per load)
- Dismiss tracking via Redis (30-day TTL)
- 8 seed promo cards for feature discovery

### Frontend
- v3 Badge, PostComposer, PostCard components
- Community page refactored with feed tabs + infinite scroll
- Trending page with hashtag grid + hot posts
- Mobile CommunityScreen with feed tabs

### Backend
- 4 new NestJS modules: posts (8 endpoints), hashtags (4), feed (3), promo (5)
- 8 new Prisma models, 5 new enums
- User.badgeType + badgeVerifiedAt fields
- 2 cron jobs (engagement scoring, trending computation)

---

