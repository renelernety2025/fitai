import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { getDrops, purchaseDrop } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Vyprodano';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m}m`;
}

export function DropsScreen() {
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    getDrops().then(setDrops).catch(() => setDrops([]));
  }, []);

  function handlePurchase(drop: any) {
    Alert.alert(
      'Potvrdit',
      `Chces ziskat "${drop.name}" za ${drop.price ?? 0} XP?`,
      [
        { text: 'Zrusit', style: 'cancel' },
        {
          text: 'Ziskat',
          onPress: () => {
            purchaseDrop(drop.id)
              .then(() => {
                setDrops((prev) =>
                  prev.map((d) =>
                    d.id === drop.id
                      ? { ...d, remaining: Math.max(0, (d.remaining ?? 1) - 1), purchased: true }
                      : d,
                  ),
                );
              })
              .catch((e: any) => Alert.alert('Chyba', e.message || 'Nelze zakoupit'));
          },
        },
      ],
    );
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Limitovane edice</V2SectionLabel>
        <V2Display size="xl">Drops.</V2Display>
      </View>

      {drops.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          Zadne aktivni dropy
        </Text>
      )}

      {drops.map((drop) => (
        <View
          key={drop.id}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.yellow,
            padding: 24,
            marginBottom: 20,
            backgroundColor: 'rgba(255,159,10,0.04)',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: v2.yellow, fontSize: 10, fontWeight: '700', letterSpacing: 2 }}>
              LIMITED EDITION
            </Text>
            {drop.endsAt && (
              <Text style={{ color: v2.red, fontSize: 10, fontWeight: '600' }}>
                {formatCountdown(drop.endsAt)}
              </Text>
            )}
          </View>

          <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.5, marginBottom: 8 }}>
            {drop.name}
          </Text>

          {drop.description && (
            <Text style={{ color: v2.muted, fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
              {drop.description}
            </Text>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <View>
              <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>EDICE</Text>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                {drop.remaining ?? '?'} / {drop.total ?? '?'}
              </Text>
            </View>
            {drop.price != null && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>CENA</Text>
                <Text style={{ color: v2.yellow, fontSize: 16, fontWeight: '700' }}>
                  {drop.price} XP
                </Text>
              </View>
            )}
          </View>

          <V2Button
            onPress={() => handlePurchase(drop)}
            variant="primary"
            full
            disabled={drop.purchased || (drop.remaining != null && drop.remaining <= 0)}
          >
            {drop.purchased ? 'Ziskano' : 'Secure Edition'}
          </V2Button>
        </View>
      ))}
    </V2Screen>
  );
}
