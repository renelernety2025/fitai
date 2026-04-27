'use client';

import { Button, Card, Ring } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';

interface ActiveOverlayProps {
  exerciseName: string;
  currentSet: number;
  totalSets: number;
  weight: number;
  reps: number;
  restSeconds: number;
  restTotal: number;
  isResting: boolean;
  coachCue?: string;
  onSetComplete?: () => void;
}

export function ActiveOverlay({
  exerciseName, currentSet, totalSets,
  weight, reps, restSeconds, restTotal,
  isResting, coachCue, onSetComplete,
}: ActiveOverlayProps) {
  const restPct = restTotal > 0 ? ((restTotal - restSeconds) / restTotal) * 100 : 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(7,7,10,0.92)', backdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 32,
      padding: 32,
    }}>
      <div className="v3-eyebrow" style={{ color: 'var(--accent)' }}>
        SET {currentSet} OF {totalSets}
      </div>

      <div className="v3-display-3" style={{ textAlign: 'center' }}>
        {exerciseName}
      </div>

      {isResting ? (
        <Ring
          value={restPct}
          size={160}
          stroke={6}
          color="var(--accent)"
          label={String(restSeconds)}
          sub="REST"
        />
      ) : (
        <WeightDisplay weight={weight} reps={reps} />
      )}

      {!isResting && (
        <Button variant="accent" size="lg" onClick={onSetComplete}>
          Set complete
        </Button>
      )}

      {coachCue && <CoachCueCard cue={coachCue} />}
    </div>
  );
}

function WeightDisplay({ weight, reps }: { weight: number; reps: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, textAlign: 'center' }}>
      <div>
        <div className="v3-numeric" style={{ fontSize: 72, color: 'var(--text-1)' }}>
          {weight}
        </div>
        <div className="v3-caption" style={{ marginTop: 4 }}>KG</div>
      </div>
      <div className="v3-numeric" style={{ fontSize: 28, color: 'var(--text-3)' }}>
        x
      </div>
      <div>
        <div className="v3-numeric" style={{ fontSize: 72, color: 'var(--text-1)' }}>
          {reps}
        </div>
        <div className="v3-caption" style={{ marginTop: 4 }}>REPS</div>
      </div>
    </div>
  );
}

function CoachCueCard({ cue }: { cue: string }) {
  return (
    <Card padding={16} style={{ maxWidth: 400, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <FitIcon name="brain" size={16} color="var(--accent)" />
        <span className="v3-eyebrow" style={{ color: 'var(--accent)' }}>
          COACH MAYA &middot; LIVE CUE
        </span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-2)' }}>
        {cue}
      </div>
    </Card>
  );
}
