import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getWorkoutPlans } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Row, v2 } from '../components/v2/V2';

const planAccent: Record<string, string> = {
  PUSH_PULL_LEGS: v2.red,
  UPPER_LOWER: v2.green,
  FULL_BODY: v2.blue,
  CUSTOM: v2.purple,
};

export function PlansScreen({ navigation }: any) {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    getWorkoutPlans().then(setPlans).catch(console.error);
  }, []);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Připraven?</V2SectionLabel>
        <V2Display size="xl">Trénink.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 16, marginTop: 16 }}>
          Vyber svůj plán nebo začni rychlý workout. Forma má přednost před váhou.
        </Text>
      </View>

      {/* Quick start */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32, gap: 12 }}>
        {[
          { label: 'Doma', screen: 'Doma', color: v2.green },
          { label: 'Video', screen: 'Videos', color: v2.blue },
          { label: 'AI Plán', screen: 'AICoach', color: v2.purple },
          { label: 'Pose AI', screen: 'CameraWorkoutPro', color: v2.red },
        ].map((q) => (
          <Pressable
            key={q.label}
            onPress={() => navigation.navigate(q.screen)}
            style={{
              flex: 1,
              minWidth: 100,
              padding: 20,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: v2.border,
            }}
          >
            <View style={{ width: 32, height: 4, borderRadius: 2, backgroundColor: q.color, marginBottom: 12 }} />
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      <V2SectionLabel>Plány</V2SectionLabel>

      {plans.map((p) => (
        <V2Row key={p.id} onPress={() => navigation.navigate('PlanDetail', { id: p.id })}>
          <Text style={{ color: planAccent[p.type] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>
            {(p.type || '').replace(/_/g, ' ')} · {p.daysPerWeek}× TÝDNĚ
          </Text>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>{p.nameCs}</Text>
          <Text style={{ color: v2.faint, fontSize: 13, marginTop: 4 }} numberOfLines={1}>
            {p.description}
          </Text>
        </V2Row>
      ))}
    </V2Screen>
  );
}
