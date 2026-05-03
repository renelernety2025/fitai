import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getWishlist, removeFromWishlist } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState, NativeConfirm } from '../components/native';

const TYPE_LABELS: Record<string, string> = {
  WISH_EXERCISE: 'Exercise',
  WISH_PLAN: 'Workout Plan',
  WISH_RECIPE: 'Recipe',
  WISH_EXPERIENCE: 'Experience',
  WISH_BUNDLE: 'Bundle',
  WISH_CLIP: 'Clip',
};

const TYPE_ICONS: Record<string, string> = {
  WISH_EXERCISE: '🏋️',
  WISH_PLAN: '📋',
  WISH_RECIPE: '🍽️',
  WISH_EXPERIENCE: '🎯',
  WISH_BUNDLE: '📦',
  WISH_CLIP: '🎬',
};

export function WishlistScreen() {
  const [wishlist, setWishlist] = useState<any[] | null>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    loadWishlist();
  }, []);

  function loadWishlist() {
    getWishlist().then(setWishlist).catch(() => setWishlist([]));
  }

  async function confirmRemove() {
    if (!pendingRemove) return;
    const id = pendingRemove;
    setPendingRemove(null);
    try {
      await removeFromWishlist(id);
      haptic.success();
      loadWishlist();
    } catch {
      haptic.error();
    }
  }

  const items = wishlist ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Saved</V2SectionLabel>
        <V2Display size="xl">Wishlist.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 8 }}>
          {items.length} items
        </Text>
      </View>

      {wishlist === null ? (
        <LoadingState label="Loading wishlist" />
      ) : items.length === 0 ? (
        <EmptyState icon="🔖" title="Wishlist empty" body="Bookmark items across the app to save them here." />
      ) : null}

      {items.map((item) => (
        <View
          key={item.id}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 14 }}>
            {TYPE_ICONS[item.itemType] || '📌'}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
              {TYPE_LABELS[item.itemType] || item.itemType?.replace(/^WISH_/, '')}
            </Text>
            <Text style={{ color: v2.faint, fontSize: 11, marginTop: 2 }}>
              Added {new Date(item.addedAt).toLocaleDateString('en-US')}
            </Text>
          </View>
          <Pressable
            onPress={() => { haptic.press(); setPendingRemove(item.id); }}
            hitSlop={8}
            style={({ pressed }) => [{ paddingLeft: 12 }, pressed && { opacity: 0.5 }]}
          >
            <Text style={{ color: v2.red, fontSize: 12, fontWeight: '600' }}>Remove</Text>
          </Pressable>
        </View>
      ))}

      <NativeConfirm
        visible={!!pendingRemove}
        title="Remove from wishlist?"
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </V2Screen>
  );
}
