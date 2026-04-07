# FitAI Changelog

Lidsky čitelná historie změn. Aktualizovat při každém deployi.

---

## [v2 Design System — celá platforma] 2026-04-07
### Added
Kompletní redesign celé platformy v jednotném "Apple Music + Activity Rings" stylu (Jonny Ive era B+C). Stará v1 zůstává živá vedle.

**Sdílené komponenty:**
- `apps/web/src/components/v2/V2Layout.tsx` — V2Layout, V2SectionLabel, V2Display, V2Stat, V2Ring
- `apps/web/src/components/v2/V2AuthLayout.tsx` — V2AuthLayout, V2Input, V2Button

**19 nových v2 stránek:**
- `/v2` (landing), `/login-v2`, `/register-v2`, `/onboarding-v2`
- `/dashboard-v2`, `/gym-v2`, `/vyziva-v2`, `/lekce-v2`, `/progress-v2`
- `/lekce-v2/[slug]`, `/slovnik-v2`, `/exercises-v2`, `/exercises-v2/[id]`, `/plans-v2/[id]`
- `/doma-v2`, `/ai-coach-v2`, `/videos-v2`, `/videos-v2/[id]`, `/community-v2`
- `/gym-v2/[sessionId]` (gym session in-progress, reskin, logic 1:1)
- `/workout-v2/[videoId]` (video workout s pose detection, reskin, logic 1:1)

**Princip:** reskin only — žádné změny v API, žádné změny v auth flow, žádné změny v pose detection / rep counter / smart voice / safety checker. Pouze JSX + Tailwind.

**Infrastruktura:**
- Dockerfile přepnut na AWS Public ECR (`public.ecr.aws/docker/library/node:20-alpine`) — žádné Docker Hub rate limity

### Files added
17× `apps/web/src/app/(app)/*-v2/...`, 2× `apps/web/src/components/v2/*`, 1× `apps/web/src/app/v2/page.tsx`, 2× `apps/web/src/app/(auth)/*-v2/page.tsx`

---

## [Section F — Nutrition Tracking] 2026-04-07
### Added
- `FoodLog` model + `FitnessProfile.dailyKcal/Protein/Carbs/Fat` fields
- Modul `nutrition` s endpointy: `/goals`, `/goals/auto`, `/today`, `/log` (CRUD), `/quick-foods`
- TDEE výpočet (Mifflin-St Jeor + activity multiplier + goal úprava)
- 16 quick foods databáze (kuřecí, vejce, tvaroh, rýže, ovesné vločky, whey...)
- Stránka `/vyziva` — makro kruhy, jídelníček po jídlech, quick add modal, auto-výpočet z profilu
- Header link "Výživa"

### Files
- `apps/api/prisma/schema.prisma` (+ FoodLog, +daily macro fields)
- `apps/api/src/nutrition/{module,controller,service}.ts`
- `apps/web/src/app/(app)/vyziva/page.tsx`
- `apps/web/src/lib/api.ts` (+ nutrition functions)

---

## [Section E — Training Outside Gym] 2026-04-07
### Added
- `Exercise.equipment String[]` field — bodyweight = `[]`
- 6 nových bodyweight cviků: Push-up, Bodyweight Squat, Glute Bridge, Mountain Climbers, Burpees, Jumping Jacks
- Nový modul `home-training` s endpointy `/api/home-training/quick`, `/home`, `/travel`
- Stránka `/doma` se 3 tabs (Quick 15min, Doma 35min, Travel 20min)
- Header navigace: Doma

### Files
- `apps/api/prisma/schema.prisma` (+ Exercise.equipment)
- `apps/api/prisma/seed.ts` (+ bodyweight exercises + equipmentMap)
- `apps/api/src/home-training/{module,controller,service}.ts`
- `apps/web/src/app/(app)/doma/page.tsx`
- `apps/web/src/lib/api.ts` (+ home training functions)
- `apps/web/src/components/layout/Header.tsx` (+ Doma link)

---

## [Regression Prevention] 2026-04-07
### Added
- `CONTRACTS.md` — zámčená API, DB modely, frontend routes, core soubory
- `REGRESSION_TESTS.md` — checklist co testovat
- `test-production.sh` — bash script, jeden příkaz otestuje vše
- `CHANGELOG.md` — tento soubor
- `CLAUDE.md` — sekce "Regression Prevention Rules"

**Why:** Uživatel se obával že Claude bude přepisovat fungující funkce při dalším vývoji.

---

## [Section D — Education] 2026-04-07
### Added
- 8 lekcí (technique, nutrition, recovery, mindset)
- 16 termínů ve slovníku
- Lekce týdne widget na dashboardu
- Pre-workout briefing a post-workout debrief endpointy
- Stránky `/lekce`, `/lekce/[slug]`, `/slovnik`
- Header navigace: Lekce, Slovník

### Files
- `apps/api/src/education/` (module, service, controller)
- `apps/api/prisma/schema.prisma` (+ EducationLesson, GlossaryTerm)
- `apps/api/prisma/seed.ts` (+ lessons + glossary)
- `apps/web/src/app/(app)/lekce/page.tsx`
- `apps/web/src/app/(app)/lekce/[slug]/page.tsx`
- `apps/web/src/app/(app)/slovnik/page.tsx`

---

## [Section C — Onboarding + 1RM] 2026-04-07
### Added
- 3-step onboarding wizard (measurements, fitness test, review)
- 1RM test s Epley formulí
- `OneRepMax` model
- `FitnessProfile` rozšíření: age, weightKg, heightCm, onboardingDone
- Stránka `/onboarding`

---

## [Section B — Adaptive Intelligence] 2026-04-07
### Added
- `intelligence` modul: plateau detekce, recovery score, weak points, asymmetry
- Endpointy `/api/intelligence/*`
- `FitnessProfile.priorityMuscles`

---

## [Section A — Fitness Intelligence] 2026-04-07
### Added
- `Exercise.category` (compound/isolation/accessory)
- `Exercise.instructions` (JSON s detailními instrukcemi)
- `ExerciseSet.rpe`, `isWarmup`, `tempoSeconds`
- `WeeklyVolume` model
- Warmup recommendations, RPE tracking, volume tracking, exercise ordering

---

## [Phase 10 — Content Pipeline] 2026
### Added
- `content` modul (URL import, marketplace) — backend ready, mock import

## [Phase 9 — Wearables] 2026
### Added
- `wearables` modul (HR sync, recovery score) — backend ready, no mobile bridge yet

## [Phase 8 — 3D Pose] 2026
### Status
- Library ready, not wired into pipeline

## [Phase 7 — CV 2.0] 2026
### Added
- `vision` modul (rule-based equipment detection)

## [Phase 6 — Mobile RN] 2026
### Added
- React Native + Expo app
- 8 obrazovek
- Bez kamery zatím

## [Phase 5 — Social] 2026
### Added
- `social` modul: follow, feed, challenges, leaderboard
- Stránka `/community`

## [Phase 4 — PWA + Push] 2026
### Added
- Service Worker, Web App Manifest
- VAPID push notifications
- `notifications` modul

## [Phase 3 — Monetization] SKIPPED
Uživatel se rozhodl Stripe vynechat.

## [Phase 2 — Adaptive Intelligence] 2026
### Added
- `ai-planner` modul (Claude Haiku → AI plány)
- Break recovery
- Plan generation

## [Phase 1 — Smart Coach] 2026
### Added
- `coaching` modul: Claude Haiku real-time feedback
- ElevenLabs Czech voice synthesis
- Safety checker (real-time alerts)
- Fallback na Web Speech API

---

## [Initial Setup] 2026
### Added
- Monorepo (apps/api, apps/web, apps/mobile, packages/shared, infrastructure)
- NestJS + Prisma + PostgreSQL backend
- Next.js 14 + Tailwind frontend
- AWS infrastruktura: ECS Fargate, RDS, ElastiCache, S3, ALB (Terraform, 68 resources)
- CodeBuild CI/CD
- JWT auth
- MediaPipe pose detection
- Gym rep counter state machine
- XP / streak / level systém
- 8 cviků v knihovně
- Demo accounts: admin@fitai.com, demo@fitai.com
