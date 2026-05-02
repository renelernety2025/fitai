import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getQuickWorkout, getHomeWorkout, getTravelWorkout } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

type Mode = 'quick' | 'home' | 'travel';

const MODES: { v: Mode; l: string; min: string; desc: string; color: string }[] = [
  { v: 'quick', l: 'Quick', min: '15 min', desc: 'Full body', color: v2.red },
  { v: 'home', l: 'Home', min: '35 min', desc: 'Complete', color: v2.green },
  { v: 'travel', l: 'Travel', min: '20 min', desc: 'Hotel/apt', color: v2.blue },
];

export function DomaScreen() {
  const [mode, setMode] = useState<Mode>('quick');
  const [workout, setWorkout] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setError(false);
    setLoading(true);
    const fn = mode === 'quick' ? getQuickWorkout : mode === 'home' ? getHomeWorkout : getTravelWorkout;
    fn()
      .then(setWorkout)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [mode]);
  useEffect(load, [load]);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>No equipment</V2SectionLabel>
        <V2Display size="xl">Home.</V2Display>
        <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14 }}>Three modes for three situations.</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
        {MODES.map((m) => (
          <Pressable
            key={m.v}
            onPress={() => setMode(m.v)}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: mode === m.v ? '#FFF' : v2.border,
              backgroundColor: mode === m.v ? 'rgba(255,255,255,0.05)' : 'transparent',
            }}
          >
            <View style={{ width: 24, height: 3, borderRadius: 2, backgroundColor: m.color, marginBottom: 10 }} />
            <Text style={{ color: v2.faint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>{m.min.toUpperCase()}</Text>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 2 }}>{m.l}</Text>
            <Text style={{ color: v2.faint, fontSize: 11, marginTop: 2 }}>{m.desc}</Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ color: '#FF375F', fontSize: 15, fontWeight: '600', marginBottom: 16 }}>Failed to load workout</Text>
          <Pressable onPress={load} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF' }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <V2Loading />
      ) : workout ? (
        <View>
          <View style={{ marginBottom: 16 }}>
            <V2Display size="md">{workout.title}</V2Display>
            <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 1.5, marginTop: 6 }}>
              {workout.rounds} ROUNDS · REST {workout.rest}
            </Text>
          </View>

          {(workout.exercises ?? []).map((ex: any, i: number) => (
            <View
              key={ex.id}
              style={{ flexDirection: 'row', alignItems: 'baseline', borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 16 }}
            >
              <Text style={{ color: v2.ghost, fontSize: 18, fontWeight: '700', width: 32 }}>{(i + 1).toString().padStart(2, '0')}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontSize: 17 }}>{ex.nameCs || ex.name}</Text>
                <Text style={{ color: v2.faint, fontSize: 11 }}>{(ex.muscleGroups || []).slice(0, 3).join(', ')}</Text>
              </View>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>{ex.reps}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </V2Screen>
  );
}
