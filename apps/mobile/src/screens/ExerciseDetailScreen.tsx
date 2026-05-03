import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getExercise } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState, ErrorState } from '../components/native';

export function ExerciseDetailScreen({ route, navigation }: any) {
  const [ex, setEx] = useState<any>(null);
  const [error, setError] = useState(false);
  const id = route?.params?.id;
  const haptic = useHaptic();

  const load = useCallback(() => {
    if (!id) return;
    setError(false);
    getExercise(id)
      .then(setEx)
      .catch(() => setError(true));
  }, [id]);
  useEffect(load, [load]);

  const BackButton = () => (
    <Pressable
      onPress={() => { haptic.tap(); navigation.goBack(); }}
      hitSlop={12}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingTop: 16, paddingBottom: 16 }, pressed && { opacity: 0.5 }]}
    >
      <Text style={{ color: v2.text, fontSize: 32, fontWeight: '300', lineHeight: 32, marginTop: -3 }}>‹</Text>
      <Text style={{ color: v2.text, fontSize: 16, fontWeight: '500' }}>Exercises</Text>
    </Pressable>
  );

  if (error) {
    return <V2Screen><BackButton /><ErrorState message="Failed to load exercise." onRetry={load} /></V2Screen>;
  }

  if (!ex) return <V2Screen><BackButton /><LoadingState label="Loading exercise" /></V2Screen>;
  const inst = ex.instructions || {};

  return (
    <V2Screen>
      <BackButton />

      <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
        {(ex.muscleGroups || []).join(' · ').toUpperCase()}
      </Text>
      <V2Display size="xl">{ex.nameCs || ex.name}</V2Display>
      <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14 }}>{ex.descriptionCs || ex.description}</Text>

      {inst.targetMuscles && (
        <View style={{ marginTop: 32 }}>
          <V2SectionLabel>Target muscles</V2SectionLabel>
          <Text style={{ color: '#FFF', fontSize: 15 }}>
            <Text style={{ color: v2.green }}>Primary: </Text>
            {inst.targetMuscles.primary?.join(', ')}
          </Text>
          {inst.targetMuscles.secondary && (
            <Text style={{ color: v2.muted, fontSize: 14, marginTop: 4 }}>
              Secondary: {inst.targetMuscles.secondary.join(', ')}
            </Text>
          )}
        </View>
      )}

      {inst.steps && (
        <View style={{ marginTop: 32 }}>
          <V2SectionLabel>How to</V2SectionLabel>
          {inst.steps.map((step: string, i: number) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 14 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: v2.borderStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>{i + 1}</Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 22, flex: 1 }}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {inst.breathing && (
        <View style={{ marginTop: 32 }}>
          <V2SectionLabel>Breathing</V2SectionLabel>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 26 }}>{inst.breathing}</Text>
        </View>
      )}

      {inst.tempo && (
        <View style={{ marginTop: 32 }}>
          <V2SectionLabel>Tempo</V2SectionLabel>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16 }}>{inst.tempo}</Text>
        </View>
      )}

      {inst.commonMistakes && (
        <View style={{ marginTop: 32 }}>
          <V2SectionLabel>Common mistakes</V2SectionLabel>
          {inst.commonMistakes.map((m: string, i: number) => (
            <Text key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 8 }}>
              <Text style={{ color: v2.red }}>✗ </Text>{m}
            </Text>
          ))}
        </View>
      )}

      {inst.tips && (
        <View style={{ marginTop: 32 }}>
          <V2SectionLabel>Tips</V2SectionLabel>
          {inst.tips.map((tip: string, i: number) => (
            <Text key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 8 }}>
              <Text style={{ color: v2.yellow }}>→ </Text>{tip}
            </Text>
          ))}
        </View>
      )}
    </V2Screen>
  );
}
