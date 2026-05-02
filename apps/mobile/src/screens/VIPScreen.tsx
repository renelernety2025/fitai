import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getVIPStatus, checkVIPEligibility, acceptVIP } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, V2Loading, v2 } from '../components/v2/V2';

export function VIPScreen() {
  const [status, setStatus] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getVIPStatus().catch(() => null),
      checkVIPEligibility().catch(() => null),
    ]).then(([s, e]) => {
      setStatus(s);
      setEligibility(e);
    }).finally(() => setLoading(false));
  }, []);

  function handleAccept() {
    acceptVIP()
      .then((s) => { setStatus(s); Alert.alert('VIP', 'Welcome to VIP!'); })
      .catch((e: any) => Alert.alert('Error', e?.message || 'Could not accept VIP'));
  }

  // Backend returns {isVip: true/false} — check the field, not truthy object
  const isVip = status?.isVip === true;
  const stats = eligibility?.stats;
  const isEligible = eligibility?.isEligible === true;

  if (loading) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Exclusive</V2SectionLabel>
        <V2Display size="xl">VIP.</V2Display>
      </View>

      {isVip ? (
        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: v2.yellow, padding: 24, marginBottom: 24, backgroundColor: `${v2.yellow}10` }}>
          <Text style={{ color: v2.yellow, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 8 }}>
            {(status.tier || 'VIP').toUpperCase()}
          </Text>
          <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
            You are a VIP member
          </Text>
          {status.privileges?.map((p: string, i: number) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: v2.yellow, marginRight: 10 }} />
              <Text style={{ color: v2.muted, fontSize: 13 }}>{p}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: v2.border, padding: 24, marginBottom: 24, backgroundColor: v2.surface }}>
          <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            VIP Program
          </Text>
          {stats && (
            <>
              <StatRow label="XP Rank" value={`#${stats.xpRank} of ${stats.totalUsers}`} />
              <StatRow label="Streak" value={`${stats.currentStreak} days`} />
              <StatRow label="Avg form" value={`${stats.avgFormScore}%`} />
            </>
          )}
          {eligibility?.reasons?.length > 0 && (
            <View style={{ marginTop: 12 }}>
              {eligibility.reasons.map((r: string, i: number) => (
                <Text key={i} style={{ color: v2.faint, fontSize: 11, marginBottom: 2 }}>• {r}</Text>
              ))}
            </View>
          )}
          <View style={{ marginTop: 16 }}>
            {isEligible ? (
              <V2Button onPress={handleAccept} full>
                Accept VIP status
              </V2Button>
            ) : (
              <Text style={{ color: v2.muted, fontSize: 13, textAlign: 'center' }}>
                Requirements not met yet
              </Text>
            )}
          </View>
        </View>
      )}
    </V2Screen>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
      <Text style={{ color: v2.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}
