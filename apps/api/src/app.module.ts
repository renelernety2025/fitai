import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedis } from './throttler/throttler-storage-redis';
import { UserIdThrottlerGuard } from './throttler/user-id-throttler.guard';
import { LoggerModule } from 'nestjs-pino';
import { SentryModule } from '@sentry/nestjs/setup';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { MetricsModule } from './metrics/metrics.module';
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
import { WorkoutJournalModule } from './workout-journal/workout-journal.module';
import { RecipesModule } from './recipes/recipes.module';
import { ExportModule } from './export/export.module';
import { WrappedModule } from './wrapped/wrapped.module';
import { LeaguesModule } from './leagues/leagues.module';
import { SkillTreeModule } from './skill-tree/skill-tree.module';
import { CalendarModule } from './calendar/calendar.module';
import { SeasonsModule } from './seasons/seasons.module';
import { BodyPortfolioModule } from './body-portfolio/body-portfolio.module';
import { BloodworkModule } from './bloodwork/bloodwork.module';
import { RehabModule } from './rehab/rehab.module';
import { StreakFreezeModule } from './streak-freeze/streak-freeze.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { BossFightsModule } from './boss-fights/boss-fights.module';
import { DiscoverWeeklyModule } from './discover-weekly/discover-weekly.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { GymFinderModule } from './gym-finder/gym-finder.module';
import { BuddyModule } from './buddy/buddy.module';
import { MessagesModule } from './messages/messages.module';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';
import { DuelsModule } from './duels/duels.module';
import { SquadsModule } from './squads/squads.module';
import { SupplementsModule } from './supplements/supplements.module';
import { GearModule } from './gear/gear.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { CoachingMemoryModule } from './coaching-memory/coaching-memory.module';
import { RecordsModule } from './records/records.module';
import { ClipsModule } from './clips/clips.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { TrainersModule } from './trainers/trainers.module';
import { RoutineBuilderModule } from './routine-builder/routine-builder.module';
import { DropsModule } from './drops/drops.module';
import { VipModule } from './vip/vip.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { BundlesModule } from './bundles/bundles.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { DailyQuestsModule } from './daily-quests/daily-quests.module';
import { FormCheckModule } from './form-check/form-check.module';
import { SmartNotificationsModule } from './smart-notifications/smart-notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
import { FitnessScoreModule } from './fitness-score/fitness-score.module';
import { PaidChallengesModule } from './paid-challenges/paid-challenges.module';
import { CreatorsModule } from './creators/creators.module';
import { CoursesModule } from './courses/courses.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { PostsModule } from './posts/posts.module';
import { HashtagsModule } from './hashtags/hashtags.module';
import { FeedModule } from './feed/feed.module';
import { PromoModule } from './promo/promo.module';
import { NotifyModule } from './notify/notify.module';
import { CreatorEconomyModule } from './creator-economy/creator-economy.module';
import { CreatorDashboardModule } from './creator-dashboard/creator-dashboard.module';
import { ScheduleModule } from '@nestjs/schedule';

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
    // Sentry integration — automatically captures unhandled exceptions
    // across all NestJS routes/services. DSN via SENTRY_DSN env var.
    SentryModule.forRoot(),
    // Structured JSON logging — every log line queryable in CloudWatch Insights
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        // In production, emit raw JSON (parseable by log aggregators).
        // In dev, pretty-print for humans.
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true } },
        // Add userId to every log if present in request
        customProps: (req: any) => ({
          userId: req?.user?.id,
          requestId: req?.id,
        }),
        // Auto-redact sensitive fields
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie', '*.password'],
          censor: '[REDACTED]',
        },
      },
    }),
    ThrottlerModule.forRoot({
      storage: new ThrottlerStorageRedis(),
      throttlers: [
        { name: 'short', ttl: 1000, limit: 10 },
        { name: 'medium', ttl: 60_000, limit: 200 },
        { name: 'long', ttl: 3_600_000, limit: 3000 },
      ],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    CacheModule,
    EmbeddingsModule,
    MetricsModule,
    NotifyModule,
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
    WorkoutJournalModule,
    RecipesModule,
    ExportModule,
    WrappedModule,
    LeaguesModule,
    SkillTreeModule,
    CalendarModule,
    SeasonsModule,
    BodyPortfolioModule,
    BloodworkModule,
    RehabModule,
    StreakFreezeModule,
    MarketplaceModule,
    BossFightsModule,
    DiscoverWeeklyModule,
    RecommendationsModule,
    GymFinderModule,
    BuddyModule,
    MessagesModule,
    EmailModule,
    AdminModule,
    DuelsModule,
    SquadsModule,
    SupplementsModule,
    GearModule,
    MaintenanceModule,
    CoachingMemoryModule,
    RecordsModule,
    ClipsModule,
    ExperiencesModule,
    TrainersModule,
    RoutineBuilderModule,
    DropsModule,
    VipModule,
    WishlistModule,
    BundlesModule,
    PlaylistsModule,
    DailyQuestsModule,
    FormCheckModule,
    SmartNotificationsModule,
    AnalyticsModule,
    BillingModule,
    FitnessScoreModule,
    PaidChallengesModule,
    CreatorsModule,
    CoursesModule,
    EnterpriseModule,
    PostsModule,
    HashtagsModule,
    FeedModule,
    PromoModule,
    NotifyModule,
    CreatorEconomyModule,
    CreatorDashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UserIdThrottlerGuard,
    },
  ],
})
export class AppModule {}
