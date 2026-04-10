import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  getNutritionToday,
  getQuickFoods,
  addFoodLog,
  deleteFoodLog,
  getNutritionTips,
  getFoodPhotoUploadUrl,
  analyzeFoodPhoto,
} from '../lib/api';

const tipColors: Record<string, string> = {
  protein: '#FF375F',
  hydration: '#0A84FF',
  timing: '#FF9500',
  macros: '#A8FF00',
  quality: '#BF5AF2',
};
import {
  V2Screen,
  V2Display,
  V2SectionLabel,
  V2Ring,
  V2Loading,
  v2,
} from '../components/v2/V2';

const MEALS = [
  { v: 'breakfast', l: 'Snídaně' },
  { v: 'lunch', l: 'Oběd' },
  { v: 'dinner', l: 'Večeře' },
  { v: 'snack', l: 'Svačina' },
];

export function VyzivaScreen() {
  const [data, setData] = useState<any>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [meal, setMeal] = useState('breakfast');
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [photoResult, setPhotoResult] = useState<{
    name: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    mealType: string;
  } | null>(null);

  const handleFoodPhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libPerm.granted) {
          Alert.alert('Potřebuji přístup', 'Povol přístup ke kameře nebo galerii.');
          return;
        }
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets[0]) return;

      setPhotoAnalyzing(true);
      const { uploadUrl, s3Key } = await getFoodPhotoUploadUrl();
      const fileRes = await fetch(result.assets[0].uri);
      const blob = await fileRes.blob();
      await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'image/jpeg' },
      });

      const analysis = await analyzeFoodPhoto(s3Key);
      if (analysis.confidence < 30) {
        Alert.alert(
          'Nerozpoznáno',
          'Jídlo se nepodařilo spolehlivě rozpoznat. Zkus lepší fotku nebo přidej ručně.',
        );
        return;
      }
      setPhotoResult({
        name: analysis.name,
        kcal: analysis.kcal,
        proteinG: analysis.proteinG,
        carbsG: analysis.carbsG,
        fatG: analysis.fatG,
        mealType: 'lunch',
      });
    } catch (e: any) {
      Alert.alert('Chyba', e.message || 'Analýza selhala');
    } finally {
      setPhotoAnalyzing(false);
    }
  };

  const reload = () => {
    getNutritionToday().then(setData).catch(console.error);
    getQuickFoods().then(setFoods).catch(console.error);
    getNutritionTips().then((r: any) => setTips(r.tips || [])).catch(console.error);
  };
  useEffect(reload, []);

  if (!data) return <V2Screen><V2Loading /></V2Screen>;

  const grouped = MEALS.map((m) => ({
    ...m,
    items: data.log.filter((i: any) => i.mealType === m.v),
  }));

  return (
    <V2Screen>
      {/* Hero */}
      <View style={{ paddingTop: 24, alignItems: 'center', marginBottom: 32 }}>
        <V2SectionLabel>Dnes</V2SectionLabel>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ color: '#FFF', fontSize: 64, fontWeight: '700', letterSpacing: -2 }}>
            {data.totals.kcal.toLocaleString('cs-CZ')}
          </Text>
          <Text style={{ color: v2.ghost, fontSize: 24, marginLeft: 6 }}>
            / {data.goals.dailyKcal.toLocaleString('cs-CZ')}
          </Text>
        </View>
        <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginTop: 8 }}>
          KALORIE
        </Text>
      </View>

      {/* Macro rings */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 48 }}>
        <V2Ring value={data.totals.proteinG} total={data.goals.dailyProteinG} size={100} color={v2.red} label="Protein" />
        <V2Ring value={data.totals.carbsG} total={data.goals.dailyCarbsG} size={100} color={v2.green} label="Sacharidy" />
        <V2Ring value={data.totals.fatG} total={data.goals.dailyFatG} size={100} color={v2.blue} label="Tuky" />
      </View>

      {/* Food photo button */}
      <Pressable
        onPress={handleFoodPhoto}
        disabled={photoAnalyzing}
        style={{
          backgroundColor: 'rgba(108,99,255,0.15)',
          borderWidth: 1,
          borderColor: 'rgba(108,99,255,0.3)',
          borderRadius: 16,
          padding: 18,
          marginBottom: 32,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          opacity: photoAnalyzing ? 0.6 : 1,
        }}
      >
        {photoAnalyzing ? (
          <>
            <ActivityIndicator color="#6c63ff" size="small" />
            <Text style={{ color: '#6c63ff', fontSize: 16, fontWeight: '700' }}>Analyzuji jídlo...</Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 24 }}>📸</Text>
            <Text style={{ color: '#6c63ff', fontSize: 16, fontWeight: '700' }}>Vyfoť jídlo</Text>
          </>
        )}
      </Pressable>

      {/* AI tips */}
      {tips.length > 0 && (
        <View style={{ marginBottom: 32 }}>
          <V2SectionLabel>AI doporučení</V2SectionLabel>
          {tips.map((t, i) => (
            <View key={i} style={{ borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 14 }}>
              <Text style={{ color: tipColors[t.category] || '#FFF', fontSize: 9, fontWeight: '600', letterSpacing: 1.5, marginBottom: 4 }}>
                {String(t.category || '').toUpperCase()} · {String(t.priority || '').toUpperCase()}
              </Text>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>{t.title}</Text>
              <Text style={{ color: v2.muted, fontSize: 13, lineHeight: 20, marginTop: 4 }}>{t.body}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Meals */}
      {grouped.map((m) => (
        <View key={m.v} style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <V2Display size="md">{m.l}</V2Display>
            <Pressable onPress={() => { setMeal(m.v); setShowAdd(true); }}>
              <Text style={{ color: v2.muted, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
                + PŘIDAT
              </Text>
            </Pressable>
          </View>
          {m.items.length === 0 ? (
            <Text style={{ color: v2.ghost, fontSize: 14 }}>Žádné jídlo</Text>
          ) : (
            m.items.map((item: any) => (
              <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFF', fontSize: 15 }}>{item.name}</Text>
                  <Text style={{ color: v2.faint, fontSize: 11 }}>
                    {item.kcal} kcal · P {item.proteinG}g · S {item.carbsG}g · T {item.fatG}g
                  </Text>
                </View>
                <Pressable onPress={async () => { await deleteFoodLog(item.id); reload(); }}>
                  <Text style={{ color: v2.ghost, fontSize: 16, paddingHorizontal: 8 }}>✕</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      ))}

      {/* Modal */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }} onPress={() => setShowAdd(false)}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#000',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: v2.border,
              padding: 24,
              maxHeight: '80%',
            }}
          >
            <V2SectionLabel>{MEALS.find((x) => x.v === meal)?.l}</V2SectionLabel>
            <V2Display size="md">Přidat jídlo</V2Display>
            <View style={{ marginTop: 16 }}>
              {foods.map((f) => (
                <Pressable
                  key={f.name}
                  onPress={async () => {
                    await addFoodLog({ ...f, mealType: meal });
                    setShowAdd(false);
                    reload();
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: v2.border,
                    paddingVertical: 14,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFF', fontSize: 15 }}>{f.name}</Text>
                    <Text style={{ color: v2.faint, fontSize: 11 }}>
                      P {f.proteinG}g · S {f.carbsG}g · T {f.fatG}g
                    </Text>
                  </View>
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>{f.kcal}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {/* Food photo result modal */}
      <Modal visible={!!photoResult} animationType="slide" transparent onRequestClose={() => setPhotoResult(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }} onPress={() => setPhotoResult(null)}>
          <Pressable onPress={() => {}} style={{ backgroundColor: '#000', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: v2.border, padding: 24 }}>
            <V2SectionLabel>AI rozpoznalo</V2SectionLabel>
            <V2Display size="md">{photoResult?.name}</V2Display>

            <View style={{ marginTop: 20, gap: 14 }}>
              {[
                { label: 'Název', key: 'name' as const, suffix: '' },
                { label: 'Kalorie', key: 'kcal' as const, suffix: ' kcal' },
                { label: 'Protein', key: 'proteinG' as const, suffix: ' g' },
                { label: 'Sacharidy', key: 'carbsG' as const, suffix: ' g' },
                { label: 'Tuky', key: 'fatG' as const, suffix: ' g' },
              ].map((field) => (
                <View key={field.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: v2.muted, fontSize: 14, width: 80 }}>{field.label}</Text>
                  <TextInput
                    style={{ color: '#FFF', fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'right', padding: 8, borderBottomWidth: 1, borderBottomColor: v2.border }}
                    keyboardType={field.key === 'name' ? 'default' : 'numeric'}
                    value={String(photoResult?.[field.key] ?? '')}
                    onChangeText={(val) => {
                      if (!photoResult) return;
                      setPhotoResult({
                        ...photoResult,
                        [field.key]: field.key === 'name' ? val : Number(val) || 0,
                      });
                    }}
                  />
                  {field.suffix ? <Text style={{ color: v2.ghost, fontSize: 14, marginLeft: 4 }}>{field.suffix}</Text> : null}
                </View>
              ))}

              {/* Meal type picker */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {MEALS.map((m) => (
                  <Pressable
                    key={m.v}
                    onPress={() => photoResult && setPhotoResult({ ...photoResult, mealType: m.v })}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: photoResult?.mealType === m.v ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: photoResult?.mealType === m.v ? '#6c63ff' : v2.muted, fontSize: 12, fontWeight: '600' }}>
                      {m.l}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Save button */}
            <Pressable
              onPress={async () => {
                if (!photoResult) return;
                await addFoodLog({
                  name: photoResult.name,
                  kcal: photoResult.kcal,
                  proteinG: photoResult.proteinG,
                  carbsG: photoResult.carbsG,
                  fatG: photoResult.fatG,
                  mealType: photoResult.mealType,
                });
                setPhotoResult(null);
                reload();
              }}
              style={{
                backgroundColor: '#6c63ff',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 24,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Uložit do logu</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </V2Screen>
  );
}
