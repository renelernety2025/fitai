import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getLessons } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Row, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, EmptyState, ErrorState } from '../components/native';

const CATS = [
  { v: 'all', l: 'All' },
  { v: 'technique', l: 'Technique' },
  { v: 'nutrition', l: 'Nutrition' },
  { v: 'recovery', l: 'Recovery' },
  { v: 'mindset', l: 'Mindset' },
];

const accent: Record<string, string> = {
  technique: v2.blue,
  nutrition: v2.orange,
  recovery: v2.purple,
  mindset: v2.green,
};

export function LekceScreen({ navigation }: any) {
  const [lessons, setLessons] = useState<any[] | null>(null);
  const [cat, setCat] = useState('all');
  const [error, setError] = useState(false);
  const haptic = useHaptic();

  const load = useCallback(() => {
    setError(false);
    setLessons(null);
    getLessons(cat === 'all' ? undefined : cat)
      .then(setLessons)
      .catch(() => setError(true));
  }, [cat]);
  useEffect(load, [load]);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Library</V2SectionLabel>
        <V2Display size="xl">Lessons.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 12 }}>
          Short, deep lessons on training, nutrition, recovery and mindset. Not news. Principles.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
        {CATS.map((c) => (
          <V2Chip key={c.v} label={c.l} selected={cat === c.v} onPress={() => { haptic.selection(); setCat(c.v); }} />
        ))}
      </View>

      {error ? (
        <ErrorState message="Failed to load lessons." onRetry={load} />
      ) : lessons === null ? (
        <LoadingState label="Loading lessons" />
      ) : lessons.length === 0 ? (
        <EmptyState icon="📚" title="No lessons" body="More lessons in this category coming soon." />
      ) : (
        lessons.map((l) => (
          <V2Row key={l.id} onPress={() => { haptic.tap(); navigation.navigate('LessonDetail', { slug: l.slug }); }}>
            <Text style={{ color: accent[l.category] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>
              {l.category.toUpperCase()} · {l.durationMin} MIN
            </Text>
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>{l.titleCs}</Text>
            <Text style={{ color: v2.faint, fontSize: 13, marginTop: 6 }} numberOfLines={2}>
              {l.bodyCs}
            </Text>
          </V2Row>
        ))
      )}
    </V2Screen>
  );
}
