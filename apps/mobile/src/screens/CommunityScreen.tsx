import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../lib/auth-context';
import { getSocialFeed, getChallenges, joinChallenge, getFollowCounts } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Button, v2 } from '../components/v2/V2';

function timeAgo(date: string) {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1) return 'právě teď';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function CommunityScreen() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [counts, setCounts] = useState({ following: 0, followers: 0 });
  const [tab, setTab] = useState<'feed' | 'challenges'>('feed');

  useEffect(() => {
    getSocialFeed().then(setFeed).catch(console.error);
    getChallenges().then(setChallenges).catch(console.error);
    getFollowCounts().then(setCounts).catch(console.error);
  }, []);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Komunita</V2SectionLabel>
        <V2Display size="xl">Lidé.</V2Display>
        <Text style={{ color: v2.muted, marginTop: 8, fontSize: 14 }}>
          {counts.following} sleduji · {counts.followers} sledujících
        </Text>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <V2Chip label="Feed" selected={tab === 'feed'} onPress={() => setTab('feed')} />
        <V2Chip label="Výzvy" selected={tab === 'challenges'} onPress={() => setTab('challenges')} />
      </View>

      {tab === 'feed' && (
        <View>
          {feed.length === 0 && (
            <Text style={{ color: v2.faint, textAlign: 'center', marginTop: 24 }}>
              Feed je prázdný. Sleduj cvičence nebo začni cvičit.
            </Text>
          )}
          {feed.map((item) => (
            <View key={item.id} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={{ color: '#FFF', fontWeight: '600' }}>{item.user.name}</Text>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>
                  {timeAgo(item.createdAt)}
                </Text>
              </View>
              <Text style={{ color: '#FFF', fontSize: 15, marginTop: 4 }}>{item.title}</Text>
              <Text style={{ color: v2.muted, fontSize: 13 }}>{item.body}</Text>
            </View>
          ))}
        </View>
      )}

      {tab === 'challenges' && (
        <View>
          {challenges.length === 0 && (
            <Text style={{ color: v2.faint, textAlign: 'center', marginTop: 24 }}>Žádné aktivní výzvy.</Text>
          )}
          {challenges.map((ch) => {
            const days = Math.max(0, Math.ceil((new Date(ch.endDate).getTime() - Date.now()) / 86400000));
            const joined = ch.participants?.some((p: any) => p.user.id === user?.id);
            return (
              <View key={ch.id} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 24 }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginBottom: 6 }}>
                  {days} DNÍ ZBÝVÁ · {ch._count?.participants || 0} ÚČASTNÍKŮ
                </Text>
                <V2Display size="md">{ch.nameCs}</V2Display>
                <Text style={{ color: v2.muted, marginTop: 6, fontSize: 14 }}>{ch.description}</Text>
                <Text style={{ color: v2.faint, fontSize: 12, marginTop: 4 }}>Cíl: {ch.targetValue}</Text>
                <View style={{ marginTop: 16 }}>
                  {joined ? (
                    <Text style={{ color: v2.green, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
                      ✓ ÚČASTNÍŠ SE
                    </Text>
                  ) : (
                    <V2Button
                      onPress={async () => {
                        await joinChallenge(ch.id);
                        setChallenges(await getChallenges());
                      }}
                    >
                      Připojit se →
                    </V2Button>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </V2Screen>
  );
}
