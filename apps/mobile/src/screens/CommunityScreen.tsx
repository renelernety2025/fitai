import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View, Text } from 'react-native';
import { useAuth } from '../lib/auth-context';
import {
  getChallenges, joinChallenge, getFollowCounts,
  getForYouFeed, getFollowingFeed, getTrendingFeed,
} from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Button, v2 } from '../components/v2/V2';

type FeedTab = 'forYou' | 'following' | 'trending' | 'challenges';

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
  const [tab, setTab] = useState<FeedTab>('forYou');
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = useCallback(async (activeTab: FeedTab) => {
    if (activeTab === 'forYou') {
      const res = await getForYouFeed().catch(() => ({ items: [] }));
      setFeed(Array.isArray(res) ? res : (res as any).items ?? []);
    } else if (activeTab === 'following') {
      const res = await getFollowingFeed().catch(() => ({ items: [] }));
      setFeed(Array.isArray(res) ? res : (res as any).items ?? []);
    } else if (activeTab === 'trending') {
      const res = await getTrendingFeed().catch(() => ({ items: [] }));
      setFeed(Array.isArray(res) ? res : (res as any).items ?? []);
    } else {
      getChallenges().then(setChallenges).catch(console.error);
    }
  }, []);

  useEffect(() => {
    fetchFeed(tab);
    getFollowCounts().then(setCounts).catch(console.error);
  }, [tab, fetchFeed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeed(tab).catch(console.error);
    setRefreshing(false);
  }, [tab, fetchFeed]);

  const renderFeedItem = ({ item }: { item: any }) => (
    <View style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text style={{ color: '#FFF', fontWeight: '600' }}>{item.user?.name ?? item.author?.name ?? '—'}</Text>
        <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>
          {timeAgo(item.createdAt)}
        </Text>
      </View>
      <Text style={{ color: '#FFF', fontSize: 15, marginTop: 4 }}>{item.title ?? item.caption}</Text>
      {item.body ? <Text style={{ color: v2.muted, fontSize: 13 }}>{item.body}</Text> : null}
    </View>
  );

  const renderChallengeItem = ({ item: ch }: { item: any }) => {
    const days = Math.max(0, Math.ceil((new Date(ch.endDate).getTime() - Date.now()) / 86400000));
    const joined = ch.participants?.some((p: any) => p.user.id === user?.id);
    return (
      <View style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 24 }}>
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
  };

  const isFeedTab = tab !== 'challenges';
  const data = isFeedTab ? feed : challenges;
  const emptyText = tab === 'following'
    ? 'Začni sledovat cvičence a uvidíš jejich aktivitu.'
    : tab === 'trending'
    ? 'Zatím žádný trending obsah.'
    : tab === 'challenges'
    ? 'Žádné aktivní výzvy.'
    : 'Feed je prázdný. Sleduj cvičence nebo začni cvičit.';

  return (
    <V2Screen>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={isFeedTab ? renderFeedItem : renderChallengeItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={v2.green} />}
        ListHeaderComponent={
          <View>
            <View style={{ paddingTop: 24, marginBottom: 24 }}>
              <V2SectionLabel>Komunita</V2SectionLabel>
              <V2Display size="xl">Lidé.</V2Display>
              <Text style={{ color: v2.muted, marginTop: 8, fontSize: 14 }}>
                {counts.following} sleduji · {counts.followers} sledujících
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              <V2Chip label="Pro tebe" selected={tab === 'forYou'} onPress={() => setTab('forYou')} />
              <V2Chip label="Sledovaní" selected={tab === 'following'} onPress={() => setTab('following')} />
              <V2Chip label="Trending" selected={tab === 'trending'} onPress={() => setTab('trending')} />
              <V2Chip label="Výzvy" selected={tab === 'challenges'} onPress={() => setTab('challenges')} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={{ color: v2.faint, textAlign: 'center', marginTop: 24 }}>{emptyText}</Text>
        }
        contentContainerStyle={{ paddingHorizontal: 0 }}
      />
    </V2Screen>
  );
}
