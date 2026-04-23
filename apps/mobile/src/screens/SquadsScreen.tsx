import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getMySquad, getSquadLeaderboard } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, v2 } from '../components/v2/V2';

export function SquadsScreen() {
  const [tab, setTab] = useState<'squad' | 'leaderboard'>('squad');
  const [squad, setSquad] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    getMySquad().then(setSquad).catch(() => setSquad(null));
    getSquadLeaderboard().then(setLeaderboard).catch(() => setLeaderboard([]));
  }, []);

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Tym</V2SectionLabel>
        <V2Display size="xl">Squad.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <V2Chip label="Muj squad" selected={tab === 'squad'} onPress={() => setTab('squad')} />
        <V2Chip label="Zebricek" selected={tab === 'leaderboard'} onPress={() => setTab('leaderboard')} />
      </View>

      {tab === 'squad' && (
        squad ? (
          <View style={{ borderRadius: 24, borderWidth: 1, borderColor: v2.border, padding: 24, backgroundColor: v2.surface }}>
            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
              {squad.name}
            </Text>
            {squad.motto && (
              <Text style={{ color: v2.muted, fontSize: 13, marginBottom: 16, fontStyle: 'italic' }}>
                "{squad.motto}"
              </Text>
            )}
            <Text style={{ color: v2.faint, fontSize: 11, marginBottom: 12 }}>
              {squad.members?.length || 0} clenu
            </Text>
            {squad.members?.map((m: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: v2.border }}>
                <Text style={{ color: '#FFF', fontSize: 14 }}>{m.user?.name || 'Clen'}</Text>
                <Text style={{ color: v2.green, fontSize: 14, fontWeight: '700' }}>{m.weeklyXP || 0} XP</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
            Nejste v zadnem squadu
          </Text>
        )
      )}

      {tab === 'leaderboard' && (
        leaderboard.length === 0 ? (
          <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
            Zadny zebricek
          </Text>
        ) : (
          leaderboard.map((s, i) => (
            <View
              key={s.id || i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: v2.border,
              }}
            >
              <Text style={{ color: i < 3 ? v2.yellow : v2.faint, fontSize: 16, fontWeight: '700', width: 32 }}>
                #{i + 1}
              </Text>
              <Text style={{ color: '#FFF', fontSize: 14, flex: 1 }}>{s.name}</Text>
              <Text style={{ color: v2.green, fontSize: 14, fontWeight: '700' }}>{s.totalXP || 0}</Text>
            </View>
          ))
        )
      )}
    </V2Screen>
  );
}
