'use client';

import { Button } from './Button';
import { subscribeToCreator } from '@/lib/api';

interface SubscriberBlurProps {
  creatorId: string;
  priceXP: number;
  onSubscribed?: () => void;
}

export function SubscriberBlur({ creatorId, priceXP, onSubscribed }: SubscriberBlurProps) {
  async function handleSubscribe() {
    await subscribeToCreator(creatorId);
    onSubscribed?.();
  }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
        </svg>
      </div>
      <p className="font-semibold" style={{ color: 'var(--text-1)' }}>
        Subscriber Only
      </p>
      <p className="text-sm" style={{ color: 'var(--text-3)' }}>
        Subscribe for {priceXP} XP/month
      </p>
      <Button variant="accent" size="sm" onClick={handleSubscribe}>
        Subscribe
      </Button>
    </div>
  );
}
