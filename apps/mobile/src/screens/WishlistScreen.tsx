import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { getWishlist, removeFromWishlist } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

/** Human-readable type label from backend enum */
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

  useEffect(() => {
    loadWishlist();
  }, []);

  function loadWishlist() {
    getWishlist().then(setWishlist).catch(() => setWishlist([]));
  }

  function handleRemove(id: string) {
    Alert.alert('Remove', 'Remove from wishlist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFromWishlist(id).then(loadWishlist).catch(() => {}),
      },
    ]);
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
        <V2Loading />
      ) : items.length === 0 ? (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          Wishlist is empty
        </Text>
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
          <Pressable onPress={() => handleRemove(item.id)} style={{ paddingLeft: 12 }}>
            <Text style={{ color: v2.red, fontSize: 12, fontWeight: '600' }}>Remove</Text>
          </Pressable>
        </View>
      ))}
    </V2Screen>
  );
}
