import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getMaintenanceStatus, getMaintenanceAlerts, markDeload } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';

export function MaintenanceScreen() {
  const [status, setStatus] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    getMaintenanceStatus().then(setStatus).catch(() => setStatus([]));
    getMaintenanceAlerts().then(setAlerts).catch(() => setAlerts([]));
  }

  function handleDeload(muscle: string) {
    Alert.alert('Deload', `Oznacit ${muscle} pro deload?`, [
      { text: 'Zrusit', style: 'cancel' },
      {
        text: 'Ano',
        onPress: () => markDeload(muscle).then(loadData).catch((e) => Alert.alert('Chyba', e.message)),
      },
    ]);
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Body Servis</V2SectionLabel>
        <V2Display size="xl">Servis.</V2Display>
      </View>

      {alerts.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <V2SectionLabel>UPOZORNENI</V2SectionLabel>
          {alerts.map((a, i) => (
            <View
              key={a.id || i}
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: v2.orange,
                padding: 16,
                marginBottom: 8,
                backgroundColor: `${v2.orange}10`,
              }}
            >
              <Text style={{ color: v2.orange, fontSize: 13, fontWeight: '600' }}>
                {a.message || a.muscleGroup || 'Alert'}
              </Text>
            </View>
          ))}
        </View>
      )}

      <V2SectionLabel>STAV SVALOVE SKUPINY</V2SectionLabel>

      {status.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 32 }}>
          Zatim zadna data
        </Text>
      )}

      {status.map((s, i) => (
        <View
          key={i}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>
              {s.muscleGroup}
            </Text>
            <Text
              style={{
                color: s.status === 'overloaded' ? v2.red : s.status === 'optimal' ? v2.green : v2.faint,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {(s.status || 'OK').toUpperCase()}
            </Text>
          </View>

          {s.weeklyLoad != null && (
            <Text style={{ color: v2.muted, fontSize: 12, marginBottom: 8 }}>
              Zatez: {s.weeklyLoad} setu/tyden
            </Text>
          )}

          {s.status === 'overloaded' && (
            <V2Button onPress={() => handleDeload(s.muscleGroup)} variant="secondary" full>
              Oznacit deload
            </V2Button>
          )}
        </View>
      ))}
    </V2Screen>
  );
}
