'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getWorkoutPlan, updateWorkoutPlan, type WorkoutPlanData } from '@/lib/api';
import ExerciseCard, { type PlannedExerciseLocal } from '@/components/plans/ExerciseCard';
import ExerciseGroup from '@/components/plans/ExerciseGroup';
import ExercisePicker from '@/components/plans/ExercisePicker';

interface DayLocal {
  id: string;
  dayIndex: number;
  name: string;
  nameCs: string;
  exercises: PlannedExerciseLocal[];
}

export default function PlanEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [plan, setPlan] = useState<WorkoutPlanData | null>(null);
  const [days, setDays] = useState<DayLocal[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);

  useEffect(() => {
    getWorkoutPlan(params.id).then((p) => {
      setPlan(p);
      setDays(p.days.map((d) => ({
        id: d.id,
        dayIndex: d.dayIndex,
        name: d.name,
        nameCs: d.nameCs,
        exercises: d.plannedExercises.map((pe) => ({ ...pe })),
      })));
    }).catch(console.error);
  }, [params.id]);

  const currentExercises = days[activeDay]?.exercises ?? [];

  const updateExercises = useCallback((updater: (exs: PlannedExerciseLocal[]) => PlannedExerciseLocal[]) => {
    setDays((prev) => prev.map((d, i) =>
      i === activeDay ? { ...d, exercises: updater(d.exercises) } : d
    ));
  }, [activeDay]);

  const handleDragStart = useCallback((_e: React.DragEvent, idx: number) => {
    dragIdx.current = idx;
  }, []);

  const handleDragOver = useCallback((_e: React.DragEvent, idx: number) => {
    setDragOver(idx);
  }, []);

  const handleDrop = useCallback((_e: React.DragEvent, dropIdx: number) => {
    const from = dragIdx.current;
    if (from === null || from === dropIdx) { setDragOver(null); return; }
    updateExercises((exs) => {
      const arr = [...exs];
      const [moved] = arr.splice(from, 1);
      arr.splice(dropIdx, 0, moved);
      return arr.map((ex, i) => ({ ...ex, orderIndex: i }));
    });
    setDragOver(null);
    setSelected(new Set());
    dragIdx.current = null;
  }, [updateExercises]);

  const handleAddExercise = useCallback((exerciseId: string, name: string, nameCs: string, muscleGroups: string[]) => {
    updateExercises((exs) => [
      ...exs,
      {
        id: `new-${Date.now()}`,
        exerciseId,
        orderIndex: exs.length,
        targetSets: 3,
        targetReps: 10,
        targetWeight: null,
        restSeconds: 90,
        exercise: { id: exerciseId, name, nameCs, muscleGroups },
      },
    ]);
    setShowPicker(false);
  }, [updateExercises]);

  const handleAddDay = useCallback(() => {
    const idx = days.length;
    setDays((prev) => [
      ...prev,
      { id: `new-day-${Date.now()}`, dayIndex: idx, name: `Day ${idx + 1}`, nameCs: `Den ${idx + 1}`, exercises: [] },
    ]);
    setActiveDay(idx);
  }, [days.length]);

  const handleDeleteDay = useCallback(() => {
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((_, i) => i !== activeDay).map((d, i) => ({ ...d, dayIndex: i })));
    setActiveDay((a) => Math.max(0, a - 1));
    setSelected(new Set());
  }, [activeDay, days.length]);

  const handleGroup = useCallback((type: string) => {
    if (selected.size < 2) return;
    const groupId = `g-${Date.now()}`;
    let order = 0;
    updateExercises((exs) => exs.map((ex, i) => {
      if (selected.has(i)) {
        return { ...ex, groupId, groupType: type, groupOrder: order++ };
      }
      return ex;
    }));
    setSelected(new Set());
  }, [selected, updateExercises]);

  const handleUngroup = useCallback((groupId: string) => {
    updateExercises((exs) => exs.map((ex) =>
      ex.groupId === groupId ? { ...ex, groupId: null, groupType: null, groupOrder: null } : ex
    ));
  }, [updateExercises]);

  const handleSave = useCallback(async () => {
    if (!plan) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateWorkoutPlan(plan.id, {
        name: plan.name,
        nameCs: plan.nameCs,
        description: plan.description,
        type: plan.type,
        daysPerWeek: days.length,
        days: days.map((d) => ({
          dayIndex: d.dayIndex,
          name: d.name,
          nameCs: d.nameCs,
          exercises: d.exercises.map((ex, i) => ({
            exerciseId: ex.exerciseId,
            orderIndex: i,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            targetWeight: ex.targetWeight,
            restSeconds: ex.restSeconds,
            notes: ex.notes || null,
            groupId: ex.groupId || null,
            groupType: ex.groupType || null,
            groupOrder: ex.groupOrder ?? null,
          })),
        })),
      });
      router.push(`/plans/${plan.id}`);
    } catch {
      setSaveError('Nepodarilo se ulozit plan. Zkus to znovu.');
    } finally {
      setSaving(false);
    }
  }, [plan, days, router]);

  if (!plan) {
    return (
      <>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[var(--sage)]" />
        </div>
      </>
    );
  }

  // Group exercises for rendering
  const grouped = groupExercises(currentExercises);

  return (
    <>
      <Link
        href={`/plans/${plan.id}`}
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        &larr; Zpet
      </Link>

      <section className="pt-6 pb-8">
        <h1 className="v3-display-2">Upravit plan</h1>
        <p className="mt-2 text-sm text-white/40">{plan.nameCs}</p>
      </section>

      {/* Day tabs */}
      <DayTabs
        days={days}
        activeDay={activeDay}
        onSelect={setActiveDay}
        onAdd={handleAddDay}
        onDelete={handleDeleteDay}
      />

      {/* Group actions */}
      {selected.size >= 2 && (
        <GroupActions onGroup={handleGroup} count={selected.size} />
      )}

      {/* Exercise list */}
      {currentExercises.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 py-12 text-center text-white/30">
          <p className="text-sm">Tento den nema zadne cviky.</p>
          <p className="mt-1 text-xs">Pridej prvni cvik tlacitkem nize.</p>
        </div>
      )}
      <div className="mt-4 space-y-1">
        {grouped.map((item) => {
          if (item.type === 'single') {
            const ex = item.exercises[0];
            const idx = item.indices[0];
            return (
              <ExerciseCard
                key={ex.id}
                ex={ex}
                index={idx}
                selected={selected.has(idx)}
                onToggleSelect={() => toggleSelect(idx, selected, setSelected)}
                onUpdate={(f) => updateExercises((exs) => exs.map((e, i) => i === idx ? { ...e, ...f } : e))}
                onDelete={() => { updateExercises((exs) => exs.filter((_, i) => i !== idx)); setSelected(new Set()); }}
                onDragStart={handleDragStart}
                onDragOver={(e) => { e.preventDefault(); handleDragOver(e, idx); }}
                onDrop={(e) => handleDrop(e, idx)}
                isDragOver={dragOver === idx}
              />
            );
          }
          return (
            <ExerciseGroup
              key={item.groupId}
              type={item.groupType}
              count={item.exercises.length}
              onUngroup={() => handleUngroup(item.groupId)}
            >
              {item.exercises.map((ex, gi) => {
                const idx = item.indices[gi];
                return (
                  <ExerciseCard
                    key={ex.id}
                    ex={ex}
                    index={idx}
                    selected={selected.has(idx)}
                    onToggleSelect={() => toggleSelect(idx, selected, setSelected)}
                    onUpdate={(f) => updateExercises((exs) => exs.map((e, i) => i === idx ? { ...e, ...f } : e))}
                    onDelete={() => { updateExercises((exs) => exs.filter((_, i) => i !== idx)); setSelected(new Set()); }}
                    onDragStart={handleDragStart}
                    onDragOver={(e) => { e.preventDefault(); handleDragOver(e, idx); }}
                    onDrop={(e) => handleDrop(e, idx)}
                    isDragOver={dragOver === idx}
                  />
                );
              })}
            </ExerciseGroup>
          );
        })}
      </div>

      {/* Add exercise */}
      <button
        onClick={() => setShowPicker(true)}
        className="mt-4 w-full rounded-xl border border-dashed border-white/15 py-4 text-sm text-white/40 hover:border-[var(--sage)]/40 hover:text-[var(--sage)] transition"
      >
        + Pridat cvik
      </button>

      {/* Save error */}
      {saveError && (
        <div className="mt-6 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-6 py-4 text-sm text-[var(--accent)]">
          {saveError}
        </div>
      )}

      {/* Save */}
      <div className="mt-10 flex gap-4 pb-16">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full px-8 py-3 text-sm font-bold text-black transition disabled:opacity-50" style={{ backgroundColor: 'var(--sage)' }}
        >
          {saving ? 'Ukladam...' : 'Ulozit zmeny'}
        </button>
        <Link
          href={`/plans/${plan.id}`}
          className="rounded-full border border-white/15 px-8 py-3 text-sm text-white/50 hover:text-white transition"
        >
          Zrusit
        </Link>
      </div>

      {showPicker && <ExercisePicker onSelect={handleAddExercise} onClose={() => setShowPicker(false)} />}
    </>
  );
}

// --- Helper components (kept small, co-located) ---

function DayTabs({ days, activeDay, onSelect, onAdd, onDelete }: {
  days: DayLocal[];
  activeDay: number;
  onSelect: (i: number) => void;
  onAdd: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {days.map((d, i) => (
        <button
          key={d.id}
          onClick={() => onSelect(i)}
          className={`flex-shrink-0 rounded-full px-5 py-2 text-xs font-semibold transition ${
            i === activeDay
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/50 hover:bg-white/10'
          }`}
        >
          {d.nameCs}
        </button>
      ))}
      <button
        onClick={onAdd}
        className="flex-shrink-0 rounded-full bg-white/5 px-4 py-2 text-xs text-white/30 hover:text-[#A8FF00] transition"
      >
        +
      </button>
      {days.length > 1 && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 rounded-full bg-white/5 px-4 py-2 text-xs text-red-400/50 hover:text-red-400 transition"
        >
          Smazat den
        </button>
      )}
    </div>
  );
}

function GroupActions({ onGroup, count }: { onGroup: (type: string) => void; count: number }) {
  const types = [
    { key: 'superset', label: 'Superset', color: '#0A84FF' },
    { key: 'circuit', label: 'Circuit', color: 'var(--sage)' },
    { key: 'giant', label: 'Giant set', color: 'var(--clay-deep)' },
    { key: 'drop', label: 'Drop set', color: '#FF9500' },
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-[11px] text-white/40">{count} vybrano &mdash;</span>
      {types.map((t) => (
        <button
          key={t.key}
          onClick={() => onGroup(t.key)}
          className="rounded-full border px-3 py-1 text-[11px] font-semibold transition hover:bg-white/5"
          style={{ borderColor: t.color, color: t.color }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// --- Pure helpers ---

function toggleSelect(idx: number, selected: Set<number>, setSelected: (s: Set<number>) => void) {
  const next = new Set(selected);
  if (next.has(idx)) next.delete(idx); else next.add(idx);
  setSelected(next);
}

interface GroupedItem {
  type: 'single' | 'group';
  groupId: string;
  groupType: string;
  exercises: PlannedExerciseLocal[];
  indices: number[];
}

function groupExercises(exercises: PlannedExerciseLocal[]): GroupedItem[] {
  const result: GroupedItem[] = [];
  const seen = new Set<string>();

  exercises.forEach((ex, idx) => {
    if (ex.groupId && !seen.has(ex.groupId)) {
      seen.add(ex.groupId);
      const members: PlannedExerciseLocal[] = [];
      const memberIndices: number[] = [];
      exercises.forEach((e2, i2) => {
        if (e2.groupId === ex.groupId) { members.push(e2); memberIndices.push(i2); }
      });
      result.push({ type: 'group', groupId: ex.groupId, groupType: ex.groupType || 'superset', exercises: members, indices: memberIndices });
    } else if (!ex.groupId) {
      result.push({ type: 'single', groupId: ex.id, groupType: '', exercises: [ex], indices: [idx] });
    }
  });

  return result;
}
