import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Throttler guard that tracks rate-limit budgets per authenticated user ID
 * when available, falling back to IP for unauthenticated routes
 * (e.g. /auth/login, /auth/register where no JWT is present yet).
 *
 * Solves the NAT sharing bug: without this, two users behind the same
 * public IP (family WiFi, office, carrier-grade NAT) share a single
 * rate-limit budget on every @Throttle() endpoint — they block each
 * other on expensive Claude/ElevenLabs endpoints like /coaching/ask,
 * /nutrition/meal-plan/generate, /ai-insights/daily-brief, etc.
 *
 * Unauthenticated endpoints still need IP-based tracking for brute-force
 * protection (login, register), which is why the fallback exists.
 */
@Injectable()
export class UserIdThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id ?? req.ip;
  }
}
