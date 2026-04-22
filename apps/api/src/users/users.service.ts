import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserLevel } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
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
    await this.prisma.$transaction([
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
}
