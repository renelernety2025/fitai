import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getBundles, purchaseBundle } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState, NativeConfirm } from '../components/native';

export function BundlesScreen() {
  const [bundles, setBundles] = useState<any[] | null>(null);
  const [pending, setPending] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    getBundles().then(setBundles).catch(() => setBundles([]));
  }, []);

  async function confirmPurchase() {
    if (!pending) return;
    const id = pending.id;
    const name = pending.name;
    setPending(null);
    setError(null);
    try {
      await purchaseBundle(id);
      haptic.success();
      setSuccessName(name);
      // refresh list
      getBundles().then(setBundles).catch(() => {});
    } catch (e: any) {
      haptic.error();
      setError(e?.message || 'Purchase failed');
    }
  }

  const items = bundles ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Store</V2SectionLabel>
        <V2Display size="xl">Bundles.</V2Display>
      </View>

      {error && (
        <View style={{ marginBottom: 16, backgroundColor: 'rgba(255,55,95,0.10)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,55,95,0.25)' }}>
          <Text style={{ color: v2.red, fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {successName && (
        <View style={{ marginBottom: 16, backgroundColor: 'rgba(168,255,0,0.10)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(168,255,0,0.25)' }}>
          <Text style={{ color: v2.green, fontSize: 13 }}>✓ Purchased: {successName}</Text>
        </View>
      )}

      {bundles === null ? (
        <LoadingState label="Loading bundles" />
      ) : items.length === 0 ? (
        <EmptyState icon="📦" title="No bundles" body="Check back soon — new XP bundles drop regularly." />
      ) : null}

      {items.map((b) => (
        <View
          key={b.id}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
          }}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
            {b.name}
          </Text>
          {b.description && (
            <Text style={{ color: v2.muted, fontSize: 13, marginBottom: 12 }}>
              {b.description}
            </Text>
          )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: v2.yellow, fontSize: 14, fontWeight: '700' }}>
              {b.priceXP} XP
            </Text>
            <Text style={{ color: v2.faint, fontSize: 11 }}>
              {b.items?.length || 0} items
            </Text>
          </View>
          <V2Button
            onPress={() => { haptic.tap(); setPending({ id: b.id, name: b.name }); setSuccessName(null); }}
            variant="secondary"
            full
          >
            Buy
          </V2Button>
        </View>
      ))}

      <NativeConfirm
        visible={!!pending}
        title="Buy this bundle?"
        message={pending ? `${pending.name} will be added to your account.` : undefined}
        confirmLabel="Buy"
        onConfirm={confirmPurchase}
        onCancel={() => setPending(null)}
      />
    </V2Screen>
  );
}
