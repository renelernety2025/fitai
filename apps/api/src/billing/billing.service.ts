import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PLANS = [
  {
    tier: 'FREE',
    name: 'Free',
    priceKc: 0,
    interval: 'month',
    features: [
      '3 AI chats per day',
      'Basic exercise library',
      'Community access',
      'Daily check-in',
      'Basic progress tracking',
    ],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    priceKc: 199,
    interval: 'month',
    features: [
      'Unlimited AI coaching',
      'AI meal plans',
      'Form check with camera',
      'Coaching memory',
      'Workout journal',
      'Advanced analytics',
    ],
  },
  {
    tier: 'PREMIUM',
    name: 'Premium',
    priceKc: 399,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Priority AI coaching',
      'VIP lounge access',
      'Unlimited drops',
      'Exclusive challenges',
      'Personal trainer matching',
    ],
  },
] as const;

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!sub) {
      return {
        tier: 'FREE',
        status: 'ACTIVE',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
    return {
      tier: sub.tier,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    };
  }

  async createCheckout(userId: string, tier: string) {
    this.logger.log(
      `Checkout requested: user=${userId} tier=${tier}`,
    );
    // Mock mode — return placeholder URL
    // Real Stripe integration will replace this
    return {
      url: `/pricing?checkout=mock&tier=${tier}`,
      message: 'Stripe not configured yet. Mock checkout.',
    };
  }

  async createPortal(userId: string) {
    this.logger.log(`Portal requested: user=${userId}`);
    return {
      url: `/pricing?portal=mock`,
      message: 'Stripe not configured yet. Mock portal.',
    };
  }

  async handleWebhook(body: unknown, signature: string) {
    this.logger.log('Webhook received (mock mode — ignored)');
    return { received: true };
  }

  getPlans() {
    return PLANS;
  }
}
