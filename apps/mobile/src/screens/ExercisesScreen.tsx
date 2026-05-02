import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getExercises } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Row, V2Loading, v2 } from '../components/v2/V2';

const MUSCLES = [
  { v: 'ALL', l: 'All' },
  { v: 'CHEST', l: 'Chest' },
  { v: 'BACK', l: 'Back' },
  { v: 'SHOULDERS', l: 'Shoulders' },
  { v: 'BICEPS', l: 'Biceps' },
  { v: 'TRICEPS', l: 'Triceps' },
  { v: 'QUADRICEPS', l: 'Quads' },
  { v: 'HAMSTRINGS', l: 'Hamstrings' },
  { v: 'GLUTES', l: 'Glutes' },
  { v: 'CALVES', l: 'Calves' },
  { v: 'CORE', l: 'Core' },
  { v: 'FULL_BODY', l: 'Full Body' },
];

const diffAccent: Record<string, string> = {
  BEGINNER: v2.green,
  INTERMEDIATE: v2.blue,
  ADVANCED: v2.red,
};

const diffLabel: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export function ExercisesScreen({ navigation }: any) {
  const [exercises, setExercises] = useState<any[] | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setExercises(null);
    const params = filter !== 'ALL' ? { muscleGroup: filter } : undefined;
    getExercises(params)
      .then(setExercises)
      .catch(() => setError(true));
  }, [filter]);
  useEffect(load, [load]);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Library</V2SectionLabel>
        <V2Display size="xl">Exercises.</V2Display>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
        {MUSCLES.map((m) => (
          <V2Chip key={m.v} label={m.l} selected={filter === m.v} onPress={() => setFilter(m.v)} />
        ))}
      </View>

      {error ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ color: '#FF375F', fontSize: 15, fontWeight: '600', marginBottom: 16 }}>Failed to load exercises</Text>
          <Pressable onPress={load} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF' }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      ) : exercises === null ? (
        <V2Loading />
      ) : exercises.length === 0 ? (
        <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', paddingVertical: 40 }}>
          No exercises in this category yet.
        </Text>
      ) : (
        exercises.map((ex) => (
          <V2Row key={ex.id} onPress={() => navigation.navigate('ExerciseDetail', { id: ex.id })}>
            <Text style={{ color: diffAccent[ex.difficulty] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>
              {(diffLabel[ex.difficulty] || ex.difficulty || '').toUpperCase()} · {(ex.muscleGroups || []).slice(0, 2).join(', ')}
            </Text>
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>{ex.nameCs || ex.name}</Text>
            <Text style={{ color: v2.faint, fontSize: 13, marginTop: 4 }} numberOfLines={1}>
              {ex.descriptionCs || ex.description}
            </Text>
          </V2Row>
        ))
      )}
    </V2Screen>
  );
}
