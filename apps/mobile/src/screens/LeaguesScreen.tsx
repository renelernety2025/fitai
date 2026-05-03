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
  v2,
} from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState } from '../components/native';
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

function formatCountdown(endsAt: string | undefined): string {
  if (!endsAt) return '';
  const diff = new Date(endsAt).getTime() - Date.now();
  if (isNaN(diff) || diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `${days}d ${hours}h`;
}

/** Compute week end from current Monday */
function getWeekEndDate(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + daysUntilSunday);
  end.setUTCHours(23, 59, 59, 999);
  return end.toISOString();
}

export function LeaguesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  const reload = () => {
    setLoading(true);
    getLeagueCurrent()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };
  useEffect(reload, []);

  async function handleJoin() {
    haptic.tap();
    setJoining(true);
    setError(null);
    try {
      await joinLeague();
      haptic.success();
      reload();
    } catch {
      haptic.error();
      setError('Failed to join league');
    }
    setJoining(false);
  }

  const tierColor = data?.tier
    ? TIER_COLORS[data.tier.toLowerCase()] || '#C0C0C0'
    : '#C0C0C0';

  // Show league data only when actually joined with tier
  const showLeague = !loading && data?.joined && data?.tier;

  return (
    <V2Screen>
      {/* Back — native iOS chevron */}
      <Pressable
        onPress={() => { haptic.tap(); navigation.goBack(); }}
        hitSlop={12}
        style={({ pressed }) => [s.backBtnWrap, pressed && { opacity: 0.5 }]}
      >
        <Text style={s.backChevron}>‹</Text>
        <Text style={s.backLabel}>Back</Text>
      </Pressable>

      <V2SectionLabel>Leagues</V2SectionLabel>
      <V2Display size="lg">Weekly competition</V2Display>

      {error && <Text style={s.error}>{error}</Text>}

      {loading && <LoadingState label="Loading league" />}

      {showLeague && data && (
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
              {data.weeklyXP.toLocaleString('en-US')} XP this week
            </Text>
          </View>

          {/* Progress bar to next tier */}
          {data.nextTierXP > 0 && (
            <View style={s.progressWrap}>
              <View style={s.progressLabels}>
                <Text style={s.progressLabel}>Next tier</Text>
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
            Week ends in{' '}
            <Text style={{ color: v2.text, fontWeight: '600' }}>
              {formatCountdown(data.endsAt || getWeekEndDate())}
            </Text>
          </Text>

          {/* Join button */}
          {!data.joined && (
            <View style={{ marginBottom: 24, alignItems: 'center' }}>
              <V2Button onPress={handleJoin} disabled={joining}>
                {joining ? 'Joining...' : 'Join'}
              </V2Button>
            </View>
          )}

          {/* Leaderboard */}
          <V2SectionLabel>Leaderboard</V2SectionLabel>

          {(data.leaderboard ?? []).length === 0 ? (
            <Text style={s.emptyText}>
              No competitors yet. Be the first!
            </Text>
          ) : (
            (data.leaderboard ?? []).map(entry => {
              const isMe = entry.userId === user?.id;
              const promoted = data.promotionLine ? entry.rank <= data.promotionLine : false;
              const relegated = data.relegationLine
                ? entry.rank > (data.leaderboard?.length ?? 0) - data.relegationLine
                : false;

              return (
                <View
                  key={entry.userId}
                  style={[
                    s.leaderRow,
                    isMe && s.leaderRowMe,
                  ]}
                >
                  <Text style={s.leaderRank}>{entry.rank}</Text>
                  {promoted && <Text style={s.promoArrow}>↑</Text>}
                  {relegated && <Text style={s.relegArrow}>↓</Text>}
                  <Text
                    style={[s.leaderName, isMe && { color: v2.green }]}
                    numberOfLines={1}
                  >
                    {entry.name}
                    {isMe ? ' (you)' : ''}
                  </Text>
                  <Text style={s.leaderXP}>
                    {entry.weeklyXP.toLocaleString('en-US')} XP
                  </Text>
                </View>
              );
            })
          )}
        </>
      )}

      {/* Not joined / no data state */}
      {!loading && !showLeague && (
        <EmptyState
          icon="🏆"
          title={data?.joined === false ? 'Join the weekly league' : 'No league active'}
          body="Compete with others, climb tiers each week."
          actionLabel={joining ? 'Joining…' : 'Join league'}
          onAction={joining ? undefined : handleJoin}
        />
      )}
    </V2Screen>
  );
}

const s = StyleSheet.create({
  backBtnWrap: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingTop: 8 },
  backChevron: { color: v2.text, fontSize: 32, fontWeight: '300', lineHeight: 32, marginTop: -3 },
  backLabel: { color: v2.text, fontSize: 16, fontWeight: '500' },
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
