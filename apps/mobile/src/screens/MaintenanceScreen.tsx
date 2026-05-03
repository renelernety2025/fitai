import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getMaintenanceStatus, getMaintenanceAlerts, markDeload } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState, NativeConfirm } from '../components/native';

// Backend enum: FRESH, DUE, OVERDUE
const STATUS_COLOR: Record<string, string> = {
  FRESH: v2.green,
  DUE: v2.orange,
  OVERDUE: v2.red,
};

export function MaintenanceScreen() {
  const [status, setStatus] = useState<any[] | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    getMaintenanceStatus().then(setStatus).catch(() => setStatus([]));
    getMaintenanceAlerts().then(setAlerts).catch(() => setAlerts([]));
  }

  async function confirmDeload() {
    if (!pending) return;
    const muscle = pending;
    setPending(null);
    setError(null);
    try {
      await markDeload(muscle);
      haptic.success();
      loadData();
    } catch (e: any) {
      haptic.error();
      setError(e?.message || 'Failed to mark deload');
    }
  }

  const items = status ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Body Service</V2SectionLabel>
        <V2Display size="xl">Maintenance.</V2Display>
      </View>

      {error && (
        <View style={{ marginBottom: 16, backgroundColor: 'rgba(255,55,95,0.10)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,55,95,0.25)' }}>
          <Text style={{ color: v2.red, fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {alerts.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <V2SectionLabel>ALERTS</V2SectionLabel>
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

      <V2SectionLabel>MUSCLE GROUP STATUS</V2SectionLabel>

      {status === null ? (
        <LoadingState label="Loading maintenance" />
      ) : items.length === 0 ? (
        <EmptyState icon="🔧" title="No data yet" body="Maintenance signals appear after a few training weeks." />
      ) : null}

      {items.map((s, i) => (
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
                color: STATUS_COLOR[s.status] || v2.faint,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {(s.status || 'FRESH').toUpperCase()}
            </Text>
          </View>

          {s.sessionsSinceDeload != null && (
            <Text style={{ color: v2.muted, fontSize: 12, marginBottom: 8 }}>
              {s.sessionsSinceDeload} sessions since last deload
            </Text>
          )}

          {(s.status === 'DUE' || s.status === 'OVERDUE') && (
            <V2Button
              onPress={() => { haptic.tap(); setPending(s.muscleGroup); }}
              variant="secondary"
              full
            >
              Mark deload
            </V2Button>
          )}
        </View>
      ))}

      <NativeConfirm
        visible={!!pending}
        title="Mark deload?"
        message={pending ? `Reset ${pending.replace(/_/g, ' ')} session counter — next training will use lighter loads.` : undefined}
        confirmLabel="Confirm"
        onConfirm={confirmDeload}
        onCancel={() => setPending(null)}
      />
    </V2Screen>
  );
}
