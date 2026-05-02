import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getAchievements, checkAchievements } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Loading, v2 } from '../components/v2/V2';

const categoryColors: Record<string, string> = {
  training: v2.red,
  streak: v2.orange,
  milestone: v2.green,
  habits: v2.blue,
  exploration: v2.purple,
  nutrition: v2.yellow,
  social: '#0A84FF',
};

const categoryLabels: Record<string, string> = {
  training: 'Training',
  streak: 'Streak',
  milestone: 'Milestones',
  habits: 'Habits',
  exploration: 'Exploration',
  nutrition: 'Nutrition',
  social: 'Community',
};

export function UspechyScreen() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setLoading(true);
    checkAchievements()
      .then(() => getAchievements())
      .then(setAchievements)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const unlocked = achievements.filter((a) => a.unlocked);
  const filtered = filter === 'all' ? achievements : achievements.filter((a) => a.category === filter);
  const categories = Array.from(new Set(achievements.map((a) => a.category)));

  if (error) {
    return (
      <V2Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
          <Text style={{ color: '#FF375F', fontSize: 16, fontWeight: '600', marginBottom: 16 }}>Failed to load achievements</Text>
          <Pressable onPress={load} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF' }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      </V2Screen>
    );
  }

  if (loading) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>Collection</V2SectionLabel>
        <V2Display size="xl">Achievements.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 12 }}>
          {unlocked.length} of {achievements.length} unlocked
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
        <V2Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {categories.map((c) => (
          <V2Chip
            key={c}
            label={categoryLabels[c] || c}
            selected={filter === c}
            onPress={() => setFilter(c)}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
        {filtered.map((a) => (
          <View
            key={a.id}
            style={{
              width: '50%',
              padding: 6,
            }}
          >
            <View
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderColor: a.unlocked ? v2.borderStrong : v2.border,
                padding: 16,
                opacity: a.unlocked ? 1 : 0.4,
                backgroundColor: a.unlocked ? 'rgba(255,255,255,0.04)' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>{a.icon}</Text>
              <Text style={{ color: categoryColors[a.category] || '#FFF', fontSize: 9, fontWeight: '600', letterSpacing: 1.5, marginBottom: 4 }}>
                {(categoryLabels[a.category] || a.category).toUpperCase()}
              </Text>
              <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: -0.3 }}>{a.titleCs}</Text>
              <Text style={{ color: v2.faint, fontSize: 11, marginTop: 4 }} numberOfLines={2}>{a.descriptionCs}</Text>
              <Text style={{ color: v2.ghost, fontSize: 10, fontWeight: '600', marginTop: 8 }}>+{a.xpReward} XP</Text>
              {a.unlocked && (
                <Text style={{ color: v2.green, fontSize: 9, marginTop: 2 }}>
                  ✓ {new Date(a.unlockedAt).toLocaleDateString('en-US')}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </V2Screen>
  );
}
