import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { getVideos } from '../lib/api';

const categoryColors: Record<string, string> = {
  YOGA: '#10b981', PILATES: '#3b82f6', STRENGTH: '#f97316', CARDIO: '#ef4444', MOBILITY: '#a855f7',
};

export function VideosScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVideos().then(setVideos).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.title}>Videa</Text>
      <FlatList
        data={videos}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => Alert.alert(item.title, 'Workout flow bude přidán v další verzi.')}>
            <Image source={{ uri: item.thumbnailUrl }} style={s.thumbnail} />
            <View style={s.info}>
              <Text style={s.videoTitle}>{item.title}</Text>
              <View style={s.badges}>
                <View style={[s.badge, { backgroundColor: categoryColors[item.category] || '#374151' }]}>
                  <Text style={s.badgeText}>{item.category}</Text>
                </View>
                <Text style={s.duration}>{Math.floor(item.durationSeconds / 60)} min</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', padding: 20, paddingTop: 60 },
  card: { backgroundColor: '#111827', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  thumbnail: { width: '100%', height: 180 },
  info: { padding: 12 },
  videoTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '500' },
  duration: { fontSize: 12, color: '#6b7280' },
});
