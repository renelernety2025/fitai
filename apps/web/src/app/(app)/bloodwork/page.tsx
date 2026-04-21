'use client';

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getBloodwork, addBloodwork, deleteBloodwork, getBloodworkAnalysis } from '@/lib/api';

const TEST_TYPES = [
  { value: 'testosterone', label: 'Testosteron', unit: 'nmol/L', min: 10, max: 35 },
  { value: 'hemoglobin', label: 'Hemoglobin', unit: 'g/L', min: 120, max: 170 },
  { value: 'ferritin', label: 'Ferritin', unit: 'ug/L', min: 30, max: 300 },
  { value: 'vitD', label: 'Vitamin D', unit: 'nmol/L', min: 75, max: 150 },
  { value: 'crp', label: 'CRP', unit: 'mg/L', min: 0, max: 5 },
  { value: 'tsh', label: 'TSH', unit: 'mIU/L', min: 0.4, max: 4 },
  { value: 'glucose', label: 'Glukoza', unit: 'mmol/L', min: 3.9, max: 5.6 },
  { value: 'cholesterol', label: 'Cholesterol', unit: 'mmol/L', min: 0, max: 5.2 },
];

function DotChart({ entries, type }: { entries: any[]; type: typeof TEST_TYPES[number] }) {
  const filtered = entries.filter((e) => e.testType === type.value).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  if (filtered.length === 0) return null;

  const vals = filtered.map((e) => e.value);
  const allMin = Math.min(type.min * 0.8, ...vals);
  const allMax = Math.max(type.max * 1.2, ...vals);
  const range = allMax - allMin || 1;
  const w = 280;
  const h = 80;

  const pts = filtered.map((e, i) => ({
    x: filtered.length === 1 ? w / 2 : (i / (filtered.length - 1)) * w,
    y: h - ((e.value - allMin) / range) * h,
    val: e.value,
    inRange: e.value >= type.min && e.value <= type.max,
  }));

  const refY1 = h - ((type.min - allMin) / range) * h;
  const refY2 = h - ((type.max - allMin) / range) * h;

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">{type.label}</span>
        <span className="text-[10px] text-white/40">{type.unit}</span>
      </div>
      <svg width={w} height={h} className="w-full" viewBox={`0 0 ${w} ${h}`}>
        <rect x={0} y={Math.min(refY1, refY2)} width={w}
          height={Math.abs(refY1 - refY2)} fill="#A8FF00" fillOpacity={0.06} rx={4}
        />
        {pts.map((p, i) =>
          i > 0 ? (
            <line key={`l${i}`} x1={pts[i - 1].x} y1={pts[i - 1].y} x2={p.x} y2={p.y}
              stroke={p.inRange ? '#A8FF00' : '#FF375F'} strokeWidth={1.5} strokeOpacity={0.5}
            />
          ) : null,
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4}
            fill={p.inRange ? '#A8FF00' : '#FF375F'}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-white/30">
        <span>Ref: {type.min}-{type.max}</span>
        <span>Posledni: {vals[vals.length - 1]}</span>
      </div>
    </div>
  );
}

export default function BloodworkPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({ testType: 'testosterone', value: '', date: '', lab: '' });

  useEffect(() => {
    getBloodwork().then(setEntries).catch(() => {});
  }, []);

  async function handleAdd() {
    if (!form.value || !form.date) return;
    const selected = TEST_TYPES.find((t) => t.value === form.testType);
    const entry = await addBloodwork({
      testType: form.testType,
      value: parseFloat(form.value),
      unit: selected?.unit || '',
      date: form.date,
      lab: form.lab || null,
    });
    setEntries((prev) => [...prev, entry]);
    setForm({ testType: 'testosterone', value: '', date: '', lab: '' });
    setShowForm(false);
  }

  async function handleAnalysis() {
    setAnalyzing(true);
    try {
      const res = await getBloodworkAnalysis();
      setAnalysis(res.summary || res.analysis || 'Zadna analyza.');
    } catch {
      setAnalysis('AI analyza neni dostupna.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteBloodwork(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Zdravi</V2SectionLabel>
        <V2Display size="xl">Krevni testy.</V2Display>
      </section>

      <div className="mb-8 flex gap-3">
        <button onClick={() => setShowForm((p) => !p)}
          className="rounded-full border border-[#A8FF00]/30 px-6 py-2.5 text-sm font-semibold text-[#A8FF00] transition hover:bg-[#A8FF00]/10"
        >
          + Pridat zaznam
        </button>
        <button onClick={handleAnalysis} disabled={analyzing || entries.length === 0}
          className="rounded-full border border-[#BF5AF2]/30 px-6 py-2.5 text-sm font-semibold text-[#BF5AF2] transition hover:bg-[#BF5AF2]/10 disabled:opacity-40"
        >
          {analyzing ? 'Analyzuji...' : 'AI analyza'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/3 p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <select value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none"
            >
              {TEST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input type="number" step="any" placeholder="Hodnota" value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
            />
            <input type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none"
            />
            <input type="text" placeholder="Laborator" value={form.lab}
              onChange={(e) => setForm({ ...form, lab: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
          <button onClick={handleAdd}
            className="mt-4 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Ulozit
          </button>
        </div>
      )}

      {analysis && (
        <div className="mb-10 rounded-2xl border border-[#BF5AF2]/20 bg-[#BF5AF2]/5 p-6">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BF5AF2]">AI analyza</div>
          <p className="text-sm leading-relaxed text-white/70">{analysis}</p>
        </div>
      )}

      {/* Charts per test type */}
      <section className="mb-16">
        {TEST_TYPES.map((t) => (
          <DotChart key={t.value} entries={entries} type={t} />
        ))}
      </section>

      {/* Raw entries list */}
      {entries.length > 0 && (
        <section className="mb-16">
          <V2SectionLabel>Vsechny zaznamy</V2SectionLabel>
          <div className="space-y-2">
            {[...entries].reverse().map((e) => {
              const t = TEST_TYPES.find((tt) => tt.value === e.testType);
              const inRange = t ? e.value >= t.min && e.value <= t.max : true;
              return (
                <div key={e.id} className="flex items-center justify-between rounded-xl border border-white/8 px-5 py-3">
                  <div>
                    <span className="text-sm font-semibold text-white">{t?.label || e.testType}</span>
                    <span className={`ml-3 text-sm font-bold tabular-nums ${inRange ? 'text-[#A8FF00]' : 'text-[#FF375F]'}`}>
                      {e.value} {e.unit}
                    </span>
                    <span className="ml-3 text-[11px] text-white/30">{e.date}</span>
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="text-xs text-white/20 transition hover:text-[#FF375F]">
                    Smazat
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </V2Layout>
  );
}
