# FitAI — Architecture

## High-Level

```
USER (browser/mobile)
    ↓
ALB (HTTP, port 80) — fitai-production-alb-1685369378.eu-west-1.elb.amazonaws.com
    ↓
    ├── /api/* + /health    → API Target Group → ECS Fargate (NestJS, port 3001)
    └── /*                   → Web Target Group → ECS Fargate (Next.js, port 3000)

ECS API
    ├── PostgreSQL RDS (db.t3.micro, 26 tables, private subnet)
    ├── Redis ElastiCache (cache.t3.micro, private subnet)
    ├── S3 (videos, choreography, assets)
    ├── CloudFront CDN (https://d2xm0s90jjozt9.cloudfront.net)
    ├── Secrets Manager (DB password, JWT secret, API keys)
    └── External APIs:
        ├── Claude Haiku — real-time coaching, AI plan generation
        ├── ElevenLabs — Czech voice synthesis (cached)
        └── OpenAI Whisper — video audio transcription
```

## AWS Infrastructure (Terraform)

### Networking
- VPC: 10.0.0.0/16, 2 public + 2 private subnets, NAT Gateway
- Security groups: alb-sg, api-sg, web-sg, rds-sg, redis-sg

### Compute
- ECS Cluster: `fitai-production` (Fargate, Container Insights enabled)
- 2 services: `fitai-api-service`, `fitai-web-service` (each 1 task, autoscale 1-3)
- ALB: HTTP only on port 80 (no SSL yet)
- 1 listener rule: `/api/*` + `/health` → API, default → Web

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

## Database Schema (26 models)

### Core
```
User (id, email, name, isAdmin, level)
  ├── UserProgress (totalXP, currentStreak, longestStreak, totalSessions, totalMinutes)
  ├── FitnessProfile (goal, experienceMonths, daysPerWeek, equipment[], injuries[],
  │                   age, weightKg, heightCm, onboardingDone, priorityMuscles[])
  └── OneRepMax (exerciseId, estimatedKg, source) — Section C
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
PushSubscription (userId, endpoint, p256dh, auth)
NotificationPreference (userId, workoutReminder, streakWarning, achievements,
                        quietHoursStart, quietHoursEnd)
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

## Backend Modules (22)

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
| 22 | Prisma | (internal) | Database client |

## Frontend Architecture

### Pages (App Router)
```
/                          Landing page
/login, /register          Auth pages
/(app)/dashboard           Stats, Lesson of the Week, AI Insights, weekly chart, recommended videos
/(app)/onboarding          3-step wizard
/(app)/videos              Video catalog
/(app)/videos/[id]         Video detail
/(app)/workout/[videoId]   Video workout (split: video + camera + skeleton overlay)
/(app)/exercises           Exercise library
/(app)/exercises/[id]      Exercise detail with full instructions
/(app)/plans               Workout plans
/(app)/plans/[id]          Plan detail with days
/(app)/plans/create        Plan builder
/(app)/gym/start           Plan day selection
/(app)/gym/[sessionId]     Gym workout (instructions + camera + rep counter + RPE modal + rest timer)
/(app)/ai-coach            AI Trainer profile + plan generation
/(app)/lekce               Lessons listing
/(app)/lekce/[slug]        Lesson detail
/(app)/slovnik             Glossary
/(app)/community           Social: feed, challenges, people
/(app)/progress            Stats, streak calendar, weekly volume per muscle
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
- `components/layout/Header.tsx` — Main nav (8 links)
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
