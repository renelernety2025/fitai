'use client';

import type { SpeedMultiplier } from '@/lib/use-phase-animation';

interface PhaseInfo {
  phase: string;
  nameCs: string;
}

type ViewAngle = 'front' | 'side' | 'back';

interface PhaseControlsProps {
  phases: PhaseInfo[];
  currentPhaseIndex: number;
  isPlaying: boolean;
  speed: SpeedMultiplier;
  onTogglePlay: () => void;
  onJumpToPhase: (index: number) => void;
  onCycleSpeed: () => void;
  onSetView: (view: ViewAngle) => void;
}

/** Playback controls overlay for the 3D exercise viewer. */
export default function PhaseControls({
  phases,
  currentPhaseIndex,
  isPlaying,
  speed,
  onTogglePlay,
  onJumpToPhase,
  onCycleSpeed,
  onSetView,
}: PhaseControlsProps) {
  const currentPhase = phases[currentPhaseIndex];

  return (
    <div className="flex flex-col items-center gap-2 pt-3">
      <div className="flex items-center gap-4">
        {/* View angle buttons */}
        <div className="flex items-center gap-1">
          {VIEW_BUTTONS.map(({ view, label }) => (
            <button
              key={view}
              onClick={() => onSetView(view)}
              className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 transition hover:bg-white/5 hover:text-white/70"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Play/pause */}
        <button
          onClick={onTogglePlay}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:border-white/40 hover:text-white"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Phase dots */}
        <div className="flex items-center gap-2">
          {phases.map((_, i) => (
            <button
              key={i}
              onClick={() => onJumpToPhase(i)}
              className={`h-2.5 w-2.5 rounded-full border transition ${
                i === currentPhaseIndex
                  ? 'border-[#A8FF00] bg-[#A8FF00]'
                  : 'border-white/20 hover:border-white/40'
              }`}
              aria-label={`Phase ${i + 1}`}
            />
          ))}
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Speed control */}
        <button
          onClick={onCycleSpeed}
          className="rounded-md px-2 py-1 text-[11px] font-bold tabular-nums text-white/50 transition hover:bg-white/5 hover:text-white/70"
        >
          {speed}x
        </button>
      </div>

      {currentPhase && (
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
          {currentPhase.nameCs}
        </span>
      )}
    </div>
  );
}

const VIEW_BUTTONS: { view: ViewAngle; label: string }[] = [
  { view: 'front', label: 'Zepředu' },
  { view: 'side', label: 'Z boku' },
  { view: 'back', label: 'Zezadu' },
];

function PlayIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
      <path d="M0 0L12 7L0 14V0Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
      <rect width="3" height="14" />
      <rect x="7" width="3" height="14" />
    </svg>
  );
}
