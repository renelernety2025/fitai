import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getExercises } from '../lib/api';

const muscleLabels: Record<string, string> = {
  CHEST: 'Prsa', BACK: 'Záda', SHOULDERS: 'Ramena', BICEPS: 'Biceps',
  TRICEPS: 'Triceps', QUADRICEPS: 'Stehna', HAMSTRINGS: 'Zadní stehna',
  GLUTES: 'Hýždě', CORE: 'Core',
};

export function ExercisesScreen() {
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    getExercises().then(setExercises).catch(console.error);
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.title}>Cviky</Text>
      <FlatList
        data={exercises}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => Alert.alert(item.nameCs, item.descriptionCs)}>
            <Text style={s.name}>{item.nameCs}</Text>
            <Text style={s.desc} numberOfLines={2}>{item.descriptionCs}</Text>
            <View style={s.muscles}>
              {item.muscleGroups.map((mg: string) => (
                <View key={mg} style={s.muscleBadge}>
                  <Text style={s.muscleText}>{muscleLabels[mg] || mg}</Text>
                </View>
              ))}
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
  card: { backgroundColor: '#111827', borderRadius: 12, padding: 16, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  desc: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  muscles: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  muscleBadge: { backgroundColor: '#374151', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  muscleText: { fontSize: 11, color: '#d1d5db' },
});
