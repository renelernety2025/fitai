import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { getWishlist, removeFromWishlist } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, v2 } from '../components/v2/V2';

export function WishlistScreen() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  function loadWishlist() {
    getWishlist().then(setItems).catch(() => setItems([]));
  }

  function handleRemove(id: string) {
    Alert.alert('Odebrat', 'Odebrat z wishlistu?', [
      { text: 'Zrusit', style: 'cancel' },
      {
        text: 'Odebrat',
        style: 'destructive',
        onPress: () => removeFromWishlist(id).then(loadWishlist).catch(() => {}),
      },
    ]);
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Ulozeno</V2SectionLabel>
        <V2Display size="xl">Wishlist.</V2Display>
      </View>

      {items.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          Wishlist je prazdny
        </Text>
      )}

      {items.map((item) => (
        <Pressable
          key={item.id}
          onLongPress={() => handleRemove(item.id)}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
              {item.itemType}
            </Text>
            <Text style={{ color: v2.faint, fontSize: 10 }}>
              {new Date(item.addedAt).toLocaleDateString('cs-CZ')}
            </Text>
          </View>
          <Text style={{ color: v2.muted, fontSize: 12 }}>
            ID: {item.itemId}
          </Text>
        </Pressable>
      ))}

      {items.length > 0 && (
        <Text style={{ color: v2.ghost, fontSize: 11, textAlign: 'center', marginTop: 16 }}>
          Podrzte polozku pro odebrani
        </Text>
      )}
    </V2Screen>
  );
}
