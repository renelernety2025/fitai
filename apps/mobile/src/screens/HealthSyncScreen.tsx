import React, { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, ErrorState } from '../components/native';
import { requestHealthPermissions, syncRecent7Days, type HealthSyncResult } from '../lib/health-sync';

type SyncState = 'idle' | 'requesting' | 'syncing' | 'done' | 'error';

const PROVIDER_LABEL = Platform.OS === 'ios' ? 'Apple Health' : Platform.OS === 'android' ? 'Health Connect' : 'Health';

export function HealthSyncScreen() {
  const [state, setState] = useState<SyncState>('idle');
  const [result, setResult] = useState<HealthSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  async function connect() {
    haptic.tap();
    setError(null);
    setState('requesting');
    try {
      const granted = await requestHealthPermissions();
      if (!granted) {
        setError(`Povolení ${PROVIDER_LABEL} nebylo uděleno. Můžeš ho povolit v Nastavení.`);
        setState('error');
        haptic.warning();
        return;
      }
      setState('syncing');
      const res = await syncRecent7Days();
      setResult(res);
      setState('done');
      haptic.success();
    } catch (e: any) {
      setError(e?.message || 'Synchronizace selhala');
      setState('error');
      haptic.error();
    }
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Apple Watch / Pixel Watch</V2SectionLabel>
        <V2Display size="xl">Recovery z hodinek.</V2Display>
        <Text style={{ color: v2.faint, fontSize: 14, marginTop: 12, lineHeight: 22 }}>
          FitAI čte spánek, HRV a klidový tep z {PROVIDER_LABEL}. Daily Brief pak ví objektivně, jak ti je —
          a doporučuje intenzitu podle reálných dat, ne podle subjektivního self-reportu.
        </Text>
      </View>

      <View style={{ marginBottom: 24 }}>
        <V2SectionLabel>Co synchronizujeme</V2SectionLabel>
        {[
          'Spánek (hodiny + kvalita)',
          'HRV (variabilita srdečního tepu)',
          'Klidový srdeční tep',
          'Kroky a aktivita',
          'Tep během tréninku',
        ].map((item) => (
          <Text key={item} style={{ color: v2.text, fontSize: 15, marginTop: 8 }}>
            ·  {item}
          </Text>
        ))}
      </View>

      {state === 'requesting' && <LoadingState label={`Žádám o povolení ${PROVIDER_LABEL}…`} />}
      {state === 'syncing' && <LoadingState label="Synchronizuji posledních 7 dní…" />}

      {state === 'done' && result && (
        <View
          style={{
            marginTop: 24,
            padding: 20,
            backgroundColor: v2.surface,
            borderRadius: 16,
            borderColor: v2.green,
            borderWidth: 1,
          }}
        >
          <Text style={{ color: v2.green, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }}>
            ✓ Připojeno
          </Text>
          <Text style={{ color: v2.text, fontSize: 14, marginTop: 8 }}>
            {result.synced} datových bodů synchronizováno z {PROVIDER_LABEL}.
          </Text>
          <Text style={{ color: v2.faint, fontSize: 12, marginTop: 8 }}>
            Daily Brief tě teď zná z hodinek. Synchronizace běží automaticky každých 24h.
          </Text>
        </View>
      )}

      {state === 'error' && error && <ErrorState message={error} onRetry={connect} />}

      {(state === 'idle' || state === 'done') && (
        <View style={{ marginTop: 32 }}>
          <V2Button onPress={connect}>
            {state === 'done' ? 'Synchronizovat znovu' : `Připojit ${PROVIDER_LABEL}`}
          </V2Button>
        </View>
      )}
    </V2Screen>
  );
}
