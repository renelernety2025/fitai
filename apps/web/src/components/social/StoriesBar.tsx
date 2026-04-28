'use client';

import { useRef } from 'react';

interface Story {
  id: string;
  user: { id: string; name: string };
  viewed: boolean;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
}

interface StoriesBarProps {
  stories: Story[];
  onSelect: (story: Story) => void;
}

export default function StoriesBar({ stories, onSelect }: StoriesBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null!);

  if (stories.length === 0) return null;

  return (
    <div className="mb-8">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {stories.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="flex flex-shrink-0 flex-col items-center gap-2"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold"
              style={{
                background: s.viewed
                  ? 'rgba(255,255,255,0.08)'
                  : 'transparent',
                border: s.viewed
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid #A8FF00',
                color: 'var(--text-primary)',
              }}
            >
              {s.user.name.charAt(0).toUpperCase()}
            </div>
            <span
              className="max-w-[64px] truncate text-[10px]"
              style={{
                color: s.viewed
                  ? 'var(--text-muted)'
                  : 'var(--text-primary)',
              }}
            >
              {s.user.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
