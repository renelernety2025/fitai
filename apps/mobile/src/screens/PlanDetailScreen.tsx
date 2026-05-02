import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { getWorkoutPlan, startGymSession } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

export function PlanDetailScreen({ route, navigation }: any) {
  const [plan, setPlan] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);
  const id = route?.params?.id;

  useEffect(() => {
    if (!id) return;
    setLoadError(false);
    getWorkoutPlan(id)
      .then(setPlan)
      .catch(() => setLoadError(true));
  }, [id]);

  const [starting, setStarting] = useState(false);

  async function handleStart(dayIndex: number) {
    if (!plan) return;
    setStarting(true);
    try {
      const session = await startGymSession({ workoutPlanId: plan.id, workoutDayIndex: dayIndex });
      navigation.navigate('CameraWorkout', { sessionId: session.id });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to start workout');
    } finally {
      setStarting(false);
    }
  }

  if (loadError) {
    return (
      <V2Screen>
        <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 16, paddingBottom: 16 }}>
          <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>← PLANS</Text>
        </Pressable>
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text style={{ color: '#FF375F', fontSize: 15, fontWeight: '600', marginBottom: 16 }}>Failed to load plan</Text>
          <Pressable onPress={() => { setLoadError(false); getWorkoutPlan(id).then(setPlan).catch(() => setLoadError(true)); }} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF' }}>
            <Text style={{ color: '#000', fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      </V2Screen>
    );
  }

  if (!plan) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>← PLANS</Text>
      </Pressable>

      <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
        {(plan.type || '').replace(/_/g, ' ')} · {plan.daysPerWeek}× / WEEK
      </Text>
      <V2Display size="xl">{plan.nameCs}</V2Display>
      <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14 }}>{plan.description}</Text>

      {plan.days?.map((day: any) => (
        <View key={day.id} style={{ marginTop: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>
                DAY {day.dayIndex + 1}
              </Text>
              <V2Display size="md">{day.nameCs}</V2Display>
            </View>
            <Pressable
              onPress={() => handleStart(day.dayIndex)}
              disabled={starting}
              style={{
                backgroundColor: '#FFF',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 999,
                opacity: starting ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#000', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
                START →
              </Text>
            </Pressable>
          </View>

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
