'use client';

import { useState, useCallback } from 'react';
import DragHandle from './DragHandle';

export interface PlannedExerciseLocal {
  id: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetReps: number;
  targetWeight: number | null;
  restSeconds: number;
  notes?: string;
  groupId?: string | null;
  groupType?: string | null;
  groupOrder?: number | null;
  exercise: { id: string; name: string; nameCs: string; muscleGroups: string[] };
}

interface ExerciseCardProps {
  ex: PlannedExerciseLocal;
  index: number;
  selected: boolean;
  onToggleSelect: () => void;
  onUpdate: (fields: Partial<PlannedExerciseLocal>) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragOver: boolean;
}

function InlineNumber({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = useCallback(() => {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= 0) onChange(n);
    setEditing(false);
  }, [draft, onChange]);

  if (editing) {
    return (
      <input
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        className="w-14 rounded bg-white/10 px-2 py-0.5 text-center text-sm text-white outline-none focus:ring-1 focus:ring-[#A8FF00]/50"
        autoFocus
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="tabular-nums text-white hover:text-[#A8FF00] transition cursor-text"
    >
      {value}{suffix || ''}
    </button>
  );
}

export default function ExerciseCard({
  ex, index, selected, onToggleSelect, onUpdate, onDelete,
  onDragStart, onDragOver, onDrop, isDragOver,
}: ExerciseCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
      onDrop={(e) => onDrop(e, index)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
        isDragOver
          ? 'border-[#A8FF00] bg-[#A8FF00]/5'
          : selected
            ? 'border-[#A8FF00]/40 bg-white/[0.03]'
            : 'border-white/8 bg-white/[0.02] hover:border-white/15'
      }`}
    >
      <DragHandle />

      {/* Select checkbox */}
      <button
        onClick={onToggleSelect}
        className={`h-4 w-4 flex-shrink-0 rounded border transition ${
          selected ? 'border-[#A8FF00] bg-[#A8FF00]' : 'border-white/20 hover:border-white/40'
        }`}
      >
        {selected && <span className="block text-[10px] text-black text-center font-bold leading-[14px]">&#10003;</span>}
      </button>

      {/* Exercise info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{ex.exercise.nameCs}</div>
        <div className="text-[11px] text-white/35">{ex.exercise.muscleGroups.join(', ')}</div>
      </div>

      {/* Editable fields */}
      <div className="flex items-center gap-2 text-sm">
        <InlineNumber value={ex.targetSets} onChange={(v) => onUpdate({ targetSets: v })} />
        <span className="text-white/30">&times;</span>
        <InlineNumber value={ex.targetReps} onChange={(v) => onUpdate({ targetReps: v })} />
        <span className="text-white/20 text-xs ml-1">
          <InlineNumber value={ex.targetWeight ?? 0} onChange={(v) => onUpdate({ targetWeight: v || null })} suffix="kg" />
        </span>
        <span className="text-white/20 text-xs">
          <InlineNumber value={ex.restSeconds} onChange={(v) => onUpdate({ restSeconds: v })} suffix="s" />
        </span>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="text-white/20 hover:text-red-400 transition text-lg leading-none px-1"
      >
        &times;
      </button>
    </div>
  );
}
