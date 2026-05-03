import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getMyStats, getInsights } from '../lib/api';
import {
  V2Screen,
  V2Display,
  V2SectionLabel,
  V2Stat,
  v2,
} from '../components/v2/V2';
import { LoadingState, ErrorState } from '../components/native';

export function ProgressScreen() {
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    getMyStats()
      .then(setStats)
      .catch(() => setError(true));
    getInsights().then(setInsights).catch(() => {});
  }, []);
  useEffect(load, [load]);

  if (error) {
    return <V2Screen><ErrorState message="Failed to load progress." onRetry={load} /></V2Screen>;
  }

  if (!stats) return <V2Screen><LoadingState label="Loading progress" /></V2Screen>;

  const plateaus = insights?.plateaus ?? [];
  const weakGroups = insights?.weakPoints?.weakMuscleGroups ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 32 }}>
        <V2SectionLabel>Everything you've done</V2SectionLabel>
        <V2Display size="xl">Progress.</V2Display>
      </View>

      {/* Big stats grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 48 }}>
        {[
          { v: stats.totalSessions || 0, l: 'Workouts' },
          { v: stats.currentStreak || 0, l: 'Streak' },
          { v: stats.longestStreak || 0, l: 'Best' },
          { v: stats.totalXP || 0, l: 'XP' },
        ].map((s, i) => (
          <View key={i} style={{ width: '50%', marginBottom: 32 }}>
            <V2Stat value={s.v} label={s.l} />
          </View>
        ))}
      </View>

      {/* Time */}
      <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: v2.border, paddingVertical: 32, marginBottom: 48 }}>
        <V2SectionLabel>Time training</V2SectionLabel>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ color: '#FFF', fontSize: 56, fontWeight: '700', letterSpacing: -2 }}>
            {Math.floor((stats.totalMinutes || 0) / 60)}
          </Text>
          <Text style={{ color: v2.ghost, fontSize: 24, marginLeft: 8 }}>hours</Text>
        </View>
        <Text style={{ color: v2.muted, marginTop: 8, fontSize: 14 }}>
          {(stats.totalMinutes || 0).toLocaleString('en-US')} minutes
        </Text>
      </View>

      {/* Recovery */}
      {insights?.recovery && (
        <View style={{ marginBottom: 48 }}>
          <V2SectionLabel>Recovery status</V2SectionLabel>
          <V2Display size="md">
            {insights.recovery.overallStatus === 'fresh' && 'Fresh.'}
            {insights.recovery.overallStatus === 'normal' && 'Normal.'}
            {insights.recovery.overallStatus === 'fatigued' && 'Fatigued.'}
            {insights.recovery.overallStatus === 'overreached' && 'Overtrained.'}
          </V2Display>
          <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14, lineHeight: 22 }}>
            {insights.recovery.recommendation}
          </Text>
        </View>
      )}

      {/* Plateaus */}
      {plateaus.length > 0 && (
        <View style={{ marginBottom: 48 }}>
          <V2SectionLabel>Plateaus</V2SectionLabel>
          {plateaus.slice(0, 5).map((p: any) => (
            <View key={p.exerciseId} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 20 }}>
              <Text style={{ color: v2.yellow, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 4 }}>
                {p.weeksStagnant} WEEKS AT {p.currentMaxWeight}KG
              </Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 }}>{p.exerciseName}</Text>
              <Text style={{ color: v2.muted, marginTop: 6, fontSize: 13 }}>{p.recommendation}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Weak points */}
      {weakGroups.length > 0 && (
        <View>
          <V2SectionLabel>Weak points</V2SectionLabel>
          {weakGroups.slice(0, 5).map((w: any) => (
            <View key={w.muscle} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 20 }}>
              <Text style={{ color: v2.purple, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 4 }}>
                LOW VOLUME
              </Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 }}>{w.muscle}</Text>
              <Text style={{ color: v2.muted, marginTop: 6, fontSize: 13 }}>{w.reason}</Text>
            </View>
          ))}
        </View>
      )}
    </V2Screen>
  );
}
