import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import {
  getFitnessProfile,
  updateFitnessProfile,
  generateAIPlan,
} from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Chip, V2Button, V2Loading, v2 } from '../components/v2/V2';

const GOALS = [
  { v: 'STRENGTH', l: 'Síla' },
  { v: 'HYPERTROPHY', l: 'Hypertrofie' },
  { v: 'ENDURANCE', l: 'Vytrvalost' },
  { v: 'WEIGHT_LOSS', l: 'Hubnutí' },
  { v: 'GENERAL_FITNESS', l: 'Obecná' },
  { v: 'MOBILITY', l: 'Mobilita' },
];

const EQUIPMENT = [
  { v: 'barbell', l: 'Činka' },
  { v: 'dumbbells', l: 'Jednoručky' },
  { v: 'cables', l: 'Kladky' },
  { v: 'pullup_bar', l: 'Hrazda' },
  { v: 'bench', l: 'Lavička' },
  { v: 'rack', l: 'Rack' },
  { v: 'kettlebell', l: 'Kettlebell' },
  { v: 'resistance_bands', l: 'Gumy' },
];

export function AICoachScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getFitnessProfile().then(setProfile).catch(console.error);
  }, []);

  async function save(field: string, value: any) {
    if (!profile) return;
    const updated = await updateFitnessProfile({ [field]: value });
    setProfile(updated);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const plan = await generateAIPlan();
      navigation.navigate('PlanDetail', { id: plan.id });
    } finally {
      setGenerating(false);
    }
  }

  if (!profile) return <V2Screen><V2Loading /></V2Screen>;

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 32 }}>
        <V2SectionLabel>Personalizace</V2SectionLabel>
        <V2Display size="xl">AI Trenér.</V2Display>
        <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14 }}>
          Plán generovaný Claude AI podle tvých cílů a regenerace.
        </Text>
      </View>

      {/* Goal */}
      <View style={{ marginBottom: 32 }}>
        <V2SectionLabel>Cíl</V2SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {GOALS.map((g) => (
            <V2Chip key={g.v} label={g.l} selected={profile.goal === g.v} onPress={() => save('goal', g.v)} />
          ))}
        </View>
      </View>

      {/* Equipment */}
      <View style={{ marginBottom: 32 }}>
        <V2SectionLabel>Vybavení</V2SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {EQUIPMENT.map((eq) => {
            const sel = profile.equipment?.includes(eq.v);
            return (
              <V2Chip
                key={eq.v}
                label={eq.l}
                selected={sel}
                onPress={() => {
                  const cur = profile.equipment || [];
                  save('equipment', sel ? cur.filter((e: string) => e !== eq.v) : [...cur, eq.v]);
                }}
              />
            );
          })}
        </View>
      </View>

      <V2Button onPress={handleGenerate} disabled={generating} full>
        {generating ? 'AI generuje plán…' : 'Vygenerovat plán →'}
      </V2Button>
    </V2Screen>
  );
}
