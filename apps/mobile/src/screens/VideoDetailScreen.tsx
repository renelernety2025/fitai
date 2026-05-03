import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { getVideo } from '../lib/api';
import { V2Screen, V2Display, V2Button, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, ErrorState } from '../components/native';

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
  const haptic = useHaptic();

  const load = useCallback(() => {
    if (!id) return;
    setError(false);
    getVideo(id)
      .then(setVideo)
      .catch(() => setError(true));
  }, [id]);
  useEffect(load, [load]);

  const BackButton = () => (
    <Pressable
      onPress={() => { haptic.tap(); navigation.goBack(); }}
      hitSlop={12}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingTop: 16, paddingBottom: 16 }, pressed && { opacity: 0.5 }]}
    >
      <Text style={{ color: v2.text, fontSize: 32, fontWeight: '300', lineHeight: 32, marginTop: -3 }}>‹</Text>
      <Text style={{ color: v2.text, fontSize: 16, fontWeight: '500' }}>Videos</Text>
    </Pressable>
  );

  if (error) {
    return <V2Screen><BackButton /><ErrorState message="Failed to load video." onRetry={load} /></V2Screen>;
  }

  if (!video) return <V2Screen><BackButton /><LoadingState label="Loading video" /></V2Screen>;

  return (
    <V2Screen>
      <BackButton />

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
