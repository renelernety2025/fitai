import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
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

@Module({
  imports: [
    PrismaModule,
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
  ],
})
export class AppModule {}
