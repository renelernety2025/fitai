# Fitness Instagram — Wave 1: Core Social Infra

> Date: 2026-04-30
> Status: Approved
> Scope: Post system, algorithmic feed, hashtags, trending, verified badges, promo cards
> Target scale: 10M+ DAU architecture

## Overview

Transform FitAI community from a basic activity feed into a full fitness social network (Instagram-style). Every user can post photos, auto-generated workout cards, write captions with hashtags, and scroll an algorithmic "For You" feed. Creators and trainers get visual badges. Internal promo cards are injected into the feed for feature discovery.

This is Wave 1 of 3:
- **Wave 1** (this spec): Post system, algorithmic feed, hashtags + trending, verified badges, promo cards
- **Wave 2** (future): Creator monetization (subscriptions, tipping, revenue dashboard), Smart Notifications v2
- **Wave 3** (future): Video editor/filters (overlays, export for social media)

## Decisions Made

| Question | Decision | Rationale |
|---|---|---|
| Feed approach | B: Extend community feed to algorithmic | Clips stay separate (already have own algorithm), no feed fragmentation |
| Hashtag UX | C: Auto-parse from text + suggested tag picker | Most natural UX, users expect # in caption |
| Badge types | C: Tiered — creator (orange) + verified (blue) | Creator badge rewards program participation, verified is exclusive |
| Trending content | B: Hashtags + hot posts | Rising creators deferred to Wave 2 (needs monetization data) |
| Post types | B: Photos + text + auto-generated cards | Videos handled by Clips module, no duplication |
| Promo cards | C: Internal promo now, creator boost in Wave 2 | Simple cross-sell, no external advertisers |
| Scale architecture | Fan-out on write + read hybrid | Ready for 10M+ DAU from day one |

## 1. Post System

### New Model: `Post`

```prisma
model Post {
  id          String      @id @default(uuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  caption     String?     @db.VarChar(2000)
  type        PostType    @default(TEXT)
  cardData    Json?       // for AUTO_CARD type (workout/PR/streak data)
  likeCount   Int         @default(0)
  commentCount Int        @default(0)
  shareCount  Int         @default(0)
  engagementScore Float   @default(0)
  isPublic    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  photos      PostPhoto[]
  comments    PostComment[]
  likes       PostLike[]
  hashtags    PostHashtag[]

  @@index([userId, createdAt])
  @@index([engagementScore])
  @@index([createdAt])
}

enum PostType {
  TEXT
  PHOTO
  AUTO_CARD
}

model PostPhoto {
  id      String @id @default(uuid())
  postId  String
  post    Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  s3Key   String
  width   Int?
  height  Int?
  order   Int    @default(0)

  @@index([postId])
}

model PostComment {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String   @db.VarChar(1000)
  createdAt DateTime @default(now())

  @@index([postId, createdAt])
}

model PostLike {
  id     String @id @default(uuid())
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId String
  user   User   @relation(fields: [userId], references: [id])

  @@unique([postId, userId])
}
```

### Post Types

- **TEXT**: Caption only, no media. Quick status update.
- **PHOTO**: 1-4 photos uploaded to S3 (`posts/{userId}/{postId}/{order}.jpg`) + caption
- **AUTO_CARD**: System-generated card from workout data, PR, streak milestone. `cardData` JSON contains the rendered card info. User can add caption.

### Endpoints (NestJS module: `posts`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/posts` | Create post (caption, type, photos via presigned URLs) |
| GET | `/api/posts/:id` | Get single post with comments, likes, author badge |
| DELETE | `/api/posts/:id` | Delete own post (cascade photos, comments, likes, hashtags) |
| POST | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/comment` | Add comment |
| DELETE | `/api/posts/comments/:commentId` | Delete own comment |
| POST | `/api/posts/upload-url` | Get presigned S3 URL for photo upload |
| GET | `/api/posts/user/:userId` | User's posts (profile grid) |

### Photo Upload Flow

1. Client calls `POST /api/posts/upload-url` with `{ count: 3, contentType: 'image/jpeg' }`
2. Backend returns array of `{ uploadUrl, s3Key }` (presigned PUT, 15 min expiry)
3. Client uploads photos directly to S3
4. Client calls `POST /api/posts` with `{ caption, type: 'PHOTO', photoKeys: [s3Key1, s3Key2, s3Key3] }`
5. Backend validates S3 keys exist, creates Post + PostPhoto rows

## 2. Algorithmic "For You" Feed

### Architecture (10M+ DAU ready)

**Write path** (on post create / engagement event):
1. Scoring worker computes `engagementScore` for the post
2. Fan-out on write: post ID + score written to Redis sorted set `feed:{followerId}` for each follower
3. For users with 10k+ followers: skip fan-out, use fan-out on read instead
4. Update `trending:posts` sorted set

**Read path** (`GET /api/social/feed/for-you`):
1. `ZREVRANGEBYSCORE` from Redis sorted set `feed:{userId}` (pre-computed)
2. Merge celebrity posts (fan-out on read): query posts from users with 10k+ followers that current user follows
3. Inject promo cards at positions 5, 12, 20, 30...
4. Cursor pagination (return 20 posts per page)
5. Target response time: <50ms

**Scoring formula:**

```
engagementScore = (likes * 1) + (comments * 3) + (shares * 5)

feedScore = engagementScore * sourceWeight * timeDecay * diversityBoost

sourceWeight:
  following:    2.0  (target ~40% of feed)
  trending:     1.5  (target ~30%)
  educational:  1.0  (target ~20% — posts with #tutorial, #tip, auto-cards)
  discovery:    0.5  (target ~10% — random non-followed users)

timeDecay = 1 / (1 + hoursAge * 0.1)
  1h old = 0.91, 12h = 0.45, 48h = 0.17

diversityBoost:
  same author not seen in last 3 posts: * 1.3
  different post type than previous 2:   * 1.1
```

**Background worker** (Bull queue or ECS scheduled task, every 15 min):
- Recompute `engagementScore` for active posts (last 48h)
- Update `trending:posts` sorted set
- Decay old posts
- Rebuild feeds for users whose followed-users posted new content

**Fallback:** If user has <5 followed users or Redis is empty, return chronological public feed.

### Feed Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/social/feed/for-you` | Algorithmic feed (default) |
| GET | `/api/social/feed/following` | Chronological, followed users only |
| GET | `/api/social/feed/trending` | Global hot posts by engagementScore |

### Feed Tabs on `/community`

1. **Pro tebe** (default) — algorithmic for-you feed
2. **Sledovani** — chronological following feed
3. **Trending** — global hot posts

## 3. Hashtags + Trending

### New Models

```prisma
model Hashtag {
  id        String   @id @default(uuid())
  name      String   @unique  // lowercase, no #, e.g. "benchpr"
  postCount Int      @default(0)
  createdAt DateTime @default(now())

  posts     PostHashtag[]
  trending  TrendingSnapshot[]

  @@index([postCount])
}

model PostHashtag {
  postId    String
  post      Post    @relation(fields: [postId], references: [id], onDelete: Cascade)
  hashtagId String
  hashtag   Hashtag @relation(fields: [hashtagId], references: [id])

  @@unique([postId, hashtagId])
  @@index([hashtagId])
}

model TrendingSnapshot {
  id         String   @id @default(uuid())
  hashtagId  String
  hashtag    Hashtag  @relation(fields: [hashtagId], references: [id])
  period     TrendingPeriod
  score      Float
  rank       Int
  snapshotAt DateTime @default(now())

  @@index([period, rank])
  @@index([snapshotAt])
}

enum TrendingPeriod {
  H24
  D7
}
```

### Hashtag Parsing

On post create/update:
1. Regex extract from caption: `/#([a-zA-Z0-9\u00C0-\u024F_]{1,50})/g` (supports Czech diacritics)
2. Normalize to lowercase
3. Upsert each `Hashtag` (get-or-create)
4. Create `PostHashtag` relations
5. Increment `Hashtag.postCount` (decrement on post delete)

### Trending Computation

Background worker (hourly):
```
trending_score = (uses in period) * recency_weight / log(1 + total_postCount)
```
- Penalizes evergreen tags like #fitness (high total count = lower score)
- Store top 20 per period in `TrendingSnapshot`
- Redis cache: `trending:24h`, `trending:7d` (TTL 1h)

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/hashtags/trending?period=24h\|7d` | Top 20 trending hashtags |
| GET | `/api/hashtags/:name/posts` | Posts with this hashtag (paginated) |
| GET | `/api/hashtags/search?q=bench` | Autocomplete (prefix match, top 10) |
| GET | `/api/hashtags/suggested` | Suggested tags for post composer |

### Trending Page (`/trending`)

- Hero section: top 3 hashtags with post count and sparkline
- Grid: top 20 hashtags with 24h / 7d tab switch
- Click hashtag: navigate to filtered feed
- Below hashtags: "Hot Posts" section (top 10 posts by engagementScore in last 24h)

## 4. Verified Badges

### Schema Change (User model extension)

```prisma
model User {
  ...existing fields...
  badgeType       BadgeType @default(NONE)
  badgeVerifiedAt DateTime?
}

enum BadgeType {
  NONE
  CREATOR
  VERIFIED
}
```

### Rules

- `CREATOR` (orange badge): Automatically set when `CreatorProfile.isApproved` becomes `true`. Trigger in creators service on approval.
- `VERIFIED` (blue checkmark): Admin manually sets via endpoint. Reserved for certified trainers, fitness influencers, notable athletes.
- `VERIFIED` overrides `CREATOR` — if someone is verified, they show blue, not orange.
- Badge displays everywhere: feed posts, comments, profile page, leaderboards, messages, search results.

### Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/verify-user/:userId` | Admin sets badgeType = VERIFIED |
| POST | `/api/admin/unverify-user/:userId` | Admin sets badgeType = NONE (or back to CREATOR if applicable) |

### Visual Design

- **CREATOR**: Small orange circle with star icon, positioned right of username
- **VERIFIED**: Blue checkmark circle (classic Instagram style), positioned right of username
- **NONE**: No badge

Badge is a shared v3 component `BadgeVerified` used in all user name displays.

## 5. Internal Promo Cards

### New Model

```prisma
model PromoCard {
  id             String          @id @default(uuid())
  type           PromoType
  title          String
  subtitle       String?
  ctaText        String          // "Vyzkouset" / "Upgradovat"
  ctaUrl         String          // internal route, e.g. "/ai-chat"
  imageS3Key     String?
  targetAudience PromoAudience   @default(ALL)
  priority       Int             @default(5)  // 1-10, higher = more likely
  isActive       Boolean         @default(true)
  startDate      DateTime        @default(now())
  endDate        DateTime?

  @@index([isActive, targetAudience])
}

enum PromoType {
  FEATURE_DISCOVERY
  UPGRADE
  CHALLENGE
  CONTENT
}

enum PromoAudience {
  ALL
  FREE_TIER
  NO_STREAK
  NEW_USER
  NO_MEAL_PLAN
  NO_JOURNAL
}
```

### Feed Injection

- Positions: 5, 12, 20, 30... (every ~8 posts)
- Max 3 promo cards per feed load
- Backend selects by: `targetAudience` match + `isActive` + date range + not dismissed
- Dismissed promos stored in Redis set `promo:dismissed:{userId}` (TTL 30 days)

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/promo/for-feed?limit=3` | Get relevant promo cards for current user |
| POST | `/api/promo/:id/dismiss` | User hides a promo card |
| POST | `/api/admin/promo` | Create promo card (admin) |
| PUT | `/api/admin/promo/:id` | Update promo card (admin) |
| DELETE | `/api/admin/promo/:id` | Delete promo card (admin) |

### Seed Promo Cards (8 initial)

1. "Zkus AI Chat Coach" — target: all who haven't used /ai-chat
2. "Vytvor si jidelnicek" — target: NO_MEAL_PLAN
3. "Zapis do deniku" — target: NO_JOURNAL
4. "Pridej se k vyzve" — target: all
5. "Upgrade na Premium" — target: FREE_TIER
6. "Sdilej svuj trenink" — target: users with 0 posts
7. "Zkus Fitness Score" — target: all
8. "Pozvi kamarada" — target: users with 0 following

## 6. Web UI Changes

### `/community` Page Refactor

**Header:**
- Post composer: text input + photo upload + auto-card selector
- Hashtag suggestions while typing (chip picker below input)

**Feed Tabs:**
- Pro tebe (default, algorithmic)
- Sledovani (chronological)
- Trending (hot posts)

**Post Card:**
- Author avatar + name + badge (CREATOR/VERIFIED/NONE) + time ago
- Photo gallery (swipeable, 1-4 photos)
- Auto-card render (if type = AUTO_CARD)
- Caption with clickable #hashtags (link to `/trending?tag=name`)
- Engagement bar: like (heart), comment, share
- Comment preview (latest 2, "View all X comments" link)
- Promo cards: distinct styling (gradient border, "Promoted" label, CTA button)

### `/trending` Page (new)

- Hero: top 3 trending hashtags (24h)
- Tab: 24h / 7d
- Hashtag grid (top 20, each with name + post count + sparkline)
- Hot Posts section below

### Profile Page Updates

- Post grid tab (user's posts, 3-column grid like Instagram)
- Post count in stats
- Badge next to username

## 7. Summary

| Component | New Models | New Endpoints | New Pages | Background Jobs |
|---|---|---|---|---|
| Post System | 4 (Post, PostPhoto, PostComment, PostLike) | 8 | — | — |
| Algorithmic Feed | — (Redis) | 3 | — | Feed scoring worker (every 15 min) |
| Hashtags + Trending | 3 (Hashtag, PostHashtag, TrendingSnapshot) | 4 | `/trending` | Trending computation (hourly) |
| Verified Badges | — (2 fields on User) | 2 | — | — |
| Promo Cards | 1 (PromoCard) | 5 | — | — |
| **Total** | **8 new models** | **22 endpoints** | **1 new + 1 refactor** | **2 workers** |

### New Enums

- PostType (TEXT, PHOTO, AUTO_CARD)
- TrendingPeriod (H24, D7)
- BadgeType (NONE, CREATOR, VERIFIED)
- PromoType (FEATURE_DISCOVERY, UPGRADE, CHALLENGE, CONTENT)
- PromoAudience (ALL, FREE_TIER, NO_STREAK, NEW_USER, NO_MEAL_PLAN, NO_JOURNAL)

### Infrastructure

- Redis sorted sets for feed storage (existing ElastiCache, may need cluster mode for 10M+ DAU)
- S3 bucket `fitai-assets-production` for post photos (existing)
- Bull queue or ECS scheduled task for background workers
- New NestJS module: `posts` (separate from existing `social`)

### Coexistence with Existing Models

- **`ActivityFeedItem`** remains for system-generated notifications (achievement unlocked, challenge joined). Not used for user-created content anymore.
- **`Comment`** (existing, on ActivityFeedItem) remains untouched. `PostComment` is a new model for the new Post system.
- **`Reaction`** (existing, emoji reactions) stays for Stories and ActivityFeedItems. Posts use `PostLike` (simpler, just like/unlike).
- **`Clip`** stays as separate TikTok-style short video feed. Not merged into Post.
- **`Story`** stays as 24h ephemeral content. Independent from Posts.
