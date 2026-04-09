/**
 * CameraWorkoutProScreen — camera workout (manual tap mode)
 *
 * Uses `expo-camera` for a reliable, Expo-managed camera preview.
 * Tap anywhere on the camera view to count a rep.
 *
 * History: This screen was originally planned to use react-native-vision-camera
 * + ML Kit Pose frame processor for automatic pose detection, but we hit
 * dead-end babel plugin issues in that stack (vision-camera v4 + Expo SDK 54 +
 * React 19 + npm workspaces). Switched to expo-camera — zero build/runtime
 * issues, works in Expo Go and any EAS build profile.
 *
 * Pose pipeline (feedback-engine, rep-counter, safety-checker, mlkit-adapter)
 * remains in apps/mobile/src/lib/pose/ as dead code — ready to be wired up
 * when we revisit automatic pose detection via a v4-compatible stack like
 * react-native-fast-tflite + MoveNet TFLite model.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { SAMPLE_EXERCISES } from '../lib/pose/sample-exercises';

export function CameraWorkoutProScreen({ route, navigation }: any) {
  const exerciseKey: 'squat' | 'pushup' = route?.params?.exercise || 'squat';
  const exercise = SAMPLE_EXERCISES[exerciseKey];

  const [permission, requestPermission] = useCameraPermissions();
  const [reps, setReps] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const lastTapAt = useRef(0);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  /** Tap anywhere on camera to count a rep (manual mode). */
  const handleTap = () => {
    if (!running) return;
    const now = Date.now();
    if (now - lastTapAt.current < 400) return; // 400ms debounce
    lastTapAt.current = now;
    setReps((r) => r + 1);
    setCurrentPhase((p) => (p + 1) % exercise.phases.length);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Permission not yet resolved
  if (!permission) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Načítám…</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Kamera — povolení</Text>
        <Text style={styles.overlayText}>
          FitAI potřebuje přístup ke kameře pro sledování formy při cvičení.
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Povolit kameru</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      {/* Camera preview */}
      <CameraView style={StyleSheet.absoluteFill} facing="front" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
          hitSlop={16}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>{exercise.nameCs}</Text>
          <Text style={styles.topSubtitle}>Camera workout · manual mode</Text>
        </View>
      </View>

      {/* Big rep counter */}
      <View style={styles.repCounterBox}>
        <Text style={styles.repNumber}>{reps}</Text>
        <Text style={styles.repLabel}>REPS</Text>
      </View>

      {/* Current phase hint */}
      <View style={styles.infoBox}>
        <Text style={styles.phaseName}>{exercise.phases[currentPhase]?.nameCs || ''}</Text>
        <Text style={styles.phaseHint}>Klepni na kameru pro rep</Text>
      </View>

      {/* Start/Stop button */}
      <View style={styles.bottomBar} pointerEvents="box-none">
        <Pressable
          style={[styles.primaryBtn, running && styles.primaryBtnActive]}
          onPress={(e: any) => {
            e.stopPropagation?.();
            if (running) {
              setReps(0);
              setCurrentPhase(0);
              setRunning(false);
            } else {
              setRunning(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }}
          hitSlop={10}
        >
          <Text style={[styles.primaryBtnText, running && styles.primaryBtnTextActive]}>
            {running ? 'STOP' : 'START SET'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  overlayText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonText: { color: '#000', fontSize: 14, fontWeight: '600' },

  topBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 18 },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  topSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },

  repCounterBox: {
    position: 'absolute',
    top: '40%',
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 90,
  },
  repNumber: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 56,
  },
  repLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
  },

  infoBox: {
    position: 'absolute',
    top: '40%',
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 16,
    borderRadius: 16,
    minWidth: 140,
  },
  phaseName: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  phaseHint: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 999,
  },
  primaryBtnActive: { backgroundColor: '#FF375F' },
  primaryBtnText: { color: '#000', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  primaryBtnTextActive: { color: '#fff' },
});
