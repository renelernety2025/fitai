import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getClipsFeed, toggleClipLike } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

export function ClipsScreen() {
  const [clips, setClips] = useState<any[] | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getClipsFeed(1).then(setClips).catch(() => setClips([]));
  }, []);

  function handleLike(id: string) {
    toggleClipLike(id).then((res: any) => {
      // Use server response for accurate liked state
      const serverLiked = res?.liked;
      setClips(prev => (prev ?? []).map(c => {
        if (c.id !== id) return c;
        if (typeof serverLiked === 'boolean') {
          // Server told us the new state — trust it
          return { ...c, liked: serverLiked, likeCount: (c.likeCount || 0) + (serverLiked ? 1 : -1) };
        }
        // Fallback: local toggle
        return { ...c, liked: !c.liked, likeCount: (c.likeCount || 0) + (c.liked ? -1 : 1) };
      }));
    }).catch(() => {});
  }

  const items = clips ?? [];

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Feed</V2SectionLabel>
        <V2Display size="xl">Clips.</V2Display>
      </View>

      {clips === null ? (
        <V2Loading />
      ) : items.length === 0 ? (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          No clips yet — coming soon.
        </Text>
      ) : null}

      {items.map((clip) => (
        <View
          key={clip.id}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            padding: 20,
            marginBottom: 16,
            backgroundColor: v2.surface,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
              {clip.user?.name || 'User'}
            </Text>
            <Text style={{ color: v2.faint, fontSize: 10 }}>
              {clip.durationSeconds ? `${clip.durationSeconds}s` : ''}
            </Text>
          </View>

          {clip.caption && (
            <Text style={{ color: v2.muted, fontSize: 13, marginBottom: 12 }}>
              {clip.caption}
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={() => handleLike(clip.id)}>
              <Text style={{ color: clip.liked ? v2.red : v2.muted, fontSize: 13, fontWeight: '600' }}>
                {clip.liked ? '♥ ' : '♡ '}{clip.likeCount || 0} likes
              </Text>
            </Pressable>
            {clip.tags?.length > 0 && (
              <Text style={{ color: v2.faint, fontSize: 11 }}>
                {clip.tags.join(', ')}
              </Text>
            )}
          </View>
        </View>
      ))}

      {items.length > 0 && (
        <Pressable
          onPress={() => {
            const next = page + 1;
            setPage(next);
            getClipsFeed(next).then((more) => setClips(prev => [...(prev ?? []), ...more])).catch(() => {});
          }}
          style={{ alignItems: 'center', paddingVertical: 20 }}
        >
          <Text style={{ color: v2.green, fontSize: 13, fontWeight: '600' }}>Load more</Text>
        </Pressable>
      )}
    </V2Screen>
  );
}
