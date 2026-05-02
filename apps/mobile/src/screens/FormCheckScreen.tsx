import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getExercises, getFormCheckUploadUrl, analyzeForm, getFormCheckHistory } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, V2Chip, v2 } from '../components/v2/V2';

export function FormCheckScreen() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [step, setStep] = useState<'select' | 'analyzing' | 'result'>('select');
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    getExercises().then(setExercises).catch(() => setExercises([]));
    getFormCheckHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  async function handleAnalyze() {
    if (!selected) {
      Alert.alert('Error', 'Select an exercise first');
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow access to your media library to upload a video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;

    setStep('analyzing');
    try {
      const asset = result.assets[0];
      const { uploadUrl, s3Key } = await getFormCheckUploadUrl({
        fileName: 'form-check.mp4',
        contentType: 'video/mp4',
      });

      const fileRes = await fetch(asset.uri);
      const blob = await fileRes.blob();
      const upload = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'video/mp4' },
      });
      if (!upload.ok) throw new Error(`Upload failed: ${upload.status}`);

      const analysis = await analyzeForm({ s3Key, exerciseId: selected });
      setResult(analysis);
      setStep('result');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Analysis failed');
      setStep('select');
    }
  }

  const selectedEx = exercises.find((e) => e.id === selected);

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>AI Analyza</V2SectionLabel>
        <V2Display size="xl">Form Check.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 13, marginTop: 8 }}>
          Nahrajte video a AI analyzuje formu
        </Text>
      </View>

      {step === 'select' && (
        <>
          <V2SectionLabel>VYBERTE CVIK</V2SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
            {exercises.slice(0, 20).map((ex) => (
              <V2Chip
                key={ex.id}
                label={ex.nameCs || ex.name}
                selected={selected === ex.id}
                onPress={() => setSelected(ex.id)}
              />
            ))}
          </View>

          <V2Button onPress={handleAnalyze} full>
            Analyzovat formu
          </V2Button>
        </>
      )}

      {step === 'analyzing' && (
        <View style={{ alignItems: 'center', paddingTop: 48 }}>
          <Text style={{ color: v2.green, fontSize: 32, marginBottom: 16 }}>...</Text>
          <Text style={{ color: v2.muted, fontSize: 14 }}>AI analyzuje...</Text>
        </View>
      )}

      {step === 'result' && result && (
        <View>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{
              color: result.overallScore >= 80 ? v2.green : result.overallScore >= 60 ? v2.orange : v2.red,
              fontSize: 64,
              fontWeight: '800',
            }}>
              {result.overallScore}
            </Text>
            <Text style={{ color: v2.muted, fontSize: 12, fontWeight: '600', letterSpacing: 2 }}>
              CELKOVE SKORE
            </Text>
          </View>

          {result.phases?.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <V2SectionLabel>FAZE</V2SectionLabel>
              {result.phases.map((p: any, i: number) => (
                <View key={i} style={{ borderRadius: 16, borderWidth: 1, borderColor: v2.border, padding: 16, marginBottom: 8, backgroundColor: v2.surface }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>{p.name}</Text>
                    <Text style={{ color: p.score >= 80 ? v2.green : p.score >= 60 ? v2.orange : v2.red, fontSize: 14, fontWeight: '700' }}>
                      {p.score}
                    </Text>
                  </View>
                  <Text style={{ color: v2.muted, fontSize: 12 }}>{p.feedback}</Text>
                </View>
              ))}
            </View>
          )}

          {result.improvements?.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <V2SectionLabel>CO ZLEPSIT</V2SectionLabel>
              {result.improvements.map((item: string, i: number) => (
                <Text key={i} style={{ color: v2.muted, fontSize: 13, marginBottom: 4 }}>- {item}</Text>
              ))}
            </View>
          )}

          {result.positives?.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <V2SectionLabel>POZITIVA</V2SectionLabel>
              {result.positives.map((item: string, i: number) => (
                <Text key={i} style={{ color: v2.green, fontSize: 13, marginBottom: 4 }}>+ {item}</Text>
              ))}
            </View>
          )}

          <V2Button onPress={() => { setStep('select'); setResult(null); }} variant="secondary" full>
            Novy form check
          </V2Button>
        </View>
      )}
    </V2Screen>
  );
}
