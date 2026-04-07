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
- `POST /api/notifications/unsubscribe`

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
| `FitnessProfile` | `userId`, `priorityMuscles`, `age`, `weightKg`, `heightCm`, `onboardingDone` |
| `Video` | `id`, `title`, `s3Key`, `duration` |
| `Session` | `id`, `userId`, `videoId`, `startedAt`, `completedAt` |
| `Exercise` | `id`, `name`, `phases`, `instructions`, `category` |
| `ExerciseSet` | `id`, `gymSessionId`, `exerciseId`, `reps`, `weight`, `rpe`, `isWarmup`, `tempoSeconds` |
| `GymSession` | `id`, `userId`, `planDayId`, `startedAt`, `completedAt` |
| `WorkoutPlan` | `id`, `name`, `days` |
| `WeeklyVolume` | `userId`, `weekStart`, `muscleGroup`, `sets` |
| `OneRepMax` | `userId`, `exerciseId`, `value`, `testedAt` |
| `Progress` | `userId`, `xp`, `level`, `streak` |
| `EducationLesson` | `id`, `slug`, `title`, `content`, `category` |
| `GlossaryTerm` | `id`, `term`, `definition` |

**Schema změny vždy přes `prisma db push --accept-data-loss` + seed task.**

---

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
