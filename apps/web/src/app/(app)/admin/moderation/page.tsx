'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  listPendingReports,
  reviewReport,
  type ContentReport,
} from '@/lib/api/moderation';

type FilterStatus = 'PENDING' | 'REVIEWED_VALID' | 'REVIEWED_INVALID' | 'DISMISSED';

const REASON_LABEL: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Harassment',
  HATE_SPEECH: 'Hate speech',
  NUDITY: 'Nudity',
  VIOLENCE: 'Violence',
  SELF_HARM: 'Self-harm',
  MISINFORMATION: 'Misinformation',
  OTHER: 'Other',
};

const TARGET_LABEL: Record<string, string> = {
  POST: 'Post',
  CLIP: 'Clip',
  POST_COMMENT: 'Post comment',
  CLIP_COMMENT: 'Clip comment',
  USER: 'User',
};

export default function ModerationQueuePage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<FilterStatus>('PENDING');
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Moderation queue'; }, []);

  const reload = useCallback(() => {
    if (!user?.isAdmin) return;
    setLoading(true);
    setError('');
    listPendingReports(status)
      .then(setReports)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load reports'))
      .finally(() => setLoading(false));
  }, [status, user?.isAdmin]);

  useEffect(() => { reload(); }, [reload]);

  async function handleAction(id: string, action: 'HIDE_CONTENT' | 'BAN_USER' | 'DISMISS') {
    const messages: Record<typeof action, string> = {
      HIDE_CONTENT: 'Hide this content from all feeds?',
      BAN_USER: 'Ban the author? They will be unable to log in.',
      DISMISS: 'Dismiss this report without action?',
    };
    if (!confirm(messages[action])) return;
    const notes = action === 'DISMISS' ? undefined : prompt('Notes (optional, internal):') || undefined;
    setActingOn(id);
    try {
      await reviewReport(id, action, notes);
      reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActingOn(null);
    }
  }

  if (!user?.isAdmin) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="v3-display-2">Access denied</h1>
          <p className="mt-4 text-white/40">Admin only.</p>
          <Link href="/dashboard" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">Back</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-white/40 transition hover:text-white">
        &larr; Admin
      </Link>

      <section style={{ padding: '32px 0 24px' }}>
        <p className="v3-eyebrow-serif">Moderation</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Report<br/><em className="v3-clay" style={{ fontWeight: 300 }}>queue.</em>
        </h1>
      </section>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['PENDING', 'REVIEWED_VALID', 'REVIEWED_INVALID', 'DISMISSED'] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '8px 16px', borderRadius: 999, fontSize: 13,
              background: status === s ? 'var(--clay)' : 'var(--bg-2)',
              color: status === s ? '#fff' : 'var(--text-2)',
              border: status === s ? '1px solid var(--clay)' : '1px solid var(--stroke-2)',
              cursor: 'pointer',
            }}
          >
            {s.replace('_', ' ').toLowerCase()}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'var(--clay)', fontSize: 14, marginBottom: 16 }}>{error}</p>}
      {loading && <p style={{ color: 'var(--text-3)' }}>Loading…</p>}

      {!loading && reports.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>
          No reports in this state.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reports.map((r) => (
          <div
            key={r.id}
            style={{
              padding: 16, borderRadius: 12,
              background: 'var(--bg-1)',
              border: '1px solid var(--stroke-2)',
            }}
          >
            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-3)', color: 'var(--text-2)' }}>
                    {TARGET_LABEL[r.targetType] ?? r.targetType}
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(232,93,44,0.15)', color: 'var(--clay)' }}>
                    {REASON_LABEL[r.reason] ?? r.reason}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {new Date(r.createdAt).toLocaleString('en-GB')}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-1)', marginBottom: 4 }}>
                  <strong>{r.reporter.name}</strong> reported {' '}
                  {r.reportedUser ? <>user <strong>{r.reportedUser.name}</strong> {r.reportedUser.bannedAt && <em style={{ color: 'var(--clay)' }}>(banned)</em>}</> : `(${r.targetType.toLowerCase()} ${r.targetId.slice(0, 8)}…)`}
                </div>
                {r.details && (
                  <div style={{ fontSize: 13, color: 'var(--text-2)', padding: 8, marginTop: 8, background: 'var(--bg-2)', borderRadius: 6, fontStyle: 'italic' }}>
                    &ldquo;{r.details}&rdquo;
                  </div>
                )}
                {r.reviewer && (
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                    Reviewed by {r.reviewer.name} on {new Date(r.reviewedAt!).toLocaleString('en-GB')}
                    {r.reviewerNotes && <> — {r.reviewerNotes}</>}
                  </div>
                )}
              </div>

              {status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleAction(r.id, 'HIDE_CONTENT')}
                    disabled={actingOn === r.id}
                    style={btnStyle('var(--clay-deep)', 'var(--clay-deep)')}
                  >
                    Hide
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'BAN_USER')}
                    disabled={actingOn === r.id || !r.reportedUserId}
                    style={btnStyle('var(--clay)', 'var(--clay)')}
                  >
                    Ban user
                  </button>
                  <button
                    onClick={() => handleAction(r.id, 'DISMISS')}
                    disabled={actingOn === r.id}
                    style={btnStyle('transparent', 'var(--stroke-2)', 'var(--text-2)')}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function btnStyle(bg: string, border: string, color = '#fff'): React.CSSProperties {
  return {
    padding: '6px 14px', fontSize: 13, borderRadius: 6,
    background: bg, border: `1px solid ${border}`, color,
    cursor: 'pointer',
  };
}
