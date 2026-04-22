# FitAI Cross-Industry Features — Design Spec

> Date: 2026-04-22
> Status: Draft
> Scope: ~30 new features across 7 inspiration categories
> Estimated: 31 new Prisma models, 13 new NestJS modules, ~20 new web pages

## Context

FitAI has 52+ pages, 66 DB models, 250+ endpoints — a comprehensive fitness platform. But it's still primarily a **tracking tool**. This spec transforms FitAI into a **lifestyle platform** by applying proven mechanics from Airbnb, Tinder/Bumble, TikTok/Instagram/Snapchat, Notino, Louis Vuitton/Hermès, and luxury automotive.

The goal: make FitAI the place where fitness people **live**, not just log.

---

## Category 1: Airbnb Experiences + Trainer Marketplace

### Problem
Users train alone. No way to discover real-world fitness events or book verified trainers.

### Features

**A) FitAI Experiences** (`/experiences`, `/experiences/[id]`)
- Trainers/users create bookable real-world fitness events
- Fields: title, description, location (lat/lng + address), date/time, duration, capacity, price (XP or Kč), difficulty, category, photos (S3), cancellation policy (FLEXIBLE/MODERATE/STRICT)
- Categories: Skupinové tréninky, Outdoor eventy, Wellness & Recovery, Bojové sporty, Adventure Fitness, Nutrition workshopy
- Booking flow: browse → reserve → confirm → QR check-in → post-event rating
- "Instant book" vs "Request to book" (trainer approves)
- Search: by location, date, category, price range, difficulty, trainer rating

**B) Trainer Profiles** (`/trainers`, `/trainers/[id]`)
- TrainerProfile: certifications[], specializations[], videoIntroUrl, availabilityCalendar
- Supertrainer badge: auto-granted at 50+ verified reviews with avg 4.5+
- Stats: response rate, response time, total sessions hosted, repeat client %
- "Book 1:1 Session" and "Send Message" CTAs
- Admin verification flow

**C) Trust System**
- Reviews only from verified attendees (booking status = COMPLETED)
- Mutual host/guest rating after event
- Cancellation tracking (high cancel rate = warning badge)

### New Models
```
Experience (id, trainerId, title, description, locationLat, locationLng,
  locationAddress, dateTime, durationMinutes, capacity, currentBookings,
  priceXP, priceKc, difficulty, category: ExperienceCategory,
  cancellationPolicy: CancellationPolicy, photos: String[], isActive)

Booking (id, userId, experienceId, status: BookingStatus, bookedAt,
  cancelledAt, checkedInAt, rating, reviewText)

TrainerProfile (id, userId 1:1, bio, certifications: String[],
  specializations: String[], videoIntroUrl?, supertrainer: Boolean,
  responseRate: Float, avgResponseMinutes: Int, totalSessions: Int,
  isVerified: Boolean)

TrainerReview (id, trainerId, userId, bookingId, rating: Int 1-5,
  text, createdAt)
```

### Enums
```
ExperienceCategory: GROUP | OUTDOOR | WELLNESS | COMBAT | ADVENTURE | NUTRITION
CancellationPolicy: FLEXIBLE | MODERATE | STRICT
BookingStatus: PENDING | CONFIRMED | CANCELLED | COMPLETED | NO_SHOW
```

### API Endpoints
- `GET /experiences` — list/search with filters
- `GET /experiences/:id` — detail
- `POST /experiences` — create (trainer only)
- `POST /experiences/:id/book` — reserve
- `POST /bookings/:id/cancel` — cancel
- `POST /bookings/:id/checkin` — QR check-in
- `POST /bookings/:id/review` — rate after completion
- `GET /trainers` — list
- `GET /trainers/:id` — profile detail
- `POST /trainers/apply` — become trainer
- `PATCH /trainers/profile` — update profile

### Pages
- `/experiences` — browse/search grid with map view
- `/experiences/[id]` — detail with booking widget
- `/trainers` — trainer directory
- `/trainers/[id]` — trainer profile with availability calendar

---

## Category 2: 1v1 Duels + Compatibility Matching + Squads

### Problem
Competition is currently only via leagues (weekly XP). No head-to-head or team play.

### Features

**A) 1v1 Duels** (`/duels`, `/duels/[id]`)
- Challenge any user to a 1v1 duel
- Types: MAX_REPS (total reps in timeframe), HEAVIEST_LIFT, LONGEST_HOLD, FASTEST_DISTANCE
- Duration: 1h, 6h, 24h, 48h, 7d
- XP betting: both players wager XP, winner takes double
- Real-time scoreboard with live updates
- "Rematch" and "Double or nothing" after conclusion
- Push notification on score update

**B) Compatibility Matching** (extends `/gym-buddy`)
- Computed compatibility score (not stored): gym overlap (30%), schedule overlap (25%), fitness level proximity (20%), goal match (15%), workout split match (10%)
- Show % breakdown on buddy cards
- "Challenge to duel" button directly from match cards
- Super Like: 1/day, premium feature candidate

**C) Squads** (`/squads`)
- Create squad (3-5 members), invite by username
- Squad name, avatar, motto
- Squad leaderboard (sum of member XP this week)
- Squad challenges (team-based goals)
- Squad chat (reuse existing message infrastructure)
- Shared workout calendar

### New Models
```
Duel (id, challengerId, challengedId, type: DuelType, metric: String,
  duration: DuelDuration, xpBet: Int, status: DuelStatus,
  challengerScore: Float, challengedScore: Float,
  winnerId?, startedAt, endsAt, createdAt)

Squad (id, name, avatarUrl?, motto?, createdAt)

SquadMembership (id, squadId, userId, role: LEADER | MEMBER,
  joinedAt)

PersonStreak (id, userAId, userBId, currentStreak: Int,
  longestStreak: Int, lastBothActiveDate: DateTime)
```

### Enums
```
DuelType: MAX_REPS | HEAVIEST_LIFT | LONGEST_HOLD | FASTEST_DISTANCE
DuelDuration: HOUR_1 | HOUR_6 | HOUR_24 | HOUR_48 | WEEK
DuelStatus: PENDING | ACTIVE | COMPLETED | DECLINED | EXPIRED
```

### API Endpoints
- `POST /duels/challenge` — create duel
- `POST /duels/:id/accept` — accept challenge
- `POST /duels/:id/decline` — decline
- `POST /duels/:id/score` — submit score update
- `GET /duels/active` — my active duels
- `GET /duels/history` — past duels
- `POST /squads` — create squad
- `POST /squads/:id/invite` — invite member
- `GET /squads/:id` — squad detail + leaderboard
- `GET /squads/leaderboard` — global squad ranking
- `GET /buddy/compatibility/:userId` — get compatibility breakdown

### Pages
- `/duels` — active duels + challenge history
- `/duels/[id]` — live duel scoreboard
- `/squads` — my squad + global leaderboard
- Enhanced `/gym-buddy` with compatibility %

---

## Category 3: TikTok Content Platform

### Problem
No user-generated content. FitAI is a tool, not a community content platform.

### Features

**A) FitAI Clips** (`/clips`)
- Upload 15-60s exercise clips
- Auto-overlays: rep counter, form score %, muscle groups (from exercise metadata)
- Tags: exercise, muscle group, gym, equipment
- TikTok-style fullscreen vertical feed
- Like, comment, share
- "Duel" button (challenge the poster to beat their form score)
- "Ghost mode" — overlay poster's form on your camera as a guide

**B) Algorithmic Feed** (`/feed`)
- Replaces chronological community feed
- Weighted: 40% following, 30% trending (engagement score), 20% educational (clips tagged as tutorial), 10% discovery (new users, low-follower accounts)
- "Not interested" feedback loop
- Redis-cached per user (1h TTL)

**C) Duet / Split-Screen**
- Side-by-side comparison: your clip vs pro clip
- AI analysis: "Your elbows flare 15° more than ideal"
- Before/after comparison (month 1 vs month 6 of same exercise)
- Community "Best Form" voting

**D) People Streaks** (Snapchat-style)
- Both users must complete a workout on the same day
- Streak counter increments daily
- Milestone rewards at 7, 30, 100, 365 days
- "Streak is about to break!" push notification
- Streak leaderboard among friends

**E) AR Workout Stories** (enhanced existing stories)
- Auto-overlay: calories, duration, exercises, form score
- Poll stickers ("Bench nebo Squat day?")
- Music stickers (what I listened to)
- Reaction animations (animated fire, muscle flex)

### New Models
```
Clip (id, userId, s3Key, thumbnailS3Key, durationSeconds: Int,
  exerciseId?, tags: String[], caption, overlayConfig: Json?,
  viewCount: Int, likeCount: Int, commentCount: Int, createdAt)

ClipLike (id, clipId, userId, createdAt) @@unique([clipId, userId])

ClipComment (id, clipId, userId, text, createdAt)

DuetComparison (id, clipAId, clipBId, userId, aiAnalysis: Json?,
  createdAt)

PlaylistLink (id, userId, exerciseId?, workoutType?,
  spotifyUrl?, appleMusicUrl?, title, bpm: Int?, createdAt)
```

### Infrastructure
- S3 bucket: `fitai-clips-production`
- CloudFront behavior: `/clips/*` → 1d TTL
- Upload: presigned URL pattern (same as progress photos)
- Short clips (<60s) served as MP4 directly (no HLS needed)

### API Endpoints
- `POST /clips/upload-url` — presigned S3 URL
- `GET /clips/feed` — algorithmic feed
- `GET /clips/:id` — clip detail
- `POST /clips/:id/like` — toggle like
- `POST /clips/:id/comment` — add comment
- `POST /clips/duet` — create side-by-side comparison
- `GET /streaks` — my people streaks
- `POST /playlists` — share playlist link

### Pages
- `/clips` — fullscreen vertical feed (TikTok layout)
- `/feed` — enhanced algorithmic feed (replaces chronological)
- Enhanced exercise detail with community clips + playlists

---

## Category 4: Notino Personalization & Bundles

### Problem
No way to build a complete daily routine. No trial system. No wishlisting.

### Features

**A) Routine Builder** (`/routine-builder`)
- Visual timeline: Morning → Pre-workout → Workout → Post-workout → Evening → Night
- Stack items: supplement, workout plan, meal, recovery activity
- AI recommendation: "For your Hypertrophy goal + your training load, add creatine 5g morning and whey 30g post-workout"
- Shareable routine cards
- Community routine templates

**B) "People with your goal also..."** (enhanced recommendations)
- Collaborative filtering on existing data
- "87% of Hypertrophy users use PPL split"
- "Bestseller" and "Trending" badges on marketplace
- "New arrival" tag on fresh trainer content

**C) Bundles** (`/bundles`)
- Curated packages: Workout Plan + Meal Plan + Challenge + Coaching tips
- "Starter Pack" for beginners, "Advanced Pack" for experienced
- Created by trainers or AI-curated
- Gift bundles (send to friend)
- XP pricing

**D) Wishlist** (cross-platform)
- Bookmark any item: exercise, plan, recipe, experience, bundle
- "Chci zkusit" list on profile
- Reminder: "That exercise you saved — try it today?"
- Social proof: "247 people saved this"

**E) 7-Day Trial** (for plans)
- Try any marketplace plan for 7 days free
- After trial: buy, dismiss, or rate
- Trainer sees trial-to-purchase conversion rate
- Max 2 active trials at once

### New Models
```
Routine (id, userId, name, isPublic: Boolean, createdAt)

RoutineItem (id, routineId, type: RoutineItemType, timing: RoutineTime,
  referenceId: String, referenceName: String, notes?, sortOrder: Int)

Bundle (id, creatorId, name, description, items: Json[],
  priceXP: Int, isPublic: Boolean, giftable: Boolean, createdAt)

Wishlist (id, userId, itemType: WishlistItemType, itemId: String,
  addedAt) @@unique([userId, itemType, itemId])

PlanTrial (id, userId, planId, startDate, endDate,
  status: TrialStatus, convertedToPurchase: Boolean)
```

### Enums
```
RoutineItemType: SUPPLEMENT | WORKOUT | MEAL | RECOVERY | CUSTOM
RoutineTime: MORNING | PRE_WORKOUT | DURING | POST_WORKOUT | EVENING | NIGHT
WishlistItemType: EXERCISE | PLAN | RECIPE | EXPERIENCE | BUNDLE | CLIP
TrialStatus: ACTIVE | COMPLETED | CONVERTED | DISMISSED
```

### API Endpoints
- `POST /routines` — create routine
- `GET /routines/mine` — my routines
- `POST /routines/:id/items` — add item to routine
- `GET /bundles` — browse bundles
- `POST /bundles` — create bundle (trainer)
- `POST /bundles/:id/purchase` — buy with XP
- `POST /bundles/:id/gift` — send as gift
- `POST /wishlist` — add item
- `DELETE /wishlist/:id` — remove
- `GET /wishlist` — my wishlist
- `POST /plans/:id/trial` — start 7-day trial

### Pages
- `/routine-builder` — visual timeline editor
- `/bundles` — browse/search bundles
- `/wishlist` — saved items

---

## Category 5: Luxury Exclusivity & Prestige

### Problem
No scarcity, no status differentiation beyond leagues. Everything available to everyone.

### Features

**A) Limited Edition Drops** (`/drops`)
- Time-limited exclusive content: workout plans, challenges, boss fights, badges
- Numbered editions: "Plan #47/100"
- Countdown timer to drop release
- "Sold out" states, waitlist for next drop
- Exclusive reward: unique badge, title, or profile frame
- Monthly drop schedule (creates anticipation)

**B) VIP Tier** (`/vip`)
- Auto-invitation for top 1% performers (XP + streak + form score composite)
- VIP-only: challenges, boss fights, drops, experiences, trainer priority booking
- Golden profile frame
- Early access to new features
- VIP lounge (private chat channel)
- Invitation can be earned or received from existing VIP

**C) Personal Brand Identity** (extends profile)
- Earned title system: "The Iron Will" (200+ day streak), "Form Master" (avg form 95%+), "Nutrition Guru" (100+ food logs)
- Custom profile color theme (earned through achievements)
- Collectible badges from limited drops (displayed on profile)
- Digital monogram / avatar customization

**D) Craftmanship Stories** (extends exercise detail)
- Each exercise gets a rich narrative: origin, biomechanics, history, who popularized it
- Visual scroll-based storytelling (Apple product page style)
- Expert quotes, scientific studies referenced
- "Did you know?" facts
- AI-generated, reviewed for accuracy

**E) Luxury Unlock Animations**
- Achievement unlocks: slow reveal with particles and glow
- League tier promotion: cinematic animation
- Boss fight victory: epic celebration sequence
- Season completion: grand finale
- Drop acquisition: "unboxing" experience

### New Models
```
Drop (id, name, description, totalEditions: Int, remainingEditions: Int,
  releaseDate: DateTime, endDate: DateTime, priceXP: Int,
  exclusiveRewardType: String, exclusiveRewardData: Json,
  category: DropCategory, isActive: Boolean, createdAt)

DropPurchase (id, dropId, userId, editionNumber: Int, purchasedAt)
  @@unique([dropId, userId])

VIPMembership (id, userId 1:1, tier: VIPTier, invitedAt,
  invitedById?, privileges: String[])

UserTitle (id, userId, title: String, earnedCondition: String,
  isActive: Boolean, earnedAt) — user can have multiple, one active

UserBrand (id, userId 1:1, colorTheme: String?, avatarConfig: Json?,
  monogram: String?)

CraftmanshipStory (id, exerciseId 1:1, origin: String, biomechanics: String,
  history: String, expertQuotes: Json[], funFacts: String[],
  scientificReferences: String[], createdAt)
```

### Enums
```
DropCategory: WORKOUT_PLAN | CHALLENGE | BOSS_FIGHT | BADGE | EXPERIENCE
VIPTier: GOLD | PLATINUM | DIAMOND
```

### API Endpoints
- `GET /drops` — upcoming and active drops
- `GET /drops/:id` — drop detail
- `POST /drops/:id/purchase` — secure edition
- `GET /drops/:id/waitlist` — join waitlist
- `GET /vip/status` — my VIP status
- `POST /vip/accept` — accept invitation
- `GET /vip/lounge` — VIP-only content
- `GET /users/:id/titles` — user's earned titles
- `PATCH /users/brand` — update brand identity
- `GET /exercises/:id/story` — craftmanship story

### Pages
- `/drops` — upcoming drops with countdown timers
- `/drops/[id]` — drop detail with edition counter
- `/vip` — VIP dashboard (status, privileges, lounge)
- Enhanced `/profile` with titles, badges, brand
- Enhanced exercise detail with craftmanship story tab

---

## Category 6: Performance Telemetry (Luxury Auto HUD)

### Problem
Workout data displayed as plain numbers. No "performance dashboard" experience.

### Features

**A) Performance HUD** (overlay in gym session)
- Real-time gauges: heart rate (tachometer), form score (temp gauge), volume (fuel gauge)
- Animated gauge needles
- Only visible when wearable connected or pose detection active
- Minimal mode for non-wearable users (form score + reps only)

**B) Workout Modes**
- CRUISE: recovery focus, longer rest, gentle AI coaching, RPE target 5-6
- SPORT: balanced, standard rest, standard coaching, RPE target 7-8
- TRACK: max performance, shorter rest, aggressive coaching tone, RPE target 8-10
- Mode affects: rest timer defaults, AI coaching personality, target RPE, music BPM suggestion
- Selectable at session start, changeable mid-session

**C) Personal Records as Lap Times** (`/records`)
- Every PR displayed in F1 timing format
- "Sector times": eccentric / hold / concentric split
- Delta: +/- vs previous attempt (green/red)
- "Season best" vs "All-time best"
- PR board: filterable by exercise, body part, time period
- Live delta during active set ("you're 0.3s faster on eccentric!")

**D) Body Maintenance Schedule** (`/maintenance`)
- "Service book" for body — inspired by car maintenance schedule
- Per-muscle-group: sessions since last deload, recommended next recovery
- Warnings: "Shoulders overdue for recovery" (auto-computed from WeeklyVolume)
- Mileage: total lifetime volume in kg = "kilometers driven"
- Scheduled maintenance: deload weeks, stretching sessions, bloodwork reminders
- Service history timeline
- AI: "Based on your 14 consecutive shoulder sessions, I recommend a deload"

**E) Test Drive** (extends marketplace)
- Preview any marketplace plan in "simulation mode"
- Shows: what your week would look like, predicted exercises, estimated time per session
- 3-day trial option
- "Performance prediction": AI estimates your progress after 6 weeks on this plan

### New Models
```
SectorTime (id, exerciseSetId, eccentricMs: Int, holdMs: Int,
  concentricMs: Int, totalMs: Int)

MaintenanceSchedule (id, userId, muscleGroup: String,
  sessionsSinceDeload: Int, lastDeloadDate?, nextRecommendedDate?,
  status: MaintenanceStatus)

MaintenanceAlert (id, userId, muscleGroup: String,
  severity: AlertSeverity, message: String, isDismissed: Boolean,
  createdAt)
```

### Enums
```
WorkoutMode: CRUISE | SPORT | TRACK (added to GymSession model)
MaintenanceStatus: FRESH | DUE | OVERDUE
AlertSeverity: INFO | WARNING | CRITICAL
```

### Extends Existing
- `GymSession`: add `workoutMode: WorkoutMode` field
- `ExerciseSet`: relation to `SectorTime`
- `ExerciseHistory`: add `bestDelta`, `seasonBest` fields

### API Endpoints
- `GET /maintenance` — current maintenance status per muscle group
- `GET /maintenance/alerts` — active alerts
- `POST /maintenance/:muscleGroup/deload` — mark deload completed
- `GET /records` — PR board with filters
- `GET /records/:exerciseId/sectors` — sector time history

### Pages
- HUD overlay: integrated into `/gym/[sessionId]` (not separate page)
- `/records` — F1-style personal records board
- `/maintenance` — body service book

---

## Category 7: Real Gym Life

### Problem
Apps ignore what gym-goers actually deal with day-to-day.

### Features

**A) Supplement Tracker** (`/supplements`)
- My stack: name, dosage, timing (morning/pre-WO/post-WO/evening), category
- Daily checklist: mark each supplement as taken
- Reminders: push notification at supplement timing
- AI recommendations based on goal + training load
- Interaction notes: "Creatine + caffeine: OK, but space 30min apart"
- Monthly cost tracking
- Community reviews of supplements

**B) Playlist Sharing** (integrated into exercises + community)
- Link Spotify/Apple Music playlists per exercise or workout type
- Community top playlists by workout category
- BPM matching: recommend tracks at 120-140 BPM for lifting
- "What are you listening to?" on workout stories

**C) Gear & Outfit Tracker** (`/gear`)
- Log gear: shoes, belts, gloves, wraps, clothing
- Fields: brand, model, purchase date, price, photo
- Wear tracking: session count since purchase
- "Time for new shoes" alerts (after N sessions)
- Community gear reviews and ratings
- "What I wore" optional tag on workout log

**D) Coaching Memory** (`/coaching-notes`)
- AI persists every coaching insight it gives
- Searchable: "what did coach say about my bench form?"
- Timeline view: see coaching progression over weeks/months
- Improvement tracking: "3 months ago: elbows flare 15°. Now: 3°. Improvement: 80%"
- Export for real trainer: PDF of AI coaching notes

**E) Gym Etiquette Guide** (in education section)
- Interactive guides: "How to ask for a spot", "Equipment sharing rules"
- Newbie orientation mode (first 2 weeks of using app)
- Quick tips in workout session: contextual etiquette hints
- Community-contributed tips

### New Models
```
Supplement (id, name, brand?, category: SupplementCategory,
  defaultDosage: String, description?)

UserSupplement (id, userId, supplementId, dosage: String,
  timing: SupplementTiming, monthlyCostKc: Float?, isActive: Boolean)

SupplementLog (id, userSupplementId, date: DateTime, taken: Boolean)

GearItem (id, userId, category: GearCategory, brand: String,
  model: String, purchaseDate?, priceKc: Float?, photoS3Key?,
  sessionCount: Int, maxSessions: Int?, isActive: Boolean)

GearReview (id, gearItemId, userId, rating: Int 1-5, text, createdAt)

CoachingMemory (id, userId, exerciseId?, date: DateTime,
  insight: String, category: CoachingCategory,
  metricBefore: Float?, metricAfter: Float?,
  improvementPct: Float?)
```

### Enums
```
SupplementCategory: PROTEIN | CREATINE | PRE_WORKOUT | VITAMIN | AMINO | OTHER
SupplementTiming: MORNING | PRE_WORKOUT | DURING | POST_WORKOUT | EVENING | WITH_MEAL
GearCategory: SHOES | BELT | GLOVES | WRAPS | CLOTHING | EQUIPMENT | OTHER
CoachingCategory: FORM | TECHNIQUE | RECOVERY | NUTRITION | MINDSET
```

### API Endpoints
- `GET /supplements/stack` — my active stack
- `POST /supplements/stack` — add to stack
- `POST /supplements/log` — mark as taken today
- `GET /supplements/recommendations` — AI suggestions
- `GET /gear` — my gear list
- `POST /gear` — add gear item
- `POST /gear/:id/review` — review
- `GET /coaching-memory` — searchable coaching history
- `GET /coaching-memory/progress/:exerciseId` — improvement timeline

### Pages
- `/supplements` — stack management + daily checklist
- `/gear` — gear inventory + reviews
- `/coaching-notes` — searchable coaching history with improvement graphs

---

## Architecture Decisions

### Schema
- Keep single `schema.prisma` with section comments per category
- ~31 new models → schema grows to ~1800 lines (manageable)
- Profile-type models (TrainerProfile, VIPMembership, UserBrand) as 1:1 on User
- Avoid adding scalar fields to User model directly

### Module Structure
- 13 new NestJS modules (flat, following existing convention)
- 7 extensions of existing modules
- No filesystem restructuring (preserve flat `src/` convention)

### api.ts Split
- Before Phase 2: split `api.ts` (1753L) into domain files
- `lib/api/clips.ts`, `lib/api/duels.ts`, etc.
- Barrel export from `lib/api/index.ts`

### Feed Algorithm
- Redis-cached per user (1h TTL)
- Computed on request for <10K users
- Migrate to cron pre-computation only if needed

### Video Clips Infrastructure
- New S3 bucket: `fitai-clips-production`
- Presigned URL upload (reuse progress-photos pattern)
- MP4 direct serve for <60s clips (no HLS)
- CloudFront behavior: `/clips/*` → 1d TTL

### Payment Decision (Phase 4 prerequisite)
- Options: XP-only / Stripe / Hybrid
- Decision needed before implementing Experiences bookings and Bundles
- If Stripe: Stripe Connect for trainer payouts

---

## Implementation Phases

### Phase 1: Performance Core (Week 1-3)
*5 new models, extends 4 existing modules*

| Feature | Module | Models |
|---|---|---|
| Workout Modes + SectorTime | extend gym-sessions | SectorTime, GymSession enum |
| PR Enhancement | extend progress | PersonalRecord delta fields |
| Coaching Memory | extend coaching | CoachingMemory |
| Body Maintenance | extend rehab | MaintenanceSchedule, MaintenanceAlert |

Pages: HUD overlay, `/records`, `/maintenance`

### Phase 2: Social Expansion (Week 4-7)
*7 new models, 5 new modules*

| Feature | Module | Models |
|---|---|---|
| 1v1 Duels | new: duels | Duel |
| Squads | new: squads | Squad, SquadMembership |
| Person Streaks | extend buddy | PersonStreak |
| Compatibility Score | extend buddy | (computed, no model) |
| Supplements | new: supplements | Supplement, UserSupplement, SupplementLog |
| Gear | new: gear | GearItem, GearReview |

Pages: `/duels`, `/duels/[id]`, `/squads`, `/supplements`, `/gear`

### Phase 3: Content & UGC (Week 8-11)
*6 new models, 2 new modules, S3 clips infrastructure*

| Feature | Module | Models |
|---|---|---|
| Clips | new: clips | Clip, ClipLike, ClipComment |
| Feed Algorithm | new: feed-algorithm | (service-only) |
| Duets | extend clips | DuetComparison |
| Playlists | extend exercises | PlaylistLink |
| Craftmanship Stories | extend exercises | CraftmanshipStory |

Pages: `/clips`, enhanced `/feed`, exercise detail tabs
Infra: S3 clips bucket, CloudFront behavior

### Phase 4: Marketplace & Monetization (Week 12-15)
*8 new models, 4 new modules*

| Feature | Module | Models |
|---|---|---|
| Trainer Profiles | new: trainers | TrainerProfile, TrainerReview |
| Experiences | new: experiences | Experience |
| Bookings | new: bookings | Booking |
| Routine Builder | new: routine-builder | Routine, RoutineItem |
| Bundles | new: bundles | Bundle |
| Wishlist | extend social | Wishlist |
| Plan Trial | extend workout-plans | PlanTrial |

Pages: `/experiences`, `/trainers`, `/routine-builder`, `/bundles`, `/wishlist`
Decision: Payment gateway (Stripe vs XP-only)

### Phase 5: Exclusivity & Brand (Week 16-19)
*5 new models, 2 new modules*

| Feature | Module | Models |
|---|---|---|
| Limited Drops | new: drops | Drop, DropPurchase |
| VIP Tier | new: vip | VIPMembership |
| User Titles | extend users | UserTitle |
| User Brand | extend users | UserBrand |
| Craftmanship (AI content generation) | extend exercises | (batch job) |
| Luxury Animations | frontend-only | — |

Pages: `/drops`, `/drops/[id]`, `/vip`, enhanced `/profile`

---

## Verification

After each phase:
1. `npx prisma db push --accept-data-loss` — schema validates
2. All new endpoints return correct responses (manual curl/Postman)
3. New web pages render correctly in browser
4. `bash test-production.sh` — existing smoke tests still pass
5. `git diff --stat` — only expected files changed
6. Security audit: auth guards, input validation (DTOs), rate limiting on AI/expensive endpoints

End-to-end for key flows:
- Create experience → book → check-in → review → see on trainer profile
- Challenge to duel → accept → submit scores → winner gets XP
- Upload clip → appears in feed → like/comment → duet comparison
- Build routine → add supplements + workout + meal → share
- Drop countdown → purchase edition → receive exclusive badge
- Gym session with Track mode → sector times recorded → PR with delta on records page
- Add supplement to stack → daily reminder → mark as taken

---

## Total Scope Summary

| Metric | Count |
|---|---|
| New Prisma models | ~31 |
| New NestJS modules | 13 |
| Extended modules | 7 |
| New web pages | ~20 |
| New API endpoints | ~60 |
| New enums | ~15 |
| Estimated duration | 19 weeks (5 phases) |
