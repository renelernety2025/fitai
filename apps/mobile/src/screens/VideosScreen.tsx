import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { getVideos } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState, ErrorState } from '../components/native';

const CATS = [
  { v: 'ALL', l: 'All' },
  { v: 'YOGA', l: 'Yoga' },
  { v: 'PILATES', l: 'Pilates' },
  { v: 'STRENGTH', l: 'Strength' },
  { v: 'CARDIO', l: 'Cardio' },
  { v: 'MOBILITY', l: 'Mobility' },
];

const accent: Record<string, string> = {
  YOGA: v2.green,
  PILATES: v2.blue,
  STRENGTH: v2.orange,
  CARDIO: v2.red,
  MOBILITY: v2.purple,
};

export function VideosScreen({ navigation }: any) {
  const [videos, setVideos] = useState<any[] | null>(null);
  const [cat, setCat] = useState('ALL');
  const [error, setError] = useState(false);
  const haptic = useHaptic();

  const load = useCallback(() => {
    setError(false);
    setVideos(null);
    const q = cat !== 'ALL' ? `?category=${cat}` : '';
    getVideos(q)
      .then(setVideos)
      .catch(() => setError(true));
  }, [cat]);
  useEffect(load, [load]);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Library</V2SectionLabel>
        <V2Display size="xl">Videos.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
        {CATS.map((c) => (
          <V2Chip key={c.v} label={c.l} selected={cat === c.v} onPress={() => { haptic.selection(); setCat(c.v); }} />
        ))}
      </View>

      {error ? (
        <ErrorState message="Failed to load videos." onRetry={load} />
      ) : videos === null ? (
        <LoadingState label="Loading videos" />
      ) : videos.length === 0 ? (
        <EmptyState icon="🎬" title="No videos here" body="Try a different category." />
      ) : (
        videos.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => { haptic.tap(); navigation.navigate('VideoDetail', { id: v.id }); }}
            style={({ pressed }) => [{ marginBottom: 32 }, pressed && { opacity: 0.6 }]}
          >
            <Image
              source={{ uri: v.thumbnailUrl }}
              style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 16, marginBottom: 12 }}
            />
            <Text style={{ color: accent[v.category] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 4 }}>
              {(v.category || '').toUpperCase()} · {Math.floor(v.durationSeconds / 60)} MIN
            </Text>
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>{v.title}</Text>
          </Pressable>
        ))
      )}
    </V2Screen>
  );
}
