'use client';

import { useState } from 'react';
import { reportContent } from '@/lib/api';
import type { ReportReason, ReportTargetType } from '@/lib/api/moderation';

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
  onClose: () => void;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam or misleading' },
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'HATE_SPEECH', label: 'Hate speech or symbols' },
  { value: 'NUDITY', label: 'Nudity or sexual content' },
  { value: 'VIOLENCE', label: 'Violence or threats' },
  { value: 'SELF_HARM', label: 'Self-harm or suicide' },
  { value: 'MISINFORMATION', label: 'False or harmful information' },
  { value: 'OTHER', label: 'Something else' },
];

export function ReportModal({ targetType, targetId, targetLabel, onClose }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      await reportContent({ targetType, targetId, reason, details: details.trim() || undefined });
      setSent(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not send report');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-1)', borderRadius: 16, padding: 28, width: 460,
          maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {sent ? (
          <div style={{ textAlign: 'center', padding: '32px 8px' }}>
            <div className="v3-eyebrow-serif" style={{ marginBottom: 8 }}>Thanks for letting us know</div>
            <h3 className="v3-display-3" style={{ margin: '0 0 12px' }}>Report received.</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 22, marginBottom: 24 }}>
              We&apos;ll review {targetLabel} within 24 hours. You can also block this user from the post menu.
            </p>
            <button onClick={onClose} className="v3-btn">Done</button>
          </div>
        ) : (
          <>
            <div className="v3-eyebrow-serif" style={{ marginBottom: 8 }}>Report</div>
            <h3 className="v3-display-3" style={{ margin: '0 0 8px' }}>What&apos;s wrong?</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 20 }}>
              Reporting {targetLabel}. Your report is anonymous to the author.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: reason === r.value ? 'var(--bg-3)' : 'var(--bg-2)',
                    border: `1px solid ${reason === r.value ? 'var(--clay)' : 'var(--stroke-2)'}`,
                    borderRadius: 8, cursor: 'pointer', fontSize: 14,
                    color: 'var(--text-1)',
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="More details (optional, 500 chars)"
              maxLength={500}
              rows={3}
              style={{
                width: '100%', padding: 10, background: 'var(--bg-2)',
                border: '1px solid var(--stroke-2)', borderRadius: 8, color: 'var(--text-1)',
                fontSize: 14, marginBottom: 16, resize: 'vertical',
              }}
            />

            {err && <div style={{ color: 'var(--clay)', fontSize: 13, marginBottom: 12 }}>{err}</div>}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={onClose} className="v3-btn v3-btn-ghost">Cancel</button>
              <button onClick={submit} disabled={busy} className="v3-btn v3-btn-accent">
                {busy ? 'Sending…' : 'Send report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
