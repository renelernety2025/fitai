'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, Button, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getClipsFeed, toggleClipLike, commentOnClip } from '@/lib/api';

type Clip = { id: string; userName: string; userAvatar: string | null; caption: string; tags: string[]; exerciseName: string | null; formScore: number | null; likeCount: number; commentCount: number; liked: boolean };

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [showComment, setShowComment] = useState(false);

  useEffect(() => { document.title = 'FitAI — Clips'; }, []);
  useEffect(() => { setLoading(true); getClipsFeed(1, 20).then((c) => setClips(c as Clip[])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleLike = useCallback((id: string, idx: number) => {
    toggleClipLike(id).then(() => {
      setClips((prev) => prev.map((c, i) => i === idx ? { ...c, liked: !c.liked, likeCount: c.liked ? c.likeCount - 1 : c.likeCount + 1 } : c));
    }).catch(() => {});
  }, []);

  function handleComment(id: string) {
    if (!commentText.trim()) return;
    commentOnClip(id, commentText).then(() => {
      setCommentText(''); setShowComment(false);
      setClips((prev) => prev.map((c) => c.id === id ? { ...c, commentCount: c.commentCount + 1 } : c));
    }).catch(() => {});
  }

  function scrollTo(idx: number) { if (idx >= 0 && idx < clips.length) setCurrent(idx); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'ArrowDown') scrollTo(current + 1); if (e.key === 'ArrowUp') scrollTo(current - 1); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, clips.length]);

  if (loading) return <><div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}><span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading clips...</span></div></>;

  if (clips.length === 0) return (
    <>
      <div style={{ display: 'flex', height: '80vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <FitIcon name="camera" size={32} color="var(--text-3)" />
        <p className="v3-body" style={{ color: 'var(--text-3)', marginTop: 12 }}>No clips yet. Video upload coming soon.</p>
      </div>
    </>
  );

  const clip = clips[current];

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Community</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>Watch. Learn.<br /><em className="v3-clay" style={{ fontWeight: 300 }}>Repeat.</em></h1>
        </section>

        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ position: 'relative', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)' }}>
            {clip.exerciseName && (
              <p style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--stroke-1)', textAlign: 'center' as const }}>{clip.exerciseName}</p>
            )}
            {clip.formScore !== null && (
              <div style={{ position: 'absolute', left: 16, top: 16 }}>
                <Tag color="var(--sage, #34d399)">Form {clip.formScore}%</Tag>
              </div>
            )}
          </div>

          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text-1)', fontSize: 14 }}>
                {clip.userName.charAt(0)}
              </div>
              <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{clip.userName}</span>
            </div>
            {clip.caption && <p className="v3-body" style={{ color: 'var(--text-2)', marginBottom: 8 }}>{clip.caption}</p>}
            {clip.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 16 }}>
                {clip.tags.map((t) => <Tag key={t}>#{t}</Tag>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Button variant={clip.liked ? 'accent' : 'ghost'} size="sm" icon={<FitIcon name="heart" size={14} />} onClick={() => handleLike(clip.id, current)}>{clip.likeCount}</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowComment(!showComment)}>{clip.commentCount} comments</Button>
            </div>
            {showComment && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleComment(clip.id); }} placeholder="Write comment..." style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-0)', color: 'var(--text-1)', fontSize: 14 }} />
                <Button variant="accent" size="sm" onClick={() => handleComment(clip.id)}>Send</Button>
              </div>
            )}
          </div>
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
          <Button variant="ghost" size="sm" onClick={() => scrollTo(current - 1)} disabled={current === 0}>Prev</Button>
          <span className="v3-caption" style={{ color: 'var(--text-3)' }}>{current + 1} / {clips.length}</span>
          <Button variant="ghost" size="sm" onClick={() => scrollTo(current + 1)} disabled={current === clips.length - 1}>Next</Button>
        </div>
      </div>
    </>
  );
}
