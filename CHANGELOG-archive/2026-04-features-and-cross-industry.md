# FitAI Changelog Archive — 2026-04-20 to 2026-04-22 (Features & Cross-Industry)

Archived from main `CHANGELOG.md` 2026-05-04. See current CHANGELOG for newer entries.

---

## [Social Platform — Stories, Reactions, Buddy Finder, DMs, Props, Flash] 2026-04-22

### Workout Stories (Instagram)
- Auto-generated 24h story cards from workout data
- Stories bar on community feed (horizontal scroll, lime ring for unviewed)
- Fullscreen story viewer with auto-advance timer + keyboard nav

### Reactions & Comments (Instagram/TikTok)
- 5 emoji reactions (fire, muscle, clap, heart, 100) on feed items + stories
- Comment section under feed items (expandable, flat v1)

### Gym Buddy Finder (Tinder/Bumble)
- `/gym-buddy` with buddy profile + swipe card stack
- Native drag gestures (left=pass, right=interested)
- Mutual match detection + match animation

### Direct Messages
- `/messages` split-panel chat (conversations left, messages right)
- Start conversation requires mutual follow or buddy match
- 10s polling for new messages

### Props/Kudos System
- "Dát props" button on profiles + feed items (max 5/day)
- Props counter on public profiles

### Flash Challenges
- 1-hour pop-up challenges with countdown timer
- Floating banner on community, mini leaderboard (top 3)

### Share to Feed
- One-tap sharing of workouts, PRs, journal entries, recipes
- Auto-generated attractive feed cards

### Enhanced Profiles
- `/profile/:id` public profile with stats, achievements, bio
- Follow/props/message buttons
- Transformation highlights

### Backend
- Extended social module: 17 new endpoints
- New modules: buddy (5 endpoints), messages (5 endpoints)
- 10 new Prisma models
- User model extended with bio + propsReceived

---

## [Infrastructure — Legal, SEO, Landing, Password Reset, Settings, Email, Admin] 2026-04-22

### Legal Pages
- /privacy — GDPR privacy policy (data, AI, cookies, rights)
- /terms — Terms of Service
- /ai-disclaimer — AI is not medical advice
- Footer links on all pages

### SEO
- Meta tags, OG, Twitter cards on layout
- robots.txt (blocks /api/, /admin/)
- sitemap.xml (public pages only)

### Landing Page Redesign
- Hero + features grid (6 features) + how it works (3 steps)
- Pricing table (Free/Pro 199Kc/Premium 399Kc)
- Professional dark theme design

### Error Pages
- Custom 404 + 500 error pages

### Password Reset
- POST /auth/forgot-password + /auth/reset-password
- Crypto UUID tokens, 1h expiry, single-use, bcrypt
- /forgot-password + /reset-password web pages

### Account Settings (/settings)
- Change name, change password
- GDPR account deletion ($transaction, 55+ models)
- Export data link

### Email System
- EmailService with sendWelcome, sendPasswordReset, sendWeeklyDigest, sendStreakWarning
- Logger-only (ready for SES/Resend)
- Weekly digest cron (Friday 18:00)

### Admin Dashboard (/admin)
- Stats: total users, active today, sessions, food logs, check-ins, AI calls
- isAdmin server-side check

### Security Fixes
- Password reset token removed from API response (was account takeover)
- Token no longer logged to CloudWatch
- All old tokens invalidated on successful reset
- 25 missing models added to GDPR deletion
- Sitemap restricted to public pages

---

## [Priority 1 — Mobile parity, Dark/Light mode, Onboarding tour] 2026-04-22

### Mobile Parity (4 new screens)
- AI Chat: SSE streaming chat with Alex, suggested prompts, keyboard avoiding
- Journal: month navigation, day cards, mood/rating/tags, AI insights
- Calendar: monthly grid, colored dots (planned/completed/missed), CRUD
- Leagues: tier badge hero, leaderboard, weekly XP, join flow, countdown
- All accessible from Profile "Vice" menu

### Dark/Light Mode
- ThemeProvider with CSS custom properties (11 variables)
- Sun/moon toggle in V2Layout header
- localStorage persistence (default: dark)
- V2Layout + V2AuthLayout fully theme-aware

### Onboarding Tour
- 7-step guided spotlight tour for new users
- Highlights: dashboard, rings, AI chat, gym, journal, leagues, more menu
- localStorage persistence (shows once)
- "Restart tour" button on profile page

---

## [9 cross-industry features — Portfolio, Bloodwork, Rehab, Marketplace, Boss, and more] 2026-04-21

### Body Portfolio (`/body-portfolio`)
- Fintech-style dashboard: overall score + 5 categories (Strength/Endurance/Form/Nutrition/Mobility)
- CSS radar pentagon chart, monthly change indicators, sparklines

### Bloodwork Tracker (`/bloodwork`)
- Log blood test results (7 markers: testosterone, iron, vitamin D, CRP, cholesterol, glucose, HbA1c)
- Dot charts with reference range zones, AI trend analysis (Claude Haiku)

### Injury Rehab Planner (`/rehab`)
- AI-generated rehab plans (Claude Haiku) based on injury type/body part/severity
- Phase timeline, session logging with pain level 0-10, exercise checklists

### Streak Freeze (dashboard integration)
- Duolingo-style streak freeze: max 2/month, ice crystal button on dashboard

### Marketplace (`/marketplace`)
- Share/sell workout plans for XP currency
- Browse, search, filter, rate, purchase listings

### Boss Fights (`/boss-fights`)
- 5 epic workout challenges (Minotaur through Olymp, 500-2000 XP)
- Timer, completion tracking, gold badges for defeated bosses

### Discover Weekly (`/discover-weekly`)
- AI-generated personalized "workout of the week" (Claude Haiku)
- Exercise rationale, regenerates every Monday

### "Lidé jako ty" Recommendations (exercises integration)
- "People like you also do..." section on exercises page
- Based on similar users' exercise frequency

### Gym Finder (`/gym-finder`)
- User-submitted gym reviews with equipment tags and ratings
- Equipment filter, nearby search

### Backend
- 9 new NestJS modules, 9 new Prisma models
- Haversine distance for gym proximity, XP marketplace economy

---

## [Cross-industry features — Wrapped, Leagues, Skill Tree, Calendar, Battle Pass] 2026-04-21

### FitAI Wrapped (`/wrapped`)
- Spotify-inspired monthly/yearly stats recap
- Total workouts, hours, volume, PRs, top exercises, most active day
- AI motivational summary (Claude Haiku)
- Share-ready card layout with gradient backgrounds

### Leagues & Divisions (`/leagues`)
- Weekly XP competition with 5 tiers (Bronze → Legend)
- Auto-assignment by total XP level
- Leaderboard with promotion (top 3) / relegation (bottom 3) indicators
- Week countdown timer

### Skill Tree (`/skill-tree`)
- 21 skills across 4 branches: Strength, Endurance, Form, Nutrition
- Progressive unlocking with prerequisites
- Visual tree with connected nodes (unlocked/available/locked states)
- Real data evaluation (max weights, streak, sessions, form %)

### Workout Calendar (`/calendar`)
- Monthly calendar grid with planned/completed/missed indicators
- Schedule workouts with plan link, CRUD operations
- Color-coded dots and side panel detail view

### Battle Pass / Seasons (`/season`)
- 30-day seasons with 10 missions (daily/weekly/challenge)
- Level progression (100 XP = 1 level) with horizontal track
- Mission progress bars, XP rewards, auto-completion checking
- Initial season: "Jarní výzva 2026"

### Backend
- 5 new NestJS modules: wrapped, leagues, skill-tree, calendar, seasons
- 7 new Prisma models
- League tier auto-assignment, weekly ranking with promotion/relegation
- Skill tree evaluation against real user data

---

## [Tier 3 — Social Challenges + Export CSV/PDF] 2026-04-21

### Enhanced Social Challenges (`/community`)
- User-created challenges: name, type (workouts/volume/streak/steps), target, 7/14/30 day duration
- Challenge detail page with hero, progress bars, leaderboard ranking
- Invite friends via search panel
- Progress bars on challenge cards in community feed
- creatorId field on Challenge model

### Export (`/export` + buttons on pages)
- Dedicated export page with 4 options (workouts CSV, workouts print, journal, nutrition)
- `GET /api/export/workouts?format=csv|pdf` — last 100 sessions
- `GET /api/export/journal?month=YYYY-MM` — journal entries with mood/rating/notes
- `GET /api/export/nutrition?from=...&to=...` — food log with macros/source
- CSV with UTF-8 BOM for Excel compatibility
- HTML print page for workout "PDF" (Ctrl+P)
- Download buttons on /progress, /journal, /vyziva pages

### Backend
- New NestJS module: `export` (3 endpoints)
- Enhanced social: createChallenge, getChallengeDetail, inviteToChallenge
- Challenge model: +creatorId field

---

## [Superset/Circuit Builder — drag-and-drop workout editor] 2026-04-21

### Plan Editor (`/plans/[id]/edit`)
- HTML5 drag-and-drop exercise reordering (no external libs)
- Day tabs with add/delete day
- Inline editing: click to edit sets, reps, weight, rest seconds
- Exercise picker modal with search + muscle group filters

### Exercise Grouping
- Multi-select exercises → group as Superset (blue), Circuit (lime), Giant Set (purple), Drop Set (orange)
- Colored bracket connecting grouped exercises
- Ungroup button to split groups

### Backend
- `PUT /api/workout-plans/:id` — full plan update with delete-recreate pattern
- PlannedExercise: +groupId, groupType, groupOrder fields
- Ownership check + class-validator DTO with nested validation

---

## [AI Food Recognition + Recipe Book] 2026-04-21

### Food Camera (`/vyziva`)
- "Vyfotit jídlo" button — photo upload → Claude Sonnet Vision analyzes → estimated kcal/macros/ingredients
- Source selector: Doma/Restaurace/Obchod/Rozvoz (color-coded badges)
- Rating, notes, confidence score per food entry
- Enhanced food log items with photo thumbnail, source badge, expandable details

### Recipe Book (`/recepty`)
- Full recipe CRUD — name, ingredients (structured JSON), instructions, prep/cook time, macros
- Recipe grid with search + tag filters + favorites
- Recipe detail modal with serif instructions (book feel)
- "Vytvořit z fotky" — AI generates recipe estimate from food photo (Claude Sonnet Vision)
- Recipe photo upload (S3 presigned URLs)

### Backend
- New NestJS module: `recipes` (8 endpoints)
- Recipe model: ingredients JSON, macros, tags, favorite, photo
- Extended FoodLog: +photoS3Key, source, sourceDetail, ingredients, recipeId, rating, notes, confidence
- Enhanced analyze-photo: returns ingredients + source estimate

---

## [Workout Journal — full fitness diary] 2026-04-21

### Journal Page (`/journal`)
- Timeline feed with book-style day cards (two-column: stats left, notes/photos right)
- Monthly chapters with serif titles, AI summary (Claude Haiku), stats + month-over-month comparison
- Milestone badges in timeline ("100. trénink!", "30denní streak!")
- Month navigation (left/right arrows)
- Hero with total stats (entries, PRs, workouts, streak)

### Day Cards
- Auto-populated from GymSession data (exercises, sets, reps, weight, form %)
- PR badges (gold) for personal bests
- Rating (1-5 stars), mood selector (5 emojis), custom tags
- Notes field (serif font, book-like feel)
- Photo grid (up to 4 per day, S3 presigned upload)
- Body measurements (weight, arms, chest, waist — expandable)
- AI insight per entry (Claude Haiku, 1-2 sentences about performance)
- Rest day variant (centered, minimal)

### Post-Workout Integration
- "Zapsat do deníku" button on GymWorkoutSummary

### Backend
- New NestJS module: `workout-journal` (7 endpoints)
- JournalEntry + JournalPhoto models (Prisma)
- S3 presigned URL photo upload (reuses progress-photos pattern)
- Claude monthly summary + per-day AI insights
- Milestones calculation (sessions, streak, journal thresholds)

---

## [Tier 1 — AI Chat Coach + Activity Heatmap + Smart Widget] 2026-04-21

### AI Chat Coach (`/ai-chat`)
- Full conversational UI with Claude Haiku streaming (SSE)
- Hero section with Alex avatar + 8 suggested prompts
- Conversation memory (last 20 messages as Claude context)
- Auto-generated conversation titles
- 3 new API endpoints: POST /coaching/chat, GET /conversations, GET /conversations/:id/messages

### Activity Heatmap (`/habity`)
- GitHub-style 7x12 grid (12 weeks / 3 months)
- Color-coded by recovery score (red/orange/lime)
- Hover tooltips with date + score
- Stats row: total check-ins, longest streak, current streak

### "Co dnes?" Smart Widget (`/dashboard`)
- Rules-based recommendation card above Daily Brief
- 5 priority scenarios: streak risk, high soreness, long absence, low nutrition, default
- Dismissible per day (localStorage)
- Gradient themes per action type
- New API: GET /ai-insights/today-action (instant, no Claude call)

### Navigation
- "AI Chat" added to header nav bar

---

## [Sport modules + workout mode + profile + polish] 2026-04-21

### Sport Training Modules
- /sports hub — 7 sport modules linked
- /shadow-boxing — 9 moves, 10 combos, difficulty filter, round generator
- /golf-lab — 8 shot types (drive/chip/putt + setup/post-swing/victory)
- /soccer-drills — 7 skills (header, pass, tackle, dribble, GK drills)
- /workout-mode — follow-along timer with 3D, beep signals, rest overlays
- /sequences — composable multi-clip training routines with crossfade

### Mixamo Animation System
- 50+ FBX in git, 160+ on disk. Character/animation separation architecture
- Brute-force Hips+Spine lock (rest pose override every frame) fixes orientation
- sport-animations.ts + exercise-animations.ts mapping system
- workout-audio.ts — Web Audio API beep signals

### New Pages & Features
- /profile — fitness profile, stats, level progress bar
- /notifications — toggle preferences (workout/streak/achievements)
- /progress: weekly volume bar chart (muscle groups, color-coded status)
- /progress: activity heatmap (12 weeks GitHub-style)
- Landing page: features grid (8 cards) + stats section
- V2Layout header: bell + user profile icons
- V2Tooltip component for onboarding

### Backend
- @nestjs/schedule cron: streak reminders daily at 19:00
- GET /api/exercises/micro-workout
- GET /api/exercises/:id/personal-best
- Notification preferences API

### Quality
- 69+ regression tests (8 new endpoints + pages)
- Error boundary for 3D viewer
- Exercise search (client-side fulltext)
- Difficulty filter chips
- Empty states (progress, dashboard)

---

## [3D exercise viewer + coach personality + engagement features] 2026-04-20

### 3D Animated Exercise Viewer (web)
- Three.js / React Three Fiber powered 3D humanoid model on `/exercises/[id]`
- Michelle (realistic Mixamo-rigged model, 3.1 MB) animates through 4 phases (START→ECCENTRIC→HOLD→CONCENTRIC)
- Phase controls: play/pause, phase dots, speed (0.5x/1x/2x), camera presets (front/side/back)
- Joint angle overlay: floating labels show target angles on active joints
- Muscle group highlighting (emissive tint on model)
- Phase sync: click phase in text section → viewer jumps to that phase
- Lazy loaded via `next/dynamic` with SSR disabled (Canvas needs `window`)

### Coach Personality Modes
- 3 modes: Drill Sergeant (strict), Chill (calm), Motivational (energetic)
- User selects before each gym session via 3-card picker on `/gym/start`
- `CoachPersonality` enum + field on `GymSession` model (default MOTIVATIONAL)
- Personality-specific Claude system prompt rules in `coaching-prompt.ts`
- Coaching service reads personality from active GymSession

### Post-workout Celebration
- Canvas confetti particle animation (120 particles, FitAI accent colors)
- Fires on XP gained overlay after completing gym session

### Streak Fear Push Notifications
- Escalating urgency based on streak length (2-6 / 7-13 / 14-29 / 30+ days)
- Personalized with user name

### Micro-workout Mode
- `GET /api/exercises/micro-workout` — 3 random exercises, 2x12 reps, 30s rest
- `/micro-workout` web page with V2 design, reroll button
- Nav link + dashboard CTA button

### Quality Audit Fixes
- AngleLabel: ref-based position tracking (zero re-renders per frame vs 60/sec)
- Micro-workout: error state UI + empty exercises fallback + retry button
- Exercise detail: reset selectedPhase on exercise change (stale closure fix)
- Coaching service: log warning on missing GymSession, explicit personality resolution
- Speed animation: sync speedRef with speed state via useEffect
- Dockerfile: isolated npm install to fix React 18/19 monorepo conflict

---
