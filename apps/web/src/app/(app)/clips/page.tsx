'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { V2Layout } from '@/components/v2/V2Layout';
import { getClipsFeed, toggleClipLike, commentOnClip } from '@/lib/api';

type Clip = {
  id: string;
  userName: string;
  userAvatar: string | null;
  caption: string;
  tags: string[];
  exerciseName: string | null;
  formScore: number | null;
  likeCount: number;
  commentCount: number;
  liked: boolean;
};

const GRADIENTS = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 50%, #2d1b69 100%)',
  'linear-gradient(135deg, #1a1a1a 0%, #2d1f0e 50%, #3d2b1a 100%)',
  'linear-gradient(135deg, #0a1a1a 0%, #0d2b2b 50%, #1a3d3d 100%)',
  'linear-gradient(135deg, #1a0a0a 0%, #2b0d1a 50%, #3d1a2b 100%)',
];

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [showComment, setShowComment] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'FitAI — Clips';
  }, []);

  useEffect(() => {
    setLoading(true);
    getClipsFeed(1, 20)
      .then((c) => setClips(c as Clip[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLike = useCallback((id: string, idx: number) => {
    toggleClipLike(id)
      .then(() => {
        setClips((prev) =>
          prev.map((c, i) =>
            i === idx
              ? {
                  ...c,
                  liked: !c.liked,
                  likeCount: c.liked ? c.likeCount - 1 : c.likeCount + 1,
                }
              : c,
          ),
        );
      })
      .catch(() => {});
  }, []);

  function handleComment(id: string) {
    if (!commentText.trim()) return;
    commentOnClip(id, commentText)
      .then(() => {
        setCommentText('');
        setShowComment(false);
        setClips((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, commentCount: c.commentCount + 1 } : c,
          ),
        );
      })
      .catch(() => {});
  }

  function scrollTo(idx: number) {
    if (idx < 0 || idx >= clips.length) return;
    setCurrent(idx);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') scrollTo(current + 1);
      if (e.key === 'ArrowUp') scrollTo(current - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (loading) {
    return (
      <V2Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <p className="text-sm text-white/40">Nacitam clips...</p>
        </div>
      </V2Layout>
    );
  }

  if (clips.length === 0) {
    return (
      <V2Layout>
        <div className="flex h-[80vh] flex-col items-center justify-center text-center">
          <p className="mb-2 text-4xl">
            {'\uD83C\uDFAC'}
          </p>
          <p className="text-sm text-white/40">
            Zatim zadne clips. Nahraj prvni!
          </p>
        </div>
      </V2Layout>
    );
  }

  const clip = clips[current];

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: GRADIENTS[current % GRADIENTS.length] }}
      >
        {clip.exerciseName && (
          <p className="text-center text-4xl font-black uppercase tracking-wider text-white/10">
            {clip.exerciseName}
          </p>
        )}
      </div>

      {clip.formScore !== null && (
        <div className="absolute left-4 top-4 z-10 rounded-xl bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Form
          </span>
          <p className="text-lg font-bold text-[#A8FF00]">{clip.formScore}%</p>
        </div>
      )}

      <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-6">
        <button
          onClick={() => handleLike(clip.id, current)}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
              clip.liked
                ? 'bg-[#FF375F] text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {clip.liked ? '\u2764\uFE0F' : '\u2661'}
          </div>
          <span className="text-[10px] text-white/50">{clip.likeCount}</span>
        </button>
        <button
          onClick={() => setShowComment(!showComment)}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20">
            {'\uD83D\uDCAC'}
          </div>
          <span className="text-[10px] text-white/50">{clip.commentCount}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20">
            {'\u21AA\uFE0F'}
          </div>
          <span className="text-[10px] text-white/50">Share</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20">
            {'\u2694\uFE0F'}
          </div>
          <span className="text-[10px] text-white/50">Duel</span>
        </button>
      </div>

      <div className="absolute bottom-20 left-4 right-20 z-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
            {clip.userName.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-white">
            {clip.userName}
          </span>
        </div>
        {clip.caption && (
          <p className="mb-2 text-sm text-white/80">{clip.caption}</p>
        )}
        {clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {clip.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-white/50"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-3">
        <button
          onClick={() => scrollTo(current - 1)}
          disabled={current === 0}
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/20 disabled:opacity-30"
        >
          &uarr;
        </button>
        <span className="text-xs text-white/30">
          {current + 1} / {clips.length}
        </span>
        <button
          onClick={() => scrollTo(current + 1)}
          disabled={current === clips.length - 1}
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/20 disabled:opacity-30"
        >
          &darr;
        </button>
      </div>

      {showComment && (
        <div className="absolute bottom-24 left-4 right-20 z-20">
          <div className="flex gap-2 rounded-xl bg-black/60 p-2 backdrop-blur-sm">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleComment(clip.id);
              }}
              className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
              placeholder="Napsat komentar..."
            />
            <button
              onClick={() => handleComment(clip.id)}
              className="rounded-lg bg-[#FF375F] px-4 py-2 text-xs font-semibold text-white"
            >
              Odeslat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
