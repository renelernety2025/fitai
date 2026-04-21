'use client';

import { useEffect, useState, useCallback } from 'react';
import { viewStory } from '@/lib/api';

interface Story {
  id: string;
  user: { id: string; name: string };
  viewed: boolean;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m} min` : `${sec}s`;
}

function StoryCard({ story }: { story: Story }) {
  const d = story.data as Record<string, any>;
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold"
        style={{
          border: '2px solid #A8FF00',
          color: 'var(--text-primary)',
        }}
      >
        {story.user.name.charAt(0).toUpperCase()}
      </div>
      <div className="mb-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        {story.user.name}
      </div>
      <div
        className="mb-8 text-[10px] font-semibold uppercase tracking-[0.25em]"
        style={{ color: 'var(--text-muted)' }}
      >
        {story.type === 'workout' ? 'Trening' : story.type}
      </div>

      {d.exercises && (
        <div className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {(d.exercises as string[]).slice(0, 4).join(' / ')}
        </div>
      )}

      <div className="flex gap-8">
        {d.volume != null && (
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#A8FF00' }}>
              {Number(d.volume).toLocaleString('cs-CZ')}
            </div>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              kg objem
            </div>
          </div>
        )}
        {d.formScore != null && (
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#00E5FF' }}>
              {d.formScore}%
            </div>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              forma
            </div>
          </div>
        )}
        {d.duration != null && (
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#BF5AF2' }}>
              {formatDuration(Number(d.duration))}
            </div>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              cas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StoryViewer({
  stories,
  initialIndex,
  onClose,
}: StoryViewerProps) {
  const [idx, setIdx] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const story = stories[idx];
  if (!story) return null;

  const goNext = useCallback(() => {
    if (idx < stories.length - 1) {
      setIdx((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [idx, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (idx > 0) {
      setIdx((i) => i - 1);
      setProgress(0);
    }
  }, [idx]);

  useEffect(() => {
    viewStory(story.id).catch(() => {});
  }, [story.id]);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          goNext();
          return 0;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [idx, goNext]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goNext, goPrev]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
    >
      {/* Progress bars */}
      <div className="absolute left-4 right-4 top-4 flex gap-1">
        {stories.map((_, i) => (
          <div
            key={i}
            className="h-0.5 flex-1 overflow-hidden rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: i < idx ? '100%' : i === idx ? `${progress}%` : '0%',
                backgroundColor: '#A8FF00',
              }}
            />
          </div>
        ))}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-10 text-2xl font-light"
        style={{ color: 'var(--text-muted)' }}
      >
        x
      </button>

      {/* Navigation zones */}
      <div
        className="absolute inset-y-0 left-0 w-1/3 cursor-pointer"
        onClick={goPrev}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/3 cursor-pointer"
        onClick={goNext}
      />

      {/* Content */}
      <div className="w-full max-w-md">
        <StoryCard story={story} />
      </div>
    </div>
  );
}
