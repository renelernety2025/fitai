# FitAI — Architecture

> Aktualizováno: 2026-04-22

> **Scale readiness:** Plán jak připravit platformu na 1M+ DAU je v [`SCALING.md`](./SCALING.md) — 4 vrstvy podle ROI (free quick wins → observability → load test → paid upgrades).

## High-Level

```
USER (browser / mobile / Expo Go)
    ↓
DNS (Active24): fitai.bfevents.cz CNAME → ALB
    ↓
ALB
    ├── HTTPS 443 (ACM cert pro fitai.bfevents.cz)
    │     ├── /api/* + /health → API Target Group → ECS Fargate (NestJS, port 3001)
    │     └── /*               → Web Target Group → ECS Fargate (Next.js, port 3000)
    └── HTTP 80
          ├── /api/* + /health → API (compat)
          └── default          → 301 → https://fitai.bfevents.cz/...

ECS API (76 NestJS modules)
    ├── PostgreSQL RDS (99 tables, private subnet)
    ├── Redis ElastiCache (private subnet)
    ├── S3 + CloudFront (videos, choreography, assets)
    ├── Secrets Manager (DB, JWT, Anthropic, OpenAI, ElevenLabs)
    └── External APIs:
        ├── Claude Haiku — coaching, AI plans, recovery/weekly/nutrition tips
        ├── ElevenLabs Multilingual v2 — Czech voice synthesis
        ├── OpenAI Whisper — video preprocessing
        └── Expo Push API — mobile push notifications

ECS Web (Next.js 14, NEXT_PUBLIC_API_URL=https://fitai.bfevents.cz)

CodeBuild (base: public.ecr.aws/docker/library/node:20-alpine — no DockerHub rate limits)
    ├── fitai-api-build
    └── fitai-web-build
```

## AWS Infrastructure (Terraform)

### Networking
- VPC: 10.0.0.0/16, 2 public + 2 private subnets, NAT Gateway
- Security groups: alb-sg, api-sg, web-sg, rds-sg, redis-sg

### Compute
- ECS Cluster: `fitai-production` (Fargate, Container Insights enabled)
- 2 services: `fitai-api-service`, `fitai-web-service` (each 1 task, autoscale 1-3)
- **ALB: HTTP 80 (compat + redirect) + HTTPS 443 (ACM cert pro `fitai.bfevents.cz`)**
- HTTPS listener rule: `/api/*` + `/health` → API, default → Web
- HTTP listener: redirects default → HTTPS (kept rule for `/api/*` + `/health` for compat)

### Data Layer
- **RDS PostgreSQL 16:** db.t3.micro, 20GB gp3 → autoscale 100GB, 7-day backup
- **ElastiCache Redis 7:** cache.t3.micro single node
- **S3 buckets:**
  - `fitai-videos-production` — raw videos, HLS, choreography JSON
  - `fitai-assets-production` — thumbnails, static files
- **CloudFront:** Distribution serving S3 with cache behaviors:
  - `/hls/*` → 1 day TTL
  - `/choreography/*` → 1 hour TTL
  - `/thumbnails/*` → 7 days TTL

### CI/CD
- ECR: `fitai-api`, `fitai-web` (10-image lifecycle)
- CodeBuild: `fitai-api-build`, `fitai-web-build`
- ECS task definition: `fitai-migrate:2` runs `prisma db push && prisma db seed`
- **GitHub Actions auto-deploy** (`.github/workflows/deploy.yml`):
  - Trigger: `push` na `main` (+ `workflow_dispatch` pro manuální)
  - OIDC federation → IAM role `fitai-github-actions` (žádné long-lived AWS keys)
  - `dorny/paths-filter@v3` detekuje api/web/schema změny
  - Paralelní `aws codebuild start-build` pro relevantní projekty
  - Auto-spuštění `fitai-migrate:2` task při změně `prisma/schema.prisma`
  - Smoke test `test-production.sh` (115/115) po deployi
  - Concurrency lock `deploy-production`
- **CI** (`.github/workflows/ci.yml`): PR lint + typecheck (nedeployuje)

### Monitoring
- CloudWatch alarms: API CPU/memory >80%, RDS CPU >70%, ALB 5xx >10/5min
- SNS topic for alerts (email subscription)
- Dashboard: `fitai-production`

## Database Schema (99 models)

### Core
```
User (id, email, name, isAdmin, level, expoPushToken)
  ├── UserProgress (totalXP, currentStreak, longestStreak, totalSessions, totalMinutes)
  ├── FitnessProfile (goal, experienceMonths, daysPerWeek, equipment[], injuries[],
  │                   age, weightKg, heightCm, onboardingDone, priorityMuscles[],
  │                   dailyKcal, dailyProteinG, dailyCarbsG, dailyFatG)
  ├── OneRepMax (exerciseId, estimatedKg, source) — Section C
  ├── DailyCheckIn (date, sleepHours, sleepQuality, hydrationL, steps,
  │                 mood, energy, soreness, stress, notes) — Section G
  ├── FoodLog (date, mealType, name, kcal, proteinG, carbsG, fatG, servings) — Section F
  └── AchievementUnlock (achievementId, unlockedAt) — Section J
```

### Video Workouts
```
Video (title, category, difficulty, hlsUrl, choreographyUrl, preprocessingStatus)
WorkoutSession (userId, videoId?, gymSessionId?, durationSeconds, accuracyScore)
PoseSnapshot (sessionId, timestamp, poseName, isCorrect, jointAngles)
```

### Gym Workouts
```
Exercise (name, nameCs, category, muscleGroups[], difficulty, phases (JSON),
          instructions (JSON: steps/mistakes/muscles/breathing/tempo/warmup/tips))
WorkoutPlan (name, type, isTemplate, daysPerWeek)
WorkoutDay (workoutPlanId, dayIndex, name)
PlannedExercise (workoutDayId, exerciseId, targetSets, targetReps, targetWeight, restSeconds)
GymSession (userId, workoutPlanId?, totalReps, averageFormScore, durationSeconds)
ExerciseSet (gymSessionId, exerciseId, setNumber, actualReps, actualWeight,
             formScore, rpe, isWarmup, tempoSeconds, status)
ExerciseHistory (userId, exerciseId, bestWeight, bestReps, avgFormScore, totalVolume)
WeeklyVolume (userId, weekStart, muscleGroup, totalSets, totalReps, totalVolumeKg)
```

### AI Coach (Section 1)
```
CoachingSession (userId, sessionType, sessionId, messagesCount, tokensUsed)
CoachingMessage (coachingSessionId, role, content, priority)
SafetyEvent (userId, sessionId, jointName, measuredAngle, severity)
```

### Adaptive Intelligence
```
AIGeneratedPlan (userId, workoutPlanId?, goal, weekNumber, totalWeeks, isDeloadWeek,
                 claudePrompt, claudeResponse, status)
```

### PWA / Notifications
```
PushSubscription (userId, endpoint, p256dh, auth)  — VAPID web push
NotificationPreference (userId, workoutReminder, streakWarning, achievements,
                        quietHoursStart, quietHoursEnd)
User.expoPushToken — Expo Push API for mobile (Section J)
```

### Habits (Section G)
```
DailyCheckIn (userId, date, sleepHours, sleepQuality, hydrationL, steps,
              mood, energy, soreness, stress, notes)
```

### Nutrition (Section F)
```
FoodLog (userId, date, mealType, name, kcal, proteinG, carbsG, fatG, servings)
FitnessProfile.dailyKcal/dailyProteinG/dailyCarbsG/dailyFatG — TDEE-based goals
```

### Achievements (Section J)
```
Achievement (code, titleCs, category, icon, xpReward, threshold)
AchievementUnlock (userId, achievementId, unlockedAt)
```

### Body Progress (Section K)
```
BodyPhoto (userId, s3Key, side: FRONT|SIDE|BACK, takenAt, weightKg?, bodyFatPct?, notes?, isAnalyzed)
BodyAnalysis (bodyPhotoId 1:1, estimatedBodyFatPct?, estimatedMuscleMass?,
              postureNotes?, visibleStrengths[], areasToWork[], comparisonNotes?,
              modelUsed: claude-haiku-4-5)
```

### Social
```
Follow (followerId, followedId)
ActivityFeedItem (userId, type, title, body, data)
Challenge (name, type, targetValue, startDate, endDate, isActive)
ChallengeParticipant (challengeId, userId, currentValue)
```

### Wearables / Content
```
WearableData (userId, sessionId?, provider, dataType, value, unit, timestamp)
ContentImport (userId, sourceUrl, videoId?, status)
MarketplaceItem (trainerId, type, title, price, rating, isPublished)
```

### Education (Section D)
```
EducationLesson (slug, titleCs, category, bodyCs, durationMin, isPublished)
GlossaryTerm (termCs, definitionCs, category)
```

## Backend Modules (76)

Všechny endpointy jsou pod prefixem `/api/*` (kromě `/health`). Pro aktuální seznam všech modulů + endpointů čti přímo kód — markdown kopie zastarává:

```bash
# Seznam všech modulů:
ls apps/api/src/                          # directory per module

# Seznam všech endpointů v konkrétním modulu:
grep -rn "@Get\|@Post\|@Put\|@Delete\|@Patch" apps/api/src/<module>/*.controller.ts

# Všechny endpointy napříč projektem:
grep -rn "@Get\|@Post\|@Put\|@Delete\|@Patch" apps/api/src/**/*.controller.ts
```

### Přehled modulů podle domény

| Doména | Moduly | Hlavní účel |
|---|---|---|
| **Auth & Users** | `auth`, `users` | JWT login/register, profile |
| **Video workouts** | `videos`, `preprocessing`, `sessions`, `vision` | Video catalog, Whisper+Claude choreography, pose tracking |
| **Gym workouts** | `exercises`, `workout-plans`, `gym-sessions`, `adaptive` | Exercise library, plans, rep counting, weight recommendations |
| **AI coaching** | `coaching`, `ai-planner`, `ai-insights` | Real-time Claude feedback, plan generation, Daily Brief / recovery / weekly review / nutrition tips |
| **Nutrition** | `nutrition` | Food log, TDEE, meal plan generation (Section F + L) |
| **Habits & Progress** | `habits`, `intelligence`, `progress`, `progress-photos` | Daily check-in, plateau detection, weak points, body photos + Claude Vision |
| **Content** | `education`, `home-training` | Lessons, glossary, bodyweight workouts |
| **Social & Gamification** | `social`, `achievements` | Follow, feed, challenges, 17 badges |
| **Infrastructure** | `notifications`, `wearables`, `content`, `onboarding`, `health` | Web push (VAPID), HR sync, URL import, 1RM wizard, ALB health |

**Canonical list** viz `apps/api/src/app.module.ts` (imports array) — 76 modulů.

## Frontend Architecture

### Pages (App Router) — vše v jednotném v2 designu
```
/                          Landing (v2 hero, "Trénink, který tě opravdu sleduje")
/login, /register          Auth (V2AuthLayout)
/(app)/dashboard           Triple Activity Ring + AI Týdenní review + Lekce týdne + Nutrition + AI Insights
/(app)/onboarding          3-step wizard
/(app)/videos, /[id]       Video catalog + detail (Section 1)
/(app)/workout/[videoId]   Video workout — kamera + MediaPipe + Claude voice
/(app)/exercises, /[id]    Exercise library + detail (Section A)
/(app)/plans, /[id]        Workout plan templates + detail (redirect /plans → /gym)
/(app)/gym                 Plan list + quick start cards
/(app)/gym/[sessionId]     Gym workout — kamera + rep counter + RPE + rest timer
/(app)/ai-coach            AI Trainer profile + plan generation
/(app)/lekce, /[slug]      Lessons listing + detail (Section D)
/(app)/slovnik             Glossary (Section D)
/(app)/community           Social: feed, challenges, people (Section 5)
/(app)/progress            Stats, streak, weekly volume, plateaus, weak points
/(app)/doma                Home/travel/quick workouts (Section E)
/(app)/vyziva              Nutrition: macros + AI tips (Section F + H)
/(app)/habity              Daily check-in + recovery score + AI tips (Section G + H)
/(app)/uspechy             17 achievements badges grid (Section J)
/admin/upload              Admin video upload
```

### Key Lib Files
- `lib/api.ts` — Centralized API client (all functions use `${API_BASE}/api` prefix)
- `lib/auth-context.tsx` — JWT context, localStorage `fitai_token`
- `lib/feedback-engine.ts` — Pose validation: `calculateAngle`, `JOINT_MAP`, `getJointAngles`, `checkPose`
- `lib/pose-detection.ts` — MediaPipe init/cleanup
- `lib/pose-detection-3d.ts` — 3D pose helpers (Section 8 prep)
- `lib/rep-counter.ts` — State machine: START → ECCENTRIC → HOLD → CONCENTRIC → 1 rep
- `lib/rest-timer.ts` — Countdown with voice
- `lib/safety-checker.ts` — Real-time safety alerts (knee hyperextension, rounded back)
- `lib/smart-voice.ts` — ElevenLabs audio queue with priorities + Web Speech fallback
- `lib/coaching-client.ts` — Debounced coaching feedback requests
- `lib/voice-feedback.ts` — Web Speech API basic
- `lib/choreography.ts` — Loads choreography JSON from S3
- `lib/push-notifications.ts` — VAPID subscription helper

### Components
- `components/v2/V2Layout.tsx` — sdílený v2 layout: V2Layout, V2SectionLabel, V2Display, V2Stat, V2Ring (Apple Watch Activity Rings)
- `components/v2/V2AuthLayout.tsx` — login/register/landing layout: V2AuthLayout, V2Input, V2Button
- `components/layout/Header.tsx` — *(legacy v1, dead code, není importované)*
- `components/layout/ServiceWorkerRegistrar.tsx` — PWA SW registration
- `components/workout/VideoPlayer.tsx` — HLS player with timeUpdate callback
- `components/workout/CameraView.tsx` — getUserMedia + MediaPipe overlay
- `components/workout/FeedbackOverlay.tsx` — Score badge, feedback banner
- `components/workout/CoachingBubble.tsx` — Speech bubble with priority colors
- `components/workout/WorkoutSummary.tsx` — Post-workout stats
- `components/workout/XPGainedOverlay.tsx` — +XP animation
- `components/gym/RepCounter.tsx` — Big "5/10" display
- `components/gym/SetTracker.tsx` — ●●○○ progress dots
- `components/gym/RestTimerOverlay.tsx` — Circular countdown
- `components/gym/ExerciseInstructions.tsx` — Left panel with full instructions
- `components/gym/RPEModal.tsx` — RPE 1-10 selector after each set
- `components/gym/GymWorkoutSummary.tsx` — Per-exercise breakdown

## AI Subsystems

### 1. Coaching (Real-time, Claude Haiku)
- Throttled to 1 call / 10 sec during exercise
- Context: name, level, streak, weak joints, current exercise/phase, recent scores
- Output: Czech feedback max 12 words
- Priority: SAFETY (0ms) > CORRECTION (2s) > ENCOURAGEMENT (5s)
- ElevenLabs synthesis with Redis cache for common phrases
- Audio ducking: video volume → 20% during AI speech
- Fallback: static phrases when API keys missing

### 2. Plan Generation (Claude Haiku)
- Inputs: profile (goal, experience, equipment, injuries), recent history
- Outputs: 6-week plan with periodization (deload every 5th week)
- Adapts to break recovery (50-90% intensity based on days off)
- Avoids exercises that hit injured muscle groups

### 3. Preprocessing Pipeline (Whisper + Claude)
- Video upload → S3
- Whisper STT → transcript with timestamps
- Claude generates `choreography.json` with pose checkpoints + joint angle rules
- Saved back to S3, video.choreographyUrl set

### 4. Adaptive Intelligence (Section B)
- **Plateau detection:** 3+ weeks no weight increase → recommend deload/add volume/change rep range
- **Recovery analysis:** form trend + RPE + volume → status (fresh/normal/fatigued/overreached)
- **Weak points:** muscle groups with avg form <65% → accessory exercise suggestions
- **Asymmetry:** left vs right safety event count → unilateral exercise recommendations

### 5. AI Brain (Section H — Claude long-form insights)
- **Recovery tips** (`/api/ai-insights/recovery-tips`): analyzes 7-day habits (sleep/energy/soreness/stress) → 3 personalized tips in JSON
- **Weekly review** (`/api/ai-insights/weekly-review`): summary + highlights + improvements + next week focus
- **Nutrition tips** (`/api/ai-insights/nutrition-tips`): analyzes 7-day food logs vs goals → 3 tips
- **Daily Brief — flagship hero** (`/api/ai-insights/daily-brief`): full context (User + FitnessProfile + 7d DailyCheckIn + 14d WorkoutSession + OneRepMax + WeeklyVolume) → structured workout for today
  - Computes `recoveryScore` 0-100 from sleep, energy, soreness, stress
  - Mood-driven RPE: push (8-9) / maintain (7) / recover (5-6)
  - Cache 24h per user, key `${userId}:${YYYY-MM-DD}` (Europe/Prague)
  - Rules-based fallback with 3 rotating splits when Claude unavailable
- **In-memory cache** 1h per user (24h for daily-brief)
- Static fallbacks when Claude API unavailable

### 6. Habits & Recovery Score (Section G)
- DailyCheckIn data → recovery score 0-100
- Score combines: sleep distance from 8h, energy 1-5, low soreness, low stress
- Streak counter for consecutive check-in days

### 7. Achievements (Section J)
- 17 seed achievements in 6 categories (training, streak, milestone, habits, exploration, nutrition)
- Auto-unlock via `POST /api/achievements/check` reading UserProgress + sessions + check-ins
- XP reward on unlock (50-1000 XP per achievement)
- Manual unlock by code for exploration-style achievements

### 9. Generative Meal Planning (Section L)
- **Endpoint:** `POST /api/nutrition/meal-plan/generate` reads FitnessProfile (goals, age, weight, height, daysPerWeek) → computes Mifflin-St Jeor TDEE → builds Claude Haiku prompt with macro targets, allergies, cuisine
- **Output:** structured JSON with 7 days × 4 meals (breakfast/snack/lunch/dinner), each with name, kcal, macros, ingredients[], prepMinutes, optional notes
- **Aggregated shopping list** across all 28 meals, organized into 5 categories (meat/dairy/produce/bakery/other)
- **Storage:** `MealPlan` model with `@@unique([userId, weekStart])` — one plan per Monday-week per user, upserts on regenerate
- **Caching:** None at API level (full plan stored in DB; UI calls `/current` for the week)
- **Rules-based fallback** with 12 meal templates rotating across the week
- **Used by:** `/jidelnicek` web page + `JidelnicekScreen` mobile

### 8. Body Progress Photos (Section K)
- **Upload flow:** client → `POST /upload-url` → presigned S3 PUT URL + DB row pre-created
  → client uploads JPEG/PNG directly to `s3://fitai-assets-production/progress-photos/{userId}/{id}.jpg`
- **Privacy:** photos are user-only; service enforces ownership on every read/delete/analyze
- **Claude Vision analysis:** sends current photo (and previous of same angle if exists)
  as base64 to `claude-haiku-4-5`, returns structured `{estimatedBodyFatPct, estimatedMuscleMass,
  postureNotes, visibleStrengths[], areasToWork[], comparisonNotes}` in Czech
- **Before/after comparison:** web UI has interactive scrubber slider component
- **Mobile:** `expo-image-picker` → fetch as blob → presigned S3 PUT
- **IAM:** task role `fitai-production-ecs-task` has S3 Get/Put/Delete/ListBucket
  on `fitai-assets-production`

## Semantic Search & RAG (pgvector)

```
Exercise/Recipe seed time:
  text (name+description+muscleGroups+...) → OpenAI text-embedding-3-small (1536 dim)
  → UPDATE table SET embedding = vector::vector
  → HNSW partial index (WHERE embedding IS NOT NULL) is built lazily

Query time (semantic search):
  user query → EmbeddingsService.embed() → vector
  → SELECT ... ORDER BY embedding <=> $1::vector LIMIT K
  → relevance = 1 - cosine_distance
  → Redis cache 1h per query hash

RAG history query:
  user question → embed → SELECT WorkoutSessions WHERE userId=$1 ORDER BY distance
  → fetch top-10 + their exerciseSets summary
  → Claude Haiku prompt with retrieved context
  → answer cached 24h per (userId, query hash)

Weekly cron (Sunday 03:00 UTC):
  embed completed WorkoutSessions where embedding IS NULL (batch 100, 50 per OpenAI batch)
```

## Pose Detection Pipeline

```
Camera (30fps) → MediaPipe Pose (33 landmarks)
    ↓
For each frame:
  1. SafetyChecker.checkSafety(landmarks, exerciseName)
     → Critical alerts (knee hyperextension, rounded back) → immediate voice
  2. RepCounter.processFrame(landmarks, timestampMs)  [gym only]
     → Phase detection (START → ECCENTRIC → HOLD → CONCENTRIC → START = 1 rep)
     → Form score per phase
     → Partial rep detection
  3. FeedbackEngine.checkPose(landmarks, checkpoint)  [video workout]
     → 8 joint angle measurements vs checkpoint rules
     → Score 0-100, isCorrect = score >= 70
  4. Visual feedback: skeleton color (green/red), bubble, score badge
  5. Voice feedback (throttled, priority queue)
  6. Every 10s: save PoseSnapshot to backend
```

## Gym Workout Flow

```
1. User selects plan day → POST /api/gym-sessions/start
   → Creates GymSession + WorkoutSession
   → Pre-populates ExerciseSet rows:
     - Sorted by category: compound → accessory → isolation
     - Compound exercises with weight >20kg get 2 warmup sets:
       50% × 15 reps, 75% × 8 reps (isWarmup: true)
2. User starts camera → MediaPipe initializes
3. For each set:
   - Real-time pose detection
   - RepCounter increments completedReps
   - On set complete (target reps reached or manual button):
     - Show RPE modal (skipped for warmup sets)
     - POST /api/gym-sessions/:id/set/complete with reps, weight, formScore, RPE
4. Between sets: RestTimerOverlay (90s default, voice countdown)
5. Auto-advance to next set
6. After last set: POST /api/gym-sessions/:id/end
   - Calculates total reps, avg form, duration
   - Updates ExerciseHistory
   - Updates WeeklyVolume per muscle group
   - Triggers ProgressService.updateProgress (XP, streak)
   - Returns XP gained
7. Show GymWorkoutSummary with breakdown
```

## XP System
- 10 XP per minute
- +20 XP if avg form ≥80%
- +50 XP if completed 80%+ of planned sets
- 5 levels: Začátečník (0) → Pokročilý (200) → Expert (500) → Mistr (1000) → Legenda (2000)
- Streak: increments on consecutive days, resets after 2+ days off

## Onboarding Flow (Section C)
1. **Measurements:** age, weight (kg), height (cm) → POST /api/onboarding/measurements
2. **Fitness test:** weight × reps for 5 compound exercises → POST /api/onboarding/fitness-test
3. **1RM calculation:** Epley formula `1RM = weight × (1 + reps/30)`
4. **Working weight:**
   - Strength: 85% × 5 reps
   - Hypertrophy: 72% × 10 reps
   - Endurance: 60% × 15 reps
5. **First week:** 60% of recommended (gentle ramp)
6. POST /api/onboarding/complete → onboardingDone: true → redirect to dashboard

## Mobile Architecture (React Native + Expo SDK 54)

### Screens (47 total v2 design)
```
Auth stack:
  LoginScreen, RegisterScreen, OnboardingScreen

Main tabs (6):
  Dashboard (Triple Activity Ring + AI Týdenní review)
  Plans (Trénink — quick start + plan list)
  Vyziva (macro rings + AI nutrition tips + meals + modal)
  Habity (recovery score ring + AI doporučení + 1-5 scale form)
  Lekce (cards listing + filter by category)
  Progress (stats + plateaus + weak points)

Stack screens (přístupné z Profile menu / Plans / Dashboard):
  ProfileScreen (Více menu → Úspěchy, Cviky, Videa, Doma, AI Trenér, Komunita, Slovník)
  CameraWorkoutScreen (Phase 6 part 1: expo-camera + manual rep counter + RPE + rest)
  UspechyScreen (17 achievements grid)
  ExerciseDetail, PlanDetail, VideoDetail, LessonDetail
  Doma, AICoach, Videos, Exercises, Slovnik, Community
```

### Mobile-specific
- **Camera:** `expo-camera` mirror mode + `expo-haptics` feedback
- **Push notifications:** `expo-notifications` Expo Push Service, auto-register in `auth-context`
- **Storage:** `expo-secure-store` for JWT
- **SVG:** `react-native-svg` for V2Ring + V2TripleRing
- **Navigation:** `@react-navigation/bottom-tabs` + `native-stack`
- **Theme:** custom v2 theme tokens via `v2.tsx` (V2Screen, V2Display, V2SectionLabel, V2Button, V2Chip, V2Input, V2Ring, V2TripleRing, V2Loading, V2Row)
- **Metro config:** monorepo dedupe via blockList (prevents React 18 hoist conflict)
- **API URL:** default `https://fitai.bfevents.cz` (env override `EXPO_PUBLIC_API_URL`)

### Mobile vs Web parity
| Feature | Web | Mobile |
|---------|-----|--------|
| Pose detection (MediaPipe) | ✅ | ❌ TODO Phase 6 part 2 (EAS Build + native plugin) |
| Manual rep counter | — | ✅ |
| AI coaching | ✅ | ❌ depends on pose detection |
| Voice (ElevenLabs) | ✅ | ✅ expo-audio (VoiceEngine rolled back) |
| Push notifications | ❌ VAPID keys missing | ✅ Expo Push |
| All non-pose features | ✅ | ✅ Parita |

## Klíčová rozhodnutí (ADRs) — LOAD-BEARING

> Append-only tabulka. Nikdy nemazat řádky — pokud je rozhodnutí superseded, přidej nový ADR a v původním přidej "Superseded by #N".

| # | Datum | Rozhodnutí | Důvod |
|---|---|---|---|
| 1 | 2026-04-06 | Global API prefix `/api/*` via `setGlobalPrefix()` | ALB routing rule `/api/*` → API target group, `/*` → Web. Bez prefixu by NestJS a Next.js page paths kolidovaly |
| 2 | 2026-04-06 | `prisma db push` místo `migrate dev` | Produkce nemá migration history, schema push je idempotentní. Trade-off: žádné rollback migrace, ale jednodušší deploy flow |
| 3 | 2026-04-07 | ElevenLabs `language_code: 'cs'` hardcoded | Bez explicitní language_code ElevenLabs detekuje jazyk automaticky a občas mluví anglicky na český text |
| 4 | 2026-04-07 | Redis cache TTL: 7d static, 1h per-user, 24h daily-brief | Static content (exercises, lessons) se nemění, per-user AI insights potřebují refresh, daily-brief je 1x denně |
| 5 | 2026-04-08 | GitHub Actions OIDC federation místo long-lived AWS keys | Bezpečnější — žádné rotující secrets, IAM role s scoped permissions, audit trail v CloudTrail |
| 6 | 2026-04-08 | `dorny/paths-filter` v CI pro selective builds | API a Web builds jsou nezávislé. Bez filtru každý push buildí obě — zbytečný CodeBuild čas a náklady |
| 7 | 2026-04-08 | Claude Haiku pro coaching/tips, Sonnet pro vision | Haiku je 10x levnější a dostatečný pro krátké CZ coaching fráze. Sonnet potřeba jen pro image analysis (food, body photos) |
| 8 | 2026-04-09 | `expo-camera` místo `react-native-vision-camera` pro mobile workout | VisionCamera vyžaduje frame processor plugin + worklet runtime. expo-camera je jednodušší, stačí pro mirror view + manual rep counting |
| 9 | 2026-04-11 | Two-phase native rollout (native scaffold → JS flip) | Flag-day rollout (3a92c11) crashnul protože starý binár neměl nový native modul ale Metro hot-reloadnul nový JS. Lesson: native changes a JS flip vždy v oddělených commitech |
| 10 | 2026-04-11 | `scheduleReArm()` single-timer pattern pro recognition loop | Bez single-timer patternu 'end' + 'error' events stackovaly setTimeout callbacks → 3-8 concurrent recognition sessions → error 209 storm |
| 11 | 2026-04-12 | Backend PCM opt-in via `audioFormat` DTO field | Backwards compat: starý klient (expo-audio) nedostane PCM (které neumí přehrát). Nový klient (VoiceEngine) explicitně požádá o PCM. Default = MP3 |
| 12 | 2026-04-12 | POST /coaching/ask-stream (SSE) místo rozšíření /ask | Nový endpoint neruší existující JSON path. Mobile klient může přepnout na streaming nezávisle na web klientovi |
| 13 | 2026-04-12 | Sentence-boundary flushing pro Claude→ElevenLabs pipeline | Word-by-word = příliš mnoho TTS requestů. Celá odpověď = zabíjí latency. Sentence boundary (`. ! ?`) = optimální trade-off |
| 14 | 2026-04-19 | Rollback VoiceEngine na expo-audio | VoiceEngine native modul (AVAudioEngine + VoiceProcessingIO) měl nevyřešený silent playback bug (format/routing). Expo-audio funguje spolehlivě. VoiceEngine debug v separate session s Xcode |
| 15 | 2026-04-19 | Archive rhythm pro CHANGELOG/ROADMAP | CHANGELOG narostl na 74 KB (2x budget). Archive completed phases verbatim, aktivní docs drží jen recent. Viz CHANGELOG-archive/ a ROADMAP-archive/ |
| 16 | 2026-05-04 | pgvector pro semantic search + RAG | OpenAI `text-embedding-3-small` (1536 dim) přes `EmbeddingsService` (@Global, lazy client). Postgres pgvector 0.8.2 s HNSW partial indexy `WHERE embedding IS NOT NULL`. Vector field je `Unsupported("vector(1536)")` v Prisma — query přes `$queryRawUnsafe` s `$1::vector` cast. Produkce: RDS Postgres 16 má pgvector out-of-the-box, žádný downtime |
| 17 | 2026-05-04 | HealthKit data preferred over self-reported DailyCheckIn | `calcRecoveryScoreSmart()` aplikuje HRV (15 max body), objective sleep (20 max body), resting HR (10 max body) z `WearableData` když je dostupné. Self-reported (energy, soreness, stress) zůstávají jako přídavný signál. Bez wearable data fallback na původní `calcRecoveryScore` (zero breaking change pro existing users) |
| 18 | 2026-05-04 | Wearable provider OAuth via JWT-signed state | OAuth `state` parametr je signed JWT (`expiresIn: '2m'` since 2026-05-05, předtím 10m) embedding `userId + provider` + `audience: 'oauth-state'` + `issuer: 'fitai-oauth'`. Eliminates need pro Redis state store. `/callback` je veřejný endpoint (Oura redirect bez user JWT), bezpečí přes signature + audience/issuer ověření — zabraňuje cross-token-class confusion s auth JWT. Tokens v `WearableConnection.accessToken/refreshToken` plaintext — TODO: KMS envelope encryption when production-ready |
| 19 | 2026-05-05 | Atomic delete+insert pattern pro wearable replace-window | `OuraSyncService.replaceWindow` používá `prisma.$transaction([deleteMany, createMany])`. Bez transakce by partial createMany failure (RDS connection churn, validation error) nechal user s prázdným 7d wearable oknem a Daily Brief by silently fallback-l na self-reported recovery score. Pattern použitelný i pro budoucí wearable provideries (Whoop, Garmin) |
