'use client';

import { useCallback, useRef } from 'react';
import type { JournalDay } from '@/lib/api';
import { RatingStars } from './RatingStars';
import { MoodSelector } from './MoodSelector';
import { TagPicker } from './TagPicker';
import { PhotoGrid } from './PhotoGrid';
import { MeasurementsInput } from './MeasurementsInput';

interface DayCardProps {
  day: JournalDay;
  onUpdate: (date: string, data: Record<string, unknown>) => void;
  onRequestInsight: (date: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

export function DayCard({ day, onUpdate, onRequestInsight }: DayCardProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedUpdate = useCallback(
    (field: string, value: unknown) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onUpdate(day.date, { [field]: value });
      }, 500);
    },
    [day.date, onUpdate],
  );

  const entry = day.entry;
  const session = day.gymSession;
  const hasSession = session !== null;

  // Rest day layout
  if (!hasSession) {
    return (
      <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <DayHeader date={day.date} tags={entry?.tags || []} onTagsChange={(t) => debouncedUpdate('tags', t)} />
        <div className="flex flex-col items-center py-8 text-white/30">
          <span className="mb-2 text-3xl">{'\uD83D\uDCA4'}</span>
          <span className="text-sm">Den odpočinku</span>
        </div>
        <NotesField
          value={entry?.notes || ''}
          onChange={(v) => debouncedUpdate('notes', v)}
        />
        <InsightBox
          insight={entry?.aiInsight || null}
          onRequest={() => onRequestInsight(day.date)}
        />
      </div>
    );
  }

  // Workout day — two-column layout
  const totalVolume = session.exerciseSets.reduce(
    (sum, ex) => sum + ex.totalReps * ex.avgWeight,
    0,
  );
  const hasPR = session.averageFormScore > 80;

  return (
    <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-6">
      <DayHeader date={day.date} tags={entry?.tags || []} onTagsChange={(t) => debouncedUpdate('tags', t)} />

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left column — auto-populated from workout */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-white/80">
            {session.workoutPlanName || 'Ad hoc trénink'}
          </div>

          {/* Exercise list */}
          <div className="space-y-1.5">
            {session.exerciseSets.map((ex, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-white/70">{ex.exerciseName}</span>
                <span className="tabular-nums text-white/40">
                  {ex.sets}&times;{ex.totalReps} @ {Math.round(ex.avgWeight)}kg
                  {ex.avgRpe > 0 && (
                    <span className="ml-1 text-white/25">RPE {ex.avgRpe.toFixed(0)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex gap-4 text-xs text-white/40">
            <span>{formatDuration(session.durationSeconds)}</span>
            <span>{Math.round(totalVolume).toLocaleString('cs-CZ')} kg</span>
            <span>Forma {Math.round(session.averageFormScore)}%</span>
          </div>

          {hasPR && <PRBadge />}

          <RatingStars
            value={entry?.rating || null}
            onChange={(v) => onUpdate(day.date, { rating: v })}
          />

          <MeasurementsInput
            measurements={entry?.measurements || null}
            onChange={(m) => debouncedUpdate('measurements', m)}
          />
        </div>

        {/* Right column — user-editable */}
        <div className="space-y-4">
          <MoodSelector
            value={entry?.mood || null}
            onChange={(v) => onUpdate(day.date, { mood: v })}
          />

          <NotesField
            value={entry?.notes || ''}
            onChange={(v) => debouncedUpdate('notes', v)}
          />

          <PhotoGrid
            photos={entry?.photos || []}
            date={day.date}
            onUpload={() => onUpdate(day.date, {})}
            onDelete={(photoId) => onUpdate(day.date, { deletePhoto: photoId })}
          />

          <InsightBox
            insight={entry?.aiInsight || null}
            onRequest={() => onRequestInsight(day.date)}
          />
        </div>
      </div>
    </div>
  );
}

/* --- Sub-components --- */

function DayHeader({
  date,
  tags,
  onTagsChange,
}: {
  date: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3
          className="text-white/90"
          style={{ fontFamily: 'Georgia, serif', fontSize: '18px' }}
        >
          {formatDate(date)}
        </h3>
      </div>
      <TagPicker tags={tags} onChange={onTagsChange} />
    </div>
  );
}

function NotesField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Poznámky k tréninku..."
      rows={3}
      className="w-full resize-none rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:border-white/15 focus:outline-none"
      style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
    />
  );
}

function InsightBox({
  insight,
  onRequest,
}: {
  insight: string | null;
  onRequest: () => void;
}) {
  if (insight) {
    return (
      <div
        className="rounded-lg px-3 py-2 text-xs leading-relaxed text-white/70"
        style={{ backgroundColor: 'rgba(168, 255, 0, 0.06)' }}
      >
        <span className="mr-1 font-semibold text-[#A8FF00]">AI:</span>
        {insight}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onRequest}
      className="text-xs text-[#A8FF00]/60 transition hover:text-[#A8FF00]"
    >
      Generovat AI insight
    </button>
  );
}

function PRBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{
        color: '#FFD600',
        border: '1px solid rgba(255, 214, 0, 0.3)',
        backgroundColor: 'rgba(255, 214, 0, 0.08)',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD600" stroke="none">
        <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
      </svg>
      PR
    </span>
  );
}
