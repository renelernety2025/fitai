import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAuth } from '../lib/auth-context';
import {
  getMyStats,
  getInsights,
  getLessonOfTheWeek,
  getNutritionToday,
  getWeeklyReview,
  getDailyBrief,
} from '../lib/api';
import {
  V2Screen,
  V2Display,
  V2SectionLabel,
  V2Stat,
  V2TripleRing,
  V2Loading,
  v2,
} from '../components/v2/V2';

export function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [nutrition, setNutrition] = useState<any>(null);
  const [weekly, setWeekly] = useState<any>(null);
  const [brief, setBrief] = useState<any>(null);

  useEffect(() => {
    getMyStats().then(setStats).catch(console.error);
    getInsights().then(setInsights).catch(console.error);
    getLessonOfTheWeek().then(setLesson).catch(console.error);
    getNutritionToday().then(setNutrition).catch(console.error);
    getWeeklyReview().then((r: any) => setWeekly(r.review)).catch(console.error);
    getDailyBrief().then((r: any) => setBrief(r.brief)).catch(console.error);
  }, []);

  const moodColor: Record<string, string> = {
    push: v2.red,
    maintain: v2.green,
    recover: v2.blue,
  };
  const moodLabelMap: Record<string, string> = {
    push: 'PUSH DAY',
    maintain: 'MAINTAIN',
    recover: 'RECOVER',
  };

  const move = stats && stats.totalSessions > 0 ? Math.min(1, stats.totalSessions / 5) : 0.15;
  const exercise = stats ? Math.min(1, (stats.currentStreak || 0) / 7) : 0.25;
  const stand = stats ? Math.min(1, ((stats.totalXP || 0) % 1000) / 1000) : 0.5;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobré odpoledne' : 'Dobrý večer';

  return (
    <V2Screen>
      {/* Top bar with Profile link */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 16 }}>
        <Pressable onPress={() => navigation.navigate('Profile')}>
          <Text style={{ color: v2.faint, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>VÍCE →</Text>
        </Pressable>
      </View>

      {/* Hero greeting */}
      <View style={{ paddingTop: 16, alignItems: 'center', marginBottom: 24 }}>
        <V2SectionLabel>{greeting}</V2SectionLabel>
        <V2Display size="lg">{(user?.name || 'Athlete').split(' ')[0]}.</V2Display>
      </View>

      {/* Triple Ring */}
      <View style={{ alignItems: 'center', marginVertical: 32 }}>
        <V2TripleRing move={move} exercise={exercise} stand={stand} size={260} />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: v2.text, fontSize: 64, fontWeight: '700', letterSpacing: -2 }}>
            {stats?.currentStreak || 0}
          </Text>
          <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
            DNÍ V ŘADĚ
          </Text>
        </View>
      </View>

      {/* Legend */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 48 }}>
        {[
          { c: v2.red, l: 'SESSIONS' },
          { c: v2.green, l: 'STREAK' },
          { c: v2.blue, l: 'XP' },
        ].map((it) => (
          <View key={it.l} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: it.c }} />
            <Text style={{ color: v2.muted, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 }}>
              {it.l}
            </Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      {stats && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: v2.border, paddingVertical: 32, marginBottom: 48 }}>
          <V2Stat value={stats.totalSessions || 0} label="Cvičení" />
          <V2Stat value={Math.floor((stats.totalMinutes || 0) / 60)} label="Hodin" />
          <V2Stat value={stats.totalXP || 0} label="XP" />
        </View>
      )}

      {/* Daily Brief — AI Coach flagship */}
      {brief && (
        <View
          style={{
            marginBottom: 32,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: v2.border,
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: 24,
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: moodColor[brief.mood] + '55',
                backgroundColor: moodColor[brief.mood] + '22',
              }}
            >
              <Text style={{ color: moodColor[brief.mood], fontSize: 9, fontWeight: '700', letterSpacing: 2 }}>
                {moodLabelMap[brief.mood] || 'TODAY'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: v2.faint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>RECOVERY</Text>
              <Text style={{ color: v2.text, fontSize: 22, fontWeight: '700', letterSpacing: -1 }}>
                {brief.recoveryScore}
                <Text style={{ color: v2.ghost, fontSize: 12 }}>/100</Text>
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: v2.text,
              fontSize: 24,
              fontWeight: '700',
              letterSpacing: -0.6,
              lineHeight: 30,
              marginBottom: 12,
            }}
          >
            {brief.headline}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <Text style={{ color: v2.text, fontSize: 13, fontWeight: '600' }}>{brief.workout.title}</Text>
            <Text style={{ color: v2.muted, fontSize: 13 }}>· {brief.workout.estimatedMinutes} min</Text>
            <Text style={{ color: v2.muted, fontSize: 13 }}>· {brief.workout.exercises.length} cviků</Text>
          </View>

          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 22, marginBottom: 16 }}>
            {brief.rationale}
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Plans')}
            style={{
              backgroundColor: '#FFF',
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 999,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: '#000', fontSize: 14, fontWeight: '600' }}>Začít trénink →</Text>
          </Pressable>
        </View>
      )}

      {/* Daily Brief — exercises */}
      {brief && brief.workout.exercises.length > 0 && (
        <View style={{ marginBottom: 48 }}>
          <V2SectionLabel>Plán cviků</V2SectionLabel>
          {brief.workout.exercises.map((ex: any, i: number) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                paddingVertical: 14,
                borderBottomWidth: i < brief.workout.exercises.length - 1 ? 1 : 0,
                borderColor: v2.border,
              }}
            >
              <Text style={{ color: v2.ghost, fontSize: 11, fontWeight: '700', width: 28 }}>
                {String(i + 1).padStart(2, '0')}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: v2.text, fontSize: 15, fontWeight: '600' }}>{ex.nameCs}</Text>
                {ex.rationale ? (
                  <Text style={{ color: v2.muted, fontSize: 11, marginTop: 2 }}>{ex.rationale}</Text>
                ) : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: v2.text, fontSize: 13, fontWeight: '700' }}>
                  {ex.sets}×{ex.reps}
                </Text>
                <Text style={{ color: v2.ghost, fontSize: 11 }}>RPE {ex.rpe}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Weekly Review (AI) */}
      {weekly && (
        <View style={{ marginBottom: 48 }}>
          <V2SectionLabel>AI Týdenní review</V2SectionLabel>
          <V2Display size="md">{weekly.summary}</V2Display>
          {weekly.highlights?.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: v2.green, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>
                ✓ POVEDLO SE
              </Text>
              {weekly.highlights.map((h: string, i: number) => (
                <Text key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>{h}</Text>
              ))}
            </View>
          )}
          {weekly.improvements?.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: v2.yellow, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>
                → ZLEPŠIT
              </Text>
              {weekly.improvements.map((h: string, i: number) => (
                <Text key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4 }}>{h}</Text>
              ))}
            </View>
          )}
          <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderColor: v2.border }}>
            <Text style={{ color: v2.faint, fontSize: 9, fontWeight: '600', letterSpacing: 1.5 }}>
              CÍL PŘÍŠTÍHO TÝDNE
            </Text>
            <Text style={{ color: '#FFF', fontSize: 16, marginTop: 6 }}>{weekly.nextWeekFocus}</Text>
          </View>
        </View>
      )}

      {/* Lesson of the week */}
      {lesson && (
        <Pressable
          onPress={() => navigation.navigate('LessonDetail', { slug: lesson.slug })}
          style={{ marginBottom: 48 }}
        >
          <V2SectionLabel>Lekce týdne</V2SectionLabel>
          <V2Display size="md">{lesson.titleCs}</V2Display>
          <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14, lineHeight: 22 }} numberOfLines={3}>
            {lesson.bodyCs}
          </Text>
          <Text style={{ color: v2.text, marginTop: 12, fontSize: 12, fontWeight: '600' }}>Číst →</Text>
        </Pressable>
      )}

      {/* Nutrition */}
      {nutrition && (
        <Pressable onPress={() => navigation.navigate('Vyziva')} style={{ marginBottom: 48 }}>
          <V2SectionLabel>Výživa</V2SectionLabel>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ color: v2.text, fontSize: 44, fontWeight: '700', letterSpacing: -2 }}>
              {nutrition.totals.kcal.toLocaleString('cs-CZ')}
            </Text>
            <Text style={{ color: v2.ghost, fontSize: 20, marginLeft: 6 }}>
              / {nutrition.goals.dailyKcal.toLocaleString('cs-CZ')} kcal
            </Text>
          </View>
          <Text style={{ color: v2.muted, marginTop: 4, fontSize: 13 }}>
            P {nutrition.totals.proteinG}g · S {nutrition.totals.carbsG}g · T {nutrition.totals.fatG}g
          </Text>
        </Pressable>
      )}

      {/* AI Insight */}
      {insights?.recovery && (
        <View style={{ marginBottom: 48 }}>
          <V2SectionLabel>AI · Stav regenerace</V2SectionLabel>
          <V2Display size="md">
            {insights.recovery.overallStatus === 'fresh' && 'Svěží.'}
            {insights.recovery.overallStatus === 'normal' && 'Normální.'}
            {insights.recovery.overallStatus === 'fatigued' && 'Unavený.'}
            {insights.recovery.overallStatus === 'overreached' && 'Přetrénovaný.'}
          </V2Display>
          <Text style={{ color: v2.muted, marginTop: 12, fontSize: 14, lineHeight: 22 }}>
            {insights.recovery.recommendation}
          </Text>
        </View>
      )}
    </V2Screen>
  );
}
