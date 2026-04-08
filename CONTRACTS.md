# FitAI Contracts — Co Claude NESMÍ měnit bez souhlasu

> **Pravidlo:** Pokud změna zasahuje cokoliv níže, Claude MUSÍ:
> 1. Vysvětlit PROČ je změna potřeba
> 2. Ukázat co by se rozbilo
> 3. Počkat na explicitní "ano, změň to" od uživatele
>
> Přidávání nových polí/endpointů je OK. Měnění/mazání existujících NE.

---

## 🔒 Zámčené API endpointy (request/response shapes)

Všechny pod prefixem `/api/*` (kromě `/health`).

### Auth
- `POST /api/auth/register` → `{ user, accessToken }`
- `POST /api/auth/login` → `{ user, accessToken }`
- `GET  /api/auth/me` → `UserData`

### Users
- `GET  /api/users/me/reminder-status`

### Videos
- `GET  /api/videos` → `VideoData[]`
- `GET  /api/videos/:id` → `VideoData`
- `POST /api/videos/upload` (admin)

### Sessions (video workouts)
- `POST /api/sessions/start`
- `POST /api/sessions/:id/complete`
- `GET  /api/sessions/history`

### Progress / XP
- `GET  /api/progress` → `{ xp, level, streak, ... }`
- `POST /api/progress/award-xp`

### Exercises
- `GET  /api/exercises` → `ExerciseData[]`
- `GET  /api/exercises/:id` → `ExerciseData` s `phases`, `instructions`, `category`

### Workout Plans
- `GET  /api/workout-plans`
- `GET  /api/workout-plans/:id`
- `POST /api/workout-plans/custom`

### Gym Sessions
- `POST /api/gym-sessions/start` → `GymSessionData`
- `POST /api/gym-sessions/:id/set/complete`
- `POST /api/gym-sessions/:id/end`
- `GET  /api/gym-sessions/my`
- `GET  /api/gym-sessions/my/weekly-volume`
- `GET  /api/gym-sessions/:id`

### Adaptive
- `POST /api/adaptive/recommend-weight`

### Coaching
- `POST /api/coaching/feedback` (Claude Haiku)
- `POST /api/coaching/voice` (ElevenLabs TTS)

### AI Planner
- `POST /api/ai-planner/generate`
- `POST /api/ai-planner/break-recovery`

### Notifications
- `POST /api/notifications/subscribe` (web push VAPID)
- `POST /api/notifications/expo-subscribe` (mobile push token)
- `GET  /api/notifications/preferences`
- `PUT  /api/notifications/preferences`
- `POST /api/notifications/test`
- `POST /api/notifications/send-streak-reminders` (admin)

### Social
- `POST /api/social/follow/:userId`
- `DELETE /api/social/follow/:userId`
- `GET  /api/social/following`, `/followers`, `/follow-counts`
- `GET  /api/social/is-following/:userId`
- `GET  /api/social/feed`, `/feed/public`
- `GET  /api/social/challenges`
- `POST /api/social/challenges/:id/join`
- `GET  /api/social/challenges/:id/leaderboard`
- `GET  /api/social/search`

### Intelligence (Section B)
- `GET  /api/intelligence/plateaus`
- `GET  /api/intelligence/recovery`
- `GET  /api/intelligence/weak-points`

### Onboarding (Section C)
- `POST /api/onboarding/measurements`
- `POST /api/onboarding/fitness-test`
- `POST /api/onboarding/complete`
- `GET  /api/onboarding/status`

### Generative Meal Planning (Section L)
- `GET    /api/nutrition/meal-plan/current` → `MealPlan | null` for current week (Mon-Sun)
- `GET    /api/nutrition/meal-plan/history?limit=N` → `MealPlan[]`
- `POST   /api/nutrition/meal-plan/generate` — `{weekStart?, preferences?, allergies?[], cuisine?}` → `MealPlan` (upsert)
- `DELETE /api/nutrition/meal-plan/:id` → `{deleted: boolean}`
- MealPlan.payload shape: `{weekStart, totalKcal, avgKcalPerDay, avgProteinG, days[{date, dayName, totals, meals[{type, name, kcal, proteinG, carbsG, fatG, ingredients[], prepMinutes, notes?}]}], shoppingList[{category, items[{name, qty, unit}]}]}`

### Body Progress Photos (Section K)
- `POST /api/progress-photos/upload-url` — `{contentType, side, weightKg?, bodyFatPct?, notes?}` → `{uploadUrl, photoId, s3Key}`
- `GET  /api/progress-photos?side=FRONT|SIDE|BACK` → `BodyPhoto[]` with presigned `url` + `analysis`
- `GET  /api/progress-photos/stats` → `{total, byAngle{front,side,back}, firstTakenAt, latestTakenAt, daysTracked}`
- `GET  /api/progress-photos/:id` → `BodyPhoto`
- `POST /api/progress-photos/:id/analyze` → triggers Claude Vision, returns `BodyAnalysis`
- `DELETE /api/progress-photos/:id` → `{deleted: true}` (S3 + DB)

### Achievements (Section J)
- `GET  /api/achievements` — list all + unlock state
- `GET  /api/achievements/unlocked` — only unlocked, with timestamps
- `POST /api/achievements/check` — auto-detect newly unlocked
- `POST /api/achievements/unlock` — manual unlock by code

### AI Insights (Section H)
- `GET /api/ai-insights/recovery-tips`
- `GET /api/ai-insights/weekly-review`
- `GET /api/ai-insights/nutrition-tips`
- `GET /api/ai-insights/daily-brief` — flagship: structured workout for today (greeting, headline, mood, recoveryStatus, recoveryScore, workout{title,estimatedMinutes,warmup,exercises[],finisher}, rationale, motivationalHook, nutritionTip, alternativeIfTired, source)

### Habits (Section G)
- `GET /api/habits/today`
- `PUT /api/habits/today`
- `GET /api/habits/history?days=N`
- `GET /api/habits/stats`

### Nutrition (Section F)
- `GET    /api/nutrition/goals`
- `PUT    /api/nutrition/goals`
- `POST   /api/nutrition/goals/auto`
- `GET    /api/nutrition/today`
- `GET    /api/nutrition/log?date=`
- `POST   /api/nutrition/log`
- `DELETE /api/nutrition/log/:id`
- `GET    /api/nutrition/quick-foods`

### Home Training (Section E)
- `GET  /api/home-training/quick`
- `GET  /api/home-training/home`
- `GET  /api/home-training/travel`

### Education (Section D)
- `GET  /api/education/lessons`
- `GET  /api/education/lessons/of-the-week`
- `GET  /api/education/lessons/:slug`
- `GET  /api/education/glossary`
- `GET  /api/education/briefing/:gymSessionId`
- `GET  /api/education/debrief/:gymSessionId`

### Health
- `GET  /health` (NEMÁ `/api` prefix — ALB target)

**Pravidlo:** Přidávat nová pole do response je OK. Měnit/odstraňovat existující pole NE.

---

## 🔒 Zámčené DB modely (Prisma)

Nemazat ani nepřejmenovávat tato pole:

| Model | Zámčená pole |
|-------|--------------|
| `User` | `id`, `email`, `passwordHash`, `isAdmin`, `createdAt` |
| `FitnessProfile` | `userId`, `priorityMuscles`, `age`, `weightKg`, `heightCm`, `onboardingDone`, `dailyKcal`, `dailyProteinG`, `dailyCarbsG`, `dailyFatG` |
| `FoodLog` | `id`, `userId`, `date`, `mealType`, `name`, `kcal`, `proteinG`, `carbsG`, `fatG`, `servings` |
| `Video` | `id`, `title`, `s3Key`, `duration` |
| `Session` | `id`, `userId`, `videoId`, `startedAt`, `completedAt` |
| `Exercise` | `id`, `name`, `phases`, `instructions`, `category`, `equipment` |
| `ExerciseSet` | `id`, `gymSessionId`, `exerciseId`, `reps`, `weight`, `rpe`, `isWarmup`, `tempoSeconds` |
| `GymSession` | `id`, `userId`, `planDayId`, `startedAt`, `completedAt` |
| `WorkoutPlan` | `id`, `name`, `days` |
| `WeeklyVolume` | `userId`, `weekStart`, `muscleGroup`, `sets` |
| `OneRepMax` | `profileId` (→ FitnessProfile), `exerciseId`, `estimatedKg`, `testReps`, `testWeight`, `source`, `createdAt` |
| `Progress` | `userId`, `xp`, `level`, `streak` |
| `EducationLesson` | `id`, `slug`, `title`, `content`, `category` |
| `GlossaryTerm` | `id`, `term`, `definition` |
| `DailyCheckIn` | `id`, `userId`, `date`, `sleepHours`, `sleepQuality`, `hydrationL`, `steps`, `mood`, `energy`, `soreness`, `stress` |
| `Achievement` | `id`, `code`, `titleCs`, `category`, `icon`, `xpReward`, `threshold` |
| `AchievementUnlock` | `id`, `userId`, `achievementId`, `unlockedAt` |
| `BodyPhoto` | `id`, `userId`, `s3Key`, `side` (PhotoSide enum), `takenAt`, `weightKg`, `bodyFatPct`, `notes`, `isAnalyzed` |
| `BodyAnalysis` | `id`, `bodyPhotoId`, `estimatedBodyFatPct`, `estimatedMuscleMass`, `postureNotes`, `visibleStrengths[]`, `areasToWork[]`, `comparisonNotes`, `modelUsed` |
| `MealPlan` | `id`, `userId`, `weekStart` (Date, Mon), `generatedAt`, `source`, `modelUsed`, `payload` (Json: days × meals + shoppingList), `notes` |

**Schema změny vždy přes `prisma db push --accept-data-loss` + seed task.**

---

## 🔒 Design system

Celá platforma používá `apps/web/src/components/v2/V2Layout.tsx` (V2Layout, V2SectionLabel, V2Display, V2Stat, V2Ring) a `V2AuthLayout.tsx` (V2AuthLayout, V2Input, V2Button).

**Pravidlo:** Změny v `V2Layout.tsx` ovlivní VŠECHNY stránky v `(app)` group. Změny v `V2AuthLayout.tsx` ovlivní login/register/landing.

## 🔒 Zámčené frontend stránky (URL paths)

Tyto routes musí ZŮSTAT na svých URL (rozbily by bookmarks + odkazy):

- `/`, `/login`, `/register`
- `/dashboard`
- `/onboarding`
- `/videos`, `/videos/[id]`
- `/workout/[videoId]` — **kamera + pose detection pipeline**
- `/exercises`, `/exercises/[id]`
- `/plans`, `/plans/[id]`
- `/gym/start`, `/gym/[sessionId]` — **rep counter + RPE + rest timer**
- `/ai-coach`
- `/lekce`, `/lekce/[slug]`, `/slovnik`
- `/community`, `/progress`
- `/admin/upload`

---

## 🔒 Klíčové funkce které MUSÍ fungovat

1. **Registrace + přihlášení** (`/register`, `/login`) — JWT tok do `localStorage.fitai_token`
2. **Onboarding flow** — 3 kroky (measurements, 1RM test, review)
3. **Video workout** — `/workout/[videoId]` s kamerou, MediaPipe pose, real-time feedback
4. **Gym workout** — `/gym/[sessionId]` rep counter, RPE modal, rest timer
5. **AI Insights** na dashboardu (Claude Haiku call)
6. **AI plan generation** přes `/ai-coach`
7. **Education** — Lekce týdne na dashboardu, /lekce, /slovnik
8. **Progress tracking** — XP, streak, levels
9. **Social feed** — /community
10. **Push notifications** — VAPID subscribe

---

## 🔒 Zámčené core soubory (NEMĚNIT bez souhlasu)

Tyto soubory jsou jádro pose detection / coaching pipeline. Refaktor pouze s explicitním souhlasem:

- `apps/web/src/lib/feedback-engine.ts` — joint angles, pose checking
- `apps/web/src/lib/rep-counter.ts` — gym rep state machine
- `apps/web/src/lib/safety-checker.ts` — real-time safety alerts
- `apps/web/src/lib/smart-voice.ts` — ElevenLabs + Web Speech fallback
- `apps/web/src/lib/auth-context.tsx` — JWT auth context
- `apps/web/src/lib/api.ts` — API client (přidávat funkce OK, měnit existující ne)
- `apps/api/src/main.ts` — `setGlobalPrefix('api', { exclude: ['health'] })`
- `apps/api/src/auth/` — celý modul
- ALB routing rule: `/api/* + /health → API`, default → Web

---

## 🔒 Infrastruktura (NIKDY bez souhlasu)

- ALB rule pořadí (`/api/*` musí být PŘED default)
- ECS task definitions
- RDS schema bez `db push` task
- Secrets Manager keys
- ECR repo names
- CodeBuild project names (`fitai-api-build`, `fitai-web-build`)
