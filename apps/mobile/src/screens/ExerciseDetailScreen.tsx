import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getExercise } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Loading, v2 } from '../components/v2/V2';

export function ExerciseDetailScreen({ route, navigation }: any) {
  const [ex, setEx] = useState<any>(null);
  const id = route?.params?.id;

  useEffect(() => {
    if (id) getExercise(id).then(setEx).catch(console.error);
  }, [id]);

  if (!ex) return <V2Screen><V2Loading /></V2Screen>;
  const inst = ex.instructions || {};

  return (
    <V2Screen>
      <Pressable onPress={() => navigation.goBack()} style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>← CVIKY</Text>
      </Pressable>

      <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 8 }}>
        {(ex.muscleGroups || []).join(' · ').toUpperCase()}
      </Text>
      <V2Display size="xl">{ex.nameCs}</V2Display>
      <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14 }}>{ex.descriptionCs}</Text>

      {inst.targetMuscles && (
        <View style={{ marginTop: 32 }}>
          <V2SectionLabel>Cílové svaly</V2SectionLabel>
          <Text style={{ color: '#FFF', fontSize: 15 }}>
            <Text style={{ color: v2.green }}>Hlavní: </Text>
            {inst.targetMuscles.primary?.join(', ')}
          </Text>
          {inst.targetMuscles.secondary && (
            <Text style={{ color: v2.muted, fontSize: 14, marginTop: 4 }}>
              Vedlejší: {inst.targetMuscles.secondary.join(', ')}
            </Text>
          )}
        </View>
      )}

      {inst.steps && (
        <View style={{ marginTop: 32 }}>
          <V2SectionLabel>Jak na to</V2SectionLabel>
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
          <V2SectionLabel>Dýchání</V2SectionLabel>
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
          <V2SectionLabel>Časté chyby</V2SectionLabel>
          {inst.commonMistakes.map((m: string, i: number) => (
            <Text key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 8 }}>
              <Text style={{ color: v2.red }}>✗ </Text>{m}
            </Text>
          ))}
        </View>
      )}

      {inst.tips && (
        <View style={{ marginTop: 32 }}>
          <V2SectionLabel>Tipy</V2SectionLabel>
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
