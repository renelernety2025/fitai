# FitAI Changelog Archive — 2026-04-30 (Fitness Instagram)

Archived from active `@CHANGELOG.md` on 2026-05-14. See the current CHANGELOG for newer entries.

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

