import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import {
  getOnboardingStatus,
  getOnboardingTestExercises,
  saveOnboardingMeasurements,
  submitFitnessTest,
  completeOnboarding,
  getSuggestedWeights,
} from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Input, V2Button, V2Loading, v2 } from '../components/v2/V2';

type Step = 'measurements' | 'test' | 'review';

export function OnboardingScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>('measurements');
  const [loading, setLoading] = useState(true);

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const [exs, setExs] = useState<any[]>([]);
  const [results, setResults] = useState<Record<string, { weight: string; reps: string }>>({});

  const [suggested, setSuggested] = useState<any[]>([]);

  useEffect(() => {
    Promise.allSettled([getOnboardingStatus(), getOnboardingTestExercises()])
      .then(([statusRes, exsRes]) => {
        if (exsRes.status === 'fulfilled') setExs(exsRes.value);
        if (statusRes.status === 'fulfilled') {
          const status = statusRes.value;
          if (status.completed) navigation.replace('Main');
          else if (status.step === 'fitness_test') setStep('test');
          else if (status.step === 'finalize') {
            setStep('review');
            getSuggestedWeights().then(setSuggested).catch(console.error);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleMeasurementsNext() {
    const a = parseInt(age);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!a || !w || !h) return;
    await saveOnboardingMeasurements({ age: a, weightKg: w, heightCm: h });
    setStep('test');
  }

  async function handleTestNext() {
    const r = Object.entries(results)
      .filter(([, v]) => parseFloat(v.weight) > 0 && parseInt(v.reps) > 0)
      .map(([exerciseId, v]) => ({
        exerciseId,
        weight: parseFloat(v.weight),
        reps: parseInt(v.reps),
      }));
    if (r.length === 0) return;
    await submitFitnessTest(r);
    const sw = await getSuggestedWeights();
    setSuggested(sw);
    setStep('review');
  }

  async function handleFinish() {
    await completeOnboarding();
    navigation.replace('Main');
  }

  if (loading) return <V2Screen><V2Loading /></V2Screen>;

  const stepIdx = ['measurements', 'test', 'review'].indexOf(step);

  return (
    <V2Screen>
      <View style={{ paddingTop: 24, marginBottom: 24 }}>
        <V2SectionLabel>Krok {stepIdx + 1} ze 3</V2SectionLabel>
        <V2Display size="xl">
          {step === 'measurements' && 'O tobě.'}
          {step === 'test' && 'Tvůj výkon.'}
          {step === 'review' && 'Tvůj plán.'}
        </V2Display>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 2,
              borderRadius: 1,
              backgroundColor: i <= stepIdx ? '#FFF' : v2.border,
            }}
          />
        ))}
      </View>

      {step === 'measurements' && (
        <View>
          <Text style={{ color: v2.muted, marginBottom: 32, fontSize: 14 }}>
            Tyto údaje pomohou personalizovat tvůj plán a spočítat denní příjem kalorií.
          </Text>
          <V2Input label="Věk" value={age} onChangeText={setAge} placeholder="25" keyboardType="numeric" />
          <V2Input label="Váha (kg)" value={weight} onChangeText={setWeight} placeholder="75" keyboardType="numeric" />
          <V2Input label="Výška (cm)" value={height} onChangeText={setHeight} placeholder="180" keyboardType="numeric" />
          <V2Button onPress={handleMeasurementsNext} disabled={!age || !weight || !height} full>
            Pokračovat →
          </V2Button>
        </View>
      )}

      {step === 'test' && (
        <View>
          <Text style={{ color: v2.muted, marginBottom: 24, fontSize: 14 }}>
            U každého cviku zadej váhu a počet opakování s perfektní formou.
          </Text>
          {exs.map((ex) => (
            <View key={ex.id} style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: v2.border, paddingBottom: 16 }}>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>{ex.nameCs}</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <V2Input
                    label="Váha (kg)"
                    value={results[ex.id]?.weight || ''}
                    onChangeText={(v) =>
                      setResults({ ...results, [ex.id]: { ...(results[ex.id] || { reps: '' }), weight: v } })
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <V2Input
                    label="Opakování"
                    value={results[ex.id]?.reps || ''}
                    onChangeText={(v) =>
                      setResults({ ...results, [ex.id]: { ...(results[ex.id] || { weight: '' }), reps: v } })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          ))}
          <V2Button onPress={handleTestNext} full>Spočítat 1RM →</V2Button>
        </View>
      )}

      {step === 'review' && (
        <View>
          <Text style={{ color: v2.muted, marginBottom: 24, fontSize: 14 }}>
            Spočítáno na základě tvého 1RM. První týden začneme jemně na 60 % — tělo si zvykne.
          </Text>
          {suggested.map((s) => (
            <View key={s.exerciseId} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 20 }}>
              <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
                1RM {s.oneRMKg}KG
              </Text>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.5, marginTop: 4 }}>
                {s.exerciseName}
              </Text>
              <View style={{ flexDirection: 'row', gap: 24, marginTop: 12 }}>
                <View>
                  <Text style={{ color: v2.yellow, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>PRVNÍ TÝDEN</Text>
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>
                    {s.firstWeekWeight}<Text style={{ color: v2.faint }}>kg × {s.recommendedReps}</Text>
                  </Text>
                </View>
                <View>
                  <Text style={{ color: v2.green, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>CÍL</Text>
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>
                    {s.recommendedWorkingWeight}<Text style={{ color: v2.faint }}>kg × {s.recommendedReps}</Text>
                  </Text>
                </View>
              </View>
            </View>
          ))}
          <View style={{ marginTop: 24 }}>
            <V2Button onPress={handleFinish} full>Začít cvičit →</V2Button>
          </View>
        </View>
      )}
    </V2Screen>
  );
}
