# Fitness Instagram Wave 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform FitAI community into a full fitness social network with Instagram-style posts, algorithmic feed, hashtags, trending, verified badges, and promo cards.

**Architecture:** New `posts` NestJS module with dedicated Post model (separate from legacy ActivityFeedItem). Algorithmic feed uses Redis sorted sets with fan-out-on-write for normal users and fan-out-on-read for high-follower accounts. Background workers via `@nestjs/bull` + Redis for feed scoring and trending computation. Hashtags auto-parsed from captions. Verified badges as User model extension.

**Tech Stack:** NestJS 10, Prisma 5, PostgreSQL 16, Redis 7 (ioredis), `@nestjs/bull` (new), `@aws-sdk/s3-request-presigner`, Next.js 14 App Router, v3 design system components.

**Spec:** `docs/superpowers/specs/2026-04-30-fitness-instagram-wave1-design.md`

---

## File Structure

### Backend (apps/api/src/)

```
posts/
  posts.module.ts          — NestJS module, imports BullModule
  posts.controller.ts      — 8 endpoints (CRUD, like, comment, upload-url, user posts)
  posts.service.ts         — Post business logic, S3 presigned URLs, hashtag parsing
  dto/
    create-post.dto.ts     — caption, type, photoKeys[], cardData
    create-comment.dto.ts  — content

hashtags/
  hashtags.module.ts       — NestJS module
  hashtags.controller.ts   — 4 endpoints (trending, search, by-tag, suggested)
  hashtags.service.ts      — Trending computation, autocomplete, suggestions

feed/
  feed.module.ts           — NestJS module, imports BullModule
  feed.controller.ts       — 3 endpoints (for-you, following, trending)
  feed.service.ts          — Feed assembly, Redis sorted set reads, promo injection
  feed.processor.ts        — Bull processor: scoring worker, fan-out

promo/
  promo.module.ts          — NestJS module
  promo.controller.ts      — 5 endpoints (for-feed, dismiss, admin CRUD)
  promo.service.ts         — Audience targeting, dismiss tracking

admin/ (existing, extend)
  admin.controller.ts      — +2 endpoints (verify/unverify user)
  admin.service.ts         — +badge management methods
```

### Frontend (apps/web/src/)

```
lib/api/
  posts.ts                 — Post API client functions (new file)
  social.ts                — +feed endpoints (for-you, following, trending)
  hashtags.ts              — Hashtag API client functions (new file)

app/(app)/
  community/page.tsx       — Refactor: feed tabs, post composer, post cards
  trending/page.tsx         — New: trending hashtags + hot posts

components/v3/
  index.ts                 — +export Badge, PostCard, PostComposer
  Badge.tsx                — Verified/Creator badge component (new)
  PostCard.tsx             — Instagram-style post card (new)
  PostComposer.tsx         — Caption input + photo upload + hashtag suggestions (new)
```

---

## Task 1: Prisma Schema — Post, Hashtag, Badge, Promo Models

**Files:**
- Modify: `apps/api/prisma/schema.prisma` (append after line 2271, extend User model)

- [ ] **Step 1: Add enums to schema.prisma**

Add after the last enum in schema.prisma:

```prisma
enum PostType {
  TEXT
  PHOTO
  AUTO_CARD
}

enum TrendingPeriod {
  H24
  D7
}

enum BadgeType {
  NONE
  CREATOR
  VERIFIED
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

- [ ] **Step 2: Add Post and related models**

Append after the last model (OrganizationChallenge):

```prisma
model Post {
  id               String        @id @default(uuid())
  userId           String
  user             User          @relation(fields: [userId], references: [id])
  caption          String?       @db.VarChar(2000)
  type             PostType      @default(TEXT)
  cardData         Json?
  likeCount        Int           @default(0)
  commentCount     Int           @default(0)
  shareCount       Int           @default(0)
  engagementScore  Float         @default(0)
  isPublic         Boolean       @default(true)
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  photos           PostPhoto[]
  comments         PostComment[]
  likes            PostLike[]
  hashtags         PostHashtag[]

  @@index([userId, createdAt])
  @@index([engagementScore])
  @@index([createdAt])
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
  user      User     @relation("PostComments", fields: [userId], references: [id])
  content   String   @db.VarChar(1000)
  createdAt DateTime @default(now())

  @@index([postId, createdAt])
}

model PostLike {
  id     String @id @default(uuid())
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId String
  user   User   @relation("PostLikes", fields: [userId], references: [id])

  @@unique([postId, userId])
}

model Hashtag {
  id        String   @id @default(uuid())
  name      String   @unique
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
  id         String         @id @default(uuid())
  hashtagId  String
  hashtag    Hashtag        @relation(fields: [hashtagId], references: [id])
  period     TrendingPeriod
  score      Float
  rank       Int
  snapshotAt DateTime       @default(now())

  @@index([period, rank])
  @@index([snapshotAt])
}

model PromoCard {
  id             String        @id @default(uuid())
  type           PromoType
  title          String
  subtitle       String?
  ctaText        String
  ctaUrl         String
  imageS3Key     String?
  targetAudience PromoAudience @default(ALL)
  priority       Int           @default(5)
  isActive       Boolean       @default(true)
  startDate      DateTime      @default(now())
  endDate        DateTime?

  @@index([isActive, targetAudience])
}
```

- [ ] **Step 3: Extend User model with badge fields and relations**

Find the User model (line ~66) and add these fields after `updatedAt`:

```prisma
  badgeType       BadgeType @default(NONE)
  badgeVerifiedAt DateTime?
```

Add these relations inside User model:

```prisma
  posts           Post[]
  postComments    PostComment[]  @relation("PostComments")
  postLikes       PostLike[]     @relation("PostLikes")
```

- [ ] **Step 4: Push schema to database**

```bash
cd apps/api && npx prisma db push --accept-data-loss
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 5: Generate Prisma client**

```bash
cd apps/api && npx prisma generate
```

Expected: `Generated Prisma Client`

- [ ] **Step 6: Commit**

```bash
git add apps/api/prisma/schema.prisma
git commit -m "feat(schema): add Post, Hashtag, PromoCard models + User badge fields"
```

---

## Task 2: Bull Queue Infrastructure

**Files:**
- Modify: `apps/api/package.json` (add @nestjs/bull, bull)
- Create: `apps/api/src/feed/feed.module.ts`

No existing Bull setup in the project. Install and configure for background feed scoring.

- [ ] **Step 1: Install Bull dependencies**

```bash
cd apps/api && npm install @nestjs/bull bull
cd apps/api && npm install -D @types/bull
```

- [ ] **Step 2: Verify Redis connection config**

The existing `CacheService` in `apps/api/src/cache/cache.service.ts` connects to Redis via `REDIS_HOST` env var (default `localhost`). Bull will use the same connection.

Check `apps/api/src/app.module.ts` for the Redis host pattern:

```typescript
// Bull will use: { redis: { host: process.env.REDIS_HOST || 'localhost', port: 6379 } }
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/package.json package-lock.json
git commit -m "chore: add @nestjs/bull for background job processing"
```

---

## Task 3: Posts Module — Service + DTOs

**Files:**
- Create: `apps/api/src/posts/posts.module.ts`
- Create: `apps/api/src/posts/posts.service.ts`
- Create: `apps/api/src/posts/posts.controller.ts`
- Create: `apps/api/src/posts/dto/create-post.dto.ts`
- Create: `apps/api/src/posts/dto/create-comment.dto.ts`
- Modify: `apps/api/src/app.module.ts` (add PostsModule)

- [ ] **Step 1: Create DTOs**

`apps/api/src/posts/dto/create-post.dto.ts`:

```typescript
import { IsString, IsOptional, IsEnum, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';

export enum PostTypeDto {
  TEXT = 'TEXT',
  PHOTO = 'PHOTO',
  AUTO_CARD = 'AUTO_CARD',
}

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  caption?: string;

  @IsEnum(PostTypeDto)
  type: PostTypeDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
  photoKeys?: string[];

  @IsOptional()
  cardData?: Record<string, any>;
}
```

`apps/api/src/posts/dto/create-comment.dto.ts`:

```typescript
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}
```

- [ ] **Step 2: Create posts service**

`apps/api/src/posts/posts.service.ts`:

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostsService {
  private s3: S3Client;
  private bucket = process.env.S3_BUCKET || 'fitai-assets-production';

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'eu-west-1',
      requestChecksumCalculation: 'WHEN_REQUIRED' as any,
      responseChecksumValidation: 'WHEN_REQUIRED' as any,
    });
  }

  async getUploadUrls(userId: string, count: number, contentType: string) {
    const urls: { uploadUrl: string; s3Key: string }[] = [];
    for (let i = 0; i < Math.min(count, 4); i++) {
      const s3Key = `posts/${userId}/${crypto.randomUUID()}.${contentType === 'image/png' ? 'png' : 'jpg'}`;
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        ContentType: contentType,
      });
      const uploadUrl = await getSignedUrl(this.s3 as any, command as any, { expiresIn: 900 });
      urls.push({ uploadUrl, s3Key });
    }
    return urls;
  }

  async create(userId: string, dto: CreatePostDto) {
    const hashtags = this.parseHashtags(dto.caption || '');

    const post = await this.prisma.post.create({
      data: {
        userId,
        caption: dto.caption,
        type: dto.type,
        cardData: dto.cardData || undefined,
        photos: dto.photoKeys?.length
          ? {
              create: dto.photoKeys.map((s3Key, i) => ({
                s3Key,
                order: i,
              })),
            }
          : undefined,
      },
      include: { photos: true, user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } } },
    });

    if (hashtags.length > 0) {
      await this.linkHashtags(post.id, hashtags);
    }

    return post;
  }

  async findById(postId: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        comments: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } } },
        },
        hashtags: { include: { hashtag: true } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');

    let isLiked = false;
    if (currentUserId) {
      const like = await this.prisma.postLike.findUnique({
        where: { postId_userId: { postId, userId: currentUserId } },
      });
      isLiked = !!like;
    }

    return { ...post, isLiked };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException();

    await this.prisma.post.delete({ where: { id: postId } });
    return { deleted: true };
  }

  async toggleLike(postId: string, userId: string) {
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.postLike.delete({ where: { id: existing.id } });
      await this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    }

    await this.prisma.postLike.create({ data: { postId, userId } });
    await this.prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });
    return { liked: true };
  }

  async addComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = await this.prisma.postComment.create({
      data: { postId, userId, content: dto.content },
      include: { user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } } },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.postComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException();

    await this.prisma.postComment.delete({ where: { id: commentId } });
    await this.prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });
    return { deleted: true };
  }

  async getUserPosts(userId: string, cursor?: string, limit = 20) {
    const posts = await this.prisma.post.findMany({
      where: { userId, isPublic: true },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    return posts;
  }

  parseHashtags(text: string): string[] {
    const regex = /#([a-zA-Z0-9\u00C0-\u024F_]{1,50})/g;
    const tags: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      tags.push(match[1].toLowerCase());
    }
    return [...new Set(tags)];
  }

  private async linkHashtags(postId: string, tagNames: string[]) {
    for (const name of tagNames) {
      const hashtag = await this.prisma.hashtag.upsert({
        where: { name },
        create: { name },
        update: { postCount: { increment: 1 } },
      });
      await this.prisma.postHashtag.create({
        data: { postId, hashtagId: hashtag.id },
      });
    }
  }
}
```

- [ ] **Step 3: Create posts controller**

`apps/api/src/posts/posts.controller.ts`:

```typescript
import { Controller, Get, Post, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('upload-url')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async getUploadUrl(
    @Request() req,
    @Body() body: { count: number; contentType: string },
  ) {
    return this.postsService.getUploadUrls(req.user.id, body.count || 1, body.contentType || 'image/jpeg');
  }

  @Post()
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async create(@Request() req, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.user.id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.postsService.findById(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.postsService.deletePost(id, req.user.id);
  }

  @Post(':id/like')
  async toggleLike(@Param('id') id: string, @Request() req) {
    return this.postsService.toggleLike(id, req.user.id);
  }

  @Post(':id/comment')
  async addComment(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.addComment(id, req.user.id, dto);
  }

  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.postsService.deleteComment(commentId, req.user.id);
  }

  @Get('user/:userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.postsService.getUserPosts(userId, cursor);
  }
}
```

- [ ] **Step 4: Create posts module**

`apps/api/src/posts/posts.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

- [ ] **Step 5: Register PostsModule in app.module.ts**

In `apps/api/src/app.module.ts`, add import:

```typescript
import { PostsModule } from './posts/posts.module';
```

Add `PostsModule` to the `imports` array.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/posts/
git add apps/api/src/app.module.ts
git commit -m "feat(api): add posts module — CRUD, likes, comments, photo upload, hashtag parsing"
```

---

## Task 4: Hashtags Module

**Files:**
- Create: `apps/api/src/hashtags/hashtags.module.ts`
- Create: `apps/api/src/hashtags/hashtags.service.ts`
- Create: `apps/api/src/hashtags/hashtags.controller.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create hashtags service**

`apps/api/src/hashtags/hashtags.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class HashtagsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getTrending(period: 'H24' | 'D7' = 'H24') {
    const cacheKey = `trending:${period}`;
    return this.cache.getOrSet(cacheKey, 3600, async () => {
      const snapshots = await this.prisma.trendingSnapshot.findMany({
        where: { period },
        orderBy: { rank: 'asc' },
        take: 20,
        include: { hashtag: true },
      });
      return snapshots.map((s) => ({
        name: s.hashtag.name,
        postCount: s.hashtag.postCount,
        score: s.score,
        rank: s.rank,
      }));
    });
  }

  async search(query: string) {
    const hashtags = await this.prisma.hashtag.findMany({
      where: { name: { startsWith: query.toLowerCase() } },
      orderBy: { postCount: 'desc' },
      take: 10,
    });
    return hashtags;
  }

  async getPostsByHashtag(name: string, cursor?: string, limit = 20) {
    const hashtag = await this.prisma.hashtag.findUnique({ where: { name: name.toLowerCase() } });
    if (!hashtag) return { hashtag: null, posts: [] };

    const postHashtags = await this.prisma.postHashtag.findMany({
      where: { hashtagId: hashtag.id },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { postId_hashtagId: { postId: cursor, hashtagId: hashtag.id } } } : {}),
      include: {
        post: {
          include: {
            photos: { orderBy: { order: 'asc' } },
            user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
          },
        },
      },
      orderBy: { post: { createdAt: 'desc' } },
    });

    return {
      hashtag: { name: hashtag.name, postCount: hashtag.postCount },
      posts: postHashtags.map((ph) => ph.post),
    };
  }

  async getSuggested() {
    return this.cache.getOrSet('hashtags:suggested', 3600, async () => {
      const popular = await this.prisma.hashtag.findMany({
        orderBy: { postCount: 'desc' },
        take: 15,
      });
      return popular;
    });
  }

  async computeTrending() {
    const now = new Date();
    const h24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const d7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const { period, since } of [
      { period: 'H24' as const, since: h24Ago },
      { period: 'D7' as const, since: d7Ago },
    ]) {
      const counts = await this.prisma.$queryRaw<{ hashtagId: string; cnt: bigint }[]>`
        SELECT ph."hashtagId", COUNT(*) as cnt
        FROM "PostHashtag" ph
        JOIN "Post" p ON p.id = ph."postId"
        WHERE p."createdAt" >= ${since}
        GROUP BY ph."hashtagId"
        ORDER BY cnt DESC
        LIMIT 20
      `;

      await this.prisma.trendingSnapshot.deleteMany({ where: { period } });

      for (let i = 0; i < counts.length; i++) {
        const hashtag = await this.prisma.hashtag.findUnique({ where: { id: counts[i].hashtagId } });
        if (!hashtag) continue;

        const recentUses = Number(counts[i].cnt);
        const score = recentUses / Math.log(1 + hashtag.postCount);

        await this.prisma.trendingSnapshot.create({
          data: {
            hashtagId: counts[i].hashtagId,
            period,
            score,
            rank: i + 1,
          },
        });
      }

      await this.cache.del(`trending:${period}`);
    }
  }
}
```

- [ ] **Step 2: Create hashtags controller**

`apps/api/src/hashtags/hashtags.controller.ts`:

```typescript
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HashtagsService } from './hashtags.service';

@Controller('hashtags')
@UseGuards(JwtAuthGuard)
export class HashtagsController {
  constructor(private hashtagsService: HashtagsService) {}

  @Get('trending')
  async getTrending(@Query('period') period?: string) {
    const p = period === 'D7' ? 'D7' : 'H24';
    return this.hashtagsService.getTrending(p);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.length < 1) return [];
    return this.hashtagsService.search(query);
  }

  @Get('suggested')
  async getSuggested() {
    return this.hashtagsService.getSuggested();
  }

  @Get(':name/posts')
  async getByHashtag(
    @Param('name') name: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.hashtagsService.getPostsByHashtag(name, cursor);
  }
}
```

- [ ] **Step 3: Create hashtags module**

`apps/api/src/hashtags/hashtags.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { HashtagsController } from './hashtags.controller';
import { HashtagsService } from './hashtags.service';

@Module({
  controllers: [HashtagsController],
  providers: [HashtagsService],
  exports: [HashtagsService],
})
export class HashtagsModule {}
```

- [ ] **Step 4: Register in app.module.ts**

Add `import { HashtagsModule } from './hashtags/hashtags.module';` and add `HashtagsModule` to imports.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/hashtags/
git add apps/api/src/app.module.ts
git commit -m "feat(api): add hashtags module — trending, search, by-tag, suggested, computation"
```

---

## Task 5: Feed Module — Algorithmic Feed + Background Worker

**Files:**
- Create: `apps/api/src/feed/feed.module.ts`
- Create: `apps/api/src/feed/feed.service.ts`
- Create: `apps/api/src/feed/feed.controller.ts`
- Create: `apps/api/src/feed/feed.processor.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create feed service**

`apps/api/src/feed/feed.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getForYouFeed(userId: string, cursor?: string, limit = 20) {
    const cacheKey = `feed:foryou:${userId}`;

    const followedIds = await this.getFollowedIds(userId);

    if (followedIds.length < 5) {
      return this.getChronologicalPublic(cursor, limit);
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await this.prisma.post.findMany({
      where: {
        isPublic: true,
        createdAt: { gte: sevenDaysAgo },
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      take: 200,
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });

    const scored = posts.map((post) => {
      const hoursAge = (Date.now() - post.createdAt.getTime()) / 3600000;
      const timeDecay = 1 / (1 + hoursAge * 0.1);

      let sourceWeight = 0.5;
      if (followedIds.includes(post.userId)) sourceWeight = 2.0;
      else if (post.engagementScore > 10) sourceWeight = 1.5;
      else if (post.hashtags.some((h) => ['tutorial', 'tip', 'howto'].includes(h.hashtag.name))) sourceWeight = 1.0;

      const score = post.engagementScore * sourceWeight * timeDecay;
      return { ...post, feedScore: score };
    });

    scored.sort((a, b) => b.feedScore - a.feedScore);

    return scored.slice(0, limit);
  }

  async getFollowingFeed(userId: string, cursor?: string, limit = 20) {
    const followedIds = await this.getFollowedIds(userId);

    const posts = await this.prisma.post.findMany({
      where: {
        userId: { in: [userId, ...followedIds] },
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });

    return posts;
  }

  async getTrendingFeed(cursor?: string, limit = 20) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const posts = await this.prisma.post.findMany({
      where: {
        isPublic: true,
        createdAt: { gte: oneDayAgo },
        ...(cursor ? { engagementScore: { lt: parseFloat(cursor) } } : {}),
      },
      take: limit,
      orderBy: { engagementScore: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });

    return posts;
  }

  private async getFollowedIds(userId: string): Promise<string[]> {
    return this.cache.getOrSet(`following:${userId}`, 300, async () => {
      const follows = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followedId: true },
      });
      return follows.map((f) => f.followedId);
    });
  }

  private async getChronologicalPublic(cursor?: string, limit = 20) {
    return this.prisma.post.findMany({
      where: {
        isPublic: true,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });
  }
}
```

- [ ] **Step 2: Create feed processor (background worker)**

`apps/api/src/feed/feed.processor.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { HashtagsService } from '../hashtags/hashtags.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class FeedProcessor {
  private readonly logger = new Logger(FeedProcessor.name);

  constructor(
    private prisma: PrismaService,
    private hashtagsService: HashtagsService,
    private cache: CacheService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async recomputeEngagementScores() {
    this.logger.log('Recomputing engagement scores...');
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const posts = await this.prisma.post.findMany({
      where: { createdAt: { gte: twoDaysAgo } },
      select: { id: true, likeCount: true, commentCount: true, shareCount: true },
    });

    for (const post of posts) {
      const score = post.likeCount * 1 + post.commentCount * 3 + post.shareCount * 5;
      await this.prisma.post.update({
        where: { id: post.id },
        data: { engagementScore: score },
      });
    }

    this.logger.log(`Updated engagement scores for ${posts.length} posts`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async recomputeTrending() {
    this.logger.log('Recomputing trending hashtags...');
    await this.hashtagsService.computeTrending();
    this.logger.log('Trending hashtags updated');
  }
}
```

- [ ] **Step 3: Create feed controller**

`apps/api/src/feed/feed.controller.ts`:

```typescript
import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from './feed.service';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get('for-you')
  async getForYou(@Request() req, @Query('cursor') cursor?: string) {
    return this.feedService.getForYouFeed(req.user.id, cursor);
  }

  @Get('following')
  async getFollowing(@Request() req, @Query('cursor') cursor?: string) {
    return this.feedService.getFollowingFeed(req.user.id, cursor);
  }

  @Get('trending')
  async getTrending(@Query('cursor') cursor?: string) {
    return this.feedService.getTrendingFeed(cursor);
  }
}
```

- [ ] **Step 4: Create feed module**

`apps/api/src/feed/feed.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedProcessor } from './feed.processor';
import { HashtagsModule } from '../hashtags/hashtags.module';

@Module({
  imports: [HashtagsModule],
  controllers: [FeedController],
  providers: [FeedService, FeedProcessor],
  exports: [FeedService],
})
export class FeedModule {}
```

- [ ] **Step 5: Register in app.module.ts**

Add `import { FeedModule } from './feed/feed.module';` and add `FeedModule` to imports.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/feed/
git add apps/api/src/app.module.ts
git commit -m "feat(api): add feed module — algorithmic for-you, following, trending + background scoring"
```

---

## Task 6: Promo Cards Module

**Files:**
- Create: `apps/api/src/promo/promo.module.ts`
- Create: `apps/api/src/promo/promo.service.ts`
- Create: `apps/api/src/promo/promo.controller.ts`
- Create: `apps/api/src/promo/dto/create-promo.dto.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create promo DTO**

`apps/api/src/promo/dto/create-promo.dto.ts`:

```typescript
import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, Min, Max, IsDateString } from 'class-validator';

export class CreatePromoDto {
  @IsEnum(['FEATURE_DISCOVERY', 'UPGRADE', 'CHALLENGE', 'CONTENT'])
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  ctaText: string;

  @IsString()
  ctaUrl: string;

  @IsOptional()
  @IsString()
  imageS3Key?: string;

  @IsOptional()
  @IsEnum(['ALL', 'FREE_TIER', 'NO_STREAK', 'NEW_USER', 'NO_MEAL_PLAN', 'NO_JOURNAL'])
  targetAudience?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
```

- [ ] **Step 2: Create promo service**

`apps/api/src/promo/promo.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class PromoService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getForFeed(userId: string, limit = 3) {
    const dismissedKey = `promo:dismissed:${userId}`;
    const dismissed: string[] = (await this.cache.get<string[]>(dismissedKey)) || [];

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, createdAt: true },
      // simplified audience matching
    });

    const now = new Date();
    const promos = await this.prisma.promoCard.findMany({
      where: {
        isActive: true,
        id: { notIn: dismissed },
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { priority: 'desc' },
      take: limit * 2,
    });

    return promos.slice(0, limit);
  }

  async dismiss(userId: string, promoId: string) {
    const key = `promo:dismissed:${userId}`;
    const dismissed: string[] = (await this.cache.get<string[]>(key)) || [];
    dismissed.push(promoId);
    await this.cache.set(key, dismissed, 30 * 24 * 3600); // 30 days
    return { dismissed: true };
  }

  async create(data: any) {
    return this.prisma.promoCard.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.promoCard.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.promoCard.delete({ where: { id } });
  }
}
```

- [ ] **Step 3: Create promo controller**

`apps/api/src/promo/promo.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PromoService } from './promo.service';
import { CreatePromoDto } from './dto/create-promo.dto';

@Controller('promo')
@UseGuards(JwtAuthGuard)
export class PromoController {
  constructor(private promoService: PromoService) {}

  @Get('for-feed')
  async getForFeed(@Request() req) {
    return this.promoService.getForFeed(req.user.id);
  }

  @Post(':id/dismiss')
  async dismiss(@Param('id') id: string, @Request() req) {
    return this.promoService.dismiss(req.user.id, id);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreatePromoDto) {
    if (!req.user.isAdmin) throw new ForbiddenException();
    return this.promoService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() dto: CreatePromoDto) {
    if (!req.user.isAdmin) throw new ForbiddenException();
    return this.promoService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    if (!req.user.isAdmin) throw new ForbiddenException();
    return this.promoService.remove(id);
  }
}
```

- [ ] **Step 4: Create promo module**

`apps/api/src/promo/promo.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PromoController } from './promo.controller';
import { PromoService } from './promo.service';

@Module({
  controllers: [PromoController],
  providers: [PromoService],
  exports: [PromoService],
})
export class PromoModule {}
```

- [ ] **Step 5: Register in app.module.ts + seed initial promo cards**

Add `PromoModule` to imports. Seed 8 promo cards in `FeedProcessor.onApplicationBootstrap()` or separate seed script.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/promo/
git add apps/api/src/app.module.ts
git commit -m "feat(api): add promo module — feed injection, dismiss, admin CRUD"
```

---

## Task 7: Admin Badge Endpoints

**Files:**
- Modify: `apps/api/src/admin/admin.controller.ts`
- Modify: `apps/api/src/admin/admin.service.ts`

- [ ] **Step 1: Add verify/unverify methods to admin service**

In `apps/api/src/admin/admin.service.ts`, add:

```typescript
async verifyUser(userId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { badgeType: 'VERIFIED', badgeVerifiedAt: new Date() },
  });
}

async unverifyUser(userId: string) {
  const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
  const badgeType = creator?.isApproved ? 'CREATOR' : 'NONE';
  return this.prisma.user.update({
    where: { id: userId },
    data: { badgeType, badgeVerifiedAt: null },
  });
}
```

- [ ] **Step 2: Add endpoints to admin controller**

In `apps/api/src/admin/admin.controller.ts`, add:

```typescript
@Post('verify-user/:userId')
async verifyUser(@Param('userId') userId: string, @Request() req) {
  if (!req.user.isAdmin) throw new ForbiddenException();
  return this.adminService.verifyUser(userId);
}

@Post('unverify-user/:userId')
async unverifyUser(@Param('userId') userId: string, @Request() req) {
  if (!req.user.isAdmin) throw new ForbiddenException();
  return this.adminService.unverifyUser(userId);
}
```

- [ ] **Step 3: Auto-set CREATOR badge on creator approval**

In `apps/api/src/creators/creators.service.ts`, find the approval logic and add after `isApproved: true` update:

```typescript
await this.prisma.user.update({
  where: { id: userId },
  data: { badgeType: 'CREATOR' },
});
```

Only set if current `badgeType` is `NONE` (don't downgrade VERIFIED).

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/admin/ apps/api/src/creators/
git commit -m "feat(api): add verified/creator badge management — admin endpoints + auto-set on creator approval"
```

---

## Task 8: Seed Promo Cards

**Files:**
- Create: `apps/api/prisma/promo-seed.ts`
- Modify: `apps/api/prisma/seed.ts` (add import)

- [ ] **Step 1: Create promo seed data**

`apps/api/prisma/promo-seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

export async function seedPromoCards(prisma: PrismaClient) {
  const promos = [
    { type: 'FEATURE_DISCOVERY', title: 'Zkus AI Chat Coach', subtitle: 'Alex ti poradí s tréninkem', ctaText: 'Vyzkoušet', ctaUrl: '/ai-chat', targetAudience: 'ALL', priority: 8 },
    { type: 'FEATURE_DISCOVERY', title: 'Vytvoř si jídelníček', subtitle: 'AI vygeneruje 7denní plán', ctaText: 'Vytvořit', ctaUrl: '/jidelnicek', targetAudience: 'NO_MEAL_PLAN', priority: 7 },
    { type: 'FEATURE_DISCOVERY', title: 'Zapiš do deníku', subtitle: 'Sleduj svůj pokrok den po dni', ctaText: 'Zapsat', ctaUrl: '/journal', targetAudience: 'NO_JOURNAL', priority: 6 },
    { type: 'CHALLENGE', title: 'Přidej se k výzvě', subtitle: 'Soutěž s komunitou', ctaText: 'Prozkoumat', ctaUrl: '/community', targetAudience: 'ALL', priority: 5 },
    { type: 'UPGRADE', title: 'Upgrade na Premium', subtitle: 'Odemkni vše za 399 Kč/měs', ctaText: 'Upgradovat', ctaUrl: '/pricing', targetAudience: 'FREE_TIER', priority: 9 },
    { type: 'CONTENT', title: 'Sdílej svůj trénink', subtitle: 'Ukaž komunitě co dokážeš', ctaText: 'Sdílet', ctaUrl: '/community', targetAudience: 'ALL', priority: 4 },
    { type: 'FEATURE_DISCOVERY', title: 'Zkontroluj Fitness Score', subtitle: 'Jak jsi na tom? 0-100', ctaText: 'Zjistit', ctaUrl: '/fitness-score', targetAudience: 'ALL', priority: 6 },
    { type: 'FEATURE_DISCOVERY', title: 'Pozvi kamaráda', subtitle: 'Trénink ve dvou je lepší', ctaText: 'Pozvat', ctaUrl: '/gym-buddy', targetAudience: 'ALL', priority: 3 },
  ];

  for (const promo of promos) {
    await prisma.promoCard.upsert({
      where: { id: promo.title }, // won't match, will always create
      update: {},
      create: promo as any,
    });
  }
}
```

- [ ] **Step 2: Wire into seed.ts**

In `apps/api/prisma/seed.ts`, add import and call at the end:

```typescript
import { seedPromoCards } from './promo-seed';
// ... at end of main():
await seedPromoCards(prisma);
```

- [ ] **Step 3: Run seed**

```bash
cd apps/api && npx prisma db seed
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/prisma/promo-seed.ts apps/api/prisma/seed.ts
git commit -m "feat(seed): add 8 initial promo cards for feed injection"
```

---

## Task 9: Frontend — API Client Functions

**Files:**
- Create: `apps/web/src/lib/api/posts.ts`
- Create: `apps/web/src/lib/api/hashtags.ts`
- Modify: `apps/web/src/lib/api/social.ts` (add feed endpoints)
- Modify: `apps/web/src/lib/api/index.ts` (re-export)

- [ ] **Step 1: Create posts API client**

`apps/web/src/lib/api/posts.ts`:

```typescript
import { request } from './base';

export interface PostAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  badgeType: 'NONE' | 'CREATOR' | 'VERIFIED';
}

export interface PostPhoto {
  id: string;
  s3Key: string;
  width: number | null;
  height: number | null;
  order: number;
}

export interface PostData {
  id: string;
  userId: string;
  user: PostAuthor;
  caption: string | null;
  type: 'TEXT' | 'PHOTO' | 'AUTO_CARD';
  cardData: any;
  photos: PostPhoto[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  hashtags?: { hashtag: { name: string } }[];
  createdAt: string;
}

export interface PostCommentData {
  id: string;
  content: string;
  user: PostAuthor;
  createdAt: string;
}

export function getUploadUrls(count: number, contentType = 'image/jpeg') {
  return request('/api/posts/upload-url', {
    method: 'POST',
    body: JSON.stringify({ count, contentType }),
  });
}

export function createPost(data: { caption?: string; type: string; photoKeys?: string[]; cardData?: any }) {
  return request('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getPost(id: string): Promise<PostData> {
  return request(`/api/posts/${id}`);
}

export function deletePost(id: string) {
  return request(`/api/posts/${id}`, { method: 'DELETE' });
}

export function togglePostLike(id: string) {
  return request(`/api/posts/${id}/like`, { method: 'POST' });
}

export function addPostComment(id: string, content: string) {
  return request(`/api/posts/${id}/comment`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function deletePostComment(commentId: string) {
  return request(`/api/posts/comments/${commentId}`, { method: 'DELETE' });
}

export function getUserPosts(userId: string, cursor?: string): Promise<PostData[]> {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/api/posts/user/${userId}${params}`);
}
```

- [ ] **Step 2: Create hashtags API client**

`apps/web/src/lib/api/hashtags.ts`:

```typescript
import { request } from './base';

export interface HashtagData {
  id: string;
  name: string;
  postCount: number;
}

export interface TrendingHashtag {
  name: string;
  postCount: number;
  score: number;
  rank: number;
}

export function getTrendingHashtags(period: '24h' | '7d' = '24h'): Promise<TrendingHashtag[]> {
  return request(`/api/hashtags/trending?period=${period === '7d' ? 'D7' : 'H24'}`);
}

export function searchHashtags(query: string): Promise<HashtagData[]> {
  return request(`/api/hashtags/search?q=${encodeURIComponent(query)}`);
}

export function getSuggestedHashtags(): Promise<HashtagData[]> {
  return request('/api/hashtags/suggested');
}

export function getPostsByHashtag(name: string, cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/api/hashtags/${encodeURIComponent(name)}/posts${params}`);
}
```

- [ ] **Step 3: Add feed endpoints to social.ts**

In `apps/web/src/lib/api/social.ts`, add:

```typescript
export function getForYouFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/api/feed/for-you${params}`);
}

export function getFollowingFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/api/feed/following${params}`);
}

export function getTrendingFeed(cursor?: string) {
  const params = cursor ? `?cursor=${cursor}` : '';
  return request(`/api/feed/trending${params}`);
}

export function getPromoCards() {
  return request('/api/promo/for-feed');
}

export function dismissPromo(id: string) {
  return request(`/api/promo/${id}/dismiss`, { method: 'POST' });
}
```

- [ ] **Step 4: Re-export from index.ts**

In `apps/web/src/lib/api/index.ts`, add:

```typescript
export * from './posts';
export * from './hashtags';
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/api/posts.ts apps/web/src/lib/api/hashtags.ts
git add apps/web/src/lib/api/social.ts apps/web/src/lib/api/index.ts
git commit -m "feat(web): add API client functions for posts, hashtags, feed, promo"
```

---

## Task 10: Frontend — v3 Badge Component

**Files:**
- Create: `apps/web/src/components/v3/Badge.tsx`
- Modify: `apps/web/src/components/v3/index.ts`

- [ ] **Step 1: Create Badge component**

`apps/web/src/components/v3/Badge.tsx`:

```tsx
'use client';

interface BadgeProps {
  type: 'NONE' | 'CREATOR' | 'VERIFIED';
  size?: number;
}

export function Badge({ type, size = 16 }: BadgeProps) {
  if (type === 'NONE') return null;

  if (type === 'CREATOR') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: '#E85D2C' }}
        title="Creator"
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 12 12" fill="none">
          <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="white" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: '#3B82F6' }}
      title="Verified"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
```

- [ ] **Step 2: Export from index.ts**

In `apps/web/src/components/v3/index.ts`, add:

```typescript
export { Badge } from './Badge';
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/v3/Badge.tsx apps/web/src/components/v3/index.ts
git commit -m "feat(web): add v3 Badge component — Creator (orange star) + Verified (blue check)"
```

---

## Task 11: Frontend — PostComposer Component

**Files:**
- Create: `apps/web/src/components/v3/PostComposer.tsx`
- Modify: `apps/web/src/components/v3/index.ts`

- [ ] **Step 1: Create PostComposer**

`apps/web/src/components/v3/PostComposer.tsx`:

```tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, Button, Chip } from '@/components/v3';
import { createPost, getUploadUrls, searchHashtags } from '@/lib/api';

interface PostComposerProps {
  onPostCreated: () => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const [caption, setCaption] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<{ name: string }[]>([]);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCaptionChange = useCallback(async (value: string) => {
    setCaption(value);
    const hashMatch = value.match(/#(\w{2,})$/);
    if (hashMatch) {
      const results = await searchHashtags(hashMatch[1]).catch(() => []);
      setSuggestedTags(results.slice(0, 5));
    } else {
      setSuggestedTags([]);
    }
  }, []);

  const handleTagSelect = useCallback((tagName: string) => {
    setCaption((prev) => prev.replace(/#\w*$/, `#${tagName} `));
    setSuggestedTags([]);
  }, []);

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setPhotos(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }, []);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!caption.trim() && photos.length === 0) return;
    setPosting(true);

    try {
      let photoKeys: string[] = [];

      if (photos.length > 0) {
        const urls = await getUploadUrls(photos.length);
        for (let i = 0; i < photos.length; i++) {
          await fetch(urls[i].uploadUrl, {
            method: 'PUT',
            body: photos[i],
            headers: { 'Content-Type': photos[i].type },
          });
          photoKeys.push(urls[i].s3Key);
        }
      }

      await createPost({
        caption: caption.trim() || undefined,
        type: photoKeys.length > 0 ? 'PHOTO' : 'TEXT',
        photoKeys: photoKeys.length > 0 ? photoKeys : undefined,
      });

      setCaption('');
      setPhotos([]);
      setPreviews([]);
      onPostCreated();
    } finally {
      setPosting(false);
    }
  }, [caption, photos, onPostCreated]);

  return (
    <Card className="p-4 mb-6">
      <textarea
        value={caption}
        onChange={(e) => handleCaptionChange(e.target.value)}
        placeholder="Co je nového? Použij #hashtagy..."
        className="w-full bg-transparent border-none outline-none resize-none text-[var(--text-1)]"
        rows={3}
        maxLength={2000}
      />

      {suggestedTags.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {suggestedTags.map((tag) => (
            <Chip key={tag.name} onClick={() => handleTagSelect(tag.name)}>
              #{tag.name}
            </Chip>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <div className="flex gap-2 mt-3">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20">
              <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
              <button
                onClick={() => handleRemovePhoto(i)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-1)]">
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            Fotka
          </Button>
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={posting || (!caption.trim() && photos.length === 0)}>
          {posting ? 'Publikuji...' : 'Publikovat'}
        </Button>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Export from index.ts**

Add to `apps/web/src/components/v3/index.ts`:

```typescript
export { PostComposer } from './PostComposer';
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/v3/PostComposer.tsx apps/web/src/components/v3/index.ts
git commit -m "feat(web): add v3 PostComposer — caption with hashtag autocomplete + photo upload"
```

---

## Task 12: Frontend — PostCard Component

**Files:**
- Create: `apps/web/src/components/v3/PostCard.tsx`
- Modify: `apps/web/src/components/v3/index.ts`

- [ ] **Step 1: Create PostCard**

`apps/web/src/components/v3/PostCard.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Avatar, Badge } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { togglePostLike, addPostComment } from '@/lib/api';
import type { PostData, PostAuthor } from '@/lib/api/posts';

interface PostCardProps {
  post: PostData;
  onUpdate?: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);

  const timeAgo = getTimeAgo(post.createdAt);

  async function handleLike() {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    await togglePostLike(post.id).catch(() => {
      setLiked(liked);
      setLikeCount(post.likeCount);
    });
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    await addPostComment(post.id, commentText);
    setCommentText('');
    onUpdate?.();
  }

  return (
    <Card className="mb-4 overflow-hidden">
      {/* Author header */}
      <div className="flex items-center gap-3 p-4">
        <Avatar src={post.user.avatarUrl} name={post.user.name} size={40} />
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={`/profile/${post.user.id}`} className="font-semibold text-[var(--text-1)] hover:underline">
              {post.user.name}
            </Link>
            <Badge type={post.user.badgeType} size={14} />
          </div>
          <span className="text-xs text-[var(--text-3)]">{timeAgo}</span>
        </div>
      </div>

      {/* Photos */}
      {post.photos.length > 0 && (
        <div className="relative aspect-square bg-[var(--bg-1)]">
          <img
            src={`${process.env.NEXT_PUBLIC_CDN_URL || ''}/${post.photos[photoIndex].s3Key}`}
            alt=""
            className="w-full h-full object-cover"
          />
          {post.photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {post.photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={`w-2 h-2 rounded-full ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Caption with clickable hashtags */}
      {post.caption && (
        <div className="px-4 pt-3 text-[var(--text-1)] text-sm leading-relaxed">
          {renderCaption(post.caption)}
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button onClick={handleLike} className="flex items-center gap-1.5 text-sm">
          <span style={{ color: liked ? '#E85D2C' : 'var(--text-3)' }}>
            {liked ? '♥' : '♡'}
          </span>
          <span className="text-[var(--text-3)]">{likeCount}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-[var(--text-3)]">
          💬 {post.commentCount}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-[var(--border-1)]">
          <div className="flex gap-2 mt-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Napsat komentář..."
              className="flex-1 bg-[var(--bg-1)] rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none"
            />
            <button onClick={handleComment} className="text-sm text-[var(--accent)]">
              Odeslat
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function renderCaption(text: string) {
  const parts = text.split(/(#[a-zA-Z0-9\u00C0-\u024F_]+)/g);
  return parts.map((part, i) =>
    part.startsWith('#') ? (
      <Link key={i} href={`/trending?tag=${part.slice(1).toLowerCase()}`} className="text-[var(--accent)] hover:underline">
        {part}
      </Link>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}
```

- [ ] **Step 2: Export from index.ts**

Add to `apps/web/src/components/v3/index.ts`:

```typescript
export { PostCard } from './PostCard';
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/v3/PostCard.tsx apps/web/src/components/v3/index.ts
git commit -m "feat(web): add v3 PostCard — photo gallery, hashtag links, like/comment, author badge"
```

---

## Task 13: Frontend — Community Page Refactor

**Files:**
- Modify: `apps/web/src/app/(app)/community/page.tsx`

- [ ] **Step 1: Rewrite community page with feed tabs + post composer + post cards**

Replace the existing community page with the new Instagram-style feed. The page should:

1. Import `PostComposer`, `PostCard`, `Card`, `Button`, `Chip`, `SectionHeader` from v3
2. Import `getForYouFeed`, `getFollowingFeed`, `getTrendingFeed`, `getPromoCards`, `dismissPromo` from API
3. Three tabs: "Pro tebe" (default), "Sledovaní", "Trending"
4. PostComposer at top
5. Feed of PostCard components with promo cards injected at positions 5, 12, 20
6. Infinite scroll with cursor pagination (IntersectionObserver)
7. Promo cards rendered with distinct gradient border and "Promoted" label

The full implementation should follow the existing community page patterns (use `useState`, `useEffect`, `useCallback`) and v3 design tokens (`var(--bg-0)`, `var(--text-1)`, `var(--accent)`, etc.).

- [ ] **Step 2: Test locally**

```bash
cd apps/web && npm run dev
```

Navigate to `/community`, verify:
- Three tabs render and switch
- PostComposer shows with text area + photo button
- Feed loads (empty initially, OK)
- No console errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/\(app\)/community/page.tsx
git commit -m "feat(web): refactor community page — feed tabs, PostComposer, PostCard, promo injection"
```

---

## Task 14: Frontend — Trending Page

**Files:**
- Create: `apps/web/src/app/(app)/trending/page.tsx`

- [ ] **Step 1: Create trending page**

`apps/web/src/app/(app)/trending/page.tsx`:

The page should:
1. Hero section with top 3 trending hashtags (large cards with post count)
2. Period tabs: 24h / 7d
3. Grid of top 20 hashtags (name + post count, clickable → `/trending?tag=name`)
4. "Hot Posts" section: top 10 posts by engagement (PostCard components)
5. If `?tag=name` query param present, show filtered posts for that hashtag

Use v3 components: `Card`, `SectionHeader`, `Chip`, `Sparkline`.
Import `getTrendingHashtags`, `getPostsByHashtag`, `getTrendingFeed` from API.

- [ ] **Step 2: Add trending to navigation**

In `apps/web/src/components/v3/` or wherever the main nav is defined, add "Trending" link pointing to `/trending`.

- [ ] **Step 3: Test locally**

```bash
cd apps/web && npm run dev
```

Navigate to `/trending`, verify page renders without errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/\(app\)/trending/page.tsx
git commit -m "feat(web): add trending page — top hashtags, hot posts, hashtag filter"
```

---

## Task 15: Mobile API Client + Screens

**Files:**
- Modify: `apps/mobile/src/lib/api.ts` (add post/feed/hashtag functions)
- Modify: `apps/mobile/src/screens/CommunityScreen.tsx` (refactor for new feed)

- [ ] **Step 1: Add API functions to mobile client**

In `apps/mobile/src/lib/api.ts`, add the same post/feed/hashtag/promo functions as the web client (adapted for React Native — no `fetch` differences needed, same REST calls).

- [ ] **Step 2: Update CommunityScreen with feed tabs**

Refactor `CommunityScreen.tsx` to match web community page: 3 tabs (Pro tebe, Sledovaní, Trending), PostCard-style items, pull-to-refresh.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/lib/api.ts apps/mobile/src/screens/CommunityScreen.tsx
git commit -m "feat(mobile): add post/feed API + refactor CommunityScreen with feed tabs"
```

---

## Task 16: Update Docs + Regression Tests

**Files:**
- Modify: `test-production.sh`
- Modify: `CHANGELOG.md`
- Modify: `ROADMAP.md`
- Modify: `MODULES.md`
- Modify: `ARCHITECTURE.md`

- [ ] **Step 1: Add regression tests**

In `test-production.sh`, add:

```bash
# Posts
test_endpoint "GET" "/api/posts/user/test" "200|401"
# Feed
test_endpoint "GET" "/api/feed/for-you" "200|401"
test_endpoint "GET" "/api/feed/following" "200|401"
test_endpoint "GET" "/api/feed/trending" "200|401"
# Hashtags
test_endpoint "GET" "/api/hashtags/trending" "200|401"
test_endpoint "GET" "/api/hashtags/search?q=test" "200|401"
test_endpoint "GET" "/api/hashtags/suggested" "200|401"
# Promo
test_endpoint "GET" "/api/promo/for-feed" "200|401"
# Pages
test_page "/community"
test_page "/trending"
```

- [ ] **Step 2: Update CHANGELOG.md**

Add entry for Fitness Instagram Wave 1 with all features listed.

- [ ] **Step 3: Update ROADMAP.md**

Mark "Fitness Instagram features" as done in priorities.

- [ ] **Step 4: Update MODULES.md**

Add posts, hashtags, feed, promo modules to the backend modules table.

- [ ] **Step 5: Update ARCHITECTURE.md**

Add Post System section to AI Subsystems or Social section. Update model count.

- [ ] **Step 6: Commit**

```bash
git add test-production.sh CHANGELOG.md ROADMAP.md MODULES.md ARCHITECTURE.md
git commit -m "docs: update docs + regression tests for Fitness Instagram Wave 1"
```

---

## Task 17: Deploy + Verify

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

GitHub Actions will auto-deploy (schema migration + API + Web builds).

- [ ] **Step 2: Wait for deploy**

Monitor GitHub Actions for green status.

- [ ] **Step 3: Run regression tests**

```bash
bash test-production.sh
```

Expected: all tests pass including new post/feed/hashtag/promo endpoints.

- [ ] **Step 4: Manual smoke test**

1. Login at https://fitai.bfevents.cz
2. Navigate to `/community`
3. Verify 3 feed tabs
4. Create a text post with #hashtag
5. Create a photo post
6. Like and comment on a post
7. Navigate to `/trending`
8. Verify hashtag appears
9. Check badge renders on profiles
