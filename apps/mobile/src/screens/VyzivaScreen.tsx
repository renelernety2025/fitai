import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
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
  v2,
} from '../components/v2/V2';
import {
  useHaptic,
  LoadingState,
  NativeBottomSheet,
  NativeBottomSheetRef,
} from '../components/native';

const MEALS = [
  { v: 'breakfast', l: 'Breakfast' },
  { v: 'lunch', l: 'Lunch' },
  { v: 'dinner', l: 'Dinner' },
  { v: 'snack', l: 'Snack' },
];

export function VyzivaScreen() {
  const [data, setData] = useState<any>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [meal, setMeal] = useState('breakfast');
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoResult, setPhotoResult] = useState<{
    name: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    mealType: string;
  } | null>(null);
  const haptic = useHaptic();
  const addSheetRef = useRef<NativeBottomSheetRef>(null);
  const photoSheetRef = useRef<NativeBottomSheetRef>(null);

  // Drive bottom sheets from state
  useEffect(() => {
    if (showAdd) addSheetRef.current?.present();
    else addSheetRef.current?.dismiss();
  }, [showAdd]);

  useEffect(() => {
    if (photoResult) photoSheetRef.current?.present();
    else photoSheetRef.current?.dismiss();
  }, [photoResult]);

  const handleFoodPhoto = async () => {
    haptic.tap();
    setError(null);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libPerm.granted) {
          haptic.warning();
          setError('Allow camera or photo library in Settings to scan food.');
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
        haptic.warning();
        setError('Not recognized. Try a better photo or add manually.');
        return;
      }
      haptic.success();
      setPhotoResult({
        name: analysis.name,
        kcal: analysis.kcal,
        proteinG: analysis.proteinG,
        carbsG: analysis.carbsG,
        fatG: analysis.fatG,
        mealType: 'lunch',
      });
    } catch (e: any) {
      haptic.error();
      setError(e.message || 'Analysis failed');
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

  if (!data) return <V2Screen><LoadingState label="Loading nutrition" /></V2Screen>;

  const grouped = MEALS.map((m) => ({
    ...m,
    items: data.log.filter((i: any) => i.mealType === m.v),
  }));

  return (
    <V2Screen>
      {/* Hero */}
      <View style={{ paddingTop: 24, alignItems: 'center', marginBottom: 32 }}>
        <V2SectionLabel>Today</V2SectionLabel>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ color: '#FFF', fontSize: 64, fontWeight: '700', letterSpacing: -2 }}>
            {data.totals.kcal.toLocaleString()}
          </Text>
          <Text style={{ color: v2.ghost, fontSize: 24, marginLeft: 6 }}>
            / {data.goals.dailyKcal.toLocaleString()}
          </Text>
        </View>
        <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2, marginTop: 8 }}>
          CALORIES
        </Text>
      </View>

      {/* Macro rings */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 48 }}>
        <V2Ring value={data.totals.proteinG} total={data.goals.dailyProteinG} size={100} color={v2.red} label="Protein" />
        <V2Ring value={data.totals.carbsG} total={data.goals.dailyCarbsG} size={100} color={v2.green} label="Carbs" />
        <V2Ring value={data.totals.fatG} total={data.goals.dailyFatG} size={100} color={v2.blue} label="Fat" />
      </View>

      {error && (
        <View style={{ marginBottom: 16, backgroundColor: 'rgba(255,55,95,0.10)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,55,95,0.25)' }}>
          <Text style={{ color: v2.red, fontSize: 13 }}>{error}</Text>
        </View>
      )}

      {/* Food photo button */}
      <Pressable
        onPress={handleFoodPhoto}
        disabled={photoAnalyzing}
        style={({ pressed }) => ({
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
          opacity: photoAnalyzing ? 0.6 : pressed ? 0.7 : 1,
        })}
      >
        {photoAnalyzing ? (
          <>
            <ActivityIndicator color="#6c63ff" size="small" />
            <Text style={{ color: '#6c63ff', fontSize: 16, fontWeight: '700' }}>Analyzing food...</Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 24 }}>📸</Text>
            <Text style={{ color: '#6c63ff', fontSize: 16, fontWeight: '700' }}>Snap a meal</Text>
          </>
        )}
      </Pressable>

      {/* AI tips */}
      {tips.length > 0 && (
        <View style={{ marginBottom: 32 }}>
          <V2SectionLabel>AI recommendations</V2SectionLabel>
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
            <Pressable
              onPress={() => { haptic.tap(); setMeal(m.v); setShowAdd(true); }}
              hitSlop={8}
              style={({ pressed }) => [pressed && { opacity: 0.5 }]}
            >
              <Text style={{ color: v2.muted, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
                + ADD
              </Text>
            </Pressable>
          </View>
          {m.items.length === 0 ? (
            <Text style={{ color: v2.ghost, fontSize: 14 }}>No food logged</Text>
          ) : (
            m.items.map((item: any) => (
              <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: v2.border, paddingVertical: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFF', fontSize: 15 }}>{item.name}</Text>
                  <Text style={{ color: v2.faint, fontSize: 11 }}>
                    {item.kcal} kcal · P {item.proteinG}g · S {item.carbsG}g · T {item.fatG}g
                  </Text>
                </View>
                <Pressable
                  onPress={async () => {
                    haptic.tap();
                    try { await deleteFoodLog(item.id); haptic.success(); reload(); } catch { haptic.error(); }
                  }}
                  hitSlop={8}
                  style={({ pressed }) => [pressed && { opacity: 0.4 }]}
                >
                  <Text style={{ color: v2.ghost, fontSize: 16, paddingHorizontal: 8 }}>✕</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      ))}

      {/* Add food — native bottom sheet */}
      <NativeBottomSheet
        ref={addSheetRef}
        snapPoints={['70%']}
        onDismiss={() => { if (showAdd) setShowAdd(false); }}
      >
        <View style={{ paddingTop: 8 }}>
          <V2SectionLabel>{MEALS.find((x) => x.v === meal)?.l}</V2SectionLabel>
          <V2Display size="md">Add food</V2Display>
          <View style={{ marginTop: 16 }}>
            {foods.map((f) => (
              <Pressable
                key={f.name}
                onPress={async () => {
                  haptic.selection();
                  try {
                    await addFoodLog({ ...f, mealType: meal });
                    haptic.success();
                  } catch { haptic.error(); }
                  setShowAdd(false);
                  reload();
                }}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: v2.border,
                  paddingVertical: 14,
                  opacity: pressed ? 0.5 : 1,
                })}
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
        </View>
      </NativeBottomSheet>

      {/* Photo result — native bottom sheet */}
      <NativeBottomSheet
        ref={photoSheetRef}
        snapPoints={['85%']}
        onDismiss={() => { if (photoResult) setPhotoResult(null); }}
      >
        <View style={{ paddingTop: 8 }}>
          <V2SectionLabel>AI recognized</V2SectionLabel>
          <V2Display size="md">{photoResult?.name}</V2Display>

          <View style={{ marginTop: 20, gap: 14 }}>
            {[
              { label: 'Name', key: 'name' as const, suffix: '' },
              { label: 'Calories', key: 'kcal' as const, suffix: ' kcal' },
              { label: 'Protein', key: 'proteinG' as const, suffix: ' g' },
              { label: 'Carbs', key: 'carbsG' as const, suffix: ' g' },
              { label: 'Fat', key: 'fatG' as const, suffix: ' g' },
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

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {MEALS.map((m) => (
                <Pressable
                  key={m.v}
                  onPress={() => { haptic.selection(); photoResult && setPhotoResult({ ...photoResult, mealType: m.v }); }}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: photoResult?.mealType === m.v ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)',
                    alignItems: 'center',
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ color: photoResult?.mealType === m.v ? '#6c63ff' : v2.muted, fontSize: 12, fontWeight: '600' }}>
                    {m.l}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={async () => {
              if (!photoResult) return;
              haptic.tap();
              try {
                await addFoodLog({
                  name: photoResult.name,
                  kcal: photoResult.kcal,
                  proteinG: photoResult.proteinG,
                  carbsG: photoResult.carbsG,
                  fatG: photoResult.fatG,
                  mealType: photoResult.mealType,
                });
                haptic.success();
              } catch { haptic.error(); }
              setPhotoResult(null);
              reload();
            }}
            style={({ pressed }) => ({
              backgroundColor: '#6c63ff',
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 24,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Save to log</Text>
          </Pressable>
        </View>
      </NativeBottomSheet>
    </V2Screen>
  );
}
