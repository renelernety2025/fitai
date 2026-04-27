'use client';

import { WorkoutHero } from '@/components/workout/v3/WorkoutHero';
import { MovementList } from '@/components/workout/v3/MovementList';
import { Card, Metric, Ring } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';

const MOCK_BLOCKS = [
  {
    name: 'Warm-up \u00b7 Activation', time: '6 min', items: [
      { name: 'Banded glute walks', sets: '2 \u00d7 12', tempo: 'Steady', rest: '30s', icon: 'run' },
      { name: 'Bodyweight squat', sets: '2 \u00d7 10', tempo: '2-1-2', rest: '30s' },
      { name: 'Hip airplane', sets: '1 \u00d7 8/side', tempo: 'Slow', rest: '\u2014' },
    ],
  },
  {
    name: 'Main \u00b7 Heavy', time: '24 min', items: [
      { name: 'Back squat', sets: '4 \u00d7 5 @ 82%', tempo: '2-1-X', rest: '3m', heavy: true },
      { name: 'Romanian deadlift', sets: '4 \u00d7 6', tempo: '3-1-1', rest: '2m', heavy: true },
    ],
  },
  {
    name: 'Accessory \u00b7 Hypertrophy', time: '16 min', items: [
      { name: 'Walking lunge', sets: '3 \u00d7 10/leg', tempo: 'Steady', rest: '90s' },
      { name: 'Hip thrust', sets: '3 \u00d7 12', tempo: '2-1-1', rest: '90s' },
      { name: 'Calf raise (loaded)', sets: '4 \u00d7 15', tempo: 'Slow ecc.', rest: '60s' },
    ],
  },
  {
    name: 'Finisher \u00b7 Cooldown', time: '6 min', items: [
      { name: 'Couch stretch', sets: '2 \u00d7 60s/side', tempo: '\u2014', rest: '\u2014', icon: 'leaf' },
      { name: 'Box breathing', sets: '5 cycles', tempo: '4-4-4-4', rest: '\u2014', icon: 'heart' },
    ],
  },
];

const EQUIPMENT = [
  'Squat rack & barbell',
  'Plates \u00b7 100kg total',
  'Resistance band (medium)',
  'Bench (optional)',
];

export default function WorkoutDetailPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <WorkoutHero
        title="The Glute Hypertrophy Block."
        subtitle="Week 6 \u00b7 Day 2"
        tag="POWER \u00b7 LOWER BODY"
        breadcrumb={['Programs', 'Hypertrophy Block', 'Week 6 \u00b7 Day 2']}
        coach={{ name: 'Maya Sato', specialty: 'Hypertrophy Coach \u00b7 1.2M trained' }}
        metrics={{ duration: 52, movements: 7, sets: 22, rpe: 8 }}
        imageUrl="/images/hero-workout.jpg"
      />

      <div style={{
        padding: 32,
        display: 'grid', gridTemplateColumns: '1.6fr 1fr',
        gap: 24, maxWidth: 1400, margin: '0 auto',
      }}>
        <MovementList blocks={MOCK_BLOCKS} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <LastTimeCard />
          <EquipmentCard />
        </div>
      </div>
    </div>
  );
}

function LastTimeCard() {
  return (
    <Card padding={20}>
      <div className="v3-eyebrow" style={{ marginBottom: 12 }}>LAST TIME \u00b7 6 DAYS AGO</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Ring value={92} size={64} stroke={4} label="92" sub="EFF" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Crushed it.</div>
          <p className="v3-caption" style={{ margin: 0 }}>
            14,200kg \u00b7 avg HR 142bpm \u00b7 51 min total
          </p>
        </div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        paddingTop: 12, borderTop: '1px solid var(--stroke-1)',
      }}>
        <Metric label="VOLUME" value="14,200" unit="kg" delta="8%" deltaPositive />
        <Metric label="AVG RPE" value="7.8" sub="Target 8.0" />
      </div>
    </Card>
  );
}

function EquipmentCard() {
  return (
    <Card padding={20}>
      <div className="v3-eyebrow" style={{ marginBottom: 12 }}>YOU&apos;LL NEED</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {EQUIPMENT.map((e, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 13, color: 'var(--text-2)',
          }}>
            <FitIcon name="check" size={14} color="var(--positive)" />
            <span>{e}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
