'use client';

/**
 * Workout Calendar — monthly grid with scheduled/completed workouts.
 * Click day -> side modal with detail + CRUD.
 */

import { useEffect, useState, useCallback } from 'react';
import { V2Layout, V2SectionLabel } from '@/components/v2/V2Layout';
import {
  getCalendarMonth,
  scheduleWorkout,
  updateScheduledWorkout,
  deleteScheduledWorkout,
} from '@/lib/api';

interface ScheduledWorkout {
  id: string;
  date: string;
  title: string;
  planId: string | null;
  notes: string | null;
  completed: boolean;
}

interface CalendarDay {
  date: string;
  workouts: ScheduledWorkout[];
}

const DAY_NAMES = ['Po', 'Ut', 'St', 'Ct', 'Pa', 'So', 'Ne'];

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(m: string): string {
  const [y, mo] = m.split('-');
  const names = ['Leden','Unor','Brezen','Duben','Kveten','Cerven','Cervenec','Srpen','Zari','Rijen','Listopad','Prosinec'];
  return `${names[parseInt(mo, 10) - 1]} ${y}`;
}

function buildGrid(month: string): string[][] {
  const [y, mo] = month.split('-').map(Number);
  const first = new Date(y, mo - 1, 1);
  const last = new Date(y, mo, 0);
  const startDay = (first.getDay() + 6) % 7;
  const totalDays = last.getDate();
  const cells: string[] = [];
  for (let i = 0; i < startDay; i++) cells.push('');
  for (let d = 1; d <= totalDays; d++) {
    cells.push(`${month}-${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push('');
  const rows: string[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [month, setMonth] = useState(currentMonth);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCalendarMonth(month)
      .then((d) => setDays(d.days || d || []))
      .catch(() => { setDays([]); setError('Nepodarilo se nacist kalendar'); })
      .finally(() => setLoading(false));
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const grid = buildGrid(month);
  const dayMap = new Map(days.map((d) => [d.date, d]));

  function openDay(date: string) {
    if (!date) return;
    setSelectedDate(date);
    setFormTitle('');
    setFormNotes('');
    setEditId(null);
  }

  function startEdit(w: ScheduledWorkout) {
    setEditId(w.id);
    setFormTitle(w.title);
    setFormNotes(w.notes || '');
  }

  async function handleSave() {
    if (!selectedDate || !formTitle.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await updateScheduledWorkout(editId, { title: formTitle, notes: formNotes });
      } else {
        await scheduleWorkout({ date: selectedDate, title: formTitle, notes: formNotes });
      }
      load();
      setFormTitle('');
      setFormNotes('');
      setEditId(null);
    } catch {
      setError('Nepodarilo se ulozit');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteScheduledWorkout(id);
      load();
    } catch {
      setError('Nepodarilo se smazat');
    }
  }

  const selectedDay = selectedDate ? dayMap.get(selectedDate) : null;

  return (
    <V2Layout>
      <section className="pt-12 pb-24">
        <V2SectionLabel>Kalendar treninku</V2SectionLabel>

        {/* Month navigation */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label="Predchozi mesic"
            className="rounded-full border border-white/10 px-3 py-1 text-white/50 transition hover:text-white"
          >
            &larr;
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-white">{monthLabel(month)}</h1>
          <button
            onClick={() => setMonth(shiftMonth(month, 1))}
            aria-label="Dalsi mesic"
            className="rounded-full border border-white/10 px-3 py-1 text-white/50 transition hover:text-white"
          >
            &rarr;
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-[#FF375F]/20 bg-[#FF375F]/5 px-6 py-4 text-sm text-[#FF375F]">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#A8FF00]" />
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Calendar grid */}
            <div className="flex-1">
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {DAY_NAMES.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid rows */}
              {grid.map((row, ri) => (
                <div key={ri} className="grid grid-cols-7 gap-1">
                  {row.map((date, ci) => {
                    const day = date ? dayMap.get(date) : null;
                    const hasPlanned = day?.workouts.some((w) => !w.completed);
                    const hasCompleted = day?.workouts.some((w) => w.completed);
                    const hasMissed = day && isPast(date) && hasPlanned && !hasCompleted;
                    const today = date ? isToday(date) : false;
                    const selected = date === selectedDate;

                    return (
                      <button
                        key={ci}
                        onClick={() => openDay(date)}
                        disabled={!date}
                        className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition ${
                          !date
                            ? 'border-transparent'
                            : selected
                            ? 'border-[#A8FF00]/40 bg-[#A8FF00]/10'
                            : today
                            ? 'border-white/20 bg-white/5'
                            : 'border-white/5 hover:border-white/15'
                        }`}
                      >
                        {date && (
                          <>
                            <span className={`tabular-nums ${today ? 'font-bold text-white' : 'text-white/50'}`}>
                              {parseInt(date.split('-')[2], 10)}
                            </span>
                            <div className="mt-1 flex gap-1">
                              {hasCompleted && <span className="h-1.5 w-1.5 rounded-full bg-green-400" />}
                              {hasPlanned && !hasMissed && <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
                              {hasMissed && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Legend */}
              <div className="mt-4 flex gap-4 text-[10px] text-white/40">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Planovane</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-400" /> Splneno</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> Zmeskane</span>
              </div>
            </div>

            {/* Side panel */}
            {selectedDate && (
              <div className="w-full shrink-0 rounded-2xl border border-white/10 bg-white/3 p-6 lg:w-80">
                <h3 className="mb-4 text-lg font-bold text-white">{selectedDate}</h3>

                {/* Existing workouts */}
                {selectedDay?.workouts.map((w) => (
                  <div key={w.id} className="mb-3 rounded-xl border border-white/8 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        {w.completed ? '\u2713 ' : ''}{w.title}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(w)} className="text-[10px] text-white/40 hover:text-white">Upravit</button>
                        <button onClick={() => handleDelete(w.id)} className="text-[10px] text-red-400/60 hover:text-red-400">Smazat</button>
                      </div>
                    </div>
                    {w.notes && <p className="mt-1 text-xs text-white/40">{w.notes}</p>}
                  </div>
                ))}

                {/* Add/edit form */}
                <div className="mt-4 space-y-3">
                  <input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Nazev treninku"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#A8FF00]/40 focus:outline-none"
                  />
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Poznamky..."
                    rows={2}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#A8FF00]/40 focus:outline-none"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving || !formTitle.trim()}
                    className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    {saving ? 'Ukladam...' : editId ? 'Ulozit zmenu' : 'Pridat trenink'}
                  </button>
                  {editId && (
                    <button
                      onClick={() => { setEditId(null); setFormTitle(''); setFormNotes(''); }}
                      className="w-full text-center text-xs text-white/40 hover:text-white"
                    >
                      Zrusit upravu
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </V2Layout>
  );
}
