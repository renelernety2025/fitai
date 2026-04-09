import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideosModule } from './videos/videos.module';
import { SessionsModule } from './sessions/sessions.module';
import { ProgressModule } from './progress/progress.module';
import { PreprocessingModule } from './preprocessing/preprocessing.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { GymSessionsModule } from './gym-sessions/gym-sessions.module';
import { AdaptiveModule } from './adaptive/adaptive.module';
import { CoachingModule } from './coaching/coaching.module';
import { AIPlannerModule } from './ai-planner/ai-planner.module';
import { NotificationModule } from './notifications/notification.module';
import { SocialModule } from './social/social.module';
import { VisionModule } from './vision/vision.module';
import { WearablesModule } from './wearables/wearables.module';
import { ContentModule } from './content/content.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { EducationModule } from './education/education.module';
import { HomeTrainingModule } from './home-training/home-training.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { HabitsModule } from './habits/habits.module';
import { AiInsightsModule } from './ai-insights/ai-insights.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ProgressPhotosModule } from './progress-photos/progress-photos.module';

/**
 * Global throttler config — layered limits:
 *   - short:  burst protection (10 req/sec)
 *   - medium: sustained protection (200 req/min)
 *   - long:   abuse protection (3000 req/hour)
 *
 * Individual endpoints can override via @Throttle() decorator (e.g. AI endpoints
 * which are expensive get much tighter limits like 5 requests per hour).
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60_000, limit: 200 },
      { name: 'long', ttl: 3_600_000, limit: 3000 },
    ]),
    PrismaModule,
    CacheModule,
    HealthModule,
    AuthModule,
    UsersModule,
    VideosModule,
    SessionsModule,
    ProgressModule,
    PreprocessingModule,
    ExercisesModule,
    WorkoutPlansModule,
    GymSessionsModule,
    AdaptiveModule,
    CoachingModule,
    AIPlannerModule,
    NotificationModule,
    SocialModule,
    VisionModule,
    WearablesModule,
    ContentModule,
    IntelligenceModule,
    OnboardingModule,
    EducationModule,
    HomeTrainingModule,
    NutritionModule,
    HabitsModule,
    AiInsightsModule,
    AchievementsModule,
    ProgressPhotosModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
