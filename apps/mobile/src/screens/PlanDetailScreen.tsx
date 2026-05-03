import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getWorkoutPlan, startGymSession } from '../lib/api';
import { V2Screen, V2Display, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, ErrorState } from '../components/native';

export function PlanDetailScreen({ route, navigation }: any) {
  const [plan, setPlan] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const id = route?.params?.id;
  const haptic = useHaptic();

  function reload() {
    setLoadError(false);
    getWorkoutPlan(id).then(setPlan).catch(() => setLoadError(true));
  }

  useEffect(() => {
    if (!id) return;
    reload();
  }, [id]);

  const [starting, setStarting] = useState(false);

  async function handleStart(dayIndex: number) {
    if (!plan) return;
    haptic.tap();
    setStartError(null);
    setStarting(true);
    try {
      const session = await startGymSession({ workoutPlanId: plan.id, workoutDayIndex: dayIndex });
      haptic.success();
      navigation.navigate('CameraWorkout', { sessionId: session.id });
    } catch (e: any) {
      haptic.error();
      setStartError(e?.message || 'Failed to start workout');
    } finally {
      setStarting(false);
    }
  }

  if (loadError) {
    return (
      <V2Screen>
        <Pressable
          onPress={() => { haptic.tap(); navigation.goBack(); }}
          hitSlop={12}
          style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingTop: 8 }, pressed && { opacity: 0.5 }]}
        >
          <Text style={{ color: v2.text, fontSize: 32, fontWeight: '300', lineHeight: 32, marginTop: -3 }}>‹</Text>
          <Text style={{ color: v2.text, fontSize: 16, fontWeight: '500' }}>Plans</Text>
        </Pressable>
        <ErrorState message="Failed to load plan." onRetry={reload} />
      </V2Screen>
    );
  }

  if (!plan) return <V2Screen><LoadingState label="Loading plan" /></V2Screen>;

  return (
    <V2Screen>
      <Pressable
        onPress={() => { haptic.tap(); navigation.goBack(); }}
        hitSlop={12}
        style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingTop: 8, paddingBottom: 16 }, pressed && { opacity: 0.5 }]}
      >
        <Text style={{ color: v2.text, fontSize: 32, fontWeight: '300', lineHeight: 32, marginTop: -3 }}>‹</Text>
        <Text style={{ color: v2.text, fontSize: 16, fontWeight: '500' }}>Plans</Text>
      </Pressable>

      <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
        {(plan.type || '').replace(/_/g, ' ')} · {plan.daysPerWeek}× / WEEK
      </Text>
      <V2Display size="xl">{plan.nameCs}</V2Display>
      <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14 }}>{plan.description}</Text>

      {startError && (
        <View style={{ marginTop: 16, backgroundColor: 'rgba(255,55,95,0.10)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,55,95,0.25)' }}>
          <Text style={{ color: v2.red, fontSize: 13 }}>{startError}</Text>
        </View>
      )}

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
              style={({ pressed }) => ({
                backgroundColor: '#FFF',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 999,
                opacity: starting ? 0.5 : pressed ? 0.7 : 1,
              })}
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
