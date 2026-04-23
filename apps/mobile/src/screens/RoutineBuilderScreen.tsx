import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getMyRoutines, getPublicRoutines } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, v2 } from '../components/v2/V2';

export function RoutineBuilderScreen() {
  const [tab, setTab] = useState<'mine' | 'public'>('mine');
  const [mine, setMine] = useState<any[]>([]);
  const [pub, setPub] = useState<any[]>([]);

  useEffect(() => {
    getMyRoutines().then(setMine).catch(() => setMine([]));
    getPublicRoutines().then(setPub).catch(() => setPub([]));
  }, []);

  const items = tab === 'mine' ? mine : pub;

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Organizace</V2SectionLabel>
        <V2Display size="xl">Rutina.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <V2Chip label="Moje" selected={tab === 'mine'} onPress={() => setTab('mine')} />
        <V2Chip label="Verejne" selected={tab === 'public'} onPress={() => setTab('public')} />
      </View>

      {items.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          {tab === 'mine' ? 'Zatim zadne rutiny' : 'Zadne verejne rutiny'}
        </Text>
      )}

      {items.map((r) => (
        <View
          key={r.id}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
            {r.name}
          </Text>
          <Text style={{ color: v2.faint, fontSize: 12 }}>
            {r.items?.length || 0} polozek
          </Text>
          {r.items?.map((item: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: v2.border, marginTop: i === 0 ? 12 : 0 }}>
              <Text style={{ color: v2.muted, fontSize: 13 }}>
                {item.referenceName}
              </Text>
              <Text style={{ color: v2.faint, fontSize: 11 }}>
                {item.timing}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </V2Screen>
  );
}
