# FitAI — Session Notes

> Last updated: 2026-05-01
> Previous session: 2026-04-30 to 2026-05-01 (mega session)

## Where We Are

**Platform state:** Feature-complete, pre-launch. 88+ NestJS modules, 120+ DB models, 96+ web pages, 47 mobile screens.

**This session shipped:**
- Fitness Instagram Wave 1 (posts, feed, hashtags, badges, promo) — 20 commits
- Fitness Instagram Wave 2 (creator economy, notifications, dashboard) — 16 commits
- Scalability Phase 1 (cron locks, batch queries, throttler Redis, composite index) — 7 commits
- Security audit + all Critical/High/Medium fixes — 4 commits
- UX/UI audit + all fixes (nav restructure, hover CSS, accessibility, language) — 4 commits
- QA audit (8 domains) + all 14 issue fixes — 2 commits
- Smoke test CI fix — 1 commit
- Build fixes — 2 commits

**Total:** ~56 commits in single session

## What's Next (priority order)

1. **Stripe live mode** — switch from mock, add real API keys to Secrets Manager
2. **English localization** — landing + onboarding + core flow (i18n)
3. **App Store submission** — EAS production build + metadata + screenshots
4. **Real exercise imagery** — render 3D model thumbnails to replace 3 stock photos
5. **50 beta testers** — personal invite, track retention D1/D7/D30
6. **Wave 3** — Stripe Connect (real money for creators), video editor/filters

## Known Not-Done

### Security (deferred — architecture changes)
- H1: httpOnly cookie migration (JWT currently in localStorage)
- H2: tokenVersion for invalidation after password change
- M2: Server-side logout (Redis token blocklist)
- M6: Refresh token flow (short access + long refresh)

### Infrastructure (Terraform — manual)
- C3: S3 videos bucket CORS restrict to production domain
- H8: S3 public access block on both buckets
- H9: IAM MediaConvert wildcard scope

### UX (Phase C — premium polish)
- Framer Motion spring animations
- Skeleton loading on ALL data-driven pages
- Full responsive audit (hardcoded pixel padding)
- Exercise real photography/rendered thumbnails

## Git State

- Branch: main
- Clean: yes (no uncommitted changes)
- Ahead of origin: 0 (all pushed)
- Last commit: QA audit fixes

## Critical Docs Resume List

1. `CLAUDE.md` — project rules
2. `CONTRACTS.md` — locked API/DB shapes
3. `docs/ROADMAP.md` — current priorities
4. `docs/FINISH-PLAN.md` — launch checklist
5. `docs/ARCHITECTURE.md` — system overview + ADRs
6. `docs/CHANGELOG.md` — recent history

## Dev Server

- API: `cd apps/api && npm run start:dev` (requires Docker postgres on :5435)
- Web: `cd apps/web && npm run dev`
- Production: https://fitai.bfevents.cz
