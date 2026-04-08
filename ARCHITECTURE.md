# FitAI — Architecture

> Aktualizováno: 2026-04-08

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

ECS API (26 NestJS modules)
    ├── PostgreSQL RDS (30+ tables, private subnet)
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
- CodeBuild: `fitai-api-build`, `fitai-web-build` (manual trigger via CLI)
- ECS task definition: `fitai-migrate:2` runs `prisma db push && prisma db seed`

### Monitoring
- CloudWatch alarms: API CPU/memory >80%, RDS CPU >70%, ALB 5xx >10/5min
- SNS topic for alerts (email subscription)
- Dashboard: `fitai-production`

## Database Schema (30+ models)

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

## Backend Modules (26)

| # | Module | Endpoints (under `/api`) | Purpose |
|---|--------|--------------------------|---------|
| 1 | Auth | /auth/login, /auth/register, /auth/me | JWT auth |
| 2 | Users | /users/me/reminder-status | Profile, reminders |
| 3 | Health | /health (NO prefix) | ALB health check |
| 4 | Videos | /videos, /videos/upload-url, /videos/:id, /videos/admin/all, /videos/:id/publish, /videos/:id/reprocess | Video CRUD |
| 5 | Preprocessing | /preprocessing/start, /preprocessing/status/:videoId | Whisper + Claude pipeline |
| 6 | Sessions | /sessions/start, /sessions/:id/end, /sessions/:id/pose-snap, /sessions/my, /sessions/my/stats | Video workout tracking |
| 7 | Progress | (internal service) | XP/streak/levels |
| 8 | Exercises | /exercises, /exercises/:id, POST/PUT/DELETE | Exercise library |
| 9 | WorkoutPlans | /workout-plans, /workout-plans/:id, /workout-plans/:id/clone | Plan templates |
| 10 | GymSessions | /gym-sessions/start, /gym-sessions/:id/set/complete, /gym-sessions/:id/end, /gym-sessions/my, /gym-sessions/my/weekly-volume | Gym tracking |
| 11 | Adaptive | /adaptive/recommendations/:exerciseId | Weight recommendations |
| 12 | Coaching | /coaching/feedback, /coaching/tts, /coaching/safety-event, /coaching/precache | Real-time AI coaching |
| 13 | AIPlanner | /ai-planner/profile, /ai-planner/generate, /ai-planner/break-recovery, /ai-planner/asymmetry, /ai-planner/home-alternative | AI plan generation |
| 14 | Notifications | /notifications/vapid-public-key, /notifications/subscribe, /notifications/preferences, /notifications/test | Web push (VAPID) |
| 15 | Social | /social/follow/:userId, /social/feed, /social/challenges, /social/search | Social features |
| 16 | Vision | /vision/detect-exercise, /vision/analyze, /vision/estimate-weight | Exercise detection |
| 17 | Wearables | /wearables/sync, /wearables/heart-rate/:sessionId, /wearables/recovery, /wearables/calories/:sessionId | HR data, recovery |
| 18 | Content | /content/import, /content/marketplace, /content/my-imports | URL import, marketplace |
| 19 | Intelligence | /intelligence/insights, /intelligence/plateaus, /intelligence/recovery, /intelligence/weak-points, /intelligence/priority-muscles | Adaptive learning (Section B) |
| 20 | Onboarding | /onboarding/status, /onboarding/test-exercises, /onboarding/measurements, /onboarding/fitness-test, /onboarding/suggested-weights, /onboarding/complete | 1RM test wizard (Section C) |
| 21 | Education | /education/lessons, /education/lessons/of-the-week, /education/lessons/:slug, /education/glossary, /education/briefing/:gymSessionId, /education/debrief/:gymSessionId | Lessons + glossary (Section D) |
| 22 | HomeTraining | /home-training/quick, /home-training/home, /home-training/travel | Bodyweight workouts (Section E) |
| 23 | Nutrition | /nutrition/goals, /nutrition/goals/auto, /nutrition/today, /nutrition/log, /nutrition/quick-foods | Food log + TDEE (Section F) |
| 24 | Habits | /habits/today, /habits/history, /habits/stats | Daily check-in + recovery score (Section G) |
| 25 | AiInsights | /ai-insights/recovery-tips, /ai-insights/weekly-review, /ai-insights/nutrition-tips | Claude-powered insights (Section H), 1h cache |
| 26 | Achievements | /achievements, /achievements/check, /achievements/unlock | Gamification (Section J), 17 seed badges |
| — | Prisma | (internal) | Database client |

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
- **In-memory cache** 1h per user per endpoint
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

### Screens (18 total v2 design)
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
| Voice (ElevenLabs) | ✅ | ❌ TODO native TTS player |
| Push notifications | ❌ VAPID keys missing | ✅ Expo Push |
| All non-pose features | ✅ | ✅ Parita |
