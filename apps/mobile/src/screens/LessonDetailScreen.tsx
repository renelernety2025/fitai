import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getLesson } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

const accent: Record<string, string> = {
  technique: v2.blue,
  nutrition: v2.orange,
  recovery: v2.purple,
  mindset: v2.green,
};

export function LessonDetailScreen({ route, navigation }: any) {
  const [lesson, setLesson] = useState<any>(null);
  const slug = route?.params?.slug;

  useEffect(() => {
    if (slug) getLesson(slug).then(setLesson).catch(console.error);
  }, [slug]);

  if (!lesson) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 16, paddingBottom: 24 }}>
        <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>← LEKCE</Text>
      </Pressable>

      <Text style={{ color: accent[lesson.category] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 12 }}>
        {lesson.category.toUpperCase()} · {lesson.durationMin} MIN ČTENÍ
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
