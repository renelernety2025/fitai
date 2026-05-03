import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getLesson } from '../lib/api';
import { V2Screen, V2Display, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, ErrorState } from '../components/native';

const accent: Record<string, string> = {
  technique: v2.blue,
  nutrition: v2.orange,
  recovery: v2.purple,
  mindset: v2.green,
};

export function LessonDetailScreen({ route, navigation }: any) {
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState(false);
  const slug = route?.params?.slug;
  const haptic = useHaptic();

  const BackButton = () => (
    <Pressable
      onPress={() => { haptic.tap(); navigation.goBack(); }}
      hitSlop={12}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingTop: 16, paddingBottom: 16 }, pressed && { opacity: 0.5 }]}
    >
      <Text style={{ color: v2.text, fontSize: 32, fontWeight: '300', lineHeight: 32, marginTop: -3 }}>‹</Text>
      <Text style={{ color: v2.text, fontSize: 16, fontWeight: '500' }}>Lessons</Text>
    </Pressable>
  );

  const load = useCallback(() => {
    if (!slug) return;
    setError(false);
    getLesson(slug)
      .then(setLesson)
      .catch(() => setError(true));
  }, [slug]);
  useEffect(load, [load]);

  if (error) {
    return (
      <V2Screen>
        <BackButton />
        <ErrorState message="Failed to load lesson." onRetry={load} />
      </V2Screen>
    );
  }

  if (!lesson) return <V2Screen><BackButton /><LoadingState label="Loading lesson" /></V2Screen>;

  return (
    <V2Screen>
      <BackButton />

      <Text style={{ color: accent[lesson.category] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 12 }}>
        {lesson.category.toUpperCase()} · {lesson.durationMin} MIN READ
      </Text>

      <V2Display size="lg">{lesson.titleCs}</V2Display>

      <Text
        style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: 17,
          lineHeight: 28,
          marginTop: 32,
        }}
      >
        {lesson.bodyCs}
      </Text>
    </V2Screen>
  );
}
