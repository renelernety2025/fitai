import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import {
  V2Screen,
  V2Display,
  V2SectionLabel,
  V2Button,
  V2Loading,
  v2,
} from '../components/v2/V2';
import { getLeagueCurrent, joinLeague } from '../lib/api';
import { useAuth } from '../lib/auth-context';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#00E5FF',
  legend: '#BF5AF2',
};

interface LeagueData {
  tier: string;
  rank: number;
  weeklyXP: number;
  nextTierXP: number;
  joined: boolean;
  endsAt: string;
  leaderboard: {
    userId: string;
    name: string;
    weeklyXP: number;
    rank: number;
  }[];
  promotionLine: number;
  relegationLine: number;
}

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Skonceno';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `${days}d ${hours}h`;
}

export function LeaguesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeagueCurrent()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      const d = await joinLeague();
      setData(d);
    } catch {
      setError('Nepodarilo se pripojit k lige');
    }
    setJoining(false);
  }

  const tierColor = data
    ? TIER_COLORS[data.tier.toLowerCase()] || '#C0C0C0'
    : '#C0C0C0';

  return (
    <V2Screen>
      {/* Back */}
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 8 }}>
        <Text style={{ color: v2.muted, fontSize: 14, fontWeight: '600' }}>Zpet</Text>
      </Pressable>

      <V2SectionLabel>Ligy</V2SectionLabel>
      <V2Display size="lg">Tydeni soutez</V2Display>

      {error && <Text style={s.error}>{error}</Text>}

      {loading && <V2Loading />}

      {!loading && data && (
        <>
          {/* Hero: tier badge */}
          <View style={s.heroCenter}>
            <View
              style={[
                s.tierBadge,
                {
                  borderColor: tierColor,
                  shadowColor: tierColor,
                  backgroundColor: tierColor + '11',
                },
              ]}
            >
              <Text style={[s.tierLetter, { color: tierColor }]}>
                {data.tier.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[s.tierName, { color: tierColor }]}>
              {data.tier.toUpperCase()}
            </Text>
            <Text style={s.rankBig}>#{data.rank}</Text>
            <Text style={s.xpSub}>
              {data.weeklyXP.toLocaleString('cs-CZ')} XP tento tyden
            </Text>
          </View>

          {/* Progress bar to next tier */}
          {data.nextTierXP > 0 && (
            <View style={s.progressWrap}>
              <View style={s.progressLabels}>
                <Text style={s.progressLabel}>Dalsi tier</Text>
                <Text style={s.progressLabel}>
                  {data.weeklyXP} / {data.nextTierXP} XP
                </Text>
              </View>
              <View style={s.progressTrack}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${Math.min(100, (data.weeklyXP / data.nextTierXP) * 100)}%`,
                      backgroundColor: tierColor,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Countdown */}
          <Text style={s.countdown}>
            Tyden konci za{' '}
            <Text style={{ color: v2.text, fontWeight: '600' }}>
              {formatCountdown(data.endsAt)}
            </Text>
          </Text>

          {/* Join button */}
          {!data.joined && (
            <View style={{ marginBottom: 24, alignItems: 'center' }}>
              <V2Button onPress={handleJoin} disabled={joining}>
                {joining ? 'Pripojuji...' : 'Pripojit se'}
              </V2Button>
            </View>
          )}

          {/* Leaderboard */}
          <V2SectionLabel>Zebricek</V2SectionLabel>

          {data.leaderboard.length === 0 ? (
            <Text style={s.emptyText}>
              Zatim zadni soutezici. Bud prvni!
            </Text>
          ) : (
            data.leaderboard.map(entry => {
              const isMe = entry.userId === user?.id;
              const promoted = entry.rank <= data.promotionLine;
              const relegated =
                entry.rank > data.leaderboard.length - data.relegationLine;

              return (
                <View
                  key={entry.userId}
                  style={[
                    s.leaderRow,
                    isMe && s.leaderRowMe,
                  ]}
                >
                  <Text style={s.leaderRank}>{entry.rank}</Text>
                  {promoted && <Text style={s.promoArrow}>^</Text>}
                  {relegated && <Text style={s.relegArrow}>v</Text>}
                  <Text
                    style={[s.leaderName, isMe && { color: v2.green }]}
                    numberOfLines={1}
                  >
                    {entry.name}
                    {isMe ? ' (ty)' : ''}
                  </Text>
                  <Text style={s.leaderXP}>
                    {entry.weeklyXP.toLocaleString('cs-CZ')} XP
                  </Text>
                </View>
              );
            })
          )}
        </>
      )}

      {/* No data state */}
      {!loading && !data && (
        <View style={s.noDataWrap}>
          <Text style={s.emptyText}>Ligy nejsou aktivni.</Text>
          <View style={{ marginTop: 16 }}>
            <V2Button onPress={handleJoin} disabled={joining}>
              {joining ? 'Pripojuji...' : 'Pripojit se k lige'}
            </V2Button>
          </View>
        </View>
      )}
    </V2Screen>
  );
}

const s = StyleSheet.create({
  error: { color: v2.red, fontSize: 13, marginTop: 12 },
  heroCenter: { alignItems: 'center', marginTop: 32, marginBottom: 32 },
  tierBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tierLetter: { fontSize: 28, fontWeight: '800' },
  tierName: { fontSize: 10, fontWeight: '700', letterSpacing: 3, marginBottom: 16 },
  rankBig: {
    color: v2.text,
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -3,
    lineHeight: 60,
  },
  xpSub: { color: v2.muted, fontSize: 14, marginTop: 4 },
  progressWrap: { marginBottom: 24 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: v2.faint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },
  countdown: { color: v2.faint, fontSize: 13, textAlign: 'center', marginBottom: 24 },
  emptyText: { color: v2.ghost, fontSize: 14, textAlign: 'center', marginTop: 24 },
  noDataWrap: { alignItems: 'center', marginTop: 48 },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: v2.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 6,
    gap: 8,
  },
  leaderRowMe: {
    borderColor: 'rgba(168,255,0,0.3)',
    backgroundColor: 'rgba(168,255,0,0.04)',
  },
  leaderRank: {
    color: v2.ghost,
    fontSize: 16,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
  promoArrow: { color: '#4ade80', fontSize: 12 },
  relegArrow: { color: v2.red, fontSize: 12 },
  leaderName: { color: v2.text, fontSize: 14, fontWeight: '600', flex: 1 },
  leaderXP: { color: v2.muted, fontSize: 13 },
});
