import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { V2Screen, V2Display, V2SectionLabel, V2Stat, v2 } from '../components/v2/V2';
import { getCurrentMealPlan, generateMealPlan } from '../lib/api';

const MEAL_LABEL: Record<string, string> = {
  breakfast: 'Snídaně',
  snack: 'Svačina',
  lunch: 'Oběd',
  dinner: 'Večeře',
};
const MEAL_COLOR: Record<string, string> = {
  breakfast: '#FFD60A',
  snack: '#A8FF00',
  lunch: '#FF9F0A',
  dinner: '#7C3AED',
};

export function JidelnicekScreen() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [showShopping, setShowShopping] = useState(false);

  useEffect(() => {
    getCurrentMealPlan()
      .then(setPlan)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function regenerate() {
    setGenerating(true);
    try {
      const fresh = await generateMealPlan();
      setPlan(fresh);
      setActiveDay(0);
    } catch (e: any) {
      Alert.alert('Generování selhalo', e.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <V2Screen>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <Text style={{ color: v2.muted }}>Načítám…</Text>
        </View>
      </V2Screen>
    );
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16 }}>
        <V2SectionLabel>AI Meal Plan</V2SectionLabel>
        <V2Display size="lg">Your meal plan.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 12, lineHeight: 20 }}>
          Personalizovaný 7denní plán generovaný Claude Haiku z tvých makro cílů a preferencí.
        </Text>
      </View>

      {!plan && (
        <View
          style={{
            marginTop: 32,
            borderRadius: 24,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: v2.border,
            padding: 32,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: v2.text, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Žádný plán pro tento týden
          </Text>
          <Text style={{ color: v2.muted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            Klikni a Claude vygeneruje plný 7denní jídelníček podle tvého profilu.
          </Text>
          <Pressable
            onPress={regenerate}
            disabled={generating}
            style={{
              backgroundColor: '#FFF',
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 999,
              opacity: generating ? 0.5 : 1,
            }}
          >
            <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>
              {generating ? 'Generuju (~10-20s)…' : '✦ Vygenerovat plán'}
            </Text>
          </Pressable>
        </View>
      )}

      {plan && (
        <>
          {/* Stats bar */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: v2.border,
              paddingVertical: 24,
              marginVertical: 32,
            }}
          >
            <V2Stat value={plan.payload.avgKcalPerDay} label="Kcal/den" />
            <V2Stat value={plan.payload.avgProteinG} label="Protein" />
            <V2Stat value={plan.payload.totalKcal} label="Týdně" />
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <Pressable
              onPress={() => setShowShopping((s) => !s)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: v2.border,
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <Text style={{ color: v2.text, fontSize: 12, fontWeight: '600' }}>
                {showShopping ? 'Skrýt' : '🛒 Nákupní seznam'}
              </Text>
            </Pressable>
            <Pressable
              onPress={regenerate}
              disabled={generating}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: '#FFF',
                opacity: generating ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>
                {generating ? 'Generuju…' : '✦ Regenerate'}
              </Text>
            </Pressable>
          </View>

          {/* Shopping list */}
          {showShopping && (
            <View style={{ marginBottom: 32 }}>
              <V2SectionLabel>🛒 Nákupní seznam · týden</V2SectionLabel>
              {plan.payload.shoppingList.map((cat: any) => (
                <View
                  key={cat.category}
                  style={{
                    marginTop: 12,
                    borderWidth: 1,
                    borderColor: v2.border,
                    borderRadius: 16,
                    padding: 16,
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <Text style={{ color: v2.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                    {cat.category}
                  </Text>
                  {cat.items.map((item: any, i: number) => (
                    <View
                      key={i}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}
                    >
                      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{item.name}</Text>
                      <Text style={{ color: v2.muted, fontSize: 13 }}>
                        {item.qty} {item.unit}
                      </Text>
                    </View>
                  ))}
                  {cat.items.length === 0 && (
                    <Text style={{ color: v2.ghost, fontSize: 11 }}>Žádné položky</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Day picker */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginBottom: 16 }}
          >
            {plan.payload.days.map((day: any, i: number) => (
              <Pressable
                key={i}
                onPress={() => setActiveDay(i)}
                style={{
                  minWidth: 72,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: i === activeDay ? '#FFF' : v2.border,
                  backgroundColor: i === activeDay ? '#FFF' : 'rgba(255,255,255,0.02)',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: i === activeDay ? '#000' : v2.muted,
                    fontSize: 9,
                    fontWeight: '700',
                    letterSpacing: 1,
                  }}
                >
                  {day.dayName.slice(0, 3).toUpperCase()}
                </Text>
                <Text
                  style={{
                    color: i === activeDay ? '#000' : v2.text,
                    fontSize: 18,
                    fontWeight: '700',
                    marginTop: 2,
                  }}
                >
                  {new Date(day.date).getDate()}
                </Text>
                <Text
                  style={{
                    color: i === activeDay ? 'rgba(0,0,0,0.55)' : v2.ghost,
                    fontSize: 9,
                    marginTop: 2,
                  }}
                >
                  {day.totals.kcal} kcal
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Active day */}
          {plan.payload.days[activeDay] && (
            <View style={{ marginBottom: 32 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: v2.text, fontSize: 24, fontWeight: '700', letterSpacing: -0.6 }}>
                  {plan.payload.days[activeDay].dayName}
                </Text>
                <Text style={{ color: v2.muted, fontSize: 11 }}>
                  P {plan.payload.days[activeDay].totals.proteinG}g · S{' '}
                  {plan.payload.days[activeDay].totals.carbsG}g · T{' '}
                  {plan.payload.days[activeDay].totals.fatG}g
                </Text>
              </View>

              {plan.payload.days[activeDay].meals.map((meal: any, i: number) => {
                const color = MEAL_COLOR[meal.type] || '#FFF';
                return (
                  <View
                    key={i}
                    style={{
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: v2.border,
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: color + '66',
                          backgroundColor: color + '22',
                        }}
                      >
                        <Text style={{ color, fontSize: 9, fontWeight: '700', letterSpacing: 1 }}>
                          {(MEAL_LABEL[meal.type] || meal.type).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={{ color: v2.ghost, fontSize: 11 }}>{meal.prepMinutes} min</Text>
                    </View>
                    <Text style={{ color: v2.text, fontSize: 16, fontWeight: '600', marginBottom: 6 }}>
                      {meal.name}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                      <Text style={{ color: '#A8FF00', fontSize: 12, fontWeight: '600' }}>{meal.kcal} kcal</Text>
                      <Text style={{ color: v2.muted, fontSize: 12 }}>P {meal.proteinG}g</Text>
                      <Text style={{ color: v2.muted, fontSize: 12 }}>S {meal.carbsG}g</Text>
                      <Text style={{ color: v2.muted, fontSize: 12 }}>T {meal.fatG}g</Text>
                    </View>
                    {meal.ingredients.map((ing: string, j: number) => (
                      <Text key={j} style={{ color: v2.muted, fontSize: 11, lineHeight: 16 }}>
                        · {ing}
                      </Text>
                    ))}
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </V2Screen>
  );
}
