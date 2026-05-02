import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { getMyStack, logSupplement } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

// Backend enum is UPPERCASE — match both for safety
const timingColors: Record<string, string> = {
  MORNING: v2.orange,
  PRE_WORKOUT: v2.red,
  DURING: v2.yellow,
  POST_WORKOUT: v2.green,
  EVENING: v2.purple,
  WITH_MEAL: v2.blue,
};

/** Resolve supplement name from nested or flat shape */
function getItemName(item: any): string {
  return item.supplement?.name || item.name || 'Supplement';
}

export function SupplementsScreen() {
  const [stack, setStack] = useState<any[] | null>(null);

  useEffect(() => {
    getMyStack().then(setStack).catch(() => setStack([]));
  }, []);

  function handleToggle(item: any) {
    if (item.takenToday) return;
    logSupplement(item.id)
      .then(() => {
        setStack((prev) =>
          (prev ?? []).map((s) => (s.id === item.id ? { ...s, takenToday: true } : s)),
        );
      })
      .catch(() => Alert.alert('Error', 'Failed to log supplement'));
  }

  const items = stack ?? [];
  const taken = items.filter((s) => s.takenToday).length;

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Daily dose</V2SectionLabel>
        <V2Display size="xl">Supplements.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 12 }}>
          {taken} of {items.length} taken today
        </Text>
      </View>

      {stack === null ? (
        <V2Loading />
      ) : items.length === 0 ? (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          No supplements in your stack. Add them on the web app.
        </Text>
      ) : null}

      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => handleToggle(item)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: v2.border,
            paddingVertical: 20,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: 2,
              borderColor: item.takenToday ? v2.green : v2.ghost,
              backgroundColor: item.takenToday ? v2.green : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            {item.takenToday && (
              <Text style={{ color: '#000', fontSize: 14, fontWeight: '700' }}>
                ✓
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
              {getItemName(item)}
            </Text>
            <Text style={{ color: v2.faint, fontSize: 12, marginTop: 2 }}>
              {item.dosage || 'N/A'}
            </Text>
          </View>

          <Text
            style={{
              color: timingColors[item.timing] || v2.muted,
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 1,
            }}
          >
            {(item.timing || '').toUpperCase()}
          </Text>
        </Pressable>
      ))}
    </V2Screen>
  );
}
