# FitAI Pre-Launch Checklist

Operational checklist before App Store / public launch. Driven by 2026-05 6-slice audit findings + standard production hardening.

## ✅ Already complete (after 2026-05 audit + fixes)

### Authentication & Authorization
- [x] JWT with bcrypt cost 10, 7-day expiry, hard-required `JWT_SECRET` at startup
- [x] Password reset uses `crypto.randomUUID()`, 1h expiry, invalidates other tokens, identical response for existing/missing email (no enumeration)
- [x] `@UseGuards(JwtAuthGuard)` on every user-data endpoint (verified by audit slice 1–6)
- [x] `req.user.id` from JWT — no body-supplied userId anywhere
- [x] Admin endpoints protected by `AdminGuard` with DB-side `user.isAdmin` check
- [x] OAuth state JWT signed with `audience: 'oauth-state'` + `issuer: 'fitai-oauth'`, 2-minute TTL
- [x] OAuth callback shared-secret query param (MediaConvert webhook)

### Input validation
- [x] `ValidationPipe` global with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- [x] DTO on every `@Body()` — enforced by `scripts/check-api-conventions.sh` in CI
- [x] `@MaxLength` on every user-controlled string (TTS, search, post caption, etc.)
- [x] `@IsUUID` on resource IDs
- [x] SSRF-resistant URL inputs (`content/import` blocks private/link-local hostnames)

### Rate limiting & cost protection
- [x] `@Throttle()` on every Claude / OpenAI / ElevenLabs endpoint — enforced by CI script
- [x] Per-user throttle via `UserIdThrottlerGuard`
- [x] Atomic XP debit via `updateMany` with `totalXP gte` filter (creator tip, marketplace, experiences)
- [x] No body-supplied amounts for paid actions

### Data integrity
- [x] Transactions on multi-step operations (duels payout, marketplace purchase, streak freeze, Oura sync replaceWindow)
- [x] Ownership check in service layer for every IDOR-vulnerable resource
- [x] Pagination/limits on list endpoints
- [x] `_avg`/`_count` aggregation instead of in-memory reduce for stats

### Infra & secrets
- [x] CORS whitelist (`fitai.bfevents.cz` in prod, localhost in dev) — not `'*'`
- [x] Helmet with CSP, HSTS, frame-ancestors
- [x] All secrets via AWS Secrets Manager, never hardcoded
- [x] CloudWatch logs sanitized (`req.headers.authorization`, `*.password` redacted)
- [x] No stack traces returned to client in production

### Privacy & compliance
- [x] Email opt-out filter on weekly digest (`notificationPrefs.workoutReminder`)
- [x] Progress photo S3 keys scoped per-user, ownership enforced on every read/delete/analyze
- [x] User search returns name-matches only (no email enumeration)
- [x] Account deletion cascades through all owned records

## 🟡 Remaining before public launch

### Penetration test (recommended)
- [ ] Engage an external pen-test firm (~$2-5k for scope this size) for:
  - Authentication chain attacks (token replay, JWT confusion)
  - Authorization escalation (privilege+IDOR combos)
  - Race condition exploration (concurrent state mutations)
  - Frontend XSS / clickjacking
  - Mobile app reverse engineering (API endpoint discovery, deep-link hijacking)
  - Real-world social engineering (account takeover via password reset flow)
- Static audit covered the 80% baseline; pen-test closes the 20% that requires runtime exploitation.

### Token encryption at rest (HIGH priority before EU launch)
- [ ] **KMS envelope encryption** for `WearableConnection.accessToken` and `.refreshToken`
  - Currently plaintext (Oura grants 7d health PII scope)
  - Risk: RDS snapshot exfil → mass token leak
  - Implementation: per-row data key via AWS KMS GenerateDataKey, AES-256-GCM ciphertext, key id stored alongside ciphertext, rotate on refresh
  - Estimate: 2 days

### Webhook signature validation
- [ ] **MediaConvert SNS signature verification** (currently shared-secret only)
  - Wire `sns-validator` npm package, verify `x-amz-sns-message-signature` against the `SigningCertURL`
  - Restrict ingress SG to AWS SNS CIDR ranges as defense-in-depth
  - Estimate: 4 hours

### Deep-link hardening (Android)
- [ ] **Universal Links / App Links** instead of custom `fitai://` scheme for OAuth redirects
  - Android allows multiple apps to claim the same scheme → malicious app can intercept OAuth completion
  - Set up `assetlinks.json` on `https://fitai.bfevents.cz/.well-known/assetlinks.json`
  - Replace OAuth redirect URI to `https://fitai.bfevents.cz/oauth/...`
  - Estimate: 1 day

### Scale readiness
- [ ] **k6 load tests** — 4 scenarios (smoke / soak / spike / stress) at 100/1000/10k concurrent
- [ ] **HNSW index verification** on all pgvector queries via `EXPLAIN ANALYZE`
- [ ] **CloudWatch alarms** on API CPU/memory, RDS connections, Redis evictions, 5xx rate
- [ ] **Sentry alert routing** for unhandled exceptions
- [ ] **AWS WAF** rules in front of ALB (rate limit unauthenticated, block common bot UAs, geo-block where applicable)

### Compliance / legal
- [ ] **Privacy policy** review by Czech/EU lawyer (GDPR Art. 13/14 disclosures)
- [ ] **Terms of Service**, AI disclaimer (health/fitness advice not medical), age restriction (13+ COPPA / 16+ GDPR)
- [ ] **Apple App Tracking Transparency** opt-in if using IDFA
- [ ] **Account deletion** flow (already implemented but verify Apple's "deletion from within app" requirement)
- [ ] **Data export** endpoint (GDPR Art. 20 portability) — verify completeness

### Mobile native pre-flight
- [ ] `npx expo prebuild --clean && cd ios && pod install` locally before EAS build
- [ ] EAS dev build → TestFlight (5–10 beta testers)
- [ ] iterate 2-3 weeks → production build
- [ ] App Store review submission (privacy questionnaire, screenshots, AI feature disclosure)

### Monitoring
- [ ] **APM** (Sentry already wired) — add custom transactions for AI endpoints (token usage)
- [ ] **Cost dashboards** — Claude/OpenAI/ElevenLabs monthly spend per feature
- [ ] **User funnel** — registration → onboarding → first workout → first AI interaction → 7-day retention

## 🔵 Nice-to-have

- [ ] **Sentry source map upload** in CI for readable stack traces
- [ ] **OpenAPI/Swagger** spec generated from controllers (NestJS `@nestjs/swagger`)
- [ ] **Postman collection** for QA
- [ ] **Smoke test expansion** — current 115 tests cover happy path; add edge cases per slice findings
- [ ] **Periodic mini-audit** — run the 6-slice agent pass quarterly, not just before launch
- [ ] **OWASP ZAP** baseline scan in CI on PRs

## Audit history

- **2026-05-11**: 6-slice comprehensive audit, 42 fixes deployed (commits `f7906fa..10604b5`). See `CHANGELOG.md` entries 2026-05-11.
- **2026-05-05**: First review (code+security agents) on Wave 1+3 commits, applied to `51ff488` + `9359045`.
- **2026-05-02**: 96 web pages + 43 mobile screens manual QA, 180+ bugs fixed.
