import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import {
  getNutritionToday,
  getQuickFoods,
  addFoodLog,
  deleteFoodLog,
} from '../lib/api';
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
  const [showAdd, setShowAdd] = useState(false);
  const [meal, setMeal] = useState('breakfast');

  const reload = () => {
    getNutritionToday().then(setData).catch(console.error);
    getQuickFoods().then(setFoods).catch(console.error);
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
    </V2Screen>
  );
}
