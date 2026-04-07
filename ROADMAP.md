# FitAI — Roadmap & Progress

## Implementation Status

### ✅ Foundation (Phases 1-10 from initial roadmap)

#### Phase 1: Smart Coach System (DONE)
- ElevenLabs TTS integration with priority queue
- Claude Haiku contextual coaching (knows user history, weak joints)
- Safety system (knee hyperextension, rounded back, shoulder impingement)
- Audio ducking when video instructor speaks
- DB: CoachingSession, CoachingMessage, SafetyEvent
- Files: `apps/api/src/coaching/`, `apps/web/src/lib/smart-voice.ts`, `safety-checker.ts`

#### Phase 2: Adaptive Intelligence (DONE)
- AI-generated personalized plans via Claude
- FitnessProfile with goals, equipment, injuries
- Break recovery (50-90% intensity based on days off)
- Periodization (deload every 5th week)
- Asymmetry detection from safety events
- Home workout fallback
- Files: `apps/api/src/ai-planner/`

#### Phase 3: Monetization — SKIPPED by user

#### Phase 4: PWA + Push Notifications (DONE)
- Service worker with offline caching
- VAPID push notifications (web-push lib)
- Notification preferences with quiet hours
- Streak reminder logic
- Files: `apps/api/src/notifications/`, `apps/web/public/sw.js`, `manifest.json`

#### Phase 5: Social & Community (DONE)
- Follow/unfollow system
- Activity feed
- Challenges with leaderboards
- User search
- Files: `apps/api/src/social/`, `apps/web/src/app/(app)/community/`

#### Phase 6: Mobile App (React Native + Expo) (DONE)
- 8 screens: Login, Register, Dashboard, Videos, Exercises, Plans, Progress, Profile
- Bottom tab navigation
- SecureStore for JWT
- Files: `apps/mobile/`

#### Phase 7: Computer Vision 2.0 (Partial)
- Rule-based exercise detection from joint angles
- Equipment guess from exercise name
- Files: `apps/api/src/vision/`
- TODO: YOLO integration for real plate color detection

#### Phase 8: 3D Pose Estimation (Library ready)
- `pose-detection-3d.ts` with `calculateAngle3D`, body rotation detection
- Not yet wired to live workouts (requires MediaPipe Task API upgrade)

#### Phase 9: Wearables (Backend ready)
- WearableData model, sync endpoint
- HR zones calculation, recovery score
- Calorie estimation from heart rate
- Files: `apps/api/src/wearables/`
- TODO: iOS HealthKit bridge in mobile app

#### Phase 10: Content Pipeline (Backend ready)
- URL import endpoint (mock implementation)
- Marketplace items model
- Files: `apps/api/src/content/`
- TODO: Real yt-dlp integration, Synthesia integration

---

### ✅ Section A: Fitness Intelligence (DONE)
**Goal:** Add real fitness systematics (warmup, periodization, RPE, volume)

- Exercise.category (compound/isolation/accessory)
- Auto warmup sets for compound exercises (50% × 15, 75% × 8)
- Exercise ordering: compound → accessory → isolation
- ExerciseSet.rpe + tempoSeconds + isWarmup
- WeeklyVolume model: sets/reps/kg per muscle group per week
- New endpoint: GET /api/gym-sessions/my/weekly-volume
- Frontend: RPEModal (1-10 with descriptions), Weekly Volume widget on /progress
- Files: `apps/api/src/gym-sessions/`, `apps/web/src/components/gym/RPEModal.tsx`

### ✅ Section B: Adaptive Learning from Data (DONE)
**Goal:** AI learns from user data to optimize training

- IntelligenceModule with 4 analyses:
  - **Plateau detection:** 3+ weeks no weight increase → recommendation
  - **Recovery analysis:** form trend + RPE + volume → status (fresh/normal/fatigued/overreached)
  - **Weak points:** muscle groups with avg form <65%
  - **Asymmetries:** L vs R safety events
- FitnessProfile.priorityMuscles for body part focus
- Dashboard widget: AI Insights panel
- Files: `apps/api/src/intelligence/`

### ✅ Section C: Onboarding + Fitness Assessment (DONE)
**Goal:** Calibrate new users with proper starting weights

- 3-step wizard: measurements → fitness test → review
- 1RM calculation via Epley formula: `weight × (1 + reps/30)`
- Goal-based working weights (Strength 85%, Hypertrophy 72%, Endurance 60%)
- First week starts at 60% (gentle ramp)
- Auto-redirect from dashboard if onboarding incomplete
- DB: OneRepMax model, FitnessProfile.onboardingDone/age/weightKg/heightCm
- Files: `apps/api/src/onboarding/`, `apps/web/src/app/(app)/onboarding/`

### ✅ Section D: Education (DONE)
**Goal:** Educate users about training, nutrition, recovery

- 8 lessons: technique, nutrition, recovery, mindset
- 16 glossary terms: 1RM, RPE, AMRAP, hypertrofie, deload, eccentric...
- Lesson of the Week (rotates by ISO week)
- Pre-workout briefing endpoint (greeting, summary, tips)
- Post-workout debrief endpoint (wins, improvements, next steps)
- Files: `apps/api/src/education/`, `apps/web/src/app/(app)/lekce/`, `slovnik/`
- New nav: Lekce, Slovník

---

## Next: Section E — Training Outside Gym

**Goal:** When user can't access gym, provide alternatives

### Planned features:
1. **Home workout fallback**
   - Bodyweight alternatives for each gym exercise
   - Progressions (push-ups → archer push-ups → one-arm)
   - DB: Exercise.bodyweightAlternativeId or new ExerciseAlternative model

2. **Travel mode**
   - Hotel room workouts (zero equipment)
   - Quick 15-min full-body sessions
   - Less space requirements

3. **Quick workout**
   - Time-boxed sessions: 15min, 30min, 45min
   - AI selects exercises to fit time budget
   - Prioritize compound + supersets for efficiency

4. **Mode switching in workout flow**
   - Before gym session: "Don't have time/equipment today? Try alternative."
   - Integration with AI Planner to swap exercises on-the-fly

### Files to create (estimated):
- `apps/api/src/alternatives/` — alternatives module
- New DB fields: Exercise.bodyweightAlternative, Exercise.minimumEquipment
- Frontend: `/quick-workout` page, exercise swap UI

---

## Future Phases (Beyond Sections A-E)

### Section F: Voice-First Interaction
- "Hey FitAI" voice activation
- Voice command: "Start chest workout"
- Hands-free during workout

### Section G: Trainer Marketplace
- Real trainers can publish plans
- Revenue split (70/30)
- Trainer ratings, reviews

### Section H: Nutrition Tracking
- Calorie + macro logging
- Photo-based food recognition (Florence-2)
- Goal-based meal recommendations

### Section I: Wellness Integration
- Sleep tracking from wearables → recovery score
- Stress level (HRV) → adjust intensity
- Hydration reminders

### Section J: Community Programs
- 30-day challenges with cohorts
- Group classes (live stream synced with multiple cameras)
- Leaderboards by region/age

---

## Technical Debt & Known Issues

### Critical
- **No HTTPS on production ALB** — kamera blocked by browser without HTTPS. Need ACM cert + custom domain.
- **Local Docker broken** — workaround: AWS CodeBuild for all builds
- **TypeScript decorators relaxed** — `strictNullChecks: false` due to TS 5.9 + NestJS interop

### Medium
- **CodeBuild trigger is manual** — TODO: GitHub webhook for auto-build on push
- **No real seed videos** — only 3 placeholders with picsum thumbnails
- **API keys not configured** — coaching/preprocessing fall back to mocks
- **Weekly volume cron** — needs ECS scheduled task to reset/aggregate weekly

### Low
- **Mobile app** — only static screens, no camera/pose integration yet
- **3D pose** — library exists but not wired to live workouts
- **Wearables** — backend ready, no actual mobile app integration

---

## How to Continue Implementation

### To add a new module:
1. Update `apps/api/prisma/schema.prisma` (run `npx prisma db push --accept-data-loss` locally if Docker works)
2. Create `apps/api/src/<module>/` with service, controller, module
3. Register in `apps/api/src/app.module.ts`
4. Add frontend client in `apps/web/src/lib/api.ts` (use `${API_BASE}/api` prefix!)
5. Create UI page in `apps/web/src/app/(app)/<route>/`
6. Update Header nav if needed
7. Commit + push to GitHub
8. Run CodeBuild for both API and Web
9. Run migration task if schema changed
10. Test on production

### To add a new exercise:
1. Edit `apps/api/prisma/seed.ts`, add to `exercises` array with full instructions JSON
2. CodeBuild + migration task (re-runs seed via upsert)

### To add a new lesson:
1. Edit `apps/api/prisma/seed.ts`, add to `lessons` array
2. CodeBuild + migration task

### Critical reminders:
- ALL API paths must be under `/api` prefix (NestJS global prefix)
- Page paths in Next.js MUST NOT collide with API paths
- Always test routing after schema changes: `curl ALB/api/<endpoint>` vs `curl ALB/<page>`
- Browser hard refresh (Cmd+Shift+R) needed after web deploy to clear cached JS

## Production URLs
- **App:** http://fitai-production-alb-1685369378.eu-west-1.elb.amazonaws.com
- **CDN:** https://d2xm0s90jjozt9.cloudfront.net
- **GitHub:** https://github.com/renelernety2025/fitai

## Demo Credentials
- **Admin:** admin@fitai.com / demo1234
- **Demo:** demo@fitai.com / demo1234
