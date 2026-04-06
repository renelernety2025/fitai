import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../lib/auth-context';
import { getMyStats, getReminderStatus } from '../lib/api';

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [reminder, setReminder] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    Promise.all([getMyStats(), getReminderStatus()])
      .then(([s, r]) => { setStats(s); setReminder(r); })
      .catch(console.error)
      .finally(() => setRefreshing(false));
  };

  useEffect(loadData, []);

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#16a34a" />}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Vítej, {user?.name}!</Text>
          {stats && <Text style={s.level}>{stats.levelName}</Text>}
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <Text style={s.logoutText}>Odhlásit</Text>
        </TouchableOpacity>
      </View>

      {reminder?.shouldRemind && (
        <View style={s.reminderBanner}>
          <Text style={s.reminderText}>{reminder.message}</Text>
        </View>
      )}

      {stats && (
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>🔥 {stats.currentStreak}</Text>
            <Text style={s.statLabel}>Série</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: '#F59E0B' }]}>{stats.totalXP}</Text>
            <Text style={s.statLabel}>XP</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{stats.totalSessions}</Text>
            <Text style={s.statLabel}>Cvičení</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{stats.totalMinutes}</Text>
            <Text style={s.statLabel}>Minut</Text>
          </View>
        </View>
      )}

      {stats?.weeklyActivity && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Tento týden</Text>
          <View style={s.weekChart}>
            {stats.weeklyActivity.map((day: any, i: number) => {
              const maxMin = Math.max(...stats.weeklyActivity.map((d: any) => d.minutes), 1);
              const height = day.minutes > 0 ? Math.max(8, (day.minutes / maxMin) * 60) : 4;
              const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
              const d = new Date(day.date + 'T00:00:00');
              return (
                <View key={i} style={s.weekDay}>
                  <View style={[s.weekBar, { height, backgroundColor: day.minutes > 0 ? '#16a34a' : '#374151' }]} />
                  <Text style={s.weekLabel}>{dayNames[d.getDay()]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  level: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#6b7280', fontSize: 12 },
  reminderBanner: { marginHorizontal: 20, marginBottom: 16, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: 12, padding: 16 },
  reminderText: { color: '#F59E0B', fontSize: 14 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  weekChart: { flexDirection: 'row', backgroundColor: '#111827', borderRadius: 12, padding: 16, alignItems: 'flex-end', height: 100, gap: 4 },
  weekDay: { flex: 1, alignItems: 'center' },
  weekBar: { width: '80%', borderRadius: 4, minHeight: 4 },
  weekLabel: { fontSize: 10, color: '#6b7280', marginTop: 6 },
});
