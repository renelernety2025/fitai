import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getMyGear } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, v2 } from '../components/v2/V2';

const categoryIcons: Record<string, string> = {
  shoes: '👟',
  gloves: '🧤',
  belt: '🏋️',
  wraps: '🩹',
  bag: '🎒',
  bottle: '🧴',
  other: '📦',
};

export function GearScreen() {
  const [gear, setGear] = useState<any[]>([]);

  useEffect(() => {
    getMyGear().then(setGear).catch(() => setGear([]));
  }, []);

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Moje veci</V2SectionLabel>
        <V2Display size="xl">Vybaveni.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 12 }}>
          {gear.length} polozek
        </Text>
      </View>

      {gear.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          Zadne vybaveni
        </Text>
      )}

      {gear.map((item) => {
        const pct = item.maxSessions > 0
          ? Math.min(1, (item.sessionCount || 0) / item.maxSessions)
          : 0;
        const wearColor = pct > 0.8 ? v2.red : pct > 0.5 ? v2.orange : v2.green;

        return (
          <View
            key={item.id}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: v2.border,
              paddingVertical: 20,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 28, marginRight: 12 }}>
                {categoryIcons[item.category] || categoryIcons.other}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
                  {item.name}
                </Text>
                <Text style={{ color: v2.faint, fontSize: 12, marginTop: 2 }}>
                  {item.brand || item.category || 'N/A'}
                </Text>
              </View>
            </View>

            {item.maxSessions > 0 && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1 }}>
                    OPOTREBENI
                  </Text>
                  <Text style={{ color: wearColor, fontSize: 10, fontWeight: '600' }}>
                    {item.sessionCount || 0} / {item.maxSessions}
                  </Text>
                </View>
                <View
                  style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: v2.border,
                  }}
                >
                  <View
                    style={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: wearColor,
                      width: `${Math.round(pct * 100)}%`,
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}
    </V2Screen>
  );
}
