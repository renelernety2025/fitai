import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  logEvent(
    userId: string | null,
    event: string,
    properties?: Record<string, unknown>,
  ) {
    this.logger.log(
      JSON.stringify({
        type: 'analytics_event',
        userId,
        event,
        properties,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  getSummary(days: number) {
    const events = [
      'page_view',
      'workout_started',
      'workout_completed',
      'exercise_viewed',
      'plan_created',
      'achievement_unlocked',
      'meal_logged',
      'habit_checked',
      'ai_chat_sent',
      'signup_completed',
    ];

    return {
      period: `last_${days}_days`,
      counts: Object.fromEntries(
        events.map((e) => [e, 0]),
      ),
      note: 'Mock data — replace with CloudWatch Insights query',
    };
  }
}
