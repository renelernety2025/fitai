import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getWorkoutPlans, generateAIPlan } from '../lib/api';

export function PlansScreen() {
  const [plans, setPlans] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  const load = () => getWorkoutPlans().then(setPlans).catch(console.error);
  useEffect(() => { load(); }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateAIPlan();
      load();
      Alert.alert('AI Plán vytvořen!', 'Nový personalizovaný plán je připravený.');
    } catch (err: any) {
      Alert.alert('Chyba', err.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Plány</Text>

      <TouchableOpacity style={s.generateBtn} onPress={handleGenerate} disabled={generating}>
        <Text style={s.generateText}>{generating ? 'Generuji...' : 'Vygenerovat AI plán'}</Text>
      </TouchableOpacity>

      <FlatList
        data={plans}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => Alert.alert(item.nameCs, `${item.days.length} dnů, ${item.daysPerWeek}x/týden`)}>
            <Text style={s.planName}>{item.nameCs}</Text>
            <Text style={s.planMeta}>{item.type} · {item.daysPerWeek}x/týden · {item.days.length} dnů</Text>
            {item.days.map((day: any) => (
              <Text key={day.id} style={s.dayText}>
                {day.nameCs}: {day.plannedExercises.map((pe: any) => pe.exercise.nameCs).join(', ')}
              </Text>
            ))}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', padding: 20, paddingTop: 60 },
  generateBtn: { marginHorizontal: 16, backgroundColor: '#16a34a', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  generateText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: { backgroundColor: '#111827', borderRadius: 12, padding: 16, marginBottom: 12 },
  planName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  planMeta: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  dayText: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
