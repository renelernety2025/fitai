import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getVIPStatus, checkVIPEligibility, acceptVIP } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';

export function VIPScreen() {
  const [status, setStatus] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);

  useEffect(() => {
    getVIPStatus().then(setStatus).catch(() => setStatus(null));
    checkVIPEligibility().then(setEligibility).catch(() => setEligibility(null));
  }, []);

  function handleAccept() {
    acceptVIP()
      .then((s) => { setStatus(s); Alert.alert('VIP', 'Vitejte v VIP programu!'); })
      .catch((e) => Alert.alert('Chyba', e.message));
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Exkluzivni</V2SectionLabel>
        <V2Display size="xl">VIP.</V2Display>
      </View>

      {status ? (
        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: v2.yellow, padding: 24, marginBottom: 24, backgroundColor: `${v2.yellow}10` }}>
          <Text style={{ color: v2.yellow, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 8 }}>
            {(status.tier || 'VIP').toUpperCase()}
          </Text>
          <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
            Jste VIP clenem
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
          {eligibility && (
            <>
              <StatRow label="XP Rank" value={`#${eligibility.xpRank} z ${eligibility.totalUsers}`} />
              <StatRow label="Streak" value={`${eligibility.streak} dni`} />
              <StatRow label="Prumerna forma" value={`${eligibility.avgForm}%`} />
              <View style={{ marginTop: 16 }}>
                {eligibility.eligible ? (
                  <V2Button onPress={handleAccept} full>
                    Prijmout VIP status
                  </V2Button>
                ) : (
                  <Text style={{ color: v2.muted, fontSize: 13, textAlign: 'center' }}>
                    Zatim nesplnujete podminky
                  </Text>
                )}
              </View>
            </>
          )}
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
