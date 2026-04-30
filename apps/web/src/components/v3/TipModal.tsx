'use client';

import { useEffect, useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { tipCreator, getMyStats } from '@/lib/api';

interface TipModalProps {
  creatorId: string;
  creatorName: string;
  onClose: () => void;
  onTipped?: () => void;
}

const PRESETS = [50, 100, 250, 500, 1000];

export function TipModal({ creatorId, creatorName, onClose, onTipped }: TipModalProps) {
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [custom, setCustom] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    getMyStats().then((s) => setBalance(s.totalXP)).catch(() => {});
  }, []);

  async function handleSend() {
    if (amount < 10 || amount > 5000) return;
    if (balance !== null && amount > balance) return;
    setSending(true);
    try {
      await tipCreator(creatorId, amount, message || undefined);
      onTipped?.();
      onClose();
    } finally {
      setSending(false);
    }
  }

  const customExceedsBalance = custom && balance !== null && amount > balance;
  const canSend = amount >= 10 && amount <= 5000 && (balance === null || amount <= balance);

  const headingId = `tip-modal-${creatorId}`;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
      <Card
        padding={24}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <h3
          id={headingId}
          className="text-lg font-semibold mb-1"
          style={{ color: 'var(--text-1)' }}
        >
          Tip pro {creatorName}
        </h3>

        {balance !== null && (
          <p className="text-sm mb-4" style={{ color: 'var(--text-3)' }}>
            Tvůj zůstatek: {balance.toLocaleString('cs-CZ')} XP
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => {
            const tooExpensive = balance !== null && p > balance;
            return (
              <button
                key={p}
                type="button"
                onClick={() => { if (!tooExpensive) { setAmount(p); setCustom(false); } }}
                disabled={tooExpensive}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: amount === p && !custom ? 'var(--accent)' : 'var(--bg-1)',
                  color: tooExpensive ? 'var(--text-3)' : amount === p && !custom ? '#fff' : 'var(--text-2)',
                  opacity: tooExpensive ? 0.4 : 1,
                  cursor: tooExpensive ? 'not-allowed' : 'pointer',
                }}
              >
                {p} XP
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setCustom(true)}
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              background: custom ? 'var(--accent)' : 'var(--bg-1)',
              color: custom ? '#fff' : 'var(--text-2)',
            }}
          >
            Vlastní
          </button>
        </div>

        {custom && (
          <>
            <input
              type="number"
              min={10}
              max={5000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="10–5000 XP"
              aria-label="Vlastní výše tipu v XP"
              className="w-full rounded-lg px-3 py-2 mb-1 outline-none"
              style={{ background: 'var(--bg-1)', color: 'var(--text-1)' }}
            />
            {customExceedsBalance && (
              <p className="text-xs mb-3" style={{ color: 'var(--error, #f87171)' }}>
                Nemáš dost XP (zůstatek: {balance!.toLocaleString('cs-CZ')} XP)
              </p>
            )}
            {!customExceedsBalance && <div className="mb-3" />}
          </>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Zpráva (volitelné)..."
          aria-label="Zpráva k tipu"
          className="w-full rounded-lg px-3 py-2 mb-4 outline-none resize-none"
          style={{ background: 'var(--bg-1)', color: 'var(--text-1)' }}
          rows={2}
          maxLength={200}
        />

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Zrušit tip">
            Zrušit
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleSend}
            disabled={sending || !canSend}
          >
            {sending ? 'Posílám...' : `Poslat ${amount} XP`}
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
}
