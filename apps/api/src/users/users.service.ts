import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../prisma/prisma.service';
import { UserLevel } from '@prisma/client';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, avatarUrl: true, bio: true,
        level: true, isAdmin: true, badgeType: true, badgeVerifiedAt: true,
        createdAt: true, updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    name: string;
    level?: UserLevel;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        level: data.level ?? 'BEGINNER',
      },
    });
  }

  async updateName(userId: string, name: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: 'Password changed successfully' };
  }

  async deleteAccount(userId: string) {
    // 1. Collect all S3 keys before DB deletion
    const [bodyPhotos, postPhotos, journalPhotos] = await Promise.all([
      this.prisma.bodyPhoto.findMany({ where: { userId }, select: { s3Key: true } }),
      (this.prisma as any).postPhoto.findMany({ where: { post: { userId } }, select: { s3Key: true } }),
      this.prisma.journalPhoto.findMany({ where: { journalEntry: { userId } }, select: { s3Key: true } }),
    ]);

    const allS3Keys = [
      ...bodyPhotos.map((p: any) => p.s3Key),
      ...postPhotos.map((p: any) => p.s3Key),
      ...journalPhotos.map((p: any) => p.s3Key),
    ].filter(Boolean) as string[];

    if (allS3Keys.length > 0) {
      const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-west-1' });
      const bucket = process.env.S3_BUCKET || 'fitai-assets-production';
      for (let i = 0; i < allS3Keys.length; i += 1000) {
        const batch = allS3Keys.slice(i, i + 1000);
        await s3.send(new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: batch.map(Key => ({ Key })) },
        })).catch((e: any) => console.error('S3 cleanup error:', e.message));
      }
    }

    // 2. Delete all DB records in dependency order (children before parents)
    await this.prisma.$transaction([
      // New cross-industry models (Phase 1-5)
      (this.prisma as any).sectorTime.deleteMany({
        where: { exerciseSet: { gymSession: { userId } } },
      }),
      (this.prisma as any).coachingMemory.deleteMany({ where: { userId } }),
      (this.prisma as any).maintenanceAlert.deleteMany({ where: { userId } }),
      (this.prisma as any).maintenanceSchedule.deleteMany({ where: { userId } }),
      // Duels
      this.prisma.duel.deleteMany({
        where: { OR: [{ challengerId: userId }, { challengedId: userId }] },
      }),
      // Squads
      (this.prisma as any).squadMembership.deleteMany({ where: { userId } }),
      // Person streaks
      (this.prisma as any).personStreak.deleteMany({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
      }),
      // Supplements
      (this.prisma as any).supplementLog.deleteMany({
        where: { userSupplement: { userId } },
      }),
      (this.prisma as any).userSupplement.deleteMany({ where: { userId } }),
      // Gear
      (this.prisma as any).gearReview.deleteMany({ where: { userId } }),
      (this.prisma as any).gearItem.deleteMany({ where: { userId } }),
      // Clips
      (this.prisma as any).clipComment.deleteMany({ where: { userId } }),
      (this.prisma as any).clipLike.deleteMany({ where: { userId } }),
      (this.prisma as any).duetComparison.deleteMany({ where: { userId } }),
      (this.prisma as any).clip.deleteMany({ where: { userId } }),
      // Playlists
      (this.prisma as any).playlistLink.deleteMany({ where: { userId } }),
      // Experiences
      (this.prisma as any).booking.deleteMany({ where: { userId } }),
      (this.prisma as any).trainerReview.deleteMany({ where: { userId } }),
      (this.prisma as any).experience.deleteMany({
        where: { trainer: { userId } },
      }),
      (this.prisma as any).trainerProfile.deleteMany({ where: { userId } }),
      // Routines
      (this.prisma as any).routineItem.deleteMany({
        where: { routine: { userId } },
      }),
      (this.prisma as any).routine.deleteMany({ where: { userId } }),
      // Bundle purchases, Daily quest completions
      (this.prisma as any).bundlePurchase.deleteMany({ where: { userId } }),
      (this.prisma as any).dailyQuestCompletion.deleteMany({ where: { userId } }),
      // Bundles, Wishlist, Drops, VIP, Titles, Brand
      (this.prisma as any).bundle.deleteMany({ where: { creatorId: userId } }),
      (this.prisma as any).wishlist.deleteMany({ where: { userId } }),
      (this.prisma as any).dropPurchase.deleteMany({ where: { userId } }),
      (this.prisma as any).planTrial.deleteMany({ where: { userId } }),
      (this.prisma as any).vIPMembership.deleteMany({ where: { userId } }),
      (this.prisma as any).userTitle.deleteMany({ where: { userId } }),
      (this.prisma as any).userBrand.deleteMany({ where: { userId } }),
      // Creator economy models (Wave 1+2) — children before parents
      (this.prisma as any).socialNotification.deleteMany({
        where: { OR: [{ userId }, { actorId: userId }] },
      }),
      (this.prisma as any).postLike.deleteMany({ where: { userId } }),
      (this.prisma as any).postComment.deleteMany({ where: { userId } }),
      (this.prisma as any).postHashtag.deleteMany({ where: { post: { userId } } }),
      (this.prisma as any).postPhoto.deleteMany({ where: { post: { userId } } }),
      (this.prisma as any).post.deleteMany({ where: { userId } }),
      (this.prisma as any).creatorTip.deleteMany({
        where: { OR: [{ fromUserId: userId }, { toCreatorId: userId }] },
      }),
      (this.prisma as any).creatorSubscription.deleteMany({
        where: { OR: [{ subscriberId: userId }, { creatorId: userId }] },
      }),
      (this.prisma as any).creatorProfile.deleteMany({ where: { userId } }),
      // Original models
      this.prisma.journalPhoto.deleteMany({
        where: { journalEntry: { userId } },
      }),
      this.prisma.journalEntry.deleteMany({ where: { userId } }),
      this.prisma.foodLog.deleteMany({ where: { userId } }),
      this.prisma.dailyCheckIn.deleteMany({ where: { userId } }),
      this.prisma.exerciseSet.deleteMany({
        where: { gymSession: { userId } },
      }),
      this.prisma.gymSession.deleteMany({ where: { userId } }),
      this.prisma.exerciseHistory.deleteMany({ where: { userId } }),
      this.prisma.weeklyVolume.deleteMany({ where: { userId } }),
      this.prisma.poseSnapshot.deleteMany({
        where: { session: { userId } },
      }),
      this.prisma.workoutSession.deleteMany({ where: { userId } }),
      this.prisma.coachingMessage.deleteMany({
        where: { coachingSession: { userId } },
      }),
      this.prisma.coachingSession.deleteMany({ where: { userId } }),
      this.prisma.safetyEvent.deleteMany({ where: { userId } }),
      this.prisma.achievementUnlock.deleteMany({ where: { userId } }),
      this.prisma.bodyAnalysis.deleteMany({
        where: { bodyPhoto: { userId } },
      }),
      this.prisma.bodyPhoto.deleteMany({ where: { userId } }),
      this.prisma.mealPlan.deleteMany({ where: { userId } }),
      this.prisma.passwordResetToken.deleteMany({ where: { userId } }),
      this.prisma.pushSubscription.deleteMany({ where: { userId } }),
      this.prisma.notificationPreference.deleteMany({
        where: { userId },
      }),
      this.prisma.follow.deleteMany({
        where: { OR: [{ followerId: userId }, { followedId: userId }] },
      }),
      this.prisma.activityFeedItem.deleteMany({ where: { userId } }),
      this.prisma.challengeParticipant.deleteMany({ where: { userId } }),
      this.prisma.oneRepMax.deleteMany({
        where: { profile: { userId } },
      }),
      this.prisma.fitnessProfile.deleteMany({ where: { userId } }),
      this.prisma.userProgress.deleteMany({ where: { userId } }),
      this.prisma.plannedExercise.deleteMany({
        where: { workoutDay: { workoutPlan: { userId } } },
      }),
      this.prisma.workoutDay.deleteMany({
        where: { workoutPlan: { userId } },
      }),
      this.prisma.workoutPlan.deleteMany({ where: { userId } }),
      this.prisma.aIGeneratedPlan.deleteMany({ where: { userId } }),
      this.prisma.wearableData.deleteMany({ where: { userId } }),
      this.prisma.recipe.deleteMany({ where: { userId } }),
      // Social + gamification models (added in mega session)
      this.prisma.story.deleteMany({ where: { userId } }),
      this.prisma.reaction.deleteMany({ where: { userId } }),
      this.prisma.comment.deleteMany({ where: { userId } }),
      this.prisma.props.deleteMany({ where: { OR: [{ fromUserId: userId }, { toUserId: userId }] } }),
      this.prisma.directMessage.deleteMany({ where: { senderId: userId } }),
      this.prisma.conversation.deleteMany({ where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] } }),
      this.prisma.buddySwipe.deleteMany({ where: { swiperId: userId } }),
      this.prisma.buddyProfile.deleteMany({ where: { userId } }),
      this.prisma.flashParticipant.deleteMany({ where: { userId } }),
      this.prisma.leagueMembership.deleteMany({ where: { userId } }),
      this.prisma.skillUnlock.deleteMany({ where: { userId } }),
      this.prisma.scheduledWorkout.deleteMany({ where: { userId } }),
      this.prisma.seasonProgress.deleteMany({ where: { userId } }),
      this.prisma.missionCompletion.deleteMany({ where: { userId } }),
      this.prisma.bloodworkEntry.deleteMany({ where: { userId } }),
      this.prisma.rehabSession.deleteMany({ where: { rehabPlan: { userId } } }),
      this.prisma.rehabPlan.deleteMany({ where: { userId } }),
      this.prisma.streakFreeze.deleteMany({ where: { userId } }),
      this.prisma.marketplacePurchase.deleteMany({ where: { userId } }),
      this.prisma.marketplaceListing.deleteMany({ where: { authorId: userId } }),
      this.prisma.bossAttempt.deleteMany({ where: { userId } }),
      this.prisma.gymReview.deleteMany({ where: { userId } }),
      this.prisma.contentImport.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
    return { message: 'Account deleted' };
  }

  // ── User Titles ──

  async getTitles(userId: string) {
    return (this.prisma as any).userTitle.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async activateTitle(userId: string, titleId: string) {
    const title = await (this.prisma as any).userTitle.findUnique({
      where: { id: titleId },
    });
    if (!title) throw new NotFoundException('Title not found');
    if (title.userId !== userId) {
      throw new ForbiddenException('Not your title');
    }
    await (this.prisma as any).userTitle.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    return (this.prisma as any).userTitle.update({
      where: { id: titleId },
      data: { isActive: true },
    });
  }

  // ── User Brand ──

  async getBrand(userId: string) {
    const brand = await (this.prisma as any).userBrand.findUnique({
      where: { userId },
    });
    return brand ?? { colorTheme: null, avatarConfig: null, monogram: null };
  }

  async updateBrand(userId: string, dto: UpdateBrandDto) {
    return (this.prisma as any).userBrand.upsert({
      where: { userId },
      update: {
        ...(dto.colorTheme !== undefined ? { colorTheme: dto.colorTheme } : {}),
        ...(dto.avatarConfig !== undefined ? { avatarConfig: dto.avatarConfig } : {}),
        ...(dto.monogram !== undefined ? { monogram: dto.monogram } : {}),
      },
      create: {
        userId,
        colorTheme: dto.colorTheme ?? null,
        avatarConfig: dto.avatarConfig ?? null,
        monogram: dto.monogram ?? null,
      },
    });
  }
}
