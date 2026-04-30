import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { NotifyService } from '../notify/notify.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
    private notifyService: NotifyService,
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

    // Validate S3 keys belong to this user
    if (dto.photoKeys?.length) {
      const prefix = `posts/${userId}/`;
      for (const key of dto.photoKeys) {
        if (!key.startsWith(prefix)) {
          throw new ForbiddenException('Invalid photo key');
        }
      }
    }

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

    if (post.isSubscriberOnly && post.userId !== currentUserId) {
      const sub = await this.prisma.creatorSubscription.findUnique({
        where: { subscriberId_creatorId: { subscriberId: currentUserId || '', creatorId: post.userId } },
      });
      if (!sub?.isActive) {
        return { ...post, caption: null, photos: [], cardData: null, isBlurred: true, isLiked };
      }
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
    const { count } = await this.prisma.postLike.deleteMany({
      where: { postId, userId },
    });

    if (count > 0) {
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

    if (post.userId !== userId) {
      const actor = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      await this.notifyService.createBatched(
        'POST_COMMENTED', post.userId, userId,
        `${actor?.name || 'Někdo'} okomentoval tvůj post`,
        `{count} lidí okomentovalo tvůj post`,
        'post', postId,
      );
    }

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
