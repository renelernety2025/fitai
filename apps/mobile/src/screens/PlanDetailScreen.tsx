import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getWorkoutPlan } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

export function PlanDetailScreen({ route, navigation }: any) {
  const [plan, setPlan] = useState<any>(null);
  const id = route?.params?.id;

  useEffect(() => {
    if (id) getWorkoutPlan(id).then(setPlan).catch(console.error);
  }, [id]);

  if (!plan) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>← PLÁNY</Text>
      </Pressable>

      <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
        {(plan.type || '').replace(/_/g, ' ')} · {plan.daysPerWeek}× TÝDNĚ
      </Text>
      <V2Display size="xl">{plan.nameCs}</V2Display>
      <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14 }}>{plan.description}</Text>

      {plan.days?.map((day: any) => (
        <View key={day.id} style={{ marginTop: 40 }}>
          <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>
            DEN {day.dayIndex + 1}
          </Text>
          <V2Display size="md">{day.nameCs}</V2Display>

          {day.plannedExercises?.map((pe: any) => (
            <View
              key={pe.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: v2.border,
                paddingVertical: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontSize: 15 }}>{pe.exercise.nameCs}</Text>
                <Text style={{ color: v2.faint, fontSize: 11 }}>
                  {(pe.exercise.muscleGroups || []).join(', ')}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>
                  {pe.targetSets} × {pe.targetReps}
                </Text>
                <Text style={{ color: v2.faint, fontSize: 11 }}>
                  {pe.targetWeight ? `${pe.targetWeight}kg` : 'BW'} · {pe.restSeconds}s
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </V2Screen>
  );
}
