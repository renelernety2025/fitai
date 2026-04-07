/**
 * Camera Workout Screen (Phase 6 — part 1).
 *
 * This is "camera workout lite": live camera preview as a mirror + manual
 * rep counter with haptics + set management + RPE modal + API persistence.
 *
 * True MediaPipe pose detection requires a native frame processor plugin
 * (react-native-vision-camera + custom MediaPipe plugin) which needs a
 * custom EAS dev build. That is Phase 6 part 2.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
  AppState,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completeGymSet, endGymSession, getGymSession } from '../lib/api';
import { v2, V2Button, V2SectionLabel, V2Display } from '../components/v2/V2';

const RPE_VALUES = [6, 7, 8, 9, 10];
const RPE_LABELS: Record<number, string> = {
  6: 'Lehké',
  7: 'Středně',
  8: 'Těžké',
  9: 'Skoro max',
  10: 'Max',
};

export function CameraWorkoutScreen({ route, navigation }: any) {
  const sessionId = route?.params?.sessionId as string;
  const [permission, requestPermission] = useCameraPermissions();

  const [session, setSession] = useState<any>(null);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [reps, setReps] = useState(0);
  const [showRPE, setShowRPE] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(90);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const pendingSetRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const restIntervalRef = useRef<any>(null);
  const elapsedIntervalRef = useRef<any>(null);

  // ── Load session ──
  useEffect(() => {
    if (!sessionId) return;
    getGymSession(sessionId).then(setSession).catch((e) => {
      console.error(e);
      Alert.alert('Chyba', 'Nepodařilo se načíst trénink');
      navigation.goBack();
    });
  }, [sessionId]);

  // ── Elapsed timer ──
  useEffect(() => {
    startTimeRef.current = Date.now();
    elapsedIntervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(elapsedIntervalRef.current);
  }, []);

  // ── Rest timer ──
  useEffect(() => {
    if (!isResting) return;
    setRestRemaining(90);
    restIntervalRef.current = setInterval(() => {
      setRestRemaining((r) => {
        if (r <= 1) {
          clearInterval(restIntervalRef.current);
          setIsResting(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(restIntervalRef.current);
  }, [isResting]);

  // ── Rep increment with haptic ──
  const addRep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setReps((r) => r + 1);
  };

  const subtractRep = () => {
    if (reps === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReps((r) => Math.max(0, r - 1));
  };

  const currentSet = session?.exerciseSets?.[currentSetIdx];
  const exerciseSets = session
    ? session.exerciseSets.filter((s: any) => s.exerciseId === currentSet?.exerciseId)
    : [];
  const exerciseSetIdx = exerciseSets.findIndex((s: any) => s.id === currentSet?.id);

  // ── Complete set — show RPE modal ──
  const handleSetComplete = () => {
    if (!session || !currentSet) return;
    pendingSetRef.current = {
      setId: currentSet.id,
      reps,
      weight: currentSet.targetWeight,
    };
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (currentSet.isWarmup) submitSet(null);
    else setShowRPE(true);
  };

  const submitSet = async (rpe: number | null) => {
    setShowRPE(false);
    if (!session || !pendingSetRef.current) return;
    const p = pendingSetRef.current;
    try {
      await completeGymSet(session.id, {
        setId: p.setId,
        actualReps: p.reps,
        actualWeight: p.weight,
        formScore: 100, // no pose detection yet
        repData: [],
        ...(rpe ? { rpe } : {}),
      });
    } catch (e) {
      console.error(e);
    }
    pendingSetRef.current = null;

    const nextIdx = currentSetIdx + 1;
    if (nextIdx >= session.exerciseSets.length) {
      handleEnd();
      return;
    }
    setCurrentSetIdx(nextIdx);
    setReps(0);
    setIsResting(true);
  };

  const handleEnd = async () => {
    try {
      await endGymSession(session.id);
    } catch (e) {
      console.error(e);
    }
    setFinished(true);
  };

  const skipRest = () => {
    clearInterval(restIntervalRef.current);
    setIsResting(false);
  };

  // ── Permission UI ──
  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 32 }}>
        <V2SectionLabel>Kamera</V2SectionLabel>
        <V2Display size="lg">Potřebujeme{'\n'}tvé povolení.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 15, lineHeight: 24, marginTop: 16 }}>
          FitAI používá kameru jako zrcadlo pro self-check během cvičení. Video nikdy neopustí tvůj telefon.
        </Text>
        <View style={{ marginTop: 32 }}>
          <V2Button onPress={requestPermission} full>
            Povolit kameru →
          </V2Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!session || !currentSet) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
          NAČÍTÁNÍ TRÉNINKU
        </Text>
      </View>
    );
  }

  if (finished) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', padding: 32, justifyContent: 'center' }}>
        <V2SectionLabel>Hotovo</V2SectionLabel>
        <V2Display size="xl">Trénink{'\n'}dokončen.</V2Display>
        <View style={{ marginTop: 32, borderTopWidth: 1, borderColor: v2.border, paddingTop: 24 }}>
          <V2SectionLabel>Doba</V2SectionLabel>
          <Text style={{ color: '#FFF', fontSize: 44, fontWeight: '700', letterSpacing: -2 }}>
            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
          </Text>
        </View>
        <View style={{ marginTop: 32 }}>
          <V2Button onPress={() => navigation.navigate('Main')} full>
            Zpět na dashboard →
          </V2Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Camera preview (mirror mode with front camera) */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="front"
        mirror
      />

      {/* Dark overlay for readability */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0,0,0,0.35)' },
        ]}
        pointerEvents="none"
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Top bar: exit + timer */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 12,
          }}
        >
          <Pressable
            onPress={() => {
              Alert.alert('Ukončit trénink?', 'Tvůj pokrok bude uložen.', [
                { text: 'Pokračovat', style: 'cancel' },
                { text: 'Ukončit', style: 'destructive', onPress: handleEnd },
              ]);
            }}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderWidth: 1,
              borderColor: v2.border,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
              ✕ UKONČIT
            </Text>
          </Pressable>
          <View
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderWidth: 1,
              borderColor: v2.border,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 1, fontVariant: ['tabular-nums'] }}>
              {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* Exercise name + set tracker */}
        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
            SET {exerciseSetIdx + 1} / {exerciseSets.length}{currentSet.isWarmup ? ' · ZAHŘÍVACÍ' : ''}
          </Text>
          <Text style={{ color: '#FFF', fontSize: 38, fontWeight: '700', letterSpacing: -1.2, marginTop: 4 }}>
            {currentSet.exercise.nameCs}
          </Text>
          <Text style={{ color: v2.muted, fontSize: 14, marginTop: 4 }}>
            Cíl: {currentSet.targetReps} repů
            {currentSet.targetWeight ? ` · ${currentSet.targetWeight}kg` : ''}
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Rep counter — massive */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
            OPAKOVÁNÍ
          </Text>
          <Text
            style={{
              color: '#FFF',
              fontSize: 180,
              fontWeight: '700',
              letterSpacing: -8,
              lineHeight: 200,
              fontVariant: ['tabular-nums'],
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 12,
            }}
          >
            {reps}
          </Text>
        </View>

        {/* Bottom controls */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <Pressable
              onPress={subtractRep}
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.55)',
                borderWidth: 1,
                borderColor: v2.borderStrong,
                paddingVertical: 22,
                borderRadius: 24,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700' }}>−</Text>
            </Pressable>
            <Pressable
              onPress={addRep}
              style={{
                flex: 3,
                backgroundColor: '#FFF',
                paddingVertical: 22,
                borderRadius: 24,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#000', fontSize: 28, fontWeight: '700' }}>+ REP</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={handleSetComplete}
            style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              borderWidth: 1,
              borderColor: v2.borderStrong,
              paddingVertical: 18,
              borderRadius: 24,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 }}>
              SET HOTOVÝ →
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* RPE Modal */}
      <Modal visible={showRPE} transparent animationType="slide" onRequestClose={() => setShowRPE(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#000',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: v2.border,
              padding: 28,
            }}
          >
            <V2SectionLabel>Jak to bylo?</V2SectionLabel>
            <V2Display size="lg">RPE</V2Display>
            <Text style={{ color: v2.muted, fontSize: 13, marginTop: 8, marginBottom: 24 }}>
              Rate of Perceived Exertion — jak náročný byl tento set?
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {RPE_VALUES.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => submitSet(r)}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: v2.borderStrong,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700' }}>{r}</Text>
                  <Text style={{ color: v2.faint, fontSize: 9, marginTop: 2 }}>{RPE_LABELS[r]}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => submitSet(null)} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: v2.faint, fontSize: 12, fontWeight: '600', letterSpacing: 1.5 }}>
                PŘESKOČIT
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Rest overlay */}
      {isResting && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
            PAUZA
          </Text>
          <Text
            style={{
              color: '#FFF',
              fontSize: 140,
              fontWeight: '700',
              letterSpacing: -6,
              fontVariant: ['tabular-nums'],
            }}
          >
            {restRemaining}
          </Text>
          <Text style={{ color: v2.muted, fontSize: 14, marginBottom: 32 }}>
            Další: set {exerciseSetIdx + 2} / {exerciseSets.length}
          </Text>
          <Pressable
            onPress={skipRest}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: v2.borderStrong,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 }}>
              PŘESKOČIT PAUZU →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
