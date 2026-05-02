import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { getVideo } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, V2Loading, v2 } from '../components/v2/V2';

const accent: Record<string, string> = {
  YOGA: v2.green,
  PILATES: v2.blue,
  STRENGTH: v2.orange,
  CARDIO: v2.red,
  MOBILITY: v2.purple,
};

export function VideoDetailScreen({ route, navigation }: any) {
  const [video, setVideo] = useState<any>(null);
  const [error, setError] = useState(false);
  const id = route?.params?.id;

  const load = useCallback(() => {
    if (!id) return;
    setError(false);
    getVideo(id)
      .then(setVideo)
      .catch(() => setError(true));
  }, [id]);
  useEffect(load, [load]);

  if (error) {
    return (
      <V2Screen>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 16, paddingBottom: 16 }}>
          <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>← VIDEOS</Text>
        </Pressable>
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ color: '#FF375F', fontSize: 15, fontWeight: '600', marginBottom: 16 }}>Failed to load video</Text>
          <Pressable onPress={load} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF' }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      </V2Screen>
    );
  }

  if (!video) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>← VIDEOS</Text>
      </Pressable>

      <Image
        source={{ uri: video.thumbnailUrl }}
        style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 24, marginBottom: 24 }}
      />

      <Text style={{ color: accent[video.category] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
        {video.category} · {video.difficulty} · {Math.floor(video.durationSeconds / 60)} MIN
      </Text>
      <V2Display size="xl">{video.title}</V2Display>
      <Text style={{ color: v2.muted, marginTop: 16, fontSize: 15, lineHeight: 24 }}>{video.description}</Text>

      <View style={{ marginTop: 32, opacity: 0.4 }}>
        <V2Button onPress={() => {}} full disabled>
          Start workout — coming soon
        </V2Button>
        <Text style={{ color: v2.ghost, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
          Camera pose detection on mobile is in development.
        </Text>
      </View>
    </V2Screen>
  );
}
