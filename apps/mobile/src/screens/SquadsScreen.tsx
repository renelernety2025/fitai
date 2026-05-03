import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getMySquad, getSquadLeaderboard } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState } from '../components/native';

export function SquadsScreen() {
  const [tab, setTab] = useState<'squad' | 'leaderboard'>('squad');
  const [squad, setSquad] = useState<any>(undefined);
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    getMySquad().then(s => setSquad(s || null)).catch(() => setSquad(null));
    getSquadLeaderboard().then(setLeaderboard).catch(() => setLeaderboard([]));
  }, []);

  const loading = (tab === 'squad' && squad === undefined) || (tab === 'leaderboard' && leaderboard === null);

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Team</V2SectionLabel>
        <V2Display size="xl">Squad.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <V2Chip label="My squad" selected={tab === 'squad'} onPress={() => { haptic.selection(); setTab('squad'); }} />
        <V2Chip label="Leaderboard" selected={tab === 'leaderboard'} onPress={() => { haptic.selection(); setTab('leaderboard'); }} />
      </View>

      {loading && <LoadingState label="Loading squads" />}

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
              {squad.members?.length || 0} members
            </Text>
            {squad.members?.map((m: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: v2.border }}>
                <Text style={{ color: '#FFF', fontSize: 14 }}>{m.user?.name || 'Member'}</Text>
                <Text style={{ color: v2.green, fontSize: 14, fontWeight: '700' }}>{m.weeklyXP || 0} XP</Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState icon="🤝" title="No squad yet" body="Join or create a squad on the web app to compete weekly." />
        )
      )}

      {tab === 'leaderboard' && !loading && (
        (leaderboard ?? []).length === 0 ? (
          <EmptyState icon="🏆" title="No squads yet" body="Be the first to start a squad — leaderboard will fill up fast." />
        ) : (
          (leaderboard ?? []).map((s, i) => (
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
              <Text style={{ color: v2.green, fontSize: 14, fontWeight: '700' }}>{s.totalXP ?? s.weeklyXP ?? 0} XP</Text>
            </View>
          ))
        )
      )}
    </V2Screen>
  );
}
