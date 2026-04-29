type EventName =
  | 'page_view'
  | 'workout_started' | 'workout_completed'
  | 'exercise_viewed' | 'plan_created'
  | 'duel_challenged' | 'duel_completed'
  | 'achievement_unlocked'
  | 'meal_logged' | 'habit_checked'
  | 'ai_chat_sent' | 'form_check_uploaded'
  | 'squad_created' | 'squad_joined'
  | 'drop_purchased' | 'bundle_purchased'
  | 'signup_completed' | 'onboarding_completed'
  | 'subscription_started' | 'subscription_canceled'
  | 'client_error';

class Analytics {
  private enabled: boolean;

  constructor() {
    this.enabled = typeof window !== 'undefined';
  }

  track(event: EventName, properties?: Record<string, unknown>) {
    if (!this.enabled) return;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${event}`, properties);
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/analytics/event`;
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {
      // Fire and forget
    }
  }

  page(path: string) {
    this.track('page_view', { path });
  }
}

export const analytics = new Analytics();
