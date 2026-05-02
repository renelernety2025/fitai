import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { getWorkoutPlans } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Row, V2Loading, v2 } from '../components/v2/V2';

const planAccent: Record<string, string> = {
  PUSH_PULL_LEGS: v2.red,
  UPPER_LOWER: v2.green,
  FULL_BODY: v2.blue,
  CUSTOM: v2.purple,
};

export function PlansScreen({ navigation }: any) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getWorkoutPlans()
      .then(setPlans)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Ready?</V2SectionLabel>
        <V2Display size="xl">Training.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 16, marginTop: 16 }}>
          Pick your plan or start a quick workout. Form over weight, always.
        </Text>
      </View>

      {/* Quick start */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 32, gap: 12 }}>
        {[
          { label: 'Home', screen: 'Doma', color: v2.green },
          { label: 'Video', screen: 'Videos', color: v2.blue },
          { label: 'AI Plan', screen: 'AICoach', color: v2.purple },
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

      <V2SectionLabel>Plans</V2SectionLabel>

      {loading && <V2Loading />}

      {error && !loading && (
        <View style={{ alignItems: 'center', padding: 32 }}>
          <Text style={{ color: v2.red, fontSize: 14, marginBottom: 12 }}>Failed to load plans.</Text>
        </View>
      )}

      {!loading && !error && plans.length === 0 && (
        <View style={{ alignItems: 'center', padding: 32 }}>
          <Text style={{ color: v2.muted, fontSize: 14, marginBottom: 12 }}>No training plans yet.</Text>
          <Pressable onPress={() => navigation.navigate('AICoach')}>
            <Text style={{ color: v2.text, fontSize: 14, fontWeight: '600' }}>Create with AI →</Text>
          </Pressable>
        </View>
      )}

      {plans.map((p) => (
        <V2Row key={p.id} onPress={() => navigation.navigate('PlanDetail', { id: p.id })}>
          <Text style={{ color: planAccent[p.type] || '#FFF', fontSize: 10, fontWeight: '600', letterSpacing: 2, marginBottom: 6 }}>
            {(p.type || '').replace(/_/g, ' ')} · {p.daysPerWeek}x/WEEK
          </Text>
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>{p.name || p.nameCs}</Text>
          <Text style={{ color: v2.faint, fontSize: 13, marginTop: 4 }} numberOfLines={1}>
            {p.description}
          </Text>
        </V2Row>
      ))}
    </V2Screen>
  );
}
