'use client';

import { useState, useEffect } from 'react';
import { getComments, addComment, deleteComment } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Comment {
  id: string;
  content: string;
  userId: string;
  user: { id: string; name: string };
  createdAt: string;
}

interface CommentSectionProps {
  feedItemId: string;
  commentCount: number;
}

function timeAgo(date: string) {
  const m = Math.floor(
    (Date.now() - new Date(date).getTime()) / 60000,
  );
  if (m < 1) return 'ted';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function CommentSection({
  feedItemId,
  commentCount,
}: CommentSectionProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    getComments(feedItemId).then(setComments).catch(() => {});
  }, [open, feedItemId]);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const c = await addComment(feedItemId, text.trim());
      setComments((prev) => [...prev, c]);
      setText('');
    } catch {
      // silent
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silent
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-[11px] font-medium transition"
        style={{ color: 'var(--text-muted)' }}
      >
        {open
          ? 'Skryt komentare'
          : `${commentCount || comments.length} komentaru`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--text-primary)',
                }}
              >
                {c.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {c.user.name}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {c.content}
                </p>
              </div>
              {c.userId === user?.id && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-[10px] transition"
                  style={{ color: 'var(--text-muted)' }}
                >
                  x
                </button>
              )}
            </div>
          ))}

          {/* New comment input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              placeholder="Napsat komentar..."
              className="flex-1 border-b bg-transparent py-1 text-xs focus:outline-none"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
              className="text-[11px] font-semibold transition disabled:opacity-30"
              style={{ color: '#A8FF00' }}
            >
              Odeslat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
