'use client';

interface PhaseInfo {
  phase: string;
  nameCs: string;
}

interface PhaseControlsProps {
  phases: PhaseInfo[];
  currentPhaseIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onJumpToPhase: (index: number) => void;
}

/** Playback controls overlay for the 3D exercise viewer. */
export default function PhaseControls({
  phases,
  currentPhaseIndex,
  isPlaying,
  onTogglePlay,
  onJumpToPhase,
}: PhaseControlsProps) {
  const currentPhase = phases[currentPhaseIndex];

  return (
    <div className="flex flex-col items-center gap-2 pt-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:border-white/40 hover:text-white"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>

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
      </div>

      {currentPhase && (
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
          {currentPhase.nameCs}
        </span>
      )}
    </div>
  );
}

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
