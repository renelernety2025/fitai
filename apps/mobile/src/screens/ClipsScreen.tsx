import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getClipsFeed, toggleClipLike } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, v2 } from '../components/v2/V2';

export function ClipsScreen() {
  const [clips, setClips] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getClipsFeed(1).then(setClips).catch(() => setClips([]));
  }, []);

  function handleLike(id: string) {
    toggleClipLike(id).then(() => {
      // Update like state locally instead of re-fetching (which destroys pagination)
      setClips(prev => prev.map(c =>
        c.id === id ? { ...c, likeCount: (c.likeCount || 0) + (c.liked ? -1 : 1), liked: !c.liked } : c
      ));
    }).catch(() => {});
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Feed</V2SectionLabel>
        <V2Display size="xl">Clips.</V2Display>
      </View>

      {clips.length === 0 && (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginTop: 48 }}>
          Zatim zadne klipy
        </Text>
      )}

      {clips.map((clip) => (
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
              {clip.user?.name || 'Uzivatel'}
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
              <Text style={{ color: v2.red, fontSize: 13, fontWeight: '600' }}>
                {clip.likeCount || 0} likes
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

      {clips.length > 0 && (
        <Pressable
          onPress={() => {
            const next = page + 1;
            setPage(next);
            getClipsFeed(next).then((more) => setClips(prev => [...prev, ...more])).catch(() => {});
          }}
          style={{ alignItems: 'center', paddingVertical: 20 }}
        >
          <Text style={{ color: v2.green, fontSize: 13, fontWeight: '600' }}>Nacist dalsi</Text>
        </Pressable>
      )}
    </V2Screen>
  );
}
