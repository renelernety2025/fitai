import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
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
  const id = route?.params?.id;

  useEffect(() => {
    if (id) getVideo(id).then(setVideo).catch(console.error);
  }, [id]);

  if (!video) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>← VIDEA</Text>
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

      <View style={{ marginTop: 32 }}>
        <V2Button
          onPress={() => Alert.alert('Workout', 'Pose detection s kamerou v mobilní appce ještě není dostupný — připravuje se v další fázi.')}
          full
        >
          Začít cvičit →
        </V2Button>
      </View>
    </V2Screen>
  );
}
