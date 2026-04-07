import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getExercises } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Row, v2 } from '../components/v2/V2';

const MUSCLES = [
  { v: 'ALL', l: 'Vše' },
  { v: 'CHEST', l: 'Prsa' },
  { v: 'BACK', l: 'Záda' },
  { v: 'SHOULDERS', l: 'Ramena' },
  { v: 'BICEPS', l: 'Biceps' },
  { v: 'TRICEPS', l: 'Triceps' },
  { v: 'QUADRICEPS', l: 'Stehna' },
  { v: 'GLUTES', l: 'Hýždě' },
  { v: 'CORE', l: 'Core' },
];

const diffAccent: Record<string, string> = {
  BEGINNER: v2.green,
  INTERMEDIATE: v2.blue,
  ADVANCED: v2.red,
};

const diffLabel: Record<string, string> = {
  BEGINNER: 'Začátečník',
  INTERMEDIATE: 'Pokročilý',
  ADVANCED: 'Expert',
};

export function ExercisesScreen({ navigation }: any) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const params = filter !== 'ALL' ? { muscleGroup: filter } : undefined;
    getExercises(params).then(setExercises).catch(console.error);
  }, [filter]);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Knihovna</V2SectionLabel>
        <V2Display size="xl">Cviky.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
        {MUSCLES.map((m) => (
          <V2Chip key={m.v} label={m.l} selected={filter === m.v} onPress={() => setFilter(m.v)} />
        ))}
      </View>

      {exercises.map((ex) => (
        <V2Row key={ex.id} onPress={() => navigation.navigate('ExerciseDetail', { id: ex.id })}>
          <Text style={{ color: diffAccent[ex.difficulty] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>
            {(diffLabel[ex.difficulty] || '').toUpperCase()} · {(ex.muscleGroups || []).slice(0, 2).join(', ')}
          </Text>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>{ex.nameCs}</Text>
          <Text style={{ color: v2.faint, fontSize: 13, marginTop: 4 }} numberOfLines={1}>
            {ex.descriptionCs}
          </Text>
        </V2Row>
      ))}
    </V2Screen>
  );
}
