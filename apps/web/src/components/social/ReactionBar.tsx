'use client';

import { useState } from 'react';
import { addReaction, removeReaction } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const EMOJIS = [
  { key: 'fire', label: 'F' },
  { key: 'muscle', label: 'M' },
  { key: 'clap', label: 'C' },
  { key: 'heart', label: 'H' },
  { key: '100', label: '100' },
] as const;

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
}

interface ReactionBarProps {
  targetType: string;
  targetId: string;
  reactions: Reaction[];
  onUpdate?: () => void;
}

export default function ReactionBar({
  targetType,
  targetId,
  reactions: initial,
  onUpdate,
}: ReactionBarProps) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>(initial);

  async function toggle(emoji: string) {
    const existing = reactions.find(
      (r) => r.emoji === emoji && r.userId === user?.id,
    );
    try {
      if (existing) {
        await removeReaction(existing.id);
        setReactions((prev) => prev.filter((r) => r.id !== existing.id));
      } else {
        const r = await addReaction(targetType, targetId, emoji);
        setReactions((prev) => [...prev, r]);
      }
      onUpdate?.();
    } catch {
      // silent
    }
  }

  function countFor(emoji: string) {
    return reactions.filter((r) => r.emoji === emoji).length;
  }

  function isActive(emoji: string) {
    return reactions.some(
      (r) => r.emoji === emoji && r.userId === user?.id,
    );
  }

  return (
    <div className="flex gap-1">
      {EMOJIS.map((e) => {
        const count = countFor(e.key);
        const active = isActive(e.key);
        return (
          <button
            key={e.key}
            onClick={() => toggle(e.key)}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-transform active:scale-[1.3]"
            style={{
              backgroundColor: active
                ? 'rgba(168,255,0,0.15)'
                : 'rgba(255,255,255,0.05)',
              color: active ? '#A8FF00' : 'var(--text-muted)',
              border: active
                ? '1px solid rgba(168,255,0,0.3)'
                : '1px solid transparent',
            }}
          >
            <span>{e.label}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
