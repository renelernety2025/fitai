import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { getMyStats } from '../lib/api';

const levelColors: Record<string, string> = {
  'Začátečník': '#4b5563', 'Pokročilý': '#2563eb', 'Expert': '#16a34a', 'Mistr': '#7c3aed', 'Legenda': '#F59E0B',
};

export function ProgressScreen() {
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    getMyStats().then(setStats).catch(console.error).finally(() => setRefreshing(false));
  };
  useEffect(load, []);

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#16a34a" />}>
      <View style={s.header}>
        <Text style={s.title}>Progres</Text>
        {stats && (
          <View style={[s.levelBadge, { backgroundColor: levelColors[stats.levelName] || '#4b5563' }]}>
            <Text style={s.levelText}>{stats.levelName}</Text>
          </View>
        )}
      </View>

      {stats && (
        <>
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={[s.statValue, { color: '#EA580C' }]}>🔥 {stats.currentStreak}</Text>
              <Text style={s.statLabel}>Série (dní)</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statValue, { color: '#F59E0B' }]}>{stats.totalXP}</Text>
              <Text style={s.statLabel}>XP celkem</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statValue}>{stats.totalSessions}</Text>
              <Text style={s.statLabel}>Cvičení</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statValue}>{stats.totalMinutes}</Text>
              <Text style={s.statLabel}>Minut celkem</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statValue}>{stats.averageAccuracy}%</Text>
              <Text style={s.statLabel}>Průměrná přesnost</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statValue}>{stats.longestStreak}</Text>
              <Text style={s.statLabel}>Nejdelší série</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  levelText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4 },
});
