'use client';

import { useEffect, useState } from 'react';
import { Card, Button, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getBloodwork, addBloodwork, deleteBloodwork, getBloodworkAnalysis } from '@/lib/api';

const TEST_TYPES = [
  { value: 'testosterone', label: 'Testosterone', unit: 'ng/dL', min: 300, max: 1000 },
  { value: 'iron', label: 'Iron', unit: 'ug/dL', min: 60, max: 170 },
  { value: 'vitaminD', label: 'Vitamin D', unit: 'ng/mL', min: 30, max: 80 },
  { value: 'crp', label: 'CRP', unit: 'mg/L', min: 0, max: 3 },
  { value: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL', min: 0, max: 200 },
  { value: 'glucose', label: 'Glucose', unit: 'mg/dL', min: 70, max: 100 },
  { value: 'hba1c', label: 'HbA1c', unit: '%', min: 4, max: 5.7 },
];

function DotChart({ entries, type }: { entries: any[]; type: typeof TEST_TYPES[number] }) {
  const filtered = entries.filter((e) => e.testType === type.value).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (filtered.length === 0) return null;
  const vals = filtered.map((e) => e.value);
  const allMin = Math.min(type.min * 0.8, ...vals);
  const allMax = Math.max(type.max * 1.2, ...vals);
  const range = allMax - allMin || 1;
  const w = 280, h = 80;
  const pts = filtered.map((e, i) => ({ x: filtered.length === 1 ? w / 2 : (i / (filtered.length - 1)) * w, y: h - ((e.value - allMin) / range) * h, val: e.value, inRange: e.value >= type.min && e.value <= type.max }));
  const refY1 = h - ((type.min - allMin) / range) * h;
  const refY2 = h - ((type.max - allMin) / range) * h;
  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{type.label}</span>
        <span className="v3-caption" style={{ color: 'var(--text-3)' }}>{type.unit}</span>
      </div>
      <svg width={w} height={h} style={{ width: '100%' }} viewBox={`0 0 ${w} ${h}`}>
        <rect x={0} y={Math.min(refY1, refY2)} width={w} height={Math.abs(refY1 - refY2)} fill="var(--sage, #34d399)" fillOpacity={0.06} rx={4} />
        {pts.map((p, i) => i > 0 ? <line key={`l${i}`} x1={pts[i - 1].x} y1={pts[i - 1].y} x2={p.x} y2={p.y} stroke={p.inRange ? 'var(--sage, #34d399)' : 'var(--danger, #ef4444)'} strokeWidth={1.5} strokeOpacity={0.5} /> : null)}
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill={p.inRange ? 'var(--sage, #34d399)' : 'var(--danger, #ef4444)'} />)}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Ref: {type.min}-{type.max}</span>
        <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Last: {vals[vals.length - 1]}</span>
      </div>
    </Card>
  );
}

export default function BloodworkPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({ testType: 'testosterone', value: '', date: '', lab: '' });

  useEffect(() => { document.title = 'FitAI — Bloodwork'; }, []);
  useEffect(() => { getBloodwork().then(setEntries).catch(() => setError('Failed to load')).finally(() => setLoading(false)); }, []);

  async function handleAdd() {
    if (!form.value || !form.date) return;
    const sel = TEST_TYPES.find((t) => t.value === form.testType);
    const entry = await addBloodwork({ testType: form.testType, value: parseFloat(form.value), unit: sel?.unit || '', date: form.date, lab: form.lab || null });
    setEntries((prev) => [...prev, entry]);
    setForm({ testType: 'testosterone', value: '', date: '', lab: '' });
    setShowForm(false);
  }

  async function handleAnalysis() {
    setAnalyzing(true);
    try { const res = await getBloodworkAnalysis(); setAnalysis(res.summary || res.analysis || 'No analysis.'); }
    catch { setAnalysis('AI analysis unavailable.'); }
    finally { setAnalyzing(false); }
  }

  if (loading) return <><div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1.5s infinite' }} /></div></>;

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Health</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>Know your<br /><em className="v3-clay" style={{ fontWeight: 300 }}>numbers.</em></h1>
        </section>

        {error && <Card padding={16} style={{ marginBottom: 16 }}><p className="v3-body" style={{ color: 'var(--danger, #ef4444)' }}>{error}</p></Card>}

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <Button variant="ghost" onClick={() => setShowForm((p) => !p)} icon={<FitIcon name="plus" size={14} />}>Add record</Button>
          <Button variant="ghost" onClick={handleAnalysis} disabled={analyzing || entries.length === 0} icon={<FitIcon name="brain" size={14} />}>
            {analyzing ? 'Analyzing...' : 'AI analysis'}
          </Button>
        </div>

        {showForm && (
          <Card padding={20} style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <select value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })} style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-0)', color: 'var(--text-1)', fontSize: 14 }}>
                {TEST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input type="number" step="any" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-0)', color: 'var(--text-1)', fontSize: 14 }} />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-0)', color: 'var(--text-1)', fontSize: 14 }} />
              <input type="text" placeholder="Lab" value={form.lab} onChange={(e) => setForm({ ...form, lab: e.target.value })} style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-0)', color: 'var(--text-1)', fontSize: 14 }} />
            </div>
            <div style={{ marginTop: 12 }}><Button variant="accent" onClick={handleAdd}>Save</Button></div>
          </Card>
        )}

        {analysis && (
          <Card padding={20} style={{ marginBottom: 24, borderColor: 'color-mix(in srgb, #BF5AF2 30%, transparent)' }}>
            <Tag color="#BF5AF2">AI ANALYSIS</Tag>
            <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 8 }}>{analysis}</p>
          </Card>
        )}

        {entries.length === 0 && !error && (
          <Card padding={48} style={{ textAlign: 'center' as const }}>
            <FitIcon name="pulse" size={28} color="var(--text-3)" />
            <p className="v3-body" style={{ color: 'var(--text-3)', marginTop: 12 }}>No bloodwork records yet.</p>
          </Card>
        )}

        {entries.length > 0 && (
          <section style={{ marginBottom: 32 }}>{TEST_TYPES.map((t) => <DotChart key={t.value} entries={entries} type={t} />)}</section>
        )}

        {entries.length > 0 && (
          <section>
            <SectionHeader title="All records" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...entries].reverse().map((e) => {
                const t = TEST_TYPES.find((tt) => tt.value === e.testType);
                const inRange = t ? e.value >= t.min && e.value <= t.max : true;
                return (
                  <Card key={e.id} padding="10px 16px">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{t?.label || e.testType}</span>
                        <span className="v3-numeric" style={{ fontWeight: 700, color: inRange ? 'var(--sage, #34d399)' : 'var(--danger, #ef4444)' }}>{e.value} {e.unit}</span>
                        <span className="v3-caption" style={{ color: 'var(--text-3)' }}>{e.date}</span>
                      </div>
                      <button onClick={() => deleteBloodwork(e.id).then(() => setEntries((prev) => prev.filter((x) => x.id !== e.id)))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 11 }}>Delete</button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
