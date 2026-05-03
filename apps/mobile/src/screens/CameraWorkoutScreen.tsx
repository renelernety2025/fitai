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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completeGymSet, endGymSession, getGymSession } from '../lib/api';
import { v2, V2Button, V2SectionLabel, V2Display } from '../components/v2/V2';
import {
  useHaptic,
  NativeConfirm,
  NativeBottomSheet,
  NativeBottomSheetRef,
} from '../components/native';

type ConfirmKind = 'end' | 'finish' | 'last' | null;

const RPE_VALUES = [6, 7, 8, 9, 10];
const RPE_LABELS: Record<number, string> = {
  6: 'Easy',
  7: 'Moderate',
  8: 'Hard',
  9: 'Very hard',
  10: 'Max',
};

export function CameraWorkoutScreen({ route, navigation }: any) {
  const sessionId = route?.params?.sessionId as string;
  const [permission, requestPermission] = useCameraPermissions();
  const haptic = useHaptic();

  const [session, setSession] = useState<any>(null);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [reps, setReps] = useState(0);
  const [showRPE, setShowRPE] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(90);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const pendingSetRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const restIntervalRef = useRef<any>(null);
  const elapsedIntervalRef = useRef<any>(null);
  const rpeSheetRef = useRef<NativeBottomSheetRef>(null);

  // ── Load session ──
  useEffect(() => {
    if (!sessionId) return;
    getGymSession(sessionId).then(setSession).catch((e) => {
      console.error(e);
      haptic.error();
      navigation.goBack();
    });
  }, [sessionId]);

  // ── Drive RPE bottom sheet from showRPE state ──
  useEffect(() => {
    if (showRPE) rpeSheetRef.current?.present();
    else rpeSheetRef.current?.dismiss();
  }, [showRPE]);

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
          haptic.success();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(restIntervalRef.current);
  }, [isResting, haptic]);

  // ── Rep increment with haptic ──
  const addRep = () => {
    haptic.press();
    setReps((r) => r + 1);
  };

  const subtractRep = () => {
    if (reps === 0) return;
    haptic.tap();
    setReps((r) => Math.max(0, r - 1));
  };

  const currentSet = session?.exerciseSets?.[currentSetIdx];
  const exerciseSets = session
    ? session.exerciseSets.filter((s: any) => s.exerciseId === currentSet?.exerciseId)
    : [];
  const exerciseSetIdx = exerciseSets.findIndex((s: any) => s.id === currentSet?.id);

  // Overall progress: how many distinct exercises in the session, current exercise index
  const allExerciseIds = session
    ? Array.from(new Set(session.exerciseSets.map((s: any) => s.exerciseId)))
    : [];
  const currentExerciseNum = currentSet
    ? allExerciseIds.indexOf(currentSet.exerciseId) + 1
    : 0;
  const totalExercises = allExerciseIds.length;
  const totalSets = session?.exerciseSets?.length ?? 0;

  // Skip current exercise — jump to first set of next exerciseId
  const skipExercise = () => {
    if (!session || !currentSet) return;
    haptic.press();
    const next = session.exerciseSets.findIndex(
      (s: any, i: number) => i > currentSetIdx && s.exerciseId !== currentSet.exerciseId,
    );
    if (next === -1) {
      setConfirm('last');
      return;
    }
    setCurrentSetIdx(next);
    setReps(0);
  };

  const confirmFinish = () => {
    haptic.tap();
    setConfirm('finish');
  };

  const confirmExit = () => {
    haptic.tap();
    setConfirm('end');
  };

  // ── Complete set — show RPE bottom sheet ──
  const handleSetComplete = () => {
    if (!session || !currentSet) return;
    pendingSetRef.current = {
      setId: currentSet.id,
      reps,
      weight: currentSet.targetWeight,
    };
    haptic.success();
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
    haptic.tap();
    clearInterval(restIntervalRef.current);
    setIsResting(false);
  };

  // ── Permission UI ──
  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', padding: 32 }}>
        <V2SectionLabel>Camera</V2SectionLabel>
        <V2Display size="lg">We need{'\n'}your permission.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 15, lineHeight: 24, marginTop: 16 }}>
          FitAI uses the camera as a mirror for self-check during exercise. Video never leaves your phone.
        </Text>
        <View style={{ marginTop: 32 }}>
          <V2Button onPress={requestPermission} full>
            Allow camera →
          </V2Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!session || !currentSet) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
          LOADING WORKOUT
        </Text>
      </View>
    );
  }

  if (finished) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', padding: 32, justifyContent: 'center' }}>
        <V2SectionLabel>Done</V2SectionLabel>
        <V2Display size="xl">Workout{'\n'}complete.</V2Display>
        <View style={{ marginTop: 32, borderTopWidth: 1, borderColor: v2.border, paddingTop: 24 }}>
          <V2SectionLabel>Duration</V2SectionLabel>
          <Text style={{ color: '#FFF', fontSize: 44, fontWeight: '700', letterSpacing: -2 }}>
            {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}
          </Text>
        </View>
        <View style={{ marginTop: 32 }}>
          <V2Button onPress={() => navigation.navigate('Main')} full>
            Back to dashboard →
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
            onPress={confirmExit}
            style={({ pressed }) => [{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderWidth: 1,
              borderColor: v2.border,
            }, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
              ✕ EXIT
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
            EX {currentExerciseNum} / {totalExercises}  ·  SET {currentSetIdx + 1} / {totalSets}
          </Text>
          <Text style={{ color: '#FFF', fontSize: 38, fontWeight: '700', letterSpacing: -1.2, marginTop: 4 }}>
            {currentSet.exercise.nameCs}
          </Text>
          <Text style={{ color: v2.muted, fontSize: 14, marginTop: 4 }}>
            Set {exerciseSetIdx + 1} / {exerciseSets.length}{currentSet.isWarmup ? ' · warmup' : ''}
            {' · '}Target: {currentSet.targetReps} reps
            {currentSet.targetWeight ? ` · ${currentSet.targetWeight}kg` : ''}
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Rep counter — massive */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
            REPS
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
              SET DONE →
            </Text>
          </Pressable>

          {/* Skip exercise + Finish workout — secondary actions */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pressable
              onPress={skipExercise}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 20,
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderWidth: 1,
                borderColor: v2.border,
              }}
            >
              <Text style={{ color: v2.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
                SKIP EXERCISE →
              </Text>
            </Pressable>
            <Pressable
              onPress={confirmFinish}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 20,
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderWidth: 1,
                borderColor: v2.borderStrong,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
                ✓ FINISH WORKOUT
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* RPE — native bottom sheet */}
      <NativeBottomSheet
        ref={rpeSheetRef}
        snapPoints={[340]}
        onDismiss={() => { if (showRPE) setShowRPE(false); }}
      >
        <View style={{ paddingTop: 8 }}>
          <V2SectionLabel>How was it?</V2SectionLabel>
          <V2Display size="lg">RPE</V2Display>
          <Text style={{ color: v2.muted, fontSize: 13, marginTop: 8, marginBottom: 24 }}>
            Rate of Perceived Exertion — how hard was this set?
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {RPE_VALUES.map((r) => (
              <Pressable
                key={r}
                onPress={() => { haptic.selection(); submitSet(r); }}
                style={({ pressed }) => [{
                  flex: 1,
                  paddingVertical: 16,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: v2.borderStrong,
                  alignItems: 'center',
                }, pressed && { opacity: 0.6 }]}
              >
                <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700' }}>{r}</Text>
                <Text style={{ color: v2.faint, fontSize: 9, marginTop: 2 }}>{RPE_LABELS[r]}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => { haptic.tap(); submitSet(null); }}
            hitSlop={12}
            style={({ pressed }) => [{ marginTop: 16, alignItems: 'center' }, pressed && { opacity: 0.5 }]}
          >
            <Text style={{ color: v2.faint, fontSize: 12, fontWeight: '600', letterSpacing: 1.5 }}>
              SKIP
            </Text>
          </Pressable>
        </View>
      </NativeBottomSheet>

      {/* Confirmations — native iOS bottom sheets replace Alert.alert */}
      <NativeConfirm
        visible={confirm === 'end'}
        title="End workout?"
        message="Your progress will be saved."
        confirmLabel="End"
        destructive
        onConfirm={() => { setConfirm(null); handleEnd(); }}
        onCancel={() => setConfirm(null)}
      />
      <NativeConfirm
        visible={confirm === 'finish'}
        title="Finish workout?"
        message="Incomplete sets will be marked as skipped."
        confirmLabel="Finish"
        destructive
        onConfirm={() => { setConfirm(null); handleEnd(); }}
        onCancel={() => setConfirm(null)}
      />
      <NativeConfirm
        visible={confirm === 'last'}
        title="Last exercise"
        message="This was the last exercise. End workout?"
        confirmLabel="End workout"
        onConfirm={() => { setConfirm(null); handleEnd(); }}
        onCancel={() => setConfirm(null)}
      />

      {/* Rest overlay */}
      {isResting && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 2 }}>
            REST
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
            Next: set {exerciseSetIdx + 2} / {exerciseSets.length}
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
              SKIP REST →
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
