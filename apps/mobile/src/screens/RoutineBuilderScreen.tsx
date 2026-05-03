import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getMyRoutines, getPublicRoutines } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState } from '../components/native';

export function RoutineBuilderScreen() {
  const [tab, setTab] = useState<'mine' | 'public'>('mine');
  const [mine, setMine] = useState<any[] | null>(null);
  const [pub, setPub] = useState<any[] | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    getMyRoutines().then(setMine).catch(() => setMine([]));
    getPublicRoutines().then(setPub).catch(() => setPub([]));
  }, []);

  const current = tab === 'mine' ? mine : pub;
  const items = current ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Organization</V2SectionLabel>
        <V2Display size="xl">Routines.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <V2Chip label="Mine" selected={tab === 'mine'} onPress={() => { haptic.selection(); setTab('mine'); }} />
        <V2Chip label="Public" selected={tab === 'public'} onPress={() => { haptic.selection(); setTab('public'); }} />
      </View>

      {current === null ? (
        <LoadingState label="Loading routines" />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🗓"
          title={tab === 'mine' ? 'No routines yet' : 'No public routines'}
          body={tab === 'mine' ? 'Build a routine on the web app — it will sync here.' : 'Curated routines from the community appear here.'}
        />
      ) : null}

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
            {r.items?.length || 0} items
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
