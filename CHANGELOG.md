# FitAI Changelog

Lidsky čitelná historie změn. Aktualizovat při každém deployi.

---

## [Section J — Gamification + AI Nutrition Tips] 2026-04-08
### Added
- **Achievements system**: `Achievement` + `AchievementUnlock` modely, 17 seed achievements ve 6 kategoriích
  - Training: first_workout, workouts_5/25/100
  - Streak: streak_3/7/30
  - Milestone: time_10h/50h, xp_1000/5000/10000
  - Habits: first_checkin, checkin_7
  - Exploration: tried_home_workout, tried_ai_coach, read_5_lessons
- Auto-unlock při check (`POST /api/achievements/check`) — počítá z UserProgress + sessions + check-ins
- Auto XP reward při unlock (50-1000 XP per achievement)
- Manual unlock přes code (`POST /api/achievements/unlock` s `{code}`) pro exploration achievements
- Web `/uspechy` page — 17 badges grid s category filtrem, locked/unlocked stavy
- Mobile `UspechyScreen` — 2-col grid, accessible přes Profile menu
- Achievement seed na app boot (idempotent — `OnApplicationBootstrap`)

### AI Nutrition Tips
- Nový endpoint `GET /api/ai-insights/nutrition-tips`
- Claude Haiku analyzuje 7-day food logs + nutrition goals + fitness goal → 3 personalizované tipy
- Kategorie: protein, hydration, timing, macros, quality
- 1h cache, static fallback
- Web `/vyziva` integrace — sekce "AI doporučení" před meals
- Mobile `VyzivaScreen` totéž

### Files
- `apps/api/prisma/schema.prisma` (+Achievement, +AchievementUnlock)
- `apps/api/src/achievements/{module,controller,service}.ts`
- `apps/api/src/ai-insights/ai-insights.{service,controller}.ts` (+nutrition tips)
- `apps/web/src/app/(app)/uspechy/page.tsx`
- `apps/web/src/app/(app)/vyziva/page.tsx` (+AI tips)
- `apps/web/src/components/v2/V2Layout.tsx` (+nav)
- `apps/mobile/src/screens/{UspechyScreen,VyzivaScreen,ProfileScreen}.tsx`
- `apps/mobile/src/navigation/AppNavigator.tsx` (+route)

---

## [Section H — AI Brain] 2026-04-08
### Added
- Modul `ai-insights` s endpointy `/recovery-tips`, `/weekly-review`
- Claude Haiku generuje **personalizované recovery tipy** podle 7-day habits průměru (sleep, energy, soreness, stress)
- Claude Haiku generuje **weekly review** podle 7-day workouts + check-ins (summary, highlights, improvements, next week focus)
- 1h in-memory cache aby Claude nebyl volán pro každý request
- Static fallback pokud Claude API nedostupné nebo žádná data
- Web `/habity` page — sekce "AI doporučení" před daily check-in formem
- Web `/dashboard` — "AI Týdenní review" widget před lekcí týdne
- Mobile `HabityScreen` + `DashboardScreen` — totéž

### Why
Uzavírá smyčku habits → AI insights → akce. Uživatel vidí konkrétní personalizované rady místo obecných statistik.

### Files
- `apps/api/src/ai-insights/{module,controller,service}.ts`
- `apps/web/src/app/(app)/{habity,dashboard}/page.tsx`
- `apps/mobile/src/screens/{HabityScreen,DashboardScreen}.tsx`
- `apps/web/src/lib/api.ts`, `apps/mobile/src/lib/api.ts`

---

## [Push notifications + HTTPS hardening] 2026-04-08
### Added
- `User.expoPushToken` field
- `POST /api/notifications/expo-subscribe` — registrace Expo push tokenu
- `notification.service.sendExpoToUser()` — push přes Expo Push API (https://exp.host/--/api/v2/push/send)
- `sendStreakReminders` posílá teď i přes Expo push
- Mobile auto-registrace tokenu v `auth-context` (login + existing session)
- Mobile Profile: tlačítko "Otestovat push notifikace"
- ALB HTTP listener: default action = HTTP 301 → HTTPS (path + query preserved)
- Mobile API client default URL → `https://fitai.bfevents.cz`

### Why
- Mobile uživatel dostane reminder když ztratí streak nebo nezacvičil
- HTTPS redirect — žádný plain HTTP traffic, security best practice
- Mobile teď konzistentně volá HTTPS API (žádná mixed content varování v budoucnu)

### Files
- `apps/api/prisma/schema.prisma` (+expoPushToken)
- `apps/api/src/notifications/notification.{service,controller}.ts`
- `apps/mobile/src/lib/{api,auth-context}.ts`
- `apps/mobile/src/screens/ProfileScreen.tsx`

### Skipping
- VAPID web push — keys nejsou v Secrets, web push zatím nefunguje. Příští krok pokud bude potřeba.

---

## [Section G — Habits & daily check-in] 2026-04-08
### Added
- `DailyCheckIn` model (sleep, hydration, steps, mood, energy, soreness, stress, notes)
- Modul `habits` s endpointy: `GET /today`, `PUT /today`, `/history`, `/stats`
- Recovery score (0-100) — spočítaný ze 7-day průměru spánku, energie, soreness, stres
- Streak counter (consecutive check-in days)
- Web stránka `/habity` — recovery ring + 1-5 scale form + history
- Mobile `HabityScreen` jako 6. tab v bottom nav
- Web nav rozšířený o "Habity"

### Why
Holistic fitness coach — propojuje mimotreningové metriky s recovery score, AI Insights tak ví kdy snížit intenzitu.

### Files
- `apps/api/prisma/schema.prisma` (+ DailyCheckIn)
- `apps/api/src/habits/{module,controller,service}.ts`
- `apps/web/src/app/(app)/habity/page.tsx`
- `apps/web/src/components/v2/V2Layout.tsx` (+nav)
- `apps/mobile/src/screens/HabityScreen.tsx`
- `apps/mobile/src/navigation/AppNavigator.tsx` (+tab)

---

## [Real AI Keys] 2026-04-08
### Added
- AWS Secrets Manager: `fitai/anthropic-api-key`, `fitai/openai-api-key`, `fitai/elevenlabs-api-key`, `fitai/elevenlabs-voice-id`
- ECS task definition (revision 3) injektuje secrets jako env vars
- IAM: `SecretsManagerReadWrite` policy na `fitai-production-ecs-execution` roli

### Result
- Claude Haiku **reálně koučuje** s českým personalizovaným feedbackem (test: "Lokte níž, prsou se dotykej! Tlak pomaleji.")
- ElevenLabs vrací **real Czech audio** (60KB base64 audio na 1 větu)
- Mock fallbacky pro Anthropic/ElevenLabs/OpenAI vypnuté

---

## [HTTPS na produkci] 2026-04-08
### Added
- ACM certifikát pro `fitai.bfevents.cz` (DNS validation, Active24)
- ALB HTTPS listener (443) s rule `/api/* + /health → API`
- DNS CNAME `fitai → ALB hostname`
- `NEXT_PUBLIC_API_URL = https://fitai.bfevents.cz` v CodeBuild env

### Result
- Web teď běží na **https://fitai.bfevents.cz** — kamera v prohlížeči funguje, pose detection live
- Stará HTTP URL `fitai-production-alb-...amazonaws.com` zůstává funkční (HTTP listener nezměněn)

---

## [Mobile camera workout — Phase 6 part 1] 2026-04-08
### Added
- `apps/mobile/src/screens/CameraWorkoutScreen.tsx` — `expo-camera` mirror mode + manuální rep counter
- Haptic feedback (`expo-haptics`) při tap, set complete, end
- RPE modal po každém pracovním setu (1-10)
- Rest timer (90s countdown)
- Overall progress display: "CVIK X/Y · CELKEM SET X/Y"
- "PŘESKOČIT CVIK" + "✓ DOKONČIT TRÉNINK" tlačítka
- Backend save přes existing `completeGymSet` + `endGymSession`
- Camera permission flow přes `useCameraPermissions`
- Linked z `PlanDetailScreen` přes "ZAČÍT" buttony per den

### Skipping (Phase 6 part 2)
- Native MediaPipe pose detection na mobilu (vyžaduje EAS Build, custom dev build, react-native-vision-camera + frame processor plugin)

---

## [Mobile v2 — full sync s webem] 2026-04-07
### Added
Mobile React Native app dohnaná na úroveň webu. Stejný v2 design system, stejné featury (kromě pose detection s kamerou — vlastní fáze).

**Sdílené komponenty:**
- `apps/mobile/src/components/v2/V2.tsx` — V2Screen, V2Display, V2SectionLabel, V2Stat, V2Button, V2Chip, V2Input, V2Ring, V2TripleRing, V2Loading, V2Row + theme tokens

**Rozšířený API klient (`apps/mobile/src/lib/api.ts`):**
- Onboarding (status, measurements, fitness test, suggested weights, complete)
- Intelligence (recovery, plateaus, weak points)
- Education (lessons, lesson detail, glossary, lesson of week)
- Home Training (quick, home, travel)
- Nutrition (goals, today, log CRUD, quick foods, auto-calc)
- AI Planner (profile, generate, break recovery, asymmetry, update)
- Social full (feed, challenges, join, search, follow, counts)

**Obrazovky reskinnuté v v2 stylu:** LoginScreen, RegisterScreen, DashboardScreen (s Triple Activity Ring hero), VideosScreen, ExercisesScreen, PlansScreen (s quick start cards), ProgressScreen, ProfileScreen (rozšířená na "Více" menu)

**Nové obrazovky:** OnboardingScreen (3-step), VyzivaScreen (s makro ringy + modal), LekceScreen, LessonDetailScreen, SlovnikScreen, DomaScreen (3 modes), AICoachScreen, CommunityScreen, ExerciseDetailScreen, PlanDetailScreen, VideoDetailScreen

**Navigace:** 5-tab bottom nav (Dnes / Trénink / Výživa / Lekce / Pokrok). Sekundární obrazovky (Cviky, Videa, Doma, AI Trenér, Komunita, Slovník) přístupné přes Profile menu nebo z Plans/Dashboard quick links. Stack screens pro detail pages.

**Nová dependency:** `react-native-svg@15.12.1` (pro Activity Rings). **Uživatel musí spustit:**
```bash
cd apps/mobile
pnpm install
npx expo install --check
```

**API URL:** Mobile teď defaultně cílí na produkční ALB (`http://fitai-production-alb-1685369378.eu-west-1.elb.amazonaws.com`). Override přes `EXPO_PUBLIC_API_URL` env.

### Skipping (do další fáze)
- Workout in-progress s kamerou + pose detection (vyžaduje native MediaPipe plugin pro RN)
- Gym session in-progress s rep counterem (stejný důvod)

---

## [v2 Swap — v2 nyní default] 2026-04-07
### Changed
- Všechny v1 stránky nahrazeny obsahem z v2. Původní URL (`/`, `/login`, `/dashboard`, `/gym`, `/vyziva`, `/lekce`, atd.) zobrazují nový design.
- Smazáno všech 21 v2 directories (`*-v2/`, `v2/`).
- Všechny interní odkazy přepsány — žádný `-v2` v codebase.
- `/plans` → 307 redirect na `/gym` (kde je nový list plánů).
- Nový route `/gym` (gym list — předtím v1 mělo jen `/gym/start` a `/gym/[sessionId]`).
- Sdílené komponenty `V2Layout` + `V2AuthLayout` zůstávají (`apps/web/src/components/v2/`).
- Stará `apps/web/src/components/layout/Header.tsx` je dead code (neimportuje ji už žádná stránka), nesmazána pro jistotu.
- `test-production.sh` upraven: curl `-L` follow redirects, `/plans` nahrazen `/gym`.

### Why
Uživatel nechce pamatovat `-v2` URL ani zachovávat legacy design.

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
