'use client';

import { useEffect, useState } from 'react';
import { Button } from './Button';
import { subscribeToCreator, getMyStats } from '@/lib/api';

interface SubscriberBlurProps {
  creatorId: string;
  priceXP: number;
  onSubscribed?: () => void;
}

export function SubscriberBlur({ creatorId, priceXP, onSubscribed }: SubscriberBlurProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyStats().then((s) => setBalance(s.totalXP)).catch(() => {});
  }, []);

  async function handleConfirm() {
    setLoading(true);
    try {
      await subscribeToCreator(creatorId);
      onSubscribed?.();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  const canAfford = balance === null || balance >= priceXP;
  const missing = balance !== null && balance < priceXP ? priceXP - balance : 0;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden="true">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
        </svg>
      </div>

      <p className="font-semibold" style={{ color: 'var(--text-1)' }}>
        Jen pro odběratele
      </p>

      <p className="text-sm" style={{ color: 'var(--text-3)' }}>
        {priceXP.toLocaleString('cs-CZ')} XP / měsíc
      </p>

      {balance !== null && (
        <p className="text-xs" style={{ color: canAfford ? 'var(--text-3)' : 'var(--error, #f87171)' }}>
          {canAfford
            ? `Tvůj zůstatek: ${balance.toLocaleString('cs-CZ')} XP`
            : `Potřebuješ ještě ${missing.toLocaleString('cs-CZ')} XP`}
        </p>
      )}

      {!confirming ? (
        <Button
          variant="accent"
          size="sm"
          onClick={() => setConfirming(true)}
          disabled={!canAfford}
          aria-label={`Odebírat obsah za ${priceXP.toLocaleString('cs-CZ')} XP měsíčně`}
        >
          Odebírat
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-center" style={{ color: 'var(--text-2)' }}>
            Odebírat za {priceXP.toLocaleString('cs-CZ')} XP/měsíc?
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={loading} aria-label="Zrušit předplatné">
              Zrušit
            </Button>
            <Button variant="accent" size="sm" onClick={handleConfirm} disabled={loading} aria-label="Potvrdit předplatné">
              {loading ? 'Aktivuji...' : 'Potvrdit'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
