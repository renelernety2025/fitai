import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getMyStack, logSupplement } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, v2 } from '../components/v2/V2';

const timingColors: Record<string, string> = {
  morning: v2.orange,
  'pre-workout': v2.red,
  'post-workout': v2.green,
  evening: v2.purple,
  anytime: v2.blue,
};

export function SupplementsScreen() {
  const [stack, setStack] = useState<any[]>([]);

  useEffect(() => {
    getMyStack().then(setStack).catch(() => setStack([]));
  }, []);

  function handleToggle(item: any) {
    if (item.takenToday) return;
    logSupplement(item.id)
      .then(() => {
        setStack((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, takenToday: true } : s)),
        );
      })
      .catch(console.error);
  }

  const taken = stack.filter((s) => s.takenToday).length;

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Denni davka</V2SectionLabel>
        <V2Display size="xl">Suplementy.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 12 }}>
          {taken} z {stack.length} dnes uzito
        </Text>
      </View>

      {stack.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          Zadne suplementy v zasobniku
        </Text>
      )}

      {stack.map((item) => (
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
              {item.name}
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
