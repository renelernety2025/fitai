'use client';

import { useEffect, useState } from 'react';
import { Card, Button, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getRehabPlans, createRehabPlan, logRehabSession, getRehabSessions } from '@/lib/api';

const STATUS_COLOR: Record<string, string> = { active: 'var(--sage, #34d399)', completed: '#00E5FF', paused: '#FF9F0A' };
const BODY_PARTS = ['Koleno', 'Rameno', 'Zada', 'Kotnik', 'Zapesti', 'Krk', 'Kycel', 'Loket'];
const SEVERITIES = [{ value: 'mild', label: 'Mild' }, { value: 'moderate', label: 'Moderate' }, { value: 'severe', label: 'Severe' }];

export default function RehabPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ injuryType: '', bodyPart: 'Koleno', severity: 'mild' });
  const [logForm, setLogForm] = useState({ painLevel: 5, notes: '' });

  useEffect(() => { document.title = 'FitAI — Rehab'; }, []);
  useEffect(() => { getRehabPlans().then(setPlans).catch(() => setError('Failed to load')).finally(() => setLoading(false)); }, []);

  async function handleCreate() {
    if (!form.injuryType) return;
    const plan = await createRehabPlan(form);
    setPlans((p) => [...p, plan]);
    setShowCreate(false);
    setForm({ injuryType: '', bodyPart: 'Koleno', severity: 'mild' });
  }

  async function selectPlan(plan: any) {
    setSelected(plan); setShowLog(false);
    try { setSessions(await getRehabSessions(plan.id)); } catch { setSessions([]); }
  }

  async function handleLog() {
    if (!selected) return;
    const session = await logRehabSession(selected.id, logForm);
    setSessions((p) => [...p, session]);
    setShowLog(false); setLogForm({ painLevel: 5, notes: '' });
  }

  function painColor(level: number) { return level <= 3 ? 'var(--sage, #34d399)' : level <= 6 ? '#FF9F0A' : 'var(--danger, #ef4444)'; }

  if (loading) return <><div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1.5s infinite' }} /></div></>;

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Recovery</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>Heal smart,<br /><em className="v3-clay" style={{ fontWeight: 300 }}>train smart.</em></h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 12, maxWidth: 480 }}>AI rehabilitation plans. Track pain, log sessions, recover faster.</p>
        </section>

        {error && <Card padding={16} style={{ marginBottom: 16 }}><p style={{ color: 'var(--danger, #ef4444)' }}>{error}</p></Card>}

        <div style={{ marginBottom: 24 }}>
          <Button variant="ghost" onClick={() => setShowCreate((p) => !p)} icon={<FitIcon name="plus" size={14} />}>New plan</Button>
        </div>

        {showCreate && (
          <Card padding={20} style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              <input type="text" placeholder="Injury type" value={form.injuryType} onChange={(e) => setForm({ ...form, injuryType: e.target.value })} style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-0)', color: 'var(--text-1)', fontSize: 14 }} />
              <select value={form.bodyPart} onChange={(e) => setForm({ ...form, bodyPart: e.target.value })} style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-0)', color: 'var(--text-1)', fontSize: 14 }}>
                {BODY_PARTS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-0)', color: 'var(--text-1)', fontSize: 14 }}>
                {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 12 }}><Button variant="accent" onClick={handleCreate}>Create (AI generates plan)</Button></div>
          </Card>
        )}

        {plans.length === 0 && !error && (
          <Card padding={48} style={{ textAlign: 'center' as const }}><FitIcon name="shield" size={28} color="var(--text-3)" /><p className="v3-body" style={{ color: 'var(--text-3)', marginTop: 12 }}>No rehab plans yet.</p></Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
          {plans.map((plan) => (
            <Card key={plan.id} hover padding={16} onClick={() => selectPlan(plan)} style={{ border: selected?.id === plan.id ? '1px solid var(--accent)' : undefined }}>
              <Tag color={STATUS_COLOR[plan.status]}>{plan.status}</Tag>
              <div className="v3-body" style={{ fontWeight: 700, color: 'var(--text-1)', marginTop: 8 }}>{plan.injuryType}</div>
              <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>{plan.bodyPart} / {plan.severity}</div>
            </Card>
          ))}
        </div>

        {selected && (
          <section>
            <SectionHeader title={`Plan: ${selected.injuryType}`} />
            {selected.phases && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
                {selected.phases.map((phase: any, i: number) => (
                  <Card key={i} padding={14} style={{ flex: '1 1 180px', border: phase.current ? '1px solid var(--accent)' : undefined }}>
                    <Tag>Phase {i + 1}</Tag>
                    <div className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)', marginTop: 6 }}>{phase.name}</div>
                    {phase.exercises && (<ul style={{ marginTop: 6, paddingLeft: 16 }}>{phase.exercises.map((ex: string, j: number) => <li key={j} className="v3-caption" style={{ color: 'var(--text-3)' }}>{ex}</li>)}</ul>)}
                  </Card>
                ))}
              </div>
            )}
            <Button variant="ghost" onClick={() => setShowLog((p) => !p)} icon={<FitIcon name="plus" size={14} />}>Log session</Button>
            {showLog && (
              <Card padding={20} style={{ marginTop: 12 }}>
                <div className="v3-eyebrow" style={{ marginBottom: 6 }}>PAIN (0-10): {logForm.painLevel}</div>
                <input type="range" min={0} max={10} value={logForm.painLevel} onChange={(e) => setLogForm({ ...logForm, painLevel: parseInt(e.target.value) })} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                <textarea placeholder="Notes..." value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} rows={3} style={{ width: '100%', marginTop: 12, padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-0)', color: 'var(--text-1)', fontSize: 14, resize: 'vertical' }} />
                <div style={{ marginTop: 12 }}><Button variant="accent" onClick={handleLog}>Log</Button></div>
              </Card>
            )}
            {sessions.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <SectionHeader title="Session history" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sessions.map((s, i) => (
                    <Card key={s.id || i} padding="10px 16px">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="v3-caption" style={{ color: 'var(--text-3)' }}>{s.date || s.createdAt?.slice(0, 10)}</span>
                        <span className="v3-numeric" style={{ fontWeight: 700, color: painColor(s.painLevel) }}>Pain: {s.painLevel}/10</span>
                        {s.notes && <span className="v3-caption" style={{ color: 'var(--text-3)' }}>{s.notes}</span>}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
