import React, { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, ErrorState } from '../components/native';
import { requestHealthPermissions, syncRecent7Days, type HealthSyncResult } from '../lib/health-sync';
import {
  ouraAuthorize,
  ouraSyncNow,
  ouraDisconnect,
  getWearableConnections,
  type WearableConnectionInfo,
} from '../lib/api';

type SyncState = 'idle' | 'requesting' | 'syncing' | 'done' | 'error';
type OuraState = 'idle' | 'connecting' | 'syncing' | 'connected' | 'error';

const PROVIDER_LABEL = Platform.OS === 'ios' ? 'Apple Health' : Platform.OS === 'android' ? 'Health Connect' : 'Health';
const OURA_REDIRECT = 'fitai://wearables/oura/connected';

export function HealthSyncScreen() {
  const [state, setState] = useState<SyncState>('idle');
  const [result, setResult] = useState<HealthSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ouraState, setOuraState] = useState<OuraState>('idle');
  const [ouraInfo, setOuraInfo] = useState<WearableConnectionInfo | null>(null);
  const [ouraError, setOuraError] = useState<string | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    refreshConnections();
  }, []);

  async function refreshConnections() {
    try {
      const list = await getWearableConnections();
      const oura = list.find((c) => c.provider === 'oura');
      setOuraInfo(oura ?? null);
      if (oura) setOuraState('connected');
    } catch {
      // Silent — first-time users get empty state.
    }
  }

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

  async function connectOura() {
    haptic.tap();
    setOuraError(null);
    setOuraState('connecting');
    try {
      const { url } = await ouraAuthorize();
      const result = await WebBrowser.openAuthSessionAsync(url, OURA_REDIRECT);
      if (result.type !== 'success') {
        setOuraState('idle');
        return;
      }
      setOuraState('syncing');
      await ouraSyncNow();
      await refreshConnections();
      setOuraState('connected');
      haptic.success();
    } catch (e: any) {
      setOuraError(e?.message || 'Připojení Oura selhalo');
      setOuraState('error');
      haptic.error();
    }
  }

  async function disconnectOura() {
    haptic.tap();
    try {
      await ouraDisconnect();
      setOuraInfo(null);
      setOuraState('idle');
      haptic.success();
    } catch (e: any) {
      setOuraError(e?.message || 'Odpojení selhalo');
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

      <View style={{ marginTop: 48, paddingTop: 32, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
        <V2SectionLabel>Wearable hardware</V2SectionLabel>
        <V2Display size="md">Oura Ring</V2Display>
        <Text style={{ color: v2.faint, fontSize: 14, marginTop: 8, lineHeight: 22 }}>
          Připojení přes Oura Cloud (OAuth). Sync běží denně 04:00 UTC + manuálně přes "Synchronizovat".
        </Text>

        {ouraState === 'connecting' && <LoadingState label="Otvírám přihlášení k Oura…" />}
        {ouraState === 'syncing' && <LoadingState label="Stahuji posledních 7 dní z Oura…" />}
        {ouraState === 'error' && ouraError && <ErrorState message={ouraError} onRetry={connectOura} />}

        {ouraState === 'connected' && ouraInfo && (
          <View
            style={{
              marginTop: 16,
              padding: 16,
              backgroundColor: v2.surface,
              borderRadius: 12,
              borderColor: v2.green,
              borderWidth: 1,
            }}
          >
            <Text style={{ color: v2.green, fontSize: 14, fontWeight: '700', letterSpacing: 0.5 }}>● PŘIPOJENO</Text>
            <Text style={{ color: v2.faint, fontSize: 12, marginTop: 4 }}>
              Poslední sync: {ouraInfo.lastSyncAt ? new Date(ouraInfo.lastSyncAt).toLocaleString('cs-CZ') : 'zatím neproběhl'}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 16, gap: 8 }}>
          {ouraState !== 'connected' && (
            <V2Button onPress={connectOura} variant="primary">
              Připojit Oura Ring
            </V2Button>
          )}
          {ouraState === 'connected' && (
            <>
              <V2Button onPress={connectOura} variant="primary">
                Synchronizovat teď
              </V2Button>
              <V2Button onPress={disconnectOura} variant="secondary">
                Odpojit Oura
              </V2Button>
            </>
          )}
        </View>
      </View>
    </V2Screen>
  );
}
