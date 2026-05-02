import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getStreakFreezeStatus, useStreakFreeze, getHabitsStats } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';

export function StreaksScreen() {
  const [freeze, setFreeze] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getStreakFreezeStatus().then(setFreeze).catch(() => setFreeze(null));
    getHabitsStats().then(setStats).catch(() => setStats(null));
  }, []);

  function handleFreeze() {
    Alert.alert('Streak Freeze', 'Pouzit streak freeze na dnes?', [
      { text: 'Zrusit', style: 'cancel' },
      {
        text: 'Pouzit',
        onPress: () => useStreakFreeze()
          .then((r) => { setFreeze(r); Alert.alert('Hotovo', 'Streak freeze pouzit!'); })
          .catch((e) => Alert.alert('Chyba', e.message)),
      },
    ]);
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Konzistence</V2SectionLabel>
        <V2Display size="xl">Streaky.</V2Display>
      </View>

      {stats && (
        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: v2.border, padding: 24, marginBottom: 24, backgroundColor: v2.surface }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: v2.green, fontSize: 56, fontWeight: '800' }}>
              {stats.streakDays || 0}
            </Text>
            <Text style={{ color: v2.muted, fontSize: 12, fontWeight: '600', letterSpacing: 2 }}>
              DNI V RADE
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700' }}>{stats.totalCheckIns || 0}</Text>
              <Text style={{ color: v2.faint, fontSize: 10, marginTop: 2 }}>Check-inu</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700' }}>
                {stats.avgSleep ? Number(stats.avgSleep).toFixed(1) : '-'}
              </Text>
              <Text style={{ color: v2.faint, fontSize: 10, marginTop: 2 }}>Prumer spanek</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700' }}>
                {stats.avgEnergy ? Number(stats.avgEnergy).toFixed(1) : '-'}
              </Text>
              <Text style={{ color: v2.faint, fontSize: 10, marginTop: 2 }}>Prumer energie</Text>
            </View>
          </View>
        </View>
      )}

      {freeze && (
        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: v2.border, padding: 24, backgroundColor: v2.surface }}>
          <V2SectionLabel>STREAK FREEZE</V2SectionLabel>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: v2.muted, fontSize: 13 }}>Zbyvajici</Text>
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
