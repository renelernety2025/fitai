# FitAI Changelog

Lidsky čitelná historie změn. Aktualizovat při každém deployi.

> **Archive (čti přímo, NEJSOU auto-load):**
> - `CHANGELOG-archive/2026-05-wave-and-mobile-qa.md` (2026-05-02 to 2026-05-05 Wave 1+3 review, Mobile QA, Expert QA)
> - `CHANGELOG-archive/2026-04-fitness-instagram.md` (2026-04-30 Fitness Instagram Wave 1 + Wave 2)
> - `CHANGELOG-archive/2026-04-features-and-cross-industry.md` (2026-04-20 to 2026-04-22)
> - `CHANGELOG-archive/2026-04-voice-coaching-and-streaming.md` (2026-04-11 to 2026-04-19)
> - `CHANGELOG-archive/2026-04-foundation-and-infra.md` (2026-04-07 to 2026-04-09)

---

## [Platform hardening — Vlna 0+1 batch 1] 2026-07-01 → 2026-07-02

Plný platformní audit (`docs/AUDIT-2026-07-PLATFORM.md`) + první dvě vlny fixů.

- **CI konečně funguje**: ci.yml byl pnpm na npm repu → install padal na
  každém PR, gate nikdy negatoval. Přepsáno na npm workspaces + turbo,
  přidán build gate, unit testy, conventions/docs checky, gitleaks,
  migration guardy, mobile typecheck. Dependabot (npm+actions+terraform).
- **První testy v repu**: jest + @swc/jest, 76 unit testů (XP/streak/level,
  recovery score, Epley 1RM, TDEE/makra, atomic XP debit). Extrakce
  `one-rm.helpers.ts` + `nutrition.calculations.ts` (chování 1:1).
- **Prisma migration history (ADR-22, krok 1)**: baseline `0_init`
  (127 tabulek), smazané 4 zombie migrace z 2026-04, CI guard na
  destruktivní DDL, drift check skript. Produkce zatím na db push;
  cutover na `migrate deploy` následuje po baseline resolve.
- **Deploy safety**: buildspec už nedeployuje před migrací (double-deploy
  + code-ahead-of-schema bug), rolloutState gate odhalí circuit-breaker
  rollback, pre-migrate RDS snapshot (IAM grant pending — RUNBOOK),
  git tag per deploy, `docs/RUNBOOK-rollback.md`.
- **Terraform srovnán s produkcí a aplikován**: květnové ruční změny
  (autoscaling 20/10 @60 %, ALB idle 120, HTTPS redirect, IAM assets,
  CodeBuild https URL) zpětně zaneseny do kódu — apply by je jinak
  revertoval. Nově: deployment circuit breakery, web autoscaling policy
  importována, TG matcher 200-399, ECR lifecycle 30, DATABASE_URL
  connection_limit=10, S3 public-access-block + SSE, RDS deletion
  protection, rds/redis alarmy + SNS email. **Redis cluster obnoven**
  (byl smazán v úsporném režimu; cache + throttle store zpět, ~$12/mo).
- **Web/mobile tsc 0 chyb**: 9 skrytých chyb opraveno (duplicate
  @types/react přes tsconfig paths pin, otypované feed/promo/upload API
  returns), smazáno 49 commitnutých build artefaktů + 180 untracked
  .js/.d.ts v api/src. Bundle ID mismatch (App Store blocker) opraven
  v eas.json. Smoke test už self-nepasuje při výpadku auth.
- Root expo/RN deps ponechány (záměrný anti-hoist pin — dokumentováno).

---

## [Audit follow-up — slices 7-14] 2026-05-15 → 2026-05-20

Continues the 2026-05-14 monster audit cleanup. 8 additional commits
deployed; biggest wins are App Store unblocks (mobile account
deletion + content moderation) and operator observability (cron
audit table + ops dashboard + full AI cost tracking).

**App Store path is now fully covered:**
- Apple 5.1.1 (account deletion) — done via mobile AccountScreen
- Apple 1.2 (UGC moderation) — done end-to-end: report + block +
  admin review queue + ban + content hide + banned-user JWT rejection

### Slice 7 (`f5cddd1`) — Mobile account screen + forgot password
- New `AccountScreen` (change name / change password / delete account
  with NativeConfirm + auto-logout) reachable from Profile.
- New `ForgotPasswordScreen` wired into auth stack + Login link.
- mobile/lib/api: + authForgotPassword, authResetPassword,
  updateUserName, changeUserPassword, deleteUserAccount.
- auth-context exposes updateUser() for optimistic name refresh.
- Ships with next EAS bundle.

### Slice 8 (`bf99bf5`) — Duels create UI + AI metrics top 12
- /duels page: enable Challenge button → ChallengeModal with user
  typeahead, type/metric/duration selects, XP bet slider 0-500.
- metrics.service: new trackClaudeUsage() helper (fire-and-forget).
- Wired into 12 highest-volume Claude callers (coaching ×3,
  ai-insights ×5, ai-planner, nutrition ×2, history-query). Each
  emits to CloudWatch FitAI/AI namespace with Endpoint dimension.

### Slice 9 (`1b98d23`) — Content moderation backend + FE
- Schema: ContentReport + UserBlock + User.bannedAt + Post.isHidden
  + Clip.isHidden. 3 new enums, 2 new tables, indexes.
- New /moderation module (controller + service + DTOs). Endpoints:
  POST /moderation/report (throttled 10/h),
  POST /moderation/block/:id (throttled 30/h, unfollows both ways),
  DELETE /moderation/block/:id, GET /moderation/blocked,
  GET /moderation/admin/reports?status=,
  POST /moderation/admin/reports/:id/review (HIDE_CONTENT/BAN_USER/
  DISMISS), POST /moderation/admin/users/:id/ban, /unban.
- JwtStrategy rejects banned users on every request.
- AuthService.login rejects banned users at login.
- Feed queries filter isHidden: false on Post.
- Posts.getUserPosts + Clips.findClips also filter isHidden.
- new web ReportModal + PostCard ⋯ menu (Report / Block).
- new web lib/api/moderation.ts.

### Slice 10 (`4c2745c`) — Moderation polish
- New /admin/moderation page: filter tabs (PENDING /
  REVIEWED_VALID / REVIEWED_INVALID / DISMISSED), per-report row with
  Hide / Ban / Dismiss buttons + confirm + notes prompt.
- /admin gets "Moderation queue" CTA + V2Layout admin dropdown adds
  the page.
- feed.service: new getBlockedUserIds() (300s cached) applied to
  forYou + following + trending + chronologicalPublic. Block now
  hides content both directions (blocker → me and me → blocker).
- moderation.service invalidates feed-blocks + following cache on
  block/unblock for immediate feed re-convergence.
- mobile API client + ReportSheet bottom-sheet modal + CommunityScreen
  long-press → Alert.alert (Report / Block @user / Cancel) per item.

### Slice 11 (`2797a1f`) — AI metrics remaining 8 callers
- All 21 Claude call sites now emit CloudWatch metrics:
  + recipes/from-photo (Sonnet), workout-journal/monthly-summary,
    workout-journal/daily-insight, progress-photos/analyze (Sonnet
    body photo), form-check/analyze (Sonnet), bloodwork/analyze,
    rehab/plan, discover-weekly/generate, preprocessing/choreography
    (Opus video pipeline).

### Slice 12 (`17fb1ef`) — Cron observability
- Schema: CronRun model + CronRunStatus enum, indexed by name + time.
- New global CronTrackingModule (controller + service):
  - track(name, fn) wraps a cron, emits CronRun row (RUNNING → OK
    + duration, or FAILED + error). Re-throws so Sentry / loggers
    still fire. Never blocks the cron on a tracking-row failure.
  - @Cron('30 2 * * *') daily prune older than 30 days.
  - GET /admin/cron/summary (24h grouped), GET /admin/cron/runs.
- 3 critical crons wrapped: leagues-week-end, seasons-rotate,
  email-weekly-digest.
- New /admin/ops web page: summary cards + recent runs table.
- V2Layout admin dropdown: "Ops (crons)".

### Slice 13 (`194e953`) — Clips video playback (signed S3 URL)
- ClipsService.getPlayUrl() mints 15-min presigned GetObjectCommand.
- ClipsController GET /:id/play-url throttled 60/min.
- /clips page swaps text placeholder for `<video>` (autoplay + muted
  + loop + playsInline, 9:16 aspect, fresh signed URL per slide).
- mobile ClipPlayer component using expo-video (lazy require per
  CLAUDE.md). ClipsScreen now plays each clip above the caption.
- Mobile requires next EAS rebuild for expo-video autolink.
- HLS pipeline still deferred — direct mp4 plays fine on all current
  browsers + iOS/Android.

### Slice 14 (`2d84f1f`) — 5 more crons wrapped
- 9 of 13 declared crons now emit CronRun audit rows:
  oura-daily-sync, notifications-streak-reminders,
  notifications-morning-briefs, history-reembed-sessions,
  social-flash-challenge, creator-renew-subscriptions (+ 3 from
  Slice 12).
- 4 high-frequency feed crons (every 1/10/60 min, every 2h) still
  unwrapped — would generate too many rows; will add sampled
  wrapping in a follow-up with a separate CronRunSample table.

### Operator can now answer (without grepping CloudWatch):
- "What's Claude burning per endpoint today?" (CloudWatch FitAI/AI)
- "Did the league cron run last Monday?" (/admin/ops)
- "Are there pending reports?" (/admin/moderation queue)

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

## [Monster audit + fix slices 1-6] 2026-05-14

8 parallel review agents (6 customer-facing slices + visibility/orphan
+ operator) audited all 91 modules / 97 web pages / 49 mobile screens /
423 endpoints. Confidence-filtered: 21 BLOCKER + 30 HIGH + 25 MEDIUM.

Full report: `docs/audit-2026-05-14.md`.

Six fix commits this session — every BLOCKER/HIGH that doesn't require
multi-hour feature work shipped + deployed.

### Slice 1 — critical customer-facing bug fixes (`336bb08`)
- register DTO accepts optional `level` (BEGINNER/INTERMEDIATE/ADVANCED).
  forbidNonWhitelisted was 400-ing every signup attempt.
- auth/toProfile includes `isAdmin`. Admin pages were permanently
  inaccessible because /auth/me never returned the field.
- /share/:sessionId/share-card → public + throttled 60/min. Share
  recipients (no JWT) were getting 401.
- posts.linkHashtags: `create: { name, postCount: 1 }`. New hashtags
  were stuck at 0 → trending stayed empty.
- posts.deletePost: transactional decrement of linked hashtag counts.
- streaks page fix contract ({available, maxPerMonth, usedDates}) +
  add "Use freeze" CTA (calls POST /streak-freeze/use).
- admin.verifyUser/unverifyUser: pre-check user exists, NotFoundException
  (404) instead of leaking Prisma P2025 as 500.
- AppLayout enforces onboarding redirect for incomplete users.

### Slice 2 — delete stub pages reachable in production (`7ce13f8`)
12 page files deleted, ~1672 LOC removed. Each was 100% hardcoded
mocks reachable via URL: /live, /body-report, /workouts/[slug],
/golf-lab, /shadow-boxing, /soccer-drills, /sequences, /sports,
/workout-mode, /design-system, /showcase. App Store reviewer rejection
risk eliminated. Also removed nav entries + mobile Showcase tile.

### Slice 3 — IDOR + auth gaps + missing throttles (`5b9ef79`)
- workout-plans GET /:id enforces ownership for non-templates (was IDOR).
- home-training/* gets @UseGuards(JwtAuthGuard) + @Throttle 60/min
  (was fully public, unlimited rate).
- buddy/profile DTO requires lookingFor (was all-optional, accepting {}).
- 11 endpoints capped: exercises GET (30/min, public 114 KB catalog),
  users password (5/h), delete-account (3/h), wearables sync (20/h),
  nutrition photo-upload (40/day), recipes photo-url (20/day),
  achievements/leagues/seasons/skill-tree/boss-fights/daily-quests
  write endpoints (per-user limits).

### Slice 4 — gamification fixes (`97ad25f`)
- boss-fights CompleteBossDto accepts optional `durationSec` (feature
  was broken — DTO rejected the field clients needed to send).
- seasons: hardcoded "Jarni vyzva 2026" replaced with dynamic
  buildCurrentMonthSeason(). New @Cron('0 1 * * *') rotateSeasons
  daily-deactivates expired + ensures current month is seeded. Stale
  active season (endDate 2026-04-30, still showing on 2026-05-14)
  resolved.
- gym-sessions endSession now also fires AchievementsService
  .checkAndUnlock — previously achievements only unlocked when user
  manually visited /uspechy.
- daily-quests removed `prisma as any` casts (3 sites).

### Slice 5 — visibility + nav for orphan pages (`eefa1b6`)
16 web pages had full BE + UI but no V2Layout entry. Added to "Více"
dropdown: Gym Finder, Rehabilitace, Údržba, Trending, Playlists,
Streaks, Placené výzvy, Videa, Lekce, Slovník, Discover Weekly,
Vybavení, Wishlist, VIP, Enterprise, Pricing. New conditional "Admin"
section appears only when user.isAdmin (links to /admin + /admin/upload).

### Slice 6 — deep health check + CloudWatch alarms
- /health now pings Postgres (SELECT 1) + Redis (PING) with 500ms
  timeouts. Returns 503 + degraded when DB fails. ALB target check
  will now actually drop a dead task. Redis is treated as optional
  (only DB failure flips overall status). New /health/live for liveness
  probes (returns 200 unconditionally).
- CacheService.ping() + isConfigured() helpers.
- New CloudWatch alarms: RDS FreeStorageSpace < 5 GiB, RDS connections
  > 60, Redis EngineCPU > 75%, Redis DatabaseMemoryUsage > 80% (Redis
  alarms gated on `redis_cluster_id` variable). CloudFront 5xx alarm
  deferred (needs us-east-1 provider alias).

### Deferred (separate sessions or user input)
- Mobile account deletion UI (App Store 5.1.1) — ~2h
- Content moderation system (App Store 1.2) — ~6h
- Sentry DSN provisioning — needs user
- Clips video playback (HLS pipeline) — ~6h
- Post photos broken (NEXT_PUBLIC_CDN_URL env) — needs ops
- Duels create UI — ~1h
- Mobile Forgot Password — ~30 min
- Mobile parity 15+ screens — ~15h
- Marketplace seed data — needs business
- AI token metrics across all Claude callers — ~2h
- Cron observability table + admin widget — ~3h

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


## [Earlier entries archived]

See `CHANGELOG-archive/2026-05-wave-and-mobile-qa.md` for Wave 1+3 review, Mobile QA, and Expert QA entries (2026-05-02 to 2026-05-05).
