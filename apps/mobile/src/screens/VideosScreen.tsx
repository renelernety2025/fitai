import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { getVideos } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, v2 } from '../components/v2/V2';

const CATS = [
  { v: 'ALL', l: 'Vše' },
  { v: 'YOGA', l: 'Yoga' },
  { v: 'PILATES', l: 'Pilates' },
  { v: 'STRENGTH', l: 'Strength' },
  { v: 'CARDIO', l: 'Cardio' },
];

const accent: Record<string, string> = {
  YOGA: v2.green,
  PILATES: v2.blue,
  STRENGTH: v2.orange,
  CARDIO: v2.red,
  MOBILITY: v2.purple,
};

export function VideosScreen({ navigation }: any) {
  const [videos, setVideos] = useState<any[]>([]);
  const [cat, setCat] = useState('ALL');

  useEffect(() => {
    getVideos().then((all) => {
      const filtered = cat === 'ALL' ? all : all.filter((v) => v.category === cat);
      setVideos(filtered);
    }).catch(console.error);
  }, [cat]);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Knihovna</V2SectionLabel>
        <V2Display size="xl">Videa.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
        {CATS.map((c) => (
          <V2Chip key={c.v} label={c.l} selected={cat === c.v} onPress={() => setCat(c.v)} />
        ))}
      </View>

      {videos.map((v) => (
        <Pressable
          key={v.id}
          onPress={() => navigation.navigate('VideoDetail', { id: v.id })}
          style={{ marginBottom: 32 }}
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
      ))}
    </V2Screen>
  );
}
