'use client';
import { useCallback, useEffect, useState } from 'react';
import { Card, Button, Chip, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getJournalMonth,
  upsertJournalEntry,
  generateJournalInsight,
  deleteJournalPhoto,
  downloadExport,
  type JournalDay,
} from '@/lib/api';

const MOODS = ['terrible', 'bad', 'neutral', 'good', 'great'] as const;
const MOOD_COLORS = ['#ef4444', '#f97316', 'var(--text-3)', 'var(--sage)', 'var(--accent)'];

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function JournalPage() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth);
  const [days, setDays] = useState<JournalDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayMood, setTodayMood] = useState(3);
  const [todayEnergy, setTodayEnergy] = useState(7);
  const [todayText, setTodayText] = useState('');

  useEffect(() => { document.title = 'FitAI — Journal'; }, []);

  const loadMonth = useCallback(async (month: string) => {
    setLoading(true);
    setError(null);
    try {
      const journalRes = await getJournalMonth(month);
      setDays(journalRes.days);
    } catch { setError('Failed to load entries'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadMonth(currentMonth); }, [currentMonth, loadMonth]);

  async function handleSaveToday() {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await upsertJournalEntry(today, { mood: MOODS[todayMood], energy: todayEnergy, notes: todayText });
      await loadMonth(currentMonth);
    } catch { setError('Failed to save entry'); }
  }

  async function handleUpdate(date: string, data: Record<string, unknown>) {
    if (data.deletePhoto) { await deleteJournalPhoto(data.deletePhoto as string); await loadMonth(currentMonth); return; }
    if (Object.keys(data).length === 0) { await loadMonth(currentMonth); return; }
    try { await upsertJournalEntry(date, data); await loadMonth(currentMonth); }
    catch { setError('Failed to save entry'); }
  }

  async function handleInsight(date: string) {
    try { await generateJournalInsight(date); await loadMonth(currentMonth); }
    catch { setError('Failed to generate AI insight'); }
  }

  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '40px 56px' }}>
      <JournalHeader month={currentMonth} onPrev={() => setCurrentMonth((m) => shiftMonth(m, -1))} onNext={() => setCurrentMonth((m) => shiftMonth(m, 1))} onExport={() => downloadExport(`export/journal?month=${currentMonth}`, `fitai-journal-${currentMonth}.csv`).catch(console.error)} />

      <TodayEntry mood={todayMood} energy={todayEnergy} text={todayText} onMood={setTodayMood} onEnergy={setTodayEnergy} onText={setTodayText} onSave={handleSaveToday} />

      <MoodHeatmap days={days} />

      {error && <div style={{ marginBottom: 16, padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontSize: 13 }}>{error}</div>}

      <PastEntries days={sorted} loading={loading} onUpdate={handleUpdate} onInsight={handleInsight} />
    </div>
  );
}

function JournalHeader({ month, onPrev, onNext, onExport }: { month: string; onPrev: () => void; onNext: () => void; onExport: () => void }) {
  const [y, m] = month.split('-');
  const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return (
    <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Journal · {names[parseInt(m) - 1]} {y}</div>
        <h1 className="v3-display-2" style={{ margin: 0 }}>
          Reflect.<br /><span className="v3-clay" style={{ fontWeight: 300 }}>Grow.</span>
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button variant="ghost" size="sm" onClick={onPrev}><FitIcon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} /></Button>
        <Button variant="ghost" size="sm" onClick={onNext}><FitIcon name="arrow" size={14} /></Button>
        <Button variant="ghost" size="sm" onClick={onExport}>CSV</Button>
      </div>
    </div>
  );
}

function TodayEntry({ mood, energy, text, onMood, onEnergy, onText, onSave }: { mood: number; energy: number; text: string; onMood: (n: number) => void; onEnergy: (n: number) => void; onText: (s: string) => void; onSave: () => void }) {
  return (
    <Card padding={32} style={{ marginBottom: 32, background: 'linear-gradient(135deg, var(--bg-card), rgba(232,93,44,0.04))' }}>
      <div className="v3-eyebrow-serif" style={{ marginBottom: 16 }}>How are you today?</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginBottom: 24 }}>
        <div>
          <div className="v3-caption" style={{ marginBottom: 12 }}>Mood</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0,1,2,3,4].map((i) => (
              <button key={i} onClick={() => onMood(i)} style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: i === mood ? MOOD_COLORS[i] : 'var(--bg-3)', transition: 'transform .15s',
                transform: i === mood ? 'scale(1.15)' : 'scale(1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: i === mood ? '#fff' : 'var(--text-3)' }}>{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="v3-caption" style={{ marginBottom: 12 }}>Energy</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min={1} max={10} value={energy} onChange={(e) => onEnergy(+e.target.value)} style={{ flex: 1, accentColor: 'var(--accent)' }} />
            <span className="v3-numeric" style={{ fontSize: 18, color: 'var(--text-1)' }}>{energy}/10</span>
          </div>
        </div>
        <div>
          <div className="v3-caption" style={{ marginBottom: 12 }}>Sleep</div>
          <div className="v3-numeric" style={{ fontSize: 32, color: 'var(--accent)' }}>--</div>
        </div>
      </div>
      <textarea
        value={text} onChange={(e) => onText(e.target.value)}
        placeholder="What's on your mind?"
        style={{ width: '100%', minHeight: 100, padding: 16, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 12, color: 'var(--text-1)', fontSize: 14, fontFamily: 'var(--font-text)', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button variant="accent" onClick={onSave}>Save entry</Button>
      </div>
    </Card>
  );
}

function MoodHeatmap({ days }: { days: JournalDay[] }) {
  const recent = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  if (recent.length === 0) return null;

  return (
    <Card padding={24} style={{ marginBottom: 24 }}>
      <div className="v3-eyebrow" style={{ marginBottom: 16 }}>Mood · last 14 days</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 6 }}>
        {recent.map((d, i) => {
          const moodIdx = d.entry?.mood ? MOODS.indexOf(d.entry.mood as typeof MOODS[number]) : -1;
          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                aspectRatio: '1', borderRadius: 8,
                background: moodIdx >= 0 ? MOOD_COLORS[moodIdx] : 'var(--bg-3)',
                opacity: moodIdx >= 0 ? (0.4 + moodIdx * 0.15) : 0.2,
              }} />
              <div className="v3-caption" style={{ marginTop: 4, fontSize: 9 }}>{new Date(d.date).getDate()}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PastEntries({ days, loading, onUpdate, onInsight }: { days: JournalDay[]; loading: boolean; onUpdate: (d: string, data: Record<string, unknown>) => void; onInsight: (d: string) => void }) {
  if (loading) return <div className="v3-caption" style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;

  const withEntries = days.filter((d) => d.entry);
  if (withEntries.length === 0) return <div className="v3-caption" style={{ textAlign: 'center', padding: 40 }}>No entries this month.</div>;

  return (
    <div>
      <SectionHeader eyebrow="Recent" title="Past entries" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {withEntries.slice(0, 10).map((d) => (
          <Card key={d.date} padding={24}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: MOOD_COLORS[MOODS.indexOf(d.entry!.mood as typeof MOODS[number]) || 2], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{(MOODS.indexOf(d.entry!.mood as typeof MOODS[number]) || 2) + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="v3-caption" style={{ marginBottom: 6 }}>
                  {new Date(d.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.5 }}>
                  {d.entry?.notes || 'No notes.'}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onInsight(d.date)}>
                <FitIcon name="bolt" size={12} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
