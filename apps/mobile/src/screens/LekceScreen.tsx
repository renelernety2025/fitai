import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getLessons } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Row, v2 } from '../components/v2/V2';

const CATS = [
  { v: 'all', l: 'Vše' },
  { v: 'technique', l: 'Technika' },
  { v: 'nutrition', l: 'Výživa' },
  { v: 'recovery', l: 'Regenerace' },
  { v: 'mindset', l: 'Mindset' },
];

const accent: Record<string, string> = {
  technique: v2.blue,
  nutrition: v2.orange,
  recovery: v2.purple,
  mindset: v2.green,
};

export function LekceScreen({ navigation }: any) {
  const [lessons, setLessons] = useState<any[]>([]);
  const [cat, setCat] = useState('all');

  useEffect(() => {
    getLessons(cat === 'all' ? undefined : cat).then(setLessons).catch(console.error);
  }, [cat]);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Knihovna</V2SectionLabel>
        <V2Display size="xl">Lekce.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 12 }}>
          Krátké, hluboké lekce o tréninku, výživě, regeneraci a mentalitě. Ne novinky. Principy.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
        {CATS.map((c) => (
          <V2Chip key={c.v} label={c.l} selected={cat === c.v} onPress={() => setCat(c.v)} />
        ))}
      </View>

      {lessons.map((l) => (
        <V2Row key={l.id} onPress={() => navigation.navigate('LessonDetail', { slug: l.slug })}>
          <Text style={{ color: accent[l.category] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>
            {l.category.toUpperCase()} · {l.durationMin} MIN
          </Text>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>{l.titleCs}</Text>
          <Text style={{ color: v2.faint, fontSize: 13, marginTop: 6 }} numberOfLines={2}>
            {l.bodyCs}
          </Text>
        </V2Row>
      ))}
    </V2Screen>
  );
}
