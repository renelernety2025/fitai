'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { request } from '@/lib/api';

interface CronSummary {
  name: string;
  ok: number;
  failed: number;
  running: number;
  lastRun: string;
  lastStatus: 'OK' | 'FAILED' | 'RUNNING';
  lastDurationMs: number | null;
}

interface CronRun {
  id: string;
  name: string;
  status: 'OK' | 'FAILED' | 'RUNNING';
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  error: string | null;
}

export default function OpsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<CronSummary[]>([]);
  const [recent, setRecent] = useState<CronRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => { document.title = 'FitAI — Ops dashboard'; }, []);

  const reload = useCallback(() => {
    if (!user?.isAdmin) return;
    setLoading(true);
    setErr('');
    Promise.all([
      request<CronSummary[]>('/admin/cron/summary'),
      request<CronRun[]>('/admin/cron/runs?limit=50'),
    ])
      .then(([s, r]) => { setSummary(s); setRecent(r); })
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Could not load'))
      .finally(() => setLoading(false));
  }, [user?.isAdmin]);

  useEffect(() => { reload(); }, [reload]);

  if (!user?.isAdmin) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="v3-display-2">Access denied</h1>
          <Link href="/dashboard" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">Back</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-white/40 transition hover:text-white">&larr; Admin</Link>

      <section style={{ padding: '32px 0 24px' }}>
        <p className="v3-eyebrow-serif">Operations</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Cron<br/><em className="v3-clay" style={{ fontWeight: 300 }}>health.</em>
        </h1>
        <p style={{ color: 'var(--text-3)', marginTop: 12, fontSize: 14 }}>
          Last 24 hours of scheduled jobs. Wrapped via CronTrackingService.
        </p>
        <button onClick={reload} className="mt-4 rounded-full px-4 py-2 text-sm" style={{ background: 'var(--bg-2)', border: '1px solid var(--stroke-2)', color: 'var(--text-1)' }}>
          Refresh
        </button>
      </section>

      {err && <p style={{ color: 'var(--clay)', marginBottom: 16 }}>{err}</p>}
      {loading && <p style={{ color: 'var(--text-3)' }}>Loading…</p>}

      {summary.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ color: 'var(--text-2)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Summary (24h)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {summary.map((s) => (
              <div key={s.name} style={{ padding: 16, borderRadius: 12, background: 'var(--bg-1)', border: '1px solid var(--stroke-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{s.name}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: statusBg(s.lastStatus), color: '#fff' }}>
                    {s.lastStatus}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>
                  {s.ok > 0 && <span style={{ color: 'var(--sage)' }}>{s.ok} ok</span>}
                  {s.failed > 0 && <span style={{ color: 'var(--clay)' }}>{s.failed} failed</span>}
                  {s.running > 0 && <span style={{ color: 'var(--text-3)' }}>{s.running} running</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  Last: {new Date(s.lastRun).toLocaleString('en-GB')}
                  {s.lastDurationMs != null && ` · ${formatDuration(s.lastDurationMs)}`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section>
          <h2 style={{ color: 'var(--text-2)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Recent runs ({recent.length})</h2>
          <div style={{ background: 'var(--bg-1)', borderRadius: 12, border: '1px solid var(--stroke-2)', overflow: 'hidden' }}>
            {recent.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', gap: 12, padding: 12, borderBottom: i === recent.length - 1 ? 'none' : '1px solid var(--stroke-2)', alignItems: 'center', fontSize: 13 }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: statusBg(r.status), color: '#fff', minWidth: 60, textAlign: 'center' }}>{r.status}</span>
                <span style={{ flex: 1, color: 'var(--text-1)' }}>{r.name}</span>
                <span style={{ color: 'var(--text-3)' }}>{new Date(r.startedAt).toLocaleString('en-GB')}</span>
                {r.durationMs != null && <span style={{ color: 'var(--text-3)', minWidth: 70, textAlign: 'right' }}>{formatDuration(r.durationMs)}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && summary.length === 0 && (
        <p style={{ color: 'var(--text-3)', padding: 32, textAlign: 'center' }}>
          No cron runs in the last 24 hours yet. Wait for the next firing or check that wrapped crons are deployed.
        </p>
      )}
    </>
  );
}

function statusBg(status: 'OK' | 'FAILED' | 'RUNNING') {
  if (status === 'OK') return 'var(--sage)';
  if (status === 'FAILED') return 'var(--clay)';
  return 'var(--bg-3)';
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
