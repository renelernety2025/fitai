# Fitness Instagram — Wave 2: Creator Economy + Smart Notifications

> Date: 2026-04-30
> Status: Approved
> Scope: Creator XP economy (subscriptions, tips, subscriber-only posts), Smart Notifications v2 (social + engagement-driven), Creator Dashboard (stats, analytics, content tools)
> Depends on: Wave 1 (Post system, feed, hashtags, badges)

## Overview

Add creator monetization via XP economy (no real money yet), comprehensive social/engagement notifications, and a full creator dashboard with analytics and content management tools. Building above industry standard — no MVP shortcuts.

This is Wave 2 of 3:
- **Wave 1** (done): Post system, algorithmic feed, hashtags + trending, verified badges, promo cards
- **Wave 2** (this spec): Creator XP economy, Smart Notifications v2, Creator Dashboard
- **Wave 3** (future): Real money (Stripe Connect), Video editor/filters

## Decisions Made

| Question | Decision | Rationale |
|---|---|---|
| Payment model | D: XP economy (no real money) | No Stripe Connect, no KYC, no tax. Real money in Wave 3 |
| Subscriber benefits | A: Exclusive subscriber-only posts | Blurred for non-subscribers, real value for XP spend |
| Notification scope | B: Social + engagement-driven | Social = table stakes, engagement = FOMO retention driver |
| Creator dashboard | C: Stats + analytics + content tools | Full-featured, above industry standard |

## 1. Creator XP Economy

### New Models

```prisma
model CreatorSubscription {
  id            String   @id @default(uuid())
  subscriberId  String
  subscriber    User     @relation("Subscriptions", fields: [subscriberId], references: [id])
  creatorId     String
  creator       User     @relation("Subscribers", fields: [creatorId], references: [id])
  xpPerMonth    Int      @default(500)
  startedAt     DateTime @default(now())
  renewsAt      DateTime
  isActive      Boolean  @default(true)

  @@unique([subscriberId, creatorId])
  @@index([creatorId, isActive])
  @@index([renewsAt])
}

model CreatorTip {
  id          String   @id @default(uuid())
  fromUserId  String
  fromUser    User     @relation("TipsSent", fields: [fromUserId], references: [id])
  toCreatorId String
  toCreator   User     @relation("TipsReceived", fields: [toCreatorId], references: [id])
  xpAmount    Int
  message     String?  @db.VarChar(200)
  createdAt   DateTime @default(now())

  @@index([toCreatorId, createdAt])
}
```

### Model Extensions

```prisma
// Post model extensions:
Post {
  + isSubscriberOnly  Boolean  @default(false)
  + isPinned          Boolean  @default(false)
  + publishAt         DateTime?
  + isScheduled       Boolean  @default(false)
}

// CreatorProfile extensions:
CreatorProfile {
  + subscriptionPriceXP  Int  @default(500)
  + totalXPEarned        Int  @default(0)
  + monthlyXPEarned      Int  @default(0)
}

// UserProgress extension:
UserProgress {
  + totalXPSpent  Int  @default(0)
}

// User relations:
User {
  + subscriptions       CreatorSubscription[]  @relation("Subscriptions")
  + subscribers         CreatorSubscription[]  @relation("Subscribers")
  + tipsSent            CreatorTip[]           @relation("TipsSent")
  + tipsReceived        CreatorTip[]           @relation("TipsReceived")
}
```

### XP Flow

**Subscription:**
- Subscriber calls `POST /api/creator-economy/subscribe/:creatorId`
- Backend checks: user has enough XP (`totalXP - totalXPSpent >= subscriptionPriceXP`)
- Deducts XP from subscriber's `UserProgress.totalXPSpent`
- Credits 70% to creator's `CreatorProfile.totalXPEarned` + `monthlyXPEarned`
- 30% is FitAI fee (XP sink — healthy for economy)
- Creates `CreatorSubscription` with `renewsAt = now + 30 days`
- Daily cron checks `renewsAt <= now` → auto-renew if user has XP, else deactivate

**Tips:**
- Preset amounts: 50, 100, 250, 500, 1000 XP
- Custom amount: min 10, max 5000 XP
- Instant transfer: 70% to creator, 30% sink
- Optional message (max 200 chars)

**Subscriber-only posts:**
- Creator sets `isSubscriberOnly: true` when creating post
- Feed service: if user is not subscriber → returns post with `caption: null, photos: [], isBlurred: true`
- Subscriber check via `CreatorSubscription` where `subscriberId = userId AND creatorId = postUserId AND isActive = true`

### Endpoints (module: `creator-economy`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/creator-economy/subscribe/:creatorId` | Subscribe (deduct XP, create subscription) |
| POST | `/api/creator-economy/unsubscribe/:creatorId` | Cancel subscription (set isActive false) |
| GET | `/api/creator-economy/subscriptions` | My active subscriptions list |
| GET | `/api/creator-economy/subscribers` | My subscribers (for creators) |
| POST | `/api/creator-economy/tip/:creatorId` | Send tip with optional message |
| GET | `/api/creator-economy/earnings` | Creator earnings summary (total, monthly, tips vs subs) |
| GET | `/api/creator-economy/check/:creatorId` | Am I subscribed to this creator? |

### Cron Job: Subscription Renewal

Daily at 03:00 UTC:
1. Find all `CreatorSubscription` where `isActive = true AND renewsAt <= now`
2. For each: check subscriber has enough XP
3. If yes: deduct XP, credit creator 70%, update `renewsAt += 30 days`
4. If no: set `isActive = false`, notify subscriber ("Your subscription to @creator expired")

## 2. Smart Notifications v2

### New Model

```prisma
model SocialNotification {
  id         String                 @id @default(uuid())
  userId     String
  user       User                   @relation(fields: [userId], references: [id])
  type       SocialNotificationType
  actorId    String
  actor      User                   @relation("NotificationActor", fields: [actorId], references: [id])
  targetType String?                // "post", "comment", "challenge", "squad"
  targetId   String?
  message    String
  isRead     Boolean                @default(false)
  createdAt  DateTime               @default(now())

  @@index([userId, isRead, createdAt])
  @@index([userId, type, actorId, targetId])
}

enum SocialNotificationType {
  NEW_FOLLOWER
  POST_LIKED
  POST_COMMENTED
  CHALLENGE_INVITE
  CHALLENGE_COMPLETED
  SQUAD_PR
  BUDDY_WORKOUT
  SUBSCRIBER_NEW
  TIP_RECEIVED
  POST_MILESTONE
  STREAK_BUDDY
}
```

### Event Pipeline (inline in existing services)

**Immediate notifications (triggered in service methods):**

| Trigger | Type | Recipient | Message template |
|---|---|---|---|
| `PostsService.toggleLike()` (liked) | POST_LIKED | post owner | "{actor} lajknul tvůj post" |
| `PostsService.addComment()` | POST_COMMENTED | post owner | "{actor} okomentoval tvůj post: {preview}" |
| `SocialService.follow()` | NEW_FOLLOWER | followed user | "{actor} tě začal sledovat" |
| `CreatorEconomyService.subscribe()` | SUBSCRIBER_NEW | creator | "{actor} se přidal k tvým subscriberům" |
| `CreatorEconomyService.tip()` | TIP_RECEIVED | creator | "{actor} ti poslal {amount} XP tip" |

**Engagement-driven (cron every 2 hours):**

| Type | Detection | Message template |
|---|---|---|
| BUDDY_WORKOUT | GymSession created in last 2h by buddy | "Tvůj buddy {name} právě dokončil trénink!" |
| SQUAD_PR | ExerciseHistory.bestWeight increased in last 2h by squad member | "Nový PR v tvém squadu! {name} zvedl {weight}kg na {exercise}" |
| POST_MILESTONE | Post.likeCount crossed 10/50/100/500 threshold | "Tvůj post dosáhl {count} likes!" |
| STREAK_BUDDY | UserProgress.currentStreak reset to 0 for buddy | "Tvůj buddy {name} ztratil streak. Motivuj ho!" |

### Delivery

- **In-app:** Red badge counter on bell icon in header + `/notifications` page with full list
- **Push:** Expo push (mobile) + VAPID web push via existing `NotificationService`
- **Batching:** 5+ same-type notifications within 5 min on same target → batch: "5 lidí lajklo tvůj post"
- **Quiet hours:** Respect `NotificationPreference.quietHoursStart/End` — buffer and send after
- **Dedup:** No duplicate notification for same (type + actorId + targetId) within 24h

### Endpoints (extend `smart-notifications` module)

| Method | Path | Description |
|---|---|---|
| GET | `/api/smart-notifications/social` | My social notifications (paginated, cursor) |
| GET | `/api/smart-notifications/unread-count` | Unread badge count |
| POST | `/api/smart-notifications/:id/read` | Mark single as read |
| POST | `/api/smart-notifications/read-all` | Mark all as read |

### NotifyService (shared service)

```typescript
class NotifyService {
  async create(type, recipientId, actorId, targetType?, targetId?, message)
  async batchCheck(userId, type, targetId) // returns true if should batch
  async sendPush(userId, title, body) // delegates to NotificationService
}
```

Injected into PostsService, SocialService, CreatorEconomyService. Not a separate module — a provider in a shared `notify` module imported by consumers.

## 3. Creator Dashboard

### Page: `/creator-dashboard` (web only)

Three sections:

#### A) Stats Hero (top)

6 metrics in grid using v3 `Metric` + `Sparkline` components:

| Metric | Source | Visualization |
|---|---|---|
| Subscribers | `CreatorSubscription.count(isActive)` | Number + 30d sparkline |
| Monthly XP Earned | `CreatorProfile.monthlyXPEarned` | Number + vs last month % |
| Total XP Earned | `CreatorProfile.totalXPEarned` | Number |
| Posts | `Post.count(userId)` | Number + subscriber-only count |
| Engagement Rate | avg (likes+comments)/post last 30d | Percentage + trend |
| Top Post | Post with highest engagementScore | Thumbnail + stats |

#### B) Analytics (middle)

| Chart | Type | Data |
|---|---|---|
| Subscriber Growth | BarChart 30d | Daily new subscribers - daily churn (stacked) |
| XP Earnings | BarChart 12 weeks | Tips vs subscriptions breakdown (stacked) |
| Post Performance | Table 20 rows | Date, caption preview, type badge, likes, comments, engagement, subscriber-only badge |
| Top Hashtags | Chip cloud | Top 10 hashtags by usage, size = postCount |

#### C) Content Tools (bottom)

| Tool | Description |
|---|---|
| Scheduled Posts | List of posts with `publishAt` in future. Create/edit/delete/publish-now actions. |
| Pinned Post | Select 1 post as pinned. Shows first on creator profile. `isPinned: true` on Post. |
| Subscriber-Only Toggle | Multi-select existing posts → batch set `isSubscriberOnly: true/false` |
| Subscription Price | Slider/input: 100-5000 XP/month. Updates `CreatorProfile.subscriptionPriceXP` |

### Scheduled Post Publisher (cron every 1 minute)

1. Find `Post` where `isScheduled = true AND publishAt <= now`
2. Set `isScheduled = false` (now it appears in feed)
3. Trigger normal post-creation side effects (hashtag indexing, feed fan-out)

### Endpoints (module: `creator-dashboard`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/creator-dashboard/stats` | Hero stats (6 metrics) |
| GET | `/api/creator-dashboard/subscriber-growth?days=30` | Daily sub/unsub counts |
| GET | `/api/creator-dashboard/earnings?weeks=12` | Weekly XP breakdown (tips vs subs) |
| GET | `/api/creator-dashboard/post-performance?limit=20` | Posts with engagement stats |
| GET | `/api/creator-dashboard/top-hashtags` | Creator's most used hashtags |
| PUT | `/api/creator-dashboard/subscription-price` | Set subscription XP price |
| POST | `/api/creator-dashboard/pin/:postId` | Pin a post (unpin current if exists) |
| POST | `/api/creator-dashboard/unpin/:postId` | Unpin a post |
| POST | `/api/creator-dashboard/schedule-post` | Create scheduled post |
| PUT | `/api/creator-dashboard/schedule/:postId` | Edit scheduled post |
| DELETE | `/api/creator-dashboard/schedule/:postId` | Cancel scheduled post |
| POST | `/api/creator-dashboard/publish-now/:postId` | Publish scheduled post immediately |
| POST | `/api/creator-dashboard/bulk-subscriber-only` | Batch set subscriber-only on multiple posts |

## 4. Feed Integration (Wave 1 extension)

### Subscriber-only blur

In `FeedService` and `PostsService.findById()`:
- If `post.isSubscriberOnly === true`:
  - Check if current user has active `CreatorSubscription` to post's author
  - If NOT subscribed: return post with `caption: null, photos: [], cardData: null, isBlurred: true`
  - If subscribed: return full post normally

### Pinned post

On creator's profile page (`/profile/:id`):
- Query `Post` where `userId = creatorId AND isPinned = true`
- Display pinned post first, with "Pinned" badge

### Scheduled posts

- Posts with `isScheduled = true` are excluded from all feed queries (`where: { isScheduled: false }`)
- Only visible in creator dashboard scheduled posts list

## 5. Web UI

### `/creator-dashboard` (new page)

Full-width layout with 3 sections (A, B, C as described above). Uses v3 components:
- `Metric` for stats
- `Sparkline` for trends
- `BarChart` for subscriber growth + earnings
- `Card` for content tools sections
- `Chip` for hashtag cloud
- `Button` for actions
- `SectionHeader` for section titles

### `/notifications` (refactor)

- Add social notification feed (SocialNotification items)
- Notification item: avatar + actor name + badge + message + time ago + read/unread indicator
- "Mark all read" button in header
- Filter tabs: All / Social / Training / System

### PostCard (extension)

- If `isBlurred`: overlay with blur filter + "Subscribe for {price} XP" CTA button
- If `isPinned`: small "Pinned" tag in header

### Creator Profile (extension)

- Subscribe/Unsubscribe button
- Tip button (opens modal with preset amounts + custom + optional message)
- Subscriber count displayed
- Pinned post shown first

## 6. Mobile

- Notification badge counter on bottom nav bell icon
- Subscriber-only blur overlay on PostCard
- Tip modal (preset amounts + custom message)
- Subscribe/unsubscribe buttons on creator profiles
- Creator dashboard is web-only (creators manage from desktop)

## 7. Summary

| Component | New Models | New Endpoints | New Pages | Cron Jobs |
|---|---|---|---|---|
| Creator XP Economy | 2 (CreatorSubscription, CreatorTip) | 7 | — | Subscription renewal (daily 03:00) |
| Smart Notifications v2 | 1 (SocialNotification) + enum | 4 | Refactor /notifications | Engagement check (every 2h) |
| Creator Dashboard | — (Post extensions) | 13 | `/creator-dashboard` | Scheduled post publisher (every 1min) |
| Feed Integration | — | — | — | — |
| **Total** | **3 new models, 1 enum, 5 field extensions** | **24 endpoints** | **1 new + 1 refactor** | **3 cron jobs** |

### New Enums

- SocialNotificationType (NEW_FOLLOWER, POST_LIKED, POST_COMMENTED, CHALLENGE_INVITE, CHALLENGE_COMPLETED, SQUAD_PR, BUDDY_WORKOUT, SUBSCRIBER_NEW, TIP_RECEIVED, POST_MILESTONE, STREAK_BUDDY)

### User Model Relations (additions)

- `subscriptions CreatorSubscription[] @relation("Subscriptions")`
- `subscribers CreatorSubscription[] @relation("Subscribers")`
- `tipsSent CreatorTip[] @relation("TipsSent")`
- `tipsReceived CreatorTip[] @relation("TipsReceived")`
- `socialNotifications SocialNotification[]`
- `actedNotifications SocialNotification[] @relation("NotificationActor")`
