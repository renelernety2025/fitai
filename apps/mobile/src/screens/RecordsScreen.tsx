import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getPersonalRecords } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

export function RecordsScreen() {
  const [records, setRecords] = useState<any[] | null>(null);

  useEffect(() => {
    getPersonalRecords().then(setRecords).catch(() => setRecords([]));
  }, []);

  const items = records ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Personal bests</V2SectionLabel>
        <V2Display size="xl">Records.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 12 }}>
          {items.length} exercises
        </Text>
      </View>

      {records === null ? (
        <V2Loading />
      ) : items.length === 0 ? (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          No records yet. Complete workouts to track PRs.
        </Text>
      ) : null}

      {items.map((r) => {
        // Backend uses deltaWeight (not deltaKg) and date (not achievedAt)
        const delta = r.deltaKg ?? r.deltaWeight ?? 0;
        const deltaColor = delta > 0 ? v2.green : delta < 0 ? v2.red : v2.muted;
        const deltaSign = delta > 0 ? '+' : '';

        return (
          <View
            key={r.id || r.exerciseId}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: v2.border,
              paddingVertical: 20,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              {r.exerciseNameCs || r.exerciseName || r.name}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>
                  BEST WEIGHT
                </Text>
                <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700', letterSpacing: -1 }}>
                  {r.bestWeight ?? '-'} kg
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>
                  BEST REPS
                </Text>
                <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700', letterSpacing: -1 }}>
                  {r.bestReps ?? '-'}
                </Text>
              </View>

              {delta !== 0 && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>
                    DELTA
                  </Text>
                  <Text style={{ color: deltaColor, fontSize: 20, fontWeight: '700' }}>
                    {deltaSign}{delta} kg
                  </Text>
                </View>
              )}
            </View>

            {(r.achievedAt || r.date) && (
              <Text style={{ color: v2.ghost, fontSize: 10, marginTop: 8 }}>
                {new Date(r.achievedAt || r.date).toLocaleDateString('en-US')}
              </Text>
            )}
          </View>
        );
      })}
    </V2Screen>
  );
}
