# Fitness Instagram Wave 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add creator XP economy (subscriptions, tips, subscriber-only posts), smart social/engagement notifications, and a full creator dashboard with analytics and content tools.

**Architecture:** Three new NestJS modules (`creator-economy`, `notify`, `creator-dashboard`) plus extensions to existing Post model, feed service, and smart-notifications module. XP-based economy with 70/30 revenue split. Social notifications via inline event triggers + engagement cron jobs. Creator dashboard with stats, analytics charts, scheduled posts, pinning, and bulk subscriber-only toggle.

**Tech Stack:** NestJS 10, Prisma 5, PostgreSQL 16, Redis 7 (CacheService), `@nestjs/schedule` (cron), Next.js 14 App Router, v3 design system components.

**Spec:** `docs/superpowers/specs/2026-04-30-fitness-instagram-wave2-design.md`

---

## File Structure

### Backend (apps/api/src/)

```
creator-economy/
  creator-economy.module.ts       — NestJS module
  creator-economy.controller.ts   — 7 endpoints (subscribe, unsubscribe, subscriptions, subscribers, tip, earnings, check)
  creator-economy.service.ts      — XP transfer logic, subscription management
  creator-economy.processor.ts    — Cron: daily subscription renewal
  dto/
    tip.dto.ts                    — xpAmount, message
    subscription-price.dto.ts     — priceXP

notify/
  notify.module.ts                — @Global module
  notify.service.ts               — create(), batchCheck(), sendPush()

creator-dashboard/
  creator-dashboard.module.ts     — NestJS module
  creator-dashboard.controller.ts — 13 endpoints
  creator-dashboard.service.ts    — Stats, analytics, content tools

smart-notifications/ (existing, extend)
  smart-notifications.controller.ts  — +4 endpoints (social, unread-count, read, read-all)
  smart-notifications.service.ts     — +social notification queries

feed/ (existing, extend)
  feed.service.ts                 — +subscriber-only blur logic
```

### Frontend (apps/web/src/)

```
lib/api/
  creator-economy.ts              — API client functions (new)
  notifications.ts                — API client functions (new)

app/(app)/
  creator-dashboard/page.tsx      — Full creator dashboard (new)
  notifications/page.tsx          — Refactor with social tabs

components/v3/
  index.ts                        — +export SubscriberBlur, TipModal
  SubscriberBlur.tsx              — Blurred post overlay with subscribe CTA (new)
  TipModal.tsx                    — Tip amounts + custom + message (new)
```

---

## Task 1: Prisma Schema — Economy + Notifications + Post Extensions

**Files:**
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Add SocialNotificationType enum**

After the existing enums, add:

```prisma
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

- [ ] **Step 2: Add new models**

Append after the last model:

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

model SocialNotification {
  id         String                 @id @default(uuid())
  userId     String
  user       User                   @relation("SocialNotifications", fields: [userId], references: [id])
  type       SocialNotificationType
  actorId    String
  actor      User                   @relation("NotificationActor", fields: [actorId], references: [id])
  targetType String?
  targetId   String?
  message    String
  isRead     Boolean                @default(false)
  createdAt  DateTime               @default(now())

  @@index([userId, isRead, createdAt])
  @@index([userId, type, actorId, targetId])
}
```

- [ ] **Step 3: Extend Post model**

Add to the Post model (find it around line 2315):

```prisma
  isSubscriberOnly  Boolean  @default(false)
  isPinned          Boolean  @default(false)
  publishAt         DateTime?
  isScheduled       Boolean  @default(false)
```

- [ ] **Step 4: Extend CreatorProfile model**

Add to CreatorProfile (around line 2190):

```prisma
  subscriptionPriceXP  Int  @default(500)
  totalXPEarned        Int  @default(0)
  monthlyXPEarned      Int  @default(0)
```

- [ ] **Step 5: Extend UserProgress model**

Add to UserProgress (around line 185):

```prisma
  totalXPSpent  Int  @default(0)
```

- [ ] **Step 6: Add User relations**

Add to the User model:

```prisma
  subscriptions        CreatorSubscription[]  @relation("Subscriptions")
  subscribers          CreatorSubscription[]  @relation("Subscribers")
  tipsSent             CreatorTip[]           @relation("TipsSent")
  tipsReceived         CreatorTip[]           @relation("TipsReceived")
  socialNotifications  SocialNotification[]   @relation("SocialNotifications")
  actedNotifications   SocialNotification[]   @relation("NotificationActor")
```

- [ ] **Step 7: Generate Prisma client**

```bash
cd apps/api && npx prisma generate
```

- [ ] **Step 8: Commit**

```bash
git add apps/api/prisma/schema.prisma
git commit -m "feat(schema): add CreatorSubscription, CreatorTip, SocialNotification + Post/CreatorProfile/UserProgress extensions"
```

---

## Task 2: Notify Service (shared module)

**Files:**
- Create: `apps/api/src/notify/notify.module.ts`
- Create: `apps/api/src/notify/notify.service.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create notify service**

`apps/api/src/notify/notify.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    type: string,
    recipientId: string,
    actorId: string,
    message: string,
    targetType?: string,
    targetId?: string,
  ) {
    if (recipientId === actorId) return; // don't notify yourself

    const isDuplicate = await this.isDuplicate(type, recipientId, actorId, targetId);
    if (isDuplicate) return;

    await this.prisma.socialNotification.create({
      data: {
        userId: recipientId,
        type: type as any,
        actorId,
        targetType,
        targetId,
        message,
      },
    });
  }

  async createBatched(
    type: string,
    recipientId: string,
    actorId: string,
    message: string,
    batchMessage: string,
    targetType?: string,
    targetId?: string,
  ) {
    if (recipientId === actorId) return;

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentCount = await this.prisma.socialNotification.count({
      where: {
        userId: recipientId,
        type: type as any,
        targetId,
        createdAt: { gte: fiveMinAgo },
      },
    });

    if (recentCount >= 4) {
      await this.prisma.socialNotification.updateMany({
        where: {
          userId: recipientId,
          type: type as any,
          targetId,
          createdAt: { gte: fiveMinAgo },
        },
        data: { message: batchMessage.replace('{count}', String(recentCount + 1)) },
      });
      return;
    }

    await this.create(type, recipientId, actorId, message, targetType, targetId);
  }

  private async isDuplicate(
    type: string,
    recipientId: string,
    actorId: string,
    targetId?: string,
  ): Promise<boolean> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await this.prisma.socialNotification.findFirst({
      where: {
        userId: recipientId,
        type: type as any,
        actorId,
        targetId: targetId || undefined,
        createdAt: { gte: oneDayAgo },
      },
    });
    return !!existing;
  }
}
```

- [ ] **Step 2: Create notify module**

`apps/api/src/notify/notify.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { NotifyService } from './notify.service';

@Global()
@Module({
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
```

- [ ] **Step 3: Register in app.module.ts**

Add `import { NotifyModule } from './notify/notify.module';` and `NotifyModule` to imports.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/notify/ apps/api/src/app.module.ts
git commit -m "feat(api): add global NotifyService — dedup, batching, social notification creation"
```

---

## Task 3: Creator Economy Module

**Files:**
- Create: `apps/api/src/creator-economy/creator-economy.module.ts`
- Create: `apps/api/src/creator-economy/creator-economy.service.ts`
- Create: `apps/api/src/creator-economy/creator-economy.controller.ts`
- Create: `apps/api/src/creator-economy/creator-economy.processor.ts`
- Create: `apps/api/src/creator-economy/dto/tip.dto.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create DTOs**

`apps/api/src/creator-economy/dto/tip.dto.ts`:

```typescript
import { IsInt, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';

export class TipDto {
  @IsInt()
  @Min(10)
  @Max(5000)
  xpAmount: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  message?: string;
}
```

- [ ] **Step 2: Create creator economy service**

`apps/api/src/creator-economy/creator-economy.service.ts`:

```typescript
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotifyService } from '../notify/notify.service';

@Injectable()
export class CreatorEconomyService {
  constructor(
    private prisma: PrismaService,
    private notifyService: NotifyService,
  ) {}

  async subscribe(subscriberId: string, creatorId: string) {
    if (subscriberId === creatorId) throw new BadRequestException('Cannot subscribe to yourself');

    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId: creatorId } });
    if (!creator || !creator.isApproved) throw new NotFoundException('Creator not found');

    const existing = await this.prisma.creatorSubscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
    });
    if (existing?.isActive) throw new BadRequestException('Already subscribed');

    const progress = await this.prisma.userProgress.findUnique({ where: { userId: subscriberId } });
    const availableXP = (progress?.totalXP || 0) - (progress?.totalXPSpent || 0);
    if (availableXP < creator.subscriptionPriceXP) throw new BadRequestException('Not enough XP');

    const creatorXP = Math.floor(creator.subscriptionPriceXP * 0.7);
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.$transaction([
      this.prisma.userProgress.update({
        where: { userId: subscriberId },
        data: { totalXPSpent: { increment: creator.subscriptionPriceXP } },
      }),
      this.prisma.creatorProfile.update({
        where: { userId: creatorId },
        data: {
          totalXPEarned: { increment: creatorXP },
          monthlyXPEarned: { increment: creatorXP },
          subscriberCount: { increment: 1 },
        },
      }),
      existing
        ? this.prisma.creatorSubscription.update({
            where: { id: existing.id },
            data: { isActive: true, xpPerMonth: creator.subscriptionPriceXP, renewsAt },
          })
        : this.prisma.creatorSubscription.create({
            data: { subscriberId, creatorId, xpPerMonth: creator.subscriptionPriceXP, renewsAt },
          }),
    ]);

    const subscriber = await this.prisma.user.findUnique({ where: { id: subscriberId }, select: { name: true } });
    await this.notifyService.create(
      'SUBSCRIBER_NEW', creatorId, subscriberId,
      `${subscriber?.name || 'Někdo'} se přidal k tvým subscriberům`,
      'creator', creatorId,
    );

    return { subscribed: true, xpDeducted: creator.subscriptionPriceXP };
  }

  async unsubscribe(subscriberId: string, creatorId: string) {
    const sub = await this.prisma.creatorSubscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
    });
    if (!sub || !sub.isActive) throw new BadRequestException('Not subscribed');

    await this.prisma.$transaction([
      this.prisma.creatorSubscription.update({
        where: { id: sub.id },
        data: { isActive: false },
      }),
      this.prisma.creatorProfile.update({
        where: { userId: creatorId },
        data: { subscriberCount: { decrement: 1 } },
      }),
    ]);

    return { unsubscribed: true };
  }

  async getSubscriptions(userId: string) {
    return this.prisma.creatorSubscription.findMany({
      where: { subscriberId: userId, isActive: true },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getSubscribers(creatorId: string) {
    return this.prisma.creatorSubscription.findMany({
      where: { creatorId, isActive: true },
      include: {
        subscriber: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async tip(fromUserId: string, toCreatorId: string, xpAmount: number, message?: string) {
    if (fromUserId === toCreatorId) throw new BadRequestException('Cannot tip yourself');

    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId: toCreatorId } });
    if (!creator || !creator.isApproved) throw new NotFoundException('Creator not found');

    const progress = await this.prisma.userProgress.findUnique({ where: { userId: fromUserId } });
    const availableXP = (progress?.totalXP || 0) - (progress?.totalXPSpent || 0);
    if (availableXP < xpAmount) throw new BadRequestException('Not enough XP');

    const creatorXP = Math.floor(xpAmount * 0.7);

    await this.prisma.$transaction([
      this.prisma.userProgress.update({
        where: { userId: fromUserId },
        data: { totalXPSpent: { increment: xpAmount } },
      }),
      this.prisma.creatorProfile.update({
        where: { userId: toCreatorId },
        data: {
          totalXPEarned: { increment: creatorXP },
          monthlyXPEarned: { increment: creatorXP },
        },
      }),
      this.prisma.creatorTip.create({
        data: { fromUserId, toCreatorId, xpAmount, message },
      }),
    ]);

    const sender = await this.prisma.user.findUnique({ where: { id: fromUserId }, select: { name: true } });
    await this.notifyService.create(
      'TIP_RECEIVED', toCreatorId, fromUserId,
      `${sender?.name || 'Někdo'} ti poslal ${xpAmount} XP tip`,
      'tip', toCreatorId,
    );

    return { tipped: true, xpDeducted: xpAmount };
  }

  async getEarnings(creatorId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId: creatorId } });
    if (!profile) throw new NotFoundException('Creator profile not found');

    const subscriptionCount = await this.prisma.creatorSubscription.count({
      where: { creatorId, isActive: true },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTips = await this.prisma.creatorTip.aggregate({
      where: { toCreatorId: creatorId, createdAt: { gte: thirtyDaysAgo } },
      _sum: { xpAmount: true },
      _count: true,
    });

    return {
      totalXPEarned: profile.totalXPEarned,
      monthlyXPEarned: profile.monthlyXPEarned,
      activeSubscribers: subscriptionCount,
      subscriptionPriceXP: profile.subscriptionPriceXP,
      monthlySubscriptionXP: subscriptionCount * Math.floor(profile.subscriptionPriceXP * 0.7),
      recentTipsXP: recentTips._sum.xpAmount || 0,
      recentTipsCount: recentTips._count,
    };
  }

  async checkSubscription(subscriberId: string, creatorId: string) {
    const sub = await this.prisma.creatorSubscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
    });
    return { isSubscribed: !!sub?.isActive, renewsAt: sub?.renewsAt };
  }
}
```

- [ ] **Step 3: Create creator economy controller**

`apps/api/src/creator-economy/creator-economy.controller.ts`:

```typescript
import { Controller, Get, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatorEconomyService } from './creator-economy.service';
import { TipDto } from './dto/tip.dto';

@Controller('creator-economy')
@UseGuards(JwtAuthGuard)
export class CreatorEconomyController {
  constructor(private service: CreatorEconomyService) {}

  @Post('subscribe/:creatorId')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async subscribe(@Param('creatorId') creatorId: string, @Request() req) {
    return this.service.subscribe(req.user.id, creatorId);
  }

  @Post('unsubscribe/:creatorId')
  async unsubscribe(@Param('creatorId') creatorId: string, @Request() req) {
    return this.service.unsubscribe(req.user.id, creatorId);
  }

  @Get('subscriptions')
  async getSubscriptions(@Request() req) {
    return this.service.getSubscriptions(req.user.id);
  }

  @Get('subscribers')
  async getSubscribers(@Request() req) {
    return this.service.getSubscribers(req.user.id);
  }

  @Post('tip/:creatorId')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async tip(@Param('creatorId') creatorId: string, @Request() req, @Body() dto: TipDto) {
    return this.service.tip(req.user.id, creatorId, dto.xpAmount, dto.message);
  }

  @Get('earnings')
  async getEarnings(@Request() req) {
    return this.service.getEarnings(req.user.id);
  }

  @Get('check/:creatorId')
  async checkSubscription(@Param('creatorId') creatorId: string, @Request() req) {
    return this.service.checkSubscription(req.user.id, creatorId);
  }
}
```

- [ ] **Step 4: Create subscription renewal processor**

`apps/api/src/creator-economy/creator-economy.processor.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotifyService } from '../notify/notify.service';

@Injectable()
export class CreatorEconomyProcessor {
  private readonly logger = new Logger(CreatorEconomyProcessor.name);

  constructor(
    private prisma: PrismaService,
    private notifyService: NotifyService,
  ) {}

  @Cron('0 3 * * *') // daily at 03:00 UTC
  async renewSubscriptions() {
    this.logger.log('Processing subscription renewals...');
    const now = new Date();

    const expiredSubs = await this.prisma.creatorSubscription.findMany({
      where: { isActive: true, renewsAt: { lte: now } },
      include: {
        subscriber: { include: { progress: true } },
        creator: { include: { creatorProfile: true } },
      },
    });

    let renewed = 0;
    let expired = 0;

    for (const sub of expiredSubs) {
      const availableXP = (sub.subscriber.progress?.totalXP || 0) - (sub.subscriber.progress?.totalXPSpent || 0);
      const price = sub.xpPerMonth;

      if (availableXP >= price) {
        const creatorXP = Math.floor(price * 0.7);
        const newRenewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await this.prisma.$transaction([
          this.prisma.userProgress.update({
            where: { userId: sub.subscriberId },
            data: { totalXPSpent: { increment: price } },
          }),
          this.prisma.creatorProfile.update({
            where: { userId: sub.creatorId },
            data: {
              totalXPEarned: { increment: creatorXP },
              monthlyXPEarned: { increment: creatorXP },
            },
          }),
          this.prisma.creatorSubscription.update({
            where: { id: sub.id },
            data: { renewsAt: newRenewsAt },
          }),
        ]);
        renewed++;
      } else {
        await this.prisma.$transaction([
          this.prisma.creatorSubscription.update({
            where: { id: sub.id },
            data: { isActive: false },
          }),
          this.prisma.creatorProfile.update({
            where: { userId: sub.creatorId },
            data: { subscriberCount: { decrement: 1 } },
          }),
        ]);

        await this.notifyService.create(
          'SUBSCRIBER_NEW', sub.subscriberId, sub.creatorId,
          'Tvůj subscription expiroval — nemáš dost XP pro obnovu',
        );
        expired++;
      }
    }

    this.logger.log(`Subscriptions: ${renewed} renewed, ${expired} expired`);
  }
}
```

- [ ] **Step 5: Create module + register**

`apps/api/src/creator-economy/creator-economy.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CreatorEconomyController } from './creator-economy.controller';
import { CreatorEconomyService } from './creator-economy.service';
import { CreatorEconomyProcessor } from './creator-economy.processor';

@Module({
  controllers: [CreatorEconomyController],
  providers: [CreatorEconomyService, CreatorEconomyProcessor],
  exports: [CreatorEconomyService],
})
export class CreatorEconomyModule {}
```

Register `CreatorEconomyModule` in `app.module.ts`.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/creator-economy/ apps/api/src/app.module.ts
git commit -m "feat(api): add creator-economy module — XP subscriptions, tips, 70/30 split, daily renewal cron"
```

---

## Task 4: Smart Notifications v2 — Social Endpoints

**Files:**
- Modify: `apps/api/src/smart-notifications/smart-notifications.controller.ts`
- Modify: `apps/api/src/smart-notifications/smart-notifications.service.ts`

- [ ] **Step 1: Read existing files**

Read `apps/api/src/smart-notifications/smart-notifications.service.ts` and `smart-notifications.controller.ts` to see current structure.

- [ ] **Step 2: Add social notification methods to service**

Add to `smart-notifications.service.ts`:

```typescript
async getSocialNotifications(userId: string, cursor?: string, limit = 20) {
  return this.prisma.socialNotification.findMany({
    where: {
      userId,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      actor: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
    },
  });
}

async getUnreadCount(userId: string) {
  const count = await this.prisma.socialNotification.count({
    where: { userId, isRead: false },
  });
  return { unreadCount: count };
}

async markAsRead(notificationId: string, userId: string) {
  const notif = await this.prisma.socialNotification.findUnique({ where: { id: notificationId } });
  if (!notif || notif.userId !== userId) return { success: false };

  await this.prisma.socialNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return { success: true };
}

async markAllAsRead(userId: string) {
  await this.prisma.socialNotification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { success: true };
}
```

- [ ] **Step 3: Add endpoints to controller**

Add to `smart-notifications.controller.ts`:

```typescript
@Get('social')
async getSocial(@Request() req, @Query('cursor') cursor?: string) {
  return this.service.getSocialNotifications(req.user.id, cursor);
}

@Get('unread-count')
async getUnreadCount(@Request() req) {
  return this.service.getUnreadCount(req.user.id);
}

@Post(':id/read')
async markAsRead(@Param('id') id: string, @Request() req) {
  return this.service.markAsRead(id, req.user.id);
}

@Post('read-all')
async markAllAsRead(@Request() req) {
  return this.service.markAllAsRead(req.user.id);
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/smart-notifications/
git commit -m "feat(api): add social notification endpoints — list, unread count, mark read"
```

---

## Task 5: Wire Notifications into Existing Services

**Files:**
- Modify: `apps/api/src/posts/posts.service.ts`
- Modify: `apps/api/src/social/social.service.ts`

- [ ] **Step 1: Read existing files**

Read `posts.service.ts` and `social.service.ts` to see current structure and constructor injection pattern.

- [ ] **Step 2: Add NotifyService to PostsService**

In `posts.service.ts`, add `NotifyService` to constructor. Then in `toggleLike` (after creating like), add:

```typescript
const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
if (post) {
  const actor = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  await this.notifyService.createBatched(
    'POST_LIKED', post.userId, userId,
    `${actor?.name || 'Někdo'} lajknul tvůj post`,
    `{count} lidí lajklo tvůj post`,
    'post', postId,
  );
}
```

In `addComment` (after creating comment), add:

```typescript
const postData = await this.prisma.post.findUnique({ where: { id: postId }, select: { userId: true } });
if (postData) {
  const actor = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  await this.notifyService.createBatched(
    'POST_COMMENTED', postData.userId, userId,
    `${actor?.name || 'Někdo'} okomentoval tvůj post`,
    `{count} lidí okomentovalo tvůj post`,
    'post', postId,
  );
}
```

- [ ] **Step 3: Add NotifyService to SocialService**

In `social.service.ts`, find the follow method. After creating the Follow record, add:

```typescript
const actor = await this.prisma.user.findUnique({ where: { id: followerId }, select: { name: true } });
await this.notifyService.create(
  'NEW_FOLLOWER', followedId, followerId,
  `${actor?.name || 'Někdo'} tě začal sledovat`,
  'user', followerId,
);
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/posts/posts.service.ts apps/api/src/social/social.service.ts
git commit -m "feat(api): wire social notifications into posts (like, comment) and social (follow)"
```

---

## Task 6: Engagement Notifications Cron

**Files:**
- Modify: `apps/api/src/feed/feed.processor.ts`

- [ ] **Step 1: Read feed.processor.ts**

Read current file to see existing cron structure.

- [ ] **Step 2: Add engagement notification cron**

Add NotifyService to constructor. Add new cron method:

```typescript
@Cron('0 */2 * * *') // every 2 hours
async checkEngagementEvents() {
  this.logger.log('Checking engagement events...');
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  // POST_MILESTONE: posts that crossed 10/50/100/500 likes
  const milestoneThresholds = [10, 50, 100, 500];
  for (const threshold of milestoneThresholds) {
    const posts = await this.prisma.post.findMany({
      where: {
        likeCount: { gte: threshold },
        updatedAt: { gte: twoHoursAgo },
      },
      select: { id: true, userId: true, likeCount: true },
    });

    for (const post of posts) {
      await this.notifyService.create(
        'POST_MILESTONE', post.userId, post.userId,
        `Tvůj post dosáhl ${post.likeCount} likes!`,
        'post', post.id,
      );
    }
  }

  // BUDDY_WORKOUT: gym sessions completed in last 2h
  const recentSessions = await this.prisma.gymSession.findMany({
    where: { createdAt: { gte: twoHoursAgo } },
    select: { userId: true },
  });

  for (const session of recentSessions) {
    const buddies = await this.prisma.follow.findMany({
      where: { followedId: session.userId },
      select: { followerId: true },
      take: 50,
    });
    const actor = await this.prisma.user.findUnique({ where: { id: session.userId }, select: { name: true } });
    for (const buddy of buddies) {
      await this.notifyService.create(
        'BUDDY_WORKOUT', buddy.followerId, session.userId,
        `${actor?.name || 'Tvůj buddy'} právě dokončil trénink!`,
      );
    }
  }

  this.logger.log('Engagement events checked');
}
```

- [ ] **Step 3: Add scheduled post publisher cron**

```typescript
@Cron('* * * * *') // every minute
async publishScheduledPosts() {
  const now = new Date();
  const posts = await this.prisma.post.findMany({
    where: { isScheduled: true, publishAt: { lte: now } },
  });

  for (const post of posts) {
    await this.prisma.post.update({
      where: { id: post.id },
      data: { isScheduled: false },
    });
  }

  if (posts.length > 0) {
    this.logger.log(`Published ${posts.length} scheduled posts`);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/feed/feed.processor.ts
git commit -m "feat(api): add engagement notification cron + scheduled post publisher"
```

---

## Task 7: Feed Subscriber-Only Blur Logic

**Files:**
- Modify: `apps/api/src/feed/feed.service.ts`
- Modify: `apps/api/src/posts/posts.service.ts`

- [ ] **Step 1: Read feed.service.ts**

Read current file.

- [ ] **Step 2: Add subscriber check helper**

Add to `feed.service.ts`:

```typescript
private async isSubscribed(userId: string, creatorId: string): Promise<boolean> {
  const sub = await this.prisma.creatorSubscription.findUnique({
    where: { subscriberId_creatorId: { subscriberId: userId, creatorId } },
  });
  return !!sub?.isActive;
}

private async blurSubscriberOnlyPosts(posts: any[], userId: string) {
  const results = [];
  for (const post of posts) {
    if (post.isSubscriberOnly && post.userId !== userId) {
      const subscribed = await this.isSubscribed(userId, post.userId);
      if (!subscribed) {
        results.push({
          ...post,
          caption: null,
          photos: [],
          cardData: null,
          isBlurred: true,
        });
        continue;
      }
    }
    results.push({ ...post, isBlurred: false });
  }
  return results;
}
```

- [ ] **Step 3: Apply blur in feed methods**

In `getForYouFeed`, before returning, wrap: `return this.blurSubscriberOnlyPosts(diversified, userId);`

In `getFollowingFeed`, before returning: `return this.blurSubscriberOnlyPosts(posts, userId);`

In `getTrendingFeed`, add userId parameter and blur.

Also add `where: { isScheduled: false }` to all feed queries to exclude scheduled posts.

- [ ] **Step 4: Update feed controller**

Pass `req.user.id` to `getTrendingFeed`.

- [ ] **Step 5: Update PostsService.findById**

In `posts.service.ts`, add subscriber check for subscriber-only posts:

```typescript
if (post.isSubscriberOnly && post.userId !== currentUserId) {
  const sub = await this.prisma.creatorSubscription.findUnique({
    where: { subscriberId_creatorId: { subscriberId: currentUserId, creatorId: post.userId } },
  });
  if (!sub?.isActive) {
    return { ...post, caption: null, photos: [], cardData: null, isBlurred: true, isLiked };
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/feed/ apps/api/src/posts/posts.service.ts
git commit -m "feat(api): subscriber-only blur in feed + exclude scheduled posts"
```

---

## Task 8: Creator Dashboard Module

**Files:**
- Create: `apps/api/src/creator-dashboard/creator-dashboard.module.ts`
- Create: `apps/api/src/creator-dashboard/creator-dashboard.service.ts`
- Create: `apps/api/src/creator-dashboard/creator-dashboard.controller.ts`
- Create: `apps/api/src/creator-dashboard/dto/subscription-price.dto.ts`
- Create: `apps/api/src/creator-dashboard/dto/schedule-post.dto.ts`
- Create: `apps/api/src/creator-dashboard/dto/bulk-subscriber-only.dto.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create DTOs**

`dto/subscription-price.dto.ts`:
```typescript
import { IsInt, Min, Max } from 'class-validator';

export class SubscriptionPriceDto {
  @IsInt()
  @Min(100)
  @Max(5000)
  priceXP: number;
}
```

`dto/schedule-post.dto.ts`:
```typescript
import { IsString, IsOptional, IsEnum, IsArray, MaxLength, ArrayMaxSize, IsDateString } from 'class-validator';

export class SchedulePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  caption?: string;

  @IsEnum(['TEXT', 'PHOTO', 'AUTO_CARD'])
  type: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
  photoKeys?: string[];

  @IsDateString()
  publishAt: string;

  @IsOptional()
  isSubscriberOnly?: boolean;
}
```

`dto/bulk-subscriber-only.dto.ts`:
```typescript
import { IsArray, IsBoolean, IsString } from 'class-validator';

export class BulkSubscriberOnlyDto {
  @IsArray()
  @IsString({ each: true })
  postIds: string[];

  @IsBoolean()
  isSubscriberOnly: boolean;
}
```

- [ ] **Step 2: Create creator dashboard service**

`apps/api/src/creator-dashboard/creator-dashboard.service.ts`:

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CreatorDashboardService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getStats(creatorId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId: creatorId } });
    if (!profile || !profile.isApproved) throw new NotFoundException('Creator profile not found');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [subscriberCount, postCount, subscriberOnlyCount, recentPosts] = await Promise.all([
      this.prisma.creatorSubscription.count({ where: { creatorId, isActive: true } }),
      this.prisma.post.count({ where: { userId: creatorId, isScheduled: false } }),
      this.prisma.post.count({ where: { userId: creatorId, isSubscriberOnly: true } }),
      this.prisma.post.findMany({
        where: { userId: creatorId, isScheduled: false, createdAt: { gte: thirtyDaysAgo } },
        select: { likeCount: true, commentCount: true },
      }),
    ]);

    const totalEngagement = recentPosts.reduce((sum, p) => sum + p.likeCount + p.commentCount, 0);
    const engagementRate = recentPosts.length > 0 ? totalEngagement / recentPosts.length : 0;

    const topPost = await this.prisma.post.findFirst({
      where: { userId: creatorId, isScheduled: false },
      orderBy: { engagementScore: 'desc' },
      include: { photos: { take: 1, orderBy: { order: 'asc' } } },
    });

    return {
      subscribers: subscriberCount,
      monthlyXPEarned: profile.monthlyXPEarned,
      totalXPEarned: profile.totalXPEarned,
      posts: postCount,
      subscriberOnlyPosts: subscriberOnlyCount,
      engagementRate: Math.round(engagementRate * 100) / 100,
      topPost: topPost ? { id: topPost.id, caption: topPost.caption?.slice(0, 100), likeCount: topPost.likeCount, commentCount: topPost.commentCount, photo: topPost.photos[0]?.s3Key } : null,
    };
  }

  async getSubscriberGrowth(creatorId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const subs = await this.prisma.creatorSubscription.findMany({
      where: { creatorId, startedAt: { gte: since } },
      select: { startedAt: true, isActive: true },
    });

    const dailyData: Record<string, { newSubs: number; churn: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      dailyData[date] = { newSubs: 0, churn: 0 };
    }

    for (const sub of subs) {
      const date = sub.startedAt.toISOString().slice(0, 10);
      if (dailyData[date]) {
        dailyData[date].newSubs++;
        if (!sub.isActive) dailyData[date].churn++;
      }
    }

    return Object.entries(dailyData).sort().map(([date, data]) => ({ date, ...data }));
  }

  async getEarnings(creatorId: string, weeks = 12) {
    const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

    const tips = await this.prisma.creatorTip.findMany({
      where: { toCreatorId: creatorId, createdAt: { gte: since } },
      select: { xpAmount: true, createdAt: true },
    });

    const weeklyData: Record<string, { tips: number; subscriptions: number }> = {};
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const key = weekStart.toISOString().slice(0, 10);
      weeklyData[key] = { tips: 0, subscriptions: 0 };
    }

    for (const tip of tips) {
      const weekKey = Object.keys(weeklyData).find((k) => tip.createdAt >= new Date(k));
      if (weekKey && weeklyData[weekKey]) {
        weeklyData[weekKey].tips += Math.floor(tip.xpAmount * 0.7);
      }
    }

    return Object.entries(weeklyData).sort().map(([week, data]) => ({ week, ...data }));
  }

  async getPostPerformance(creatorId: string, limit = 20) {
    return this.prisma.post.findMany({
      where: { userId: creatorId, isScheduled: false },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, caption: true, type: true, likeCount: true,
        commentCount: true, engagementScore: true, isSubscriberOnly: true,
        createdAt: true,
      },
    });
  }

  async getTopHashtags(creatorId: string) {
    const posts = await this.prisma.post.findMany({
      where: { userId: creatorId },
      select: { hashtags: { include: { hashtag: true } } },
    });

    const tagCounts: Record<string, number> = {};
    for (const post of posts) {
      for (const ph of post.hashtags) {
        tagCounts[ph.hashtag.name] = (tagCounts[ph.hashtag.name] || 0) + 1;
      }
    }

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  async setSubscriptionPrice(creatorId: string, priceXP: number) {
    return this.prisma.creatorProfile.update({
      where: { userId: creatorId },
      data: { subscriptionPriceXP: priceXP },
    });
  }

  async pinPost(creatorId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId) throw new ForbiddenException();

    await this.prisma.post.updateMany({
      where: { userId: creatorId, isPinned: true },
      data: { isPinned: false },
    });

    return this.prisma.post.update({ where: { id: postId }, data: { isPinned: true } });
  }

  async unpinPost(creatorId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId) throw new ForbiddenException();
    return this.prisma.post.update({ where: { id: postId }, data: { isPinned: false } });
  }

  async schedulePost(creatorId: string, dto: any) {
    return this.prisma.post.create({
      data: {
        userId: creatorId,
        caption: dto.caption,
        type: dto.type,
        isScheduled: true,
        publishAt: new Date(dto.publishAt),
        isSubscriberOnly: dto.isSubscriberOnly || false,
        photos: dto.photoKeys?.length
          ? { create: dto.photoKeys.map((s3Key: string, i: number) => ({ s3Key, order: i })) }
          : undefined,
      },
      include: { photos: true },
    });
  }

  async updateScheduledPost(creatorId: string, postId: string, dto: any) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId || !post.isScheduled) throw new ForbiddenException();
    return this.prisma.post.update({
      where: { id: postId },
      data: { caption: dto.caption, publishAt: new Date(dto.publishAt) },
    });
  }

  async cancelScheduledPost(creatorId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId || !post.isScheduled) throw new ForbiddenException();
    return this.prisma.post.delete({ where: { id: postId } });
  }

  async publishNow(creatorId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId || !post.isScheduled) throw new ForbiddenException();
    return this.prisma.post.update({ where: { id: postId }, data: { isScheduled: false } });
  }

  async bulkSubscriberOnly(creatorId: string, postIds: string[], isSubscriberOnly: boolean) {
    await this.prisma.post.updateMany({
      where: { id: { in: postIds }, userId: creatorId },
      data: { isSubscriberOnly },
    });
    return { updated: postIds.length };
  }
}
```

- [ ] **Step 3: Create controller**

`apps/api/src/creator-dashboard/creator-dashboard.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatorDashboardService } from './creator-dashboard.service';
import { SubscriptionPriceDto } from './dto/subscription-price.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { BulkSubscriberOnlyDto } from './dto/bulk-subscriber-only.dto';

@Controller('creator-dashboard')
@UseGuards(JwtAuthGuard)
export class CreatorDashboardController {
  constructor(private service: CreatorDashboardService) {}

  @Get('stats')
  async getStats(@Request() req) { return this.service.getStats(req.user.id); }

  @Get('subscriber-growth')
  async getSubscriberGrowth(@Request() req, @Query('days') days?: string) {
    return this.service.getSubscriberGrowth(req.user.id, days ? parseInt(days) : 30);
  }

  @Get('earnings')
  async getEarnings(@Request() req, @Query('weeks') weeks?: string) {
    return this.service.getEarnings(req.user.id, weeks ? parseInt(weeks) : 12);
  }

  @Get('post-performance')
  async getPostPerformance(@Request() req, @Query('limit') limit?: string) {
    return this.service.getPostPerformance(req.user.id, limit ? parseInt(limit) : 20);
  }

  @Get('top-hashtags')
  async getTopHashtags(@Request() req) { return this.service.getTopHashtags(req.user.id); }

  @Put('subscription-price')
  async setPrice(@Request() req, @Body() dto: SubscriptionPriceDto) {
    return this.service.setSubscriptionPrice(req.user.id, dto.priceXP);
  }

  @Post('pin/:postId')
  async pin(@Param('postId') postId: string, @Request() req) {
    return this.service.pinPost(req.user.id, postId);
  }

  @Post('unpin/:postId')
  async unpin(@Param('postId') postId: string, @Request() req) {
    return this.service.unpinPost(req.user.id, postId);
  }

  @Post('schedule-post')
  async schedule(@Request() req, @Body() dto: SchedulePostDto) {
    return this.service.schedulePost(req.user.id, dto);
  }

  @Put('schedule/:postId')
  async updateSchedule(@Param('postId') postId: string, @Request() req, @Body() dto: SchedulePostDto) {
    return this.service.updateScheduledPost(req.user.id, postId, dto);
  }

  @Delete('schedule/:postId')
  async cancelSchedule(@Param('postId') postId: string, @Request() req) {
    return this.service.cancelScheduledPost(req.user.id, postId);
  }

  @Post('publish-now/:postId')
  async publishNow(@Param('postId') postId: string, @Request() req) {
    return this.service.publishNow(req.user.id, postId);
  }

  @Post('bulk-subscriber-only')
  async bulkSubscriberOnly(@Request() req, @Body() dto: BulkSubscriberOnlyDto) {
    return this.service.bulkSubscriberOnly(req.user.id, dto.postIds, dto.isSubscriberOnly);
  }
}
```

- [ ] **Step 4: Create module + register**

`apps/api/src/creator-dashboard/creator-dashboard.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CreatorDashboardController } from './creator-dashboard.controller';
import { CreatorDashboardService } from './creator-dashboard.service';

@Module({
  controllers: [CreatorDashboardController],
  providers: [CreatorDashboardService],
})
export class CreatorDashboardModule {}
```

Register in `app.module.ts`.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/creator-dashboard/ apps/api/src/app.module.ts
git commit -m "feat(api): add creator-dashboard module — stats, analytics, scheduled posts, pinning, bulk subscriber-only"
```

---

## Task 9: Frontend API Client + Components

**Files:**
- Create: `apps/web/src/lib/api/creator-economy.ts`
- Create: `apps/web/src/lib/api/notifications.ts`
- Modify: `apps/web/src/lib/api/index.ts`
- Create: `apps/web/src/components/v3/SubscriberBlur.tsx`
- Create: `apps/web/src/components/v3/TipModal.tsx`
- Modify: `apps/web/src/components/v3/index.ts`
- Modify: `apps/web/src/components/v3/PostCard.tsx`

- [ ] **Step 1: Create creator-economy API client**

`apps/web/src/lib/api/creator-economy.ts`:

```typescript
import { request } from './base';

export function subscribeToCreator(creatorId: string) {
  return request(`/creator-economy/subscribe/${creatorId}`, { method: 'POST' });
}
export function unsubscribeFromCreator(creatorId: string) {
  return request(`/creator-economy/unsubscribe/${creatorId}`, { method: 'POST' });
}
export function getMySubscriptions() { return request('/creator-economy/subscriptions'); }
export function getMySubscribers() { return request('/creator-economy/subscribers'); }
export function tipCreator(creatorId: string, xpAmount: number, message?: string) {
  return request(`/creator-economy/tip/${creatorId}`, {
    method: 'POST',
    body: JSON.stringify({ xpAmount, message }),
  });
}
export function getCreatorEarnings() { return request('/creator-economy/earnings'); }
export function checkSubscription(creatorId: string) {
  return request(`/creator-economy/check/${creatorId}`);
}

// Creator Dashboard
export function getDashboardStats() { return request('/creator-dashboard/stats'); }
export function getSubscriberGrowth(days = 30) { return request(`/creator-dashboard/subscriber-growth?days=${days}`); }
export function getDashboardEarnings(weeks = 12) { return request(`/creator-dashboard/earnings?weeks=${weeks}`); }
export function getPostPerformance(limit = 20) { return request(`/creator-dashboard/post-performance?limit=${limit}`); }
export function getTopHashtags() { return request('/creator-dashboard/top-hashtags'); }
export function setSubscriptionPrice(priceXP: number) {
  return request('/creator-dashboard/subscription-price', {
    method: 'PUT',
    body: JSON.stringify({ priceXP }),
  });
}
export function pinPost(postId: string) { return request(`/creator-dashboard/pin/${postId}`, { method: 'POST' }); }
export function unpinPost(postId: string) { return request(`/creator-dashboard/unpin/${postId}`, { method: 'POST' }); }
export function schedulePost(data: any) {
  return request('/creator-dashboard/schedule-post', { method: 'POST', body: JSON.stringify(data) });
}
export function cancelScheduledPost(postId: string) {
  return request(`/creator-dashboard/schedule/${postId}`, { method: 'DELETE' });
}
export function publishNow(postId: string) {
  return request(`/creator-dashboard/publish-now/${postId}`, { method: 'POST' });
}
export function bulkSubscriberOnly(postIds: string[], isSubscriberOnly: boolean) {
  return request('/creator-dashboard/bulk-subscriber-only', {
    method: 'POST',
    body: JSON.stringify({ postIds, isSubscriberOnly }),
  });
}
```

- [ ] **Step 2: Create notifications API client**

`apps/web/src/lib/api/notifications.ts`:

```typescript
import { request } from './base';

export function getSocialNotifications(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/smart-notifications/social${params}`);
}
export function getUnreadCount() { return request('/smart-notifications/unread-count'); }
export function markNotificationRead(id: string) {
  return request(`/smart-notifications/${id}/read`, { method: 'POST' });
}
export function markAllNotificationsRead() {
  return request('/smart-notifications/read-all', { method: 'POST' });
}
```

- [ ] **Step 3: Re-export from index.ts**

Add to `apps/web/src/lib/api/index.ts`:
```typescript
export * from './creator-economy';
export * from './notifications';
```

- [ ] **Step 4: Create SubscriberBlur component**

`apps/web/src/components/v3/SubscriberBlur.tsx`:

```tsx
'use client';

import { Button } from '@/components/v3';
import { subscribeToCreator } from '@/lib/api';

interface SubscriberBlurProps {
  creatorId: string;
  priceXP: number;
  onSubscribed?: () => void;
}

export function SubscriberBlur({ creatorId, priceXP, onSubscribed }: SubscriberBlurProps) {
  async function handleSubscribe() {
    await subscribeToCreator(creatorId);
    onSubscribed?.();
  }

  return (
    <div className="absolute inset-0 backdrop-blur-lg flex flex-col items-center justify-center gap-3 z-10">
      <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)">
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L19 8.27v7.46L12 19.82 5 15.73V8.27L12 4.18z"/>
        </svg>
      </div>
      <p className="text-[var(--text-1)] font-semibold">Subscriber Only</p>
      <p className="text-sm text-[var(--text-3)]">Subscribe for {priceXP} XP/month</p>
      <Button size="sm" onClick={handleSubscribe}>Subscribe</Button>
    </div>
  );
}
```

- [ ] **Step 5: Create TipModal component**

`apps/web/src/components/v3/TipModal.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/v3';
import { tipCreator } from '@/lib/api';

interface TipModalProps {
  creatorId: string;
  creatorName: string;
  onClose: () => void;
  onTipped?: () => void;
}

const PRESETS = [50, 100, 250, 500, 1000];

export function TipModal({ creatorId, creatorName, onClose, onTipped }: TipModalProps) {
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [custom, setCustom] = useState(false);

  async function handleSend() {
    if (amount < 10 || amount > 5000) return;
    setSending(true);
    try {
      await tipCreator(creatorId, amount, message || undefined);
      onTipped?.();
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="p-6 w-full max-w-sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-[var(--text-1)] mb-4">
          Tip pro {creatorName}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setAmount(p); setCustom(false); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                amount === p && !custom
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-1)] text-[var(--text-2)]'
              }`}
            >
              {p} XP
            </button>
          ))}
          <button
            onClick={() => setCustom(true)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              custom ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-1)] text-[var(--text-2)]'
            }`}
          >
            Custom
          </button>
        </div>

        {custom && (
          <input
            type="number"
            min={10}
            max={5000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-[var(--bg-1)] rounded-lg px-3 py-2 text-[var(--text-1)] mb-4 outline-none"
            placeholder="10-5000 XP"
          />
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Zpráva (volitelné)..."
          className="w-full bg-[var(--bg-1)] rounded-lg px-3 py-2 text-[var(--text-1)] mb-4 outline-none resize-none"
          rows={2}
          maxLength={200}
        />

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Zrušit</Button>
          <Button size="sm" onClick={handleSend} disabled={sending || amount < 10}>
            {sending ? 'Posílám...' : `Poslat ${amount} XP`}
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 6: Update PostCard with blur + pinned badge**

In `apps/web/src/components/v3/PostCard.tsx`, add:
- Import `SubscriberBlur`
- If `post.isBlurred`, render `<SubscriberBlur>` overlay over photos/caption area
- If `post.isPinned`, show small "Pinned" tag next to time

- [ ] **Step 7: Export new components from index.ts**

Add to `apps/web/src/components/v3/index.ts`:
```typescript
export { SubscriberBlur } from './SubscriberBlur';
export { TipModal } from './TipModal';
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/api/ apps/web/src/components/v3/
git commit -m "feat(web): add creator economy API client, SubscriberBlur, TipModal, PostCard blur/pin"
```

---

## Task 10: Creator Dashboard Page

**Files:**
- Create: `apps/web/src/app/(app)/creator-dashboard/page.tsx`

- [ ] **Step 1: Create creator dashboard page**

Full page with 3 sections:
- **A) Stats Hero** — 6 metrics in a grid using `Metric` component
- **B) Analytics** — BarChart for subscriber growth + earnings, table for post performance, chip cloud for hashtags
- **C) Content Tools** — scheduled posts list, pin toggle, subscriber-only batch toggle, subscription price slider

Use v3 components: `Card`, `SectionHeader`, `Metric`, `Sparkline`, `BarChart`, `Chip`, `Button`.
Import from `@/lib/api` all creator dashboard functions.
Check the actual v3 component APIs (especially `BarChart`, `Metric`, `Sparkline`) by reading their source files.

Page should be under 300 lines — split into sub-components if needed:
- `DashboardStats` section
- `DashboardAnalytics` section  
- `DashboardContentTools` section

- [ ] **Step 2: Add nav link**

In `apps/web/src/components/v2/V2Layout.tsx`, add "Creator Dashboard" to MORE_NAV for creators.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/\(app\)/creator-dashboard/ apps/web/src/components/v2/V2Layout.tsx
git commit -m "feat(web): add creator dashboard page — stats, analytics, content tools"
```

---

## Task 11: Notifications Page Refactor

**Files:**
- Modify: `apps/web/src/app/(app)/notifications/page.tsx`

- [ ] **Step 1: Read existing notifications page**

Read current file to understand structure.

- [ ] **Step 2: Refactor with social notifications**

Add:
- Filter tabs: Vše / Sociální / Trénink / Systém
- Social notification items with avatar, actor name, badge, message, time ago, read/unread
- "Mark all read" button
- Unread badge counter
- Import from `@/lib/api`: `getSocialNotifications`, `markNotificationRead`, `markAllNotificationsRead`, `getUnreadCount`

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/\(app\)/notifications/page.tsx
git commit -m "feat(web): refactor notifications page — social tabs, mark read, unread counter"
```

---

## Task 12: Mobile API + Screen Updates

**Files:**
- Modify: `apps/mobile/src/lib/api.ts`
- Modify: `apps/mobile/src/screens/CommunityScreen.tsx`

- [ ] **Step 1: Add API functions to mobile**

Add creator economy, notification, and dashboard functions to `apps/mobile/src/lib/api.ts`.

- [ ] **Step 2: Update CommunityScreen PostCard rendering**

Add subscriber-only blur overlay and tip button to post cards.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/lib/api.ts apps/mobile/src/screens/CommunityScreen.tsx
git commit -m "feat(mobile): add creator economy + notification API, subscriber blur on posts"
```

---

## Task 13: Docs + Regression Tests + Deploy

**Files:**
- Modify: `test-production.sh`
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`
- Modify: `MODULES.md`

- [ ] **Step 1: Add regression tests**

Add to `test-production.sh`:
```bash
# === Fitness Instagram Wave 2 ===
# Creator Economy
test_endpoint "GET" "/api/creator-economy/subscriptions" "200|401"
test_endpoint "GET" "/api/creator-economy/earnings" "200|401"
# Notifications
test_endpoint "GET" "/api/smart-notifications/social" "200|401"
test_endpoint "GET" "/api/smart-notifications/unread-count" "200|401"
# Creator Dashboard
test_endpoint "GET" "/api/creator-dashboard/stats" "200|401"
test_endpoint "GET" "/api/creator-dashboard/subscriber-growth" "200|401"
test_endpoint "GET" "/api/creator-dashboard/earnings" "200|401"
test_endpoint "GET" "/api/creator-dashboard/post-performance" "200|401"
# Pages
test_page "/creator-dashboard"
test_page "/notifications"
```

- [ ] **Step 2: Update CHANGELOG, ROADMAP, MODULES**

Add Wave 2 entries.

- [ ] **Step 3: Commit**

```bash
git add test-production.sh CHANGELOG.md ROADMAP.md MODULES.md
git commit -m "docs: update docs + regression tests for Fitness Instagram Wave 2"
```

- [ ] **Step 4: Deploy**

```bash
git push origin main
```
