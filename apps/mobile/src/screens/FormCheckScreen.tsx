import React, { useEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getExercises, getFormCheckUploadUrl, analyzeForm, getFormCheckHistory } from '../lib/api';
import { V2Screen, V2Display, V2SectionLabel, V2Button, V2Chip, v2 } from '../components/v2/V2';
import { useHaptic, LoadingState } from '../components/native';

export function FormCheckScreen() {
  const [exercises, setExercises] = useState<any[] | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [step, setStep] = useState<'select' | 'analyzing' | 'result'>('select');
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const haptic = useHaptic();

  useEffect(() => {
    getExercises().then(setExercises).catch(() => setExercises([]));
    getFormCheckHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  const allExercises = exercises ?? [];
  const filtered = search
    ? allExercises.filter(e => (e.nameCs || e.name || '').toLowerCase().includes(search.toLowerCase()))
    : allExercises;

  async function handleAnalyze() {
    setError(null);
    if (!selected) {
      haptic.warning();
      setError('Vyber nejdřív cvik.');
      return;
    }
    haptic.tap();

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      haptic.warning();
      setError('Pro upload videa povol přístup k médiím v Nastavení.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
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
      haptic.success();
      setResult(analysis);
      setStep('result');
    } catch (e: any) {
      haptic.error();
      setError(e.message || 'Analysis failed');
      setStep('select');
    }
  }

  const selectedEx = (exercises ?? []).find((e: any) => e.id === selected);

  return (
    <V2Screen>
      <View style={{ paddingTop: 16, marginBottom: 24 }}>
        <V2SectionLabel>AI Analysis</V2SectionLabel>
        <V2Display size="xl">Form Check.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 13, marginTop: 8 }}>
          Upload a video and AI analyzes your form
        </Text>
      </View>

      {step === 'select' && (
        <>
          <V2SectionLabel>SELECT EXERCISE</V2SectionLabel>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercise..."
            placeholderTextColor={v2.ghost}
            style={{ color: '#FFF', fontSize: 14, borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 10, marginBottom: 12 }}
          />
          {exercises === null ? (
            <LoadingState label="Loading exercises" inline />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
              {filtered.slice(0, 30).map((ex) => (
                <V2Chip
                  key={ex.id}
                  label={ex.nameCs || ex.name}
                  selected={selected === ex.id}
                  onPress={() => { haptic.selection(); setSelected(ex.id); }}
                />
              ))}
              {filtered.length > 30 && (
                <Text style={{ color: v2.ghost, fontSize: 11, width: '100%', marginTop: 4 }}>
                  {filtered.length - 30} more — use search to narrow
                </Text>
              )}
            </View>
          )}

          {error && (
            <View style={{ backgroundColor: 'rgba(255,55,95,0.10)', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,55,95,0.25)' }}>
              <Text style={{ color: v2.red, fontSize: 13 }}>{error}</Text>
            </View>
          )}

          <V2Button onPress={handleAnalyze} full disabled={!selected}>
            Analyze form
          </V2Button>

          {/* History */}
          {history.length > 0 && (
            <View style={{ marginTop: 32 }}>
              <V2SectionLabel>PAST CHECKS</V2SectionLabel>
              {history.map((h: any, i: number) => (
                <View key={h.id || i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: v2.border }}>
                  <Text style={{ color: '#FFF', fontSize: 13 }}>{h.exercise?.nameCs || h.exercise?.name || 'Exercise'}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: (h.overallScore ?? 0) >= 80 ? v2.green : (h.overallScore ?? 0) >= 60 ? v2.orange : v2.red, fontSize: 13, fontWeight: '700' }}>
                      {h.overallScore ?? '-'}
                    </Text>
                    <Text style={{ color: v2.faint, fontSize: 11 }}>
                      {h.date ? new Date(h.date).toLocaleDateString('en-US') : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {step === 'analyzing' && (
        <LoadingState label="AI analyzing your form" />
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
              OVERALL SCORE
            </Text>
          </View>

          {result.phases?.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <V2SectionLabel>PHASES</V2SectionLabel>
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
              <V2SectionLabel>IMPROVEMENTS</V2SectionLabel>
              {result.improvements.map((item: string, i: number) => (
                <Text key={i} style={{ color: v2.muted, fontSize: 13, marginBottom: 4 }}>- {item}</Text>
              ))}
            </View>
          )}

          {result.positives?.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <V2SectionLabel>POSITIVES</V2SectionLabel>
              {result.positives.map((item: string, i: number) => (
                <Text key={i} style={{ color: v2.green, fontSize: 13, marginBottom: 4 }}>+ {item}</Text>
              ))}
            </View>
          )}

          <V2Button onPress={() => { haptic.tap(); setStep('select'); setResult(null); setError(null); }} variant="secondary" full>
            New form check
          </V2Button>
        </View>
      )}
    </V2Screen>
  );
}
