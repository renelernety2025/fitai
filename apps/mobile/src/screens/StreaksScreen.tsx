import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getStreakFreezeStatus, useStreakFreeze, getHabitsStats } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, V2Loading, v2 } from '../components/v2/V2';

export function StreaksScreen() {
  const [freeze, setFreeze] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    getStreakFreezeStatus().then(setFreeze).catch(() => setFreeze(null));
    getHabitsStats().then(setStats).catch(() => setStats(null));
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getStreakFreezeStatus().then(setFreeze).catch(() => null),
      getHabitsStats().then(setStats).catch(() => null),
    ]).finally(() => setLoading(false));
  }, []);

  function handleFreeze() {
    Alert.alert('Streak Freeze', 'Use streak freeze for today?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Use',
        onPress: () => useStreakFreeze()
          .then(() => {
            Alert.alert('Done', 'Streak freeze used!');
            // Re-fetch to get correct status shape
            getStreakFreezeStatus().then(setFreeze).catch(() => {});
          })
          .catch((e: any) => Alert.alert('Error', e?.message || 'Could not use freeze')),
      },
    ]);
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Consistency</V2SectionLabel>
        <V2Display size="xl">Streaks.</V2Display>
      </View>

      {loading && <V2Loading />}

      {!loading && stats && (
        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: v2.border, padding: 24, marginBottom: 24, backgroundColor: v2.surface }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: v2.green, fontSize: 56, fontWeight: '800' }}>
              {stats.streakDays || 0}
            </Text>
            <Text style={{ color: v2.muted, fontSize: 12, fontWeight: '600', letterSpacing: 2 }}>
              DAYS IN A ROW
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700' }}>{stats.totalCheckIns || 0}</Text>
              <Text style={{ color: v2.faint, fontSize: 10, marginTop: 2 }}>Check-ins</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700' }}>
                {stats.avgSleep ? Number(stats.avgSleep).toFixed(1) : '-'}
              </Text>
              <Text style={{ color: v2.faint, fontSize: 10, marginTop: 2 }}>Avg sleep</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700' }}>
                {stats.avgEnergy ? Number(stats.avgEnergy).toFixed(1) : '-'}
              </Text>
              <Text style={{ color: v2.faint, fontSize: 10, marginTop: 2 }}>Avg energy</Text>
            </View>
          </View>
        </View>
      )}

      {freeze && (
        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: v2.border, padding: 24, backgroundColor: v2.surface }}>
          <V2SectionLabel>STREAK FREEZE</V2SectionLabel>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: v2.muted, fontSize: 13 }}>Remaining</Text>
            <Text style={{ color: v2.blue, fontSize: 16, fontWeight: '700' }}>
              {freeze.remaining ?? freeze.available ?? 0}
            </Text>
          </View>
          <V2Button
            onPress={handleFreeze}
            variant="secondary"
            full
            disabled={(freeze.remaining ?? freeze.available ?? 0) === 0}
          >
            {(freeze.remaining ?? freeze.available ?? 0) === 0 ? 'No freezes left' : 'Use freeze'}
          </V2Button>
        </View>
      )}
    </V2Screen>
  );
}
