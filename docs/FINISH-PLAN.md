# FitAI — Finish Plan (Launch Bible)

> Zivvy dokument. Aktualizovat pri kazdem Phase-level commitu.
> Primarni reference pro multi-session praci z current state do production launch.
> Last updated: 2026-05-01

## Context

FitAI je feature-complete fitness platforma s 88+ moduly. Zadni realni uzivatele, zadny revenue. Cil: spustit, ziskat prvnich 5k MAU, prvnich $2k MRR.

## Strategy

| Service | Current | Target | Blocker |
|---|---|---|---|
| Stripe | Mock mode (3 tiers) | Live (real payments) | API keys needed |
| Resend email | Logger fallback | Live (real emails) | API key needed |
| Claude AI | Live (Haiku + Sonnet) | Live | OK |
| ElevenLabs | Live (Czech voice) | Live | OK |
| S3/CloudFront | Live | Live | OK |
| App Store | Dev build only | Public listing | EAS production build + review |

---

## Category 1: Launch Blockers (must-do before any real users)

| # | Task | Effort | Status | Depends on |
|---|---|---|---|---|
| L1 | Stripe live mode (API keys → Secrets Manager) | 2h | Pending | Stripe account |
| L2 | App Store submission (EAS build + metadata) | 1 day | Pending | L1 |
| L3 | English localization (landing + onboarding + core) | 1 day | Pending | — |
| L4 | Real exercise imagery (3D render thumbnails) | 4h | Pending | — |
| L5 | Resend email live (API key + verify domain) | 1h | Pending | Resend account |
| L6 | Remove/protect demo credentials | Done | ✅ | — |

## Category 2: Growth Infrastructure (needed at 1k+ users)

| # | Task | Effort | Status |
|---|---|---|---|
| G1 | Analytics dashboard (internal: DAU, retention D1/D7/D30) | 4h | Pending |
| G2 | Invite 50 beta testers (personal) | Manual | Pending |
| G3 | 5-10 CZ fitness micro-influencers as creators | Manual | Pending |
| G4 | Onboarding tour refinement (based on beta feedback) | 2h | Pending |

## Category 3: Security Hardening (before scale)

| # | Task | Effort | Status |
|---|---|---|---|
| S1 | httpOnly cookie migration | 4h | Pending |
| S2 | Token invalidation (tokenVersion) | 2h | Pending |
| S3 | Refresh token flow | 4h | Pending |
| S4 | S3 CORS restrict (Terraform) | 30min | Pending |
| S5 | S3 public access block (Terraform) | 30min | Pending |

## Category 4: Integrations (retention drivers)

| # | Task | Effort | Status |
|---|---|---|---|
| I1 | Apple Health sync (sleep, steps, HR) | 2 days | Pending |
| I2 | Google Fit sync | 1 day | Pending |
| I3 | Barcode scanner for food log | 4h | Pending |

## Category 5: Content (quality perception)

| # | Task | Effort | Status |
|---|---|---|---|
| C1 | Professional exercise photos (render from 3D) | 4h | Pending |
| C2 | Exercise video demos (5-10s loops) | Manual | Pending |
| C3 | Seed 20+ example posts in community feed | 1h | Pending |
| C4 | Seed 5 example creator profiles | 1h | Pending |

## Category 6: Scale Readiness (at 10k+ DAU)

| # | Task | Effort | Status |
|---|---|---|---|
| R1 | RDS upgrade (t3.micro → r6g.large) | Terraform | Pending |
| R2 | Redis upgrade (t3.micro → r7g.large) | Terraform | Pending |
| R3 | ECS autoscale max → 100 | 5min | Pending |
| R4 | Read replicas for feed queries | Terraform | Pending |
| R5 | Pre-computed feed (Redis sorted sets) | 3 days | Pending |

---

## Launch Sequence (recommended order)

```
Week 1: L1 (Stripe) + L3 (English) + L4 (images) + L5 (Resend)
Week 2: L2 (App Store) + C3 (seed posts) + C4 (seed creators)
Week 3: G2 (50 beta testers) + G1 (analytics dashboard)
Week 4: G3 (influencers) + iterate based on feedback
```
