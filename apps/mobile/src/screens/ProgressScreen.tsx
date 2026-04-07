import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getMyStats, getInsights } from '../lib/api';
import {
  V2Screen,
  V2Display,
  V2SectionLabel,
  V2Stat,
  v2,
} from '../components/v2/V2';

export function ProgressScreen() {
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    getMyStats().then(setStats).catch(console.error);
    getInsights().then(setInsights).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <V2Screen>
        <V2SectionLabel>Načítání</V2SectionLabel>
      </V2Screen>
    );
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 32 }}>
        <V2SectionLabel>Vše co jsi udělal</V2SectionLabel>
        <V2Display size="xl">Pokrok.</V2Display>
      </View>

      {/* Big stats grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 48 }}>
        {[
          { v: stats.totalSessions || 0, l: 'Cvičení' },
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
        <V2SectionLabel>Čas v tréninku</V2SectionLabel>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ color: '#FFF', fontSize: 56, fontWeight: '700', letterSpacing: -2 }}>
            {Math.floor((stats.totalMinutes || 0) / 60)}
          </Text>
          <Text style={{ color: v2.ghost, fontSize: 24, marginLeft: 8 }}>hodin</Text>
        </View>
        <Text style={{ color: v2.muted, marginTop: 8, fontSize: 14 }}>
          {(stats.totalMinutes || 0).toLocaleString('cs-CZ')} minut
        </Text>
      </View>

      {/* Recovery */}
      {insights?.recovery && (
        <View style={{ marginBottom: 48 }}>
          <V2SectionLabel>Stav regenerace</V2SectionLabel>
          <V2Display size="md">
            {insights.recovery.overallStatus === 'fresh' && 'Svěží.'}
            {insights.recovery.overallStatus === 'normal' && 'Normální.'}
            {insights.recovery.overallStatus === 'fatigued' && 'Unavený.'}
            {insights.recovery.overallStatus === 'overreached' && 'Přetrénovaný.'}
          </V2Display>
          <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14, lineHeight: 22 }}>
            {insights.recovery.recommendation}
          </Text>
        </View>
      )}

      {/* Plateaus */}
      {insights && insights.plateaus.length > 0 && (
        <View style={{ marginBottom: 48 }}>
          <V2SectionLabel>Plateaus</V2SectionLabel>
          {insights.plateaus.slice(0, 5).map((p: any) => (
            <View key={p.exerciseId} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 20 }}>
              <Text style={{ color: v2.yellow, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 4 }}>
                {p.weeksStagnant} TÝDNŮ NA {p.currentMaxWeight}KG
              </Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 }}>{p.exerciseName}</Text>
              <Text style={{ color: v2.muted, marginTop: 6, fontSize: 13 }}>{p.recommendation}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Weak points */}
      {insights && insights.weakPoints.weakMuscleGroups.length > 0 && (
        <View>
          <V2SectionLabel>Slabá místa</V2SectionLabel>
          {insights.weakPoints.weakMuscleGroups.slice(0, 5).map((w: any) => (
            <View key={w.muscle} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 20 }}>
              <Text style={{ color: v2.purple, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 4 }}>
                MÉNĚ OBJEMU
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
