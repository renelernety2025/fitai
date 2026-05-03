import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getDrops, purchaseDrop } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState, NativeConfirm } from '../components/native';

/** Resolve field names — backend uses priceXP/endDate/remainingEditions/totalEditions */
function getPrice(d: any): number { return d.price ?? d.priceXP ?? 0; }
function getRemaining(d: any): number | null { return d.remaining ?? d.remainingEditions ?? null; }
function getTotal(d: any): number | null { return d.total ?? d.totalEditions ?? null; }
function getEndDate(d: any): string | null { return d.endsAt || d.endDate || null; }

function formatCountdown(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (isNaN(diff) || diff <= 0) return 'Ended';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m}m`;
}

export function DropsScreen() {
  const [drops, setDrops] = useState<any[] | null>(null);
  const [pending, setPending] = useState<{ id: string; name: string; price: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    getDrops().then(setDrops).catch(() => setDrops([]));
  }, []);

  async function confirmPurchase() {
    if (!pending) return;
    const id = pending.id;
    setPending(null);
    setError(null);
    try {
      await purchaseDrop(id);
      haptic.success();
      setDrops((prev) =>
        (prev ?? []).map((d) => {
          if (d.id !== id) return d;
          const rem = getRemaining(d);
          return {
            ...d,
            remainingEditions: rem != null ? Math.max(0, rem - 1) : d.remainingEditions,
            remaining: rem != null ? Math.max(0, rem - 1) : d.remaining,
            purchased: true,
          };
        }),
      );
    } catch (e: any) {
      haptic.error();
      setError(e?.message || 'Could not purchase');
    }
  }

  const items = drops ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Limited editions</V2SectionLabel>
        <V2Display size="xl">Drops.</V2Display>
      </View>

      {error && (
        <View style={{ marginBottom: 16, backgroundColor: 'rgba(255,55,95,0.10)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,55,95,0.25)' }}>
          <Text style={{ color: v2.red, fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {drops === null ? (
        <LoadingState label="Loading drops" />
      ) : items.length === 0 ? (
        <EmptyState icon="✦" title="No active drops" body="Limited edition items appear here when they go live." />
      ) : null}

      {items.map((drop) => {
        const remaining = getRemaining(drop);
        const soldOut = remaining != null && remaining <= 0;
        return (
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
              {getEndDate(drop) && (
                <Text style={{ color: v2.red, fontSize: 10, fontWeight: '600' }}>
                  {formatCountdown(getEndDate(drop))}
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
                <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>EDITION</Text>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                  {remaining ?? '?'} / {getTotal(drop) ?? '?'}
                </Text>
              </View>
              {getPrice(drop) > 0 && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>PRICE</Text>
                  <Text style={{ color: v2.yellow, fontSize: 16, fontWeight: '700' }}>
                    {getPrice(drop)} XP
                  </Text>
                </View>
              )}
            </View>

            <V2Button
              onPress={() => { haptic.tap(); setPending({ id: drop.id, name: drop.name, price: getPrice(drop) }); }}
              variant="primary"
              full
              disabled={drop.purchased || soldOut}
            >
              {drop.purchased ? 'Secured' : soldOut ? 'Sold out' : 'Secure Edition'}
            </V2Button>
          </View>
        );
      })}

      <NativeConfirm
        visible={!!pending}
        title={pending ? `Get "${pending.name}"?` : ''}
        message={pending ? `${pending.price} XP will be deducted.` : undefined}
        confirmLabel="Get it"
        onConfirm={confirmPurchase}
        onCancel={() => setPending(null)}
      />
    </V2Screen>
  );
}
