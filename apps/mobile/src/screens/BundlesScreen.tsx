import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getBundles, purchaseBundle } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, V2Loading, v2 } from '../components/v2/V2';

export function BundlesScreen() {
  const [bundles, setBundles] = useState<any[] | null>(null);

  useEffect(() => {
    getBundles().then(setBundles).catch(() => setBundles([]));
  }, []);

  function handlePurchase(id: string) {
    Alert.alert('Purchase bundle', 'Buy this bundle with XP?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Buy',
        onPress: () => purchaseBundle(id).then(() => {
          Alert.alert('Done', 'Bundle purchased!');
        }).catch((e: any) => Alert.alert('Error', e?.message || 'Purchase failed')),
      },
    ]);
  }

  const items = bundles ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Store</V2SectionLabel>
        <V2Display size="xl">Bundles.</V2Display>
      </View>

      {bundles === null ? (
        <V2Loading />
      ) : items.length === 0 ? (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          No bundles available
        </Text>
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
          <V2Button onPress={() => handlePurchase(b.id)} variant="secondary" full>
            Buy
          </V2Button>
        </View>
      ))}
    </V2Screen>
  );
}
