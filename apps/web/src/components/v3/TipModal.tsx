'use client';

import { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { tipCreator } from '@/lib/api';

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

  async function handleSend() {
    if (amount < 10 || amount > 5000) return;
    setSending(true);
    try {
      await tipCreator(creatorId, amount, message || undefined);
      onTipped?.();
      onClose();
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <Card
        padding={24}
        className="w-full max-w-sm"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--text-1)' }}
        >
          Tip pro {creatorName}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setAmount(p); setCustom(false); }}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: amount === p && !custom ? 'var(--accent)' : 'var(--bg-1)',
                color: amount === p && !custom ? '#fff' : 'var(--text-2)',
              }}
            >
              {p} XP
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCustom(true)}
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              background: custom ? 'var(--accent)' : 'var(--bg-1)',
              color: custom ? '#fff' : 'var(--text-2)',
            }}
          >
            Custom
          </button>
        </div>

        {custom && (
          <input
            type="number"
            min={10}
            max={5000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="10–5000 XP"
            className="w-full rounded-lg px-3 py-2 mb-4 outline-none"
            style={{ background: 'var(--bg-1)', color: 'var(--text-1)' }}
          />
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Zpráva (volitelné)..."
          className="w-full rounded-lg px-3 py-2 mb-4 outline-none resize-none"
          style={{ background: 'var(--bg-1)', color: 'var(--text-1)' }}
          rows={2}
          maxLength={200}
        />

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Zrušit
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleSend}
            disabled={sending || amount < 10}
          >
            {sending ? 'Posílám...' : `Poslat ${amount} XP`}
          </Button>
        </div>
      </Card>
    </div>
  );
}
