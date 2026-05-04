# FitAI Changelog

Lidsky čitelná historie změn. Aktualizovat při každém deployi.

> **Archive (čti přímo, NEJSOU auto-load):**
> - `CHANGELOG-archive/2026-04-voice-coaching-and-streaming.md` (2026-04-11 to 2026-04-19)
> - `CHANGELOG-archive/2026-04-foundation-and-infra.md` (2026-04-07 to 2026-04-09)

---

## [Wave 1 backend — pgvector + RAG + HealthKit-aware Daily Brief] 2026-05-04

Tech-uplift "Wave 1" první polovina. Backend je kompletní + lokálně ověřený, mobile native moduly (HealthKit/Health Connect) zbývají na separate session s EAS build.

### pgvector infrastructure
- Local docker-compose postgres image swap: `postgres:16` → `pgvector/pgvector:pg16` (volume `fitai_pgdata` zachován)
- `CREATE EXTENSION vector` (pgvector 0.8.2) + collation refresh + reindex
- Prisma schema: `embedding Unsupported("vector(1536)")?` přidáno na `Exercise`, `Recipe`, `WorkoutSession`
- HNSW indexy s `vector_cosine_ops` + `WHERE embedding IS NOT NULL` partial filter
- Pro produkci: `CREATE EXTENSION vector` na RDS Postgres 16 (out-of-the-box, žádný downtime), pak `prisma db push` přes ECS migrate task

### EmbeddingsService (shared, @Global module)
- `apps/api/src/embeddings/{embeddings.module,embeddings.service}.ts` — lazy OpenAI client, `text-embedding-3-small` (1536 dim)
- API: `embed(text)`, `embedBatch(texts)`, `toVectorString(vector)` — používáno semantic search + RAG + cron

### Embedding seed script
- `apps/api/prisma/seed-embeddings.ts` — embeduje `Exercise.descriptionCs/nameCs/muscleGroups/equipment` a `Recipe.name/ingredients/tags`
- `npm run seed:embeddings` (vyžaduje `OPENAI_API_KEY` env var, ~$0.05 jednorázový náklad pro 60 cviků)
- Idempotentní — skip rows where `embedding IS NOT NULL`

### Semantic exercise search
- `POST /api/exercises/search/semantic` — natural-language query → top-K cosine similarity match
- DTO validace (`query` 2-200 znaků, `limit` 1-20)
- `@Throttle(30/min)`, `@UseGuards(JwtAuthGuard)`, Redis cache 1h per query hash (content-only key)
- Vrací `{ id, name, nameCs, descriptionCs, category, equipment, muscleGroups, relevance }` (relevance 0-1 z `1 - cosine_distance`)

### RAG history query
- `POST /api/ai-insights/history-query` — uživatel pokládá natural-language otázku ("co mi šlo loni v dubnu?"), backend retrieves top-10 nejrelevantnějších `WorkoutSessions` přes pgvector, posílá kontext do Claude Haiku
- Nový `HistoryQueryService` (`apps/api/src/ai-insights/history-query.service.ts`) s:
  - `query(userId, query)` — cached 24h per user+query
  - `reembedRecentSessions()` `@Cron('0 3 * * 0')` — každou neděli 3:00 UTC, batch 100 sessions, 50 per OpenAI batch
- DTO `query` 3-300 znaků, `@Throttle(10/hour)`
- Fallback summary když Claude API nedostupné

### Daily Brief — wearable-aware recovery score
- Nový helper `calcRecoveryScoreSmart(checkIns, wearables)` v `ai-insights.helpers.ts` — preferuje HRV / objective sleep / resting HR z `WearableData` přes `DailyCheckIn` self-report
- `getDailyBrief()` načítá 7d `WearableData` (`hrv`, `sleep`, `resting_hr`) paralelně s checkIns
- Claude prompt obsahuje `zdroj: wearables/self-reported` + konkrétní HealthKit hodnoty když jsou dostupné
- Fallback na původní `calcRecoveryScore` když user nemá wearables data — žádný breaking change pro existing users

### Wearables sync DTO rozšíření
- `apps/api/src/wearables/dto/sync-wearables.dto.ts` — přidány providery `google_fit` + `health_connect` pro Android Health Connect; `sessionId` jako optional UUID
- Existing `POST /api/wearables/sync` endpoint je drop-in pro mobile native moduly (žádný nový endpoint není třeba)

### Verifikace
- TypeScript clean (`npm run lint` 0 errors)
- API build úspěšný (`npm run build`)
- Local boot: `EmbeddingsModule dependencies initialized` + obě nové routes mapped (`Mapped {/api/exercises/search/semantic, POST}`, `Mapped {/api/ai-insights/history-query, POST}`)

### Stats
- 8 nových souborů: `embeddings/{service,module}.ts`, `seed-embeddings.ts`, `history-query.service.ts`, 2 DTO, package.json script, schema vector fields
- 4 modifikované: `app.module.ts`, `exercises/{controller,service}.ts`, `ai-insights/{controller,module,service,helpers}.ts`, `wearables/dto/sync-wearables.dto.ts`, `docker-compose.yml`
- 0 breaking changes (existing users + endpoints fungují beze změny)

### Mobile Wave 1 (HealthKit + Health Connect) ✅
- Packages: `@kingstinct/react-native-healthkit` (TurboModule-ready, kompatibilní s `newArchEnabled: true`) + `react-native-health-connect` (Mateus Ribeiro, Expo plugin)
- `app.json` rozšíření:
  - iOS Info.plist: `NSHealthShareUsageDescription` + `NSHealthUpdateUsageDescription`
  - iOS entitlement `com.apple.developer.healthkit`
  - Android permissions: `READ_HEART_RATE`, `READ_SLEEP`, `READ_STEPS`, `READ_HEART_RATE_VARIABILITY`, `READ_RESTING_HEART_RATE`
  - Plugins: `@kingstinct/react-native-healthkit` (s usage descriptions) + `react-native-health-connect`
- `apps/mobile/src/lib/health-sync.ts` — cross-platform wrapper: `requestHealthPermissions()`, `syncRecent7Days()` (mapuje HealthKit / Health Connect záznamy na backend `WearableData` shape, lazy-require pattern dle mobile.md)
- `apps/mobile/src/lib/api.ts` — přidány `syncWearables()` + `getRecoveryScore()` (typed `WearableEntry` interface)
- Nový screen `HealthSyncScreen.tsx` — onboarding s vysvětlením, connect button, status display, re-sync; haptic feedback (tap/success/warning/error), error state s retry
- Wired v `AppNavigator.tsx` (Stack.Screen `HealthSync`) + `ProfileScreen.tsx` SECONDARY menu

### Co zbývá z Wave 1 (user-driven)
- `cd apps/mobile && npx expo prebuild --clean && cd ios && pod install` (lokální native sync)
- `eas build --profile development --platform ios` + Android (~15 min každá)
- Device test: open `Profile → Health Sync → Připojit Apple Health/Health Connect`, verify permission prompt + initial sync
- Production deploy: `CREATE EXTENSION vector` na RDS, `prisma db push` přes ECS migrate task, embedding seed přes ECS task s `OPENAI_API_KEY` ze Secrets Manager
- Smoke test prod (`bash test-production.sh` → 115/115)

---

## [Mobile iOS native pass — 47 screens + foundation + creator-dashboard fix] 2026-05-03

### Foundation (Phase 0)
- Installed `@gorhom/bottom-sheet`, `expo-blur`, `react-native-gesture-handler`, `expo-linear-gradient`
- App.tsx: wrapped GestureHandlerRootView + SafeAreaProvider + BottomSheetModalProvider
- AppNavigator: native iOS slide_from_right transitions, fullScreenGestureEnabled, dynamic tab bar height via useSafeAreaInsets
- 10 new native primitives in `apps/mobile/src/components/native/`: useHaptic, usePullToRefresh, LoadingState, EmptyState, ErrorState, NativeBlurOverlay, showActionSheet helper, NativeBottomSheet, NativeConfirm, NativeListItem

### Wave 1 — Tier A (9 screens)
AIChatScreen, CalendarScreen, CameraWorkoutScreen, FormCheckScreen, JidelnicekScreen, JournalScreen, LeaguesScreen, ProgressPhotosScreen, VyzivaScreen

### Wave 2 — Tier B (16 screens)
AICoachScreen, BundlesScreen, ClipsScreen, CommunityScreen, DropsScreen, DuelsScreen, ExperiencesScreen, MaintenanceScreen, OnboardingScreen, PlanDetailScreen, ProfileScreen, RoutineBuilderScreen, SquadsScreen, StreaksScreen, SupplementsScreen, VIPScreen

### Wave 3 — Tier C polish (22 screens)
CoachingNotesScreen, DashboardScreen, DomaScreen, ExerciseDetailScreen, ExercisesScreen, GearScreen, HabityScreen, LekceScreen, LessonDetailScreen, LoginScreen, PlansScreen, PlaylistsScreen, ProgressScreen, RecordsScreen, RegisterScreen, SlovnikScreen, TrainersScreen, UspechyScreen, VideoDetailScreen, VideosScreen, WishlistScreen, CameraWorkoutProScreen (verified already-native, no changes needed)

### Anti-iOS patterns eliminated
- 38 instancí `Alert.alert` (non-error confirms) → `NativeConfirm` bottom sheet nebo inline error banner
- 6 `<Modal>` (RN built-in) → `NativeBottomSheet` (`@gorhom/bottom-sheet`)
- ~15 plain "Back" / "← LIST" text → native iOS chevron (‹) s 12pt hit slop
- 0 → semantic `useHaptic` napříč všemi screens (tap/press/heavy/selection/success/warning/error)
- 5 → 30+ screens používají `useSafeAreaInsets()` přes manual SafeAreaView
- 1 → 5+ screens mají RefreshControl pull-to-refresh
- V2Loading generic spinner → `LoadingState` s explicit label
- Plain "no items" texty → `EmptyState` s ikonou + body
- Custom inline retry UI → standardizovaný `ErrorState`
- Pre-existing TS errors v JournalScreen mood (number → string enum)

### Web fix — creator-dashboard
`apps/web/src/app/(app)/creator-dashboard/{page.tsx,ContentTools.tsx}` — opraveno 5 frontend↔backend shape mismatches: stats endpoint (subscriberCount→subscribers, monthlyXP→monthlyXPEarned, totalXP→totalXPEarned, postCount→posts, topPostTitle→topPost), subscriber-growth ({date,newSubs,churn}), earnings ({week,tips,subscriptions}), post-performance (caption→title, likeCount→likes), top-hashtags ({name,count} objekty místo "[object Object]"). Plus přidán "Creator status pending" empty state pro non-creator účty.

### Code + Security review fixes
- **P0** NativeConfirm double-call onCancel (resolvingRef guard)
- **M** VyzivaScreen S3 upload `upload.ok` check before analyzeFoodPhoto
- **L** PlaylistsScreen domain whitelist tightening (`endsWith('.' + d)` místo `endsWith(d)`)
- **L** NativeListItem dead `align` parameter removed

### Stats
- 41 commits, 35 atomic per-screen + foundation + creator-dashboard fix + review fixes
- Files changed: ~50 files, +3000 insertions, -1500 deletions
- TypeScript clean, all native deps audited (no CVEs)
- 4 review findings applied
- Mobile binary requires `eas build --profile development --platform ios` to ship to devices (web auto-deploys via GHA)

---

## [Mobile QA Audit — 43 screens, 120+ bugs fixed, security hardened] 2026-05-02

### Critical Fixes (app-breaking)
- **VIPScreen** — every user shown "You are VIP member" (truthy `{isVip:false}` object check)
- **CalendarScreen** — CRASH on any scheduled workout (flat array vs grouped `{date,workouts[]}` mismatch)
- **LeaguesScreen** — CRASH on `null.toLowerCase()` when user not in league
- **JournalScreen** — mood NEVER saved (frontend sent number 1-5, backend expected enum GREAT/GOOD/NEUTRAL/TIRED/BAD)
- **MaintenanceScreen** — deload button NEVER appeared (wrong enum values: `overloaded` vs `OVERDUE`)
- **ProgressScreen** — 2x crash on `insights.plateaus.length` without optional chaining

### Data Shape Mismatches Fixed (15+ screens)
- DuelsScreen: `challengerName` → `challenger.name`, `opponentScore` → `challengedScore`
- DropsScreen: `price` → `priceXP`, `remaining` → `remainingEditions`, `endsAt` → `endDate`
- ExperiencesScreen: `name` → `title`, `location` → `locationAddress`, `price` → `priceKc`
- GearScreen: `name` field doesn't exist (backend has `brand`+`model`), category icons UPPERCASE
- SupplementsScreen: `item.name` → `item.supplement.name`, timing colors lowercase→UPPERCASE
- RecordsScreen: `deltaKg` → `deltaWeight`, `achievedAt` → `date`
- VIPScreen: 4 nested field mismatches (`eligibility.stats.xpRank` not `eligibility.xpRank`)
- SquadsScreen: `totalXP` → `weeklyXP`

### Security Fixes
- **api.ts**: HTTP 204 No Content crash fix (DELETE endpoints), 401 race condition (parallel requests), query param encoding
- **auth-context**: Only logout on 401, not on network/500 errors (was logging out on transient issues)
- **PlaylistsScreen**: URL domain whitelist on Linking.openURL (open redirect prevention)
- **AIChatScreen**: Input length validation (backend max 1000 chars)
- **DuelsScreen**: Replaced iOS-only Alert.prompt with Alert.alert (Android crash fix)

### Functional Fixes
- ExercisesScreen: 3 missing muscle group filters (HAMSTRINGS, CALVES, FULL_BODY)
- VideosScreen: Client-side filtering → server-side `?category=X`, missing MOBILITY filter
- FormCheckScreen: Upload flow was completely non-functional (no file picker). Added expo-image-picker + S3 upload. Added history display + exercise search.
- ClipsScreen: Like action destroyed paginated data. Fixed with local state update + server response sync.
- StreaksScreen: Freeze button clickable at 0 remaining. Freeze status shape lost after use.
- CameraWorkoutProScreen: Stale phaseName closure, set summary wrong math, rest timer leak on unmount

### Loading/Error States Added (30+ screens)
- Every screen now has V2Loading spinner during fetch
- Error states with retry buttons on primary data loads
- Empty states distinguish "loading" from "no data"

### CZ→EN Translation (all 43 screens)
- All UI text, labels, buttons, alerts, empty states, section headers translated

### Code Review + Security Audit
- Code review agent: confirmed consistent patterns across all 47 screen files
- Security agent: confirmed JWT in expo-secure-store, no Alert.prompt, proper permissions
- Deprecated MediaTypeOptions replaced with SDK 54 string arrays

### Stats
- 41 commits, 44 files changed, 1549 insertions, 884 deletions
- 43 screens audited (each: read → API test → backend verify → fix → commit)
- 120+ bugs found and fixed
- 0 TypeScript errors introduced

---

## [Expert QA Audit — 60+ fixes across 96 pages, 17 domains] 2026-05-02

### Security Fixes
- **S3 upload-url endpoint** was missing AdminGuard — any authenticated user could upload to S3 bucket. Fixed
- **base.ts 401 handler** race condition — redirect and throw ran simultaneously, causing React state updates on unmounting component. Fixed with immediate throw
- **Pricing open redirect** — catch block was navigating to unvalidated URL on parse failure. Now blocks invalid URLs
- **Promo card ctaUrl** — external URLs now open in new tab with noopener,noreferrer

### Critical Functional Fixes
- **Exercise filter chips** were completely non-functional — FILTERS (Strength/Hypertrophy/Cardio) didn't match actual muscleGroups (CHEST/BACK/LEGS). Replaced with real muscle group categories + FILTER_GROUPS mapping
- **Onboarding goal IDs** ('move','strength','run') didn't match backend enum ('STRENGTH','HYPERTROPHY','ENDURANCE'). Every onboarding got 400 error. Added GOAL_MAP
- **Onboarding experience IDs** ('new','returning','experienced') didn't match comparison values. Every user got experienceMonths: 48. Added EXP_MAP
- **Bloodwork 4/8 test types** (hemoglobin, ferritin, vitD, tsh) didn't exist in backend whitelist. Aligned with backend VALID_TESTS
- **Boss-fights completeBoss** sent wrong DTO ({timeSeconds,score} vs backend {score,defeated}). Always 400 error
- **Habits toggle logic** broken for all field types — steps=5 meant 5 steps, sleep=5 meant 5 hours. Added per-field TOGGLE_VALUES with proper thresholds
- **Follow/unfollow** used same API call (POST) for both directions. Now correctly uses DELETE for unfollow
- **Public profile stats** used `profile.stats.X` but backend returns `profile.progress.X`. Added fallback chain
- **Form-check** initial state was 'analysis' showing hardcoded fake data. Changed to 'upload'
- **Marketplace category filter** passed object instead of string to API. URL was `/marketplace?[object Object]`

### Dead Features / Misleading UI Fixed
- 3 dead detail page links (marketplace/[id], experiences/[id], courses/[id]) → 404. Fixed or disabled
- FEATURED/PROGRAMS cards on marketplace were not clickable. Wrapped in Links
- AI chat context panel was 100% hardcoded (recovery 62, fake sleep data). Replaced with real API calls
- Body-report page 100% hardcoded data. Added PREVIEW banner
- Calendar "Add session" button had no onClick. Disabled with "coming soon"
- Live page Join buttons now disabled with "Coming soon" banner
- Progress page body photos were fake 6-week placeholder. Replaced with honest empty state
- Settings notification toggles were local state only. Wired to real API
- Duels "Challenge a friend" button disabled (needs modal — future feature)
- Bundles Gift button removed (not implemented)
- Clips empty state said "Upload first!" with no upload mechanism. Changed to "coming soon"

### UX Improvements
- 20+ pages got missing loading/error/empty states (videos, doma, exercises, glossary, FitnessScore, etc.)
- Auth: forgot-password + reset-password rewritten from V2 to v3 split-screen design
- Register: added password confirm field + password visibility toggle
- AI coach: save() debounced (was firing API call per keystroke), added error on generate
- Meal plan: preferences panel was unreachable (no toggle button). Fixed
- Nutrition: AI tips were fetched but never rendered. Now displayed above meals
- Supplements: add modal now has dosage + timing input fields (was sending empty strings)
- Experiences: booking now has confirm dialog + success/error feedback banner
- Bundles: purchase now has loading state + confirm (prevents double-click)
- Gear: form resets on modal close (was retaining stale data)
- Gym-finder: error banner now clears on retry
- Export print: added res.ok check (was downloading error HTML as file)
- Maintenance: deload/dismiss now have error handling
- Enterprise: email validation on invite (regex check, not just HTML type)
- Shadow-boxing: Expert filter now includes all difficulty tiers (was skipping intermediate)
- Records + multiple pages: fixed grids to responsive auto-fill

### Language & Design Consistency
- 50+ pages translated CZ→EN (all UI text, labels, buttons, error messages)
- 41+ missing v3- CSS class prefixes restored across 10 files (headings/captions had zero styling)
- v3 design system applied to forgot/reset password, sports hub, workout-mode
- Landing page: removed fake social proof (2.4M members), added features section, responsive nav

### Legal & Compliance
- Privacy policy: added account deletion section + data retention section (GDPR)
- Terms: added governing law (Czech Republic) + age restriction clause (16+, Apple review)
- AI disclaimer: fixed typo, confirmed "not medical advice" prominently displayed
- Admin MAU metric was actually newUsersMonth — relabeled to "New users (30d)"

### Code Quality
- base.ts: handles HTTP 204 empty body responses (was crashing on res.json())
- auth-context: distinguishes auth failures from network errors (was logging out on offline)
- Dashboard: gated API calls on auth state (was firing 6 calls before auth resolved)
- Removed dead code: weekly review fetch never rendered, journal milestones/summary unused
- Lesson detail: error state resets on slug change (was permanent)
- Glossary: loading state moved inside debounce (was flickering on every keystroke)
- Trainers: data shape fallback for nested user object (name, avatar, rating, reviewCount)

### Stats
- 45+ commits, 100+ files changed
- 96 pages audited across 17 domains (each domain 2 passes)
- 60+ bugs found and fixed (including 4 security, 15+ critical, 20+ important)
- 0 TypeScript errors introduced

---

## [Fitness Instagram Wave 2 — Creator Economy, Smart Notifications, Creator Dashboard] 2026-04-30

### Creator XP Economy
- XP-based subscriptions (100-5000 XP/month, 70/30 creator/platform split)
- Tip system (preset 50-1000 XP + custom 10-5000 + message)
- Subscriber-only posts (blur overlay for non-subscribers)
- Daily subscription renewal cron (03:00 UTC, auto-deactivate on insufficient XP)

### Smart Notifications v2
- 11 notification types: follower, like, comment, challenge, squad PR, buddy workout, tips, milestones
- Inline triggers in posts (like/comment) and social (follow) services
- Engagement-driven cron (every 2h): buddy workouts, post milestones
- Batching: 5+ same-type in 5 min → single notification
- Deduplication: same actor+target+type within 24h
- Notification page: social tabs, mark read, unread counter

### Creator Dashboard (/creator-dashboard)
- Stats hero: 6 metrics (subscribers, XP earned, posts, engagement rate, top post)
- Analytics: subscriber growth chart (30d), XP earnings (12 weeks), post performance table, top hashtags cloud
- Content tools: scheduled posts (create/edit/publish-now/cancel), pinned post, subscription price setter, bulk subscriber-only toggle
- Scheduled post publisher cron (every 1 min)

### Feed Integration
- Subscriber-only blur: non-subscribers see blurred posts with "Subscribe for X XP" CTA
- Pinned posts: shown first on creator profile
- Scheduled posts excluded from all feed queries

### Backend
- 3 new NestJS modules: creator-economy (7 endpoints), notify (global service), creator-dashboard (13 endpoints)
- 4 new smart-notifications endpoints
- 3 new Prisma models (CreatorSubscription, CreatorTip, SocialNotification), 1 new enum
- Post extended: isSubscriberOnly, isPinned, publishAt, isScheduled
- 3 cron jobs: subscription renewal, engagement check, scheduled publisher

### Frontend
- v3 SubscriberBlur + TipModal components
- PostCard: blur overlay + pinned badge
- /creator-dashboard page (stats + analytics + content tools)
- /notifications refactored with social tabs + mark read
- Mobile: creator economy API + subscriber blur overlay

---

## [Fitness Instagram Wave 1 — Posts, Feed, Hashtags, Badges, Promo] 2026-04-30

### Post System
- New Post model with photos (1-4), captions (2000 chars), auto-cards
- S3 presigned upload for post photos
- Like/unlike toggle, comments, delete own posts
- Hashtag auto-parsing from captions (#BenchPR → clickable links)

### Algorithmic "For You" Feed
- 3 feed tabs: Pro tebe (algorithmic), Sledovani (chronological), Trending
- Scoring: engagement * sourceWeight * timeDecay * diversityBoost
- Background workers: engagement recompute (10 min), trending hashtags (hourly)
- Fallback to chronological for users with < 5 follows

### Hashtags + Trending
- Hashtag model with auto-parse, upsert, postCount tracking
- Trending computation: recent uses / log(total) penalizes evergreen tags
- /trending page: top 3 hero, hashtag grid (24h/7d), hot posts
- Autocomplete search while composing posts

### Verified Badges
- BadgeType enum: NONE / CREATOR (orange star) / VERIFIED (blue check)
- Auto-set CREATOR on creator approval (won't downgrade VERIFIED)
- Admin endpoints: verify/unverify user

### Promo Cards
- PromoCard model with audience targeting + priority
- Feed injection at positions 5, 12, 20 (max 3 per load)
- Dismiss tracking via Redis (30-day TTL)
- 8 seed promo cards for feature discovery

### Frontend
- v3 Badge, PostComposer, PostCard components
- Community page refactored with feed tabs + infinite scroll
- Trending page with hashtag grid + hot posts
- Mobile CommunityScreen with feed tabs

### Backend
- 4 new NestJS modules: posts (8 endpoints), hashtags (4), feed (3), promo (5)
- 8 new Prisma models, 5 new enums
- User.badgeType + badgeVerifiedAt fields
- 2 cron jobs (engagement scoring, trending computation)

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
