/**
 * CameraWorkoutProScreen — Phase 6 part 2 (camera-only mode)
 *
 * CURRENT STATE: Camera preview + manual rep counter + manual safety checks.
 * Uses react-native-vision-camera v4 for camera feed.
 *
 * AUTOMATIC POSE DETECTION: TEMPORARILY DISABLED.
 * The `react-native-vision-camera-v3-pose-detection` plugin we tried is
 * incompatible with vision-camera v4 — it imports `VisionCamera/VisionCameraProxy.h`
 * which v4 renamed. Compile fails with "file not found".
 *
 * TODO: Restore automatic pose detection via v4-compatible alternative:
 *   Option 1 — `react-native-fast-tflite` + MoveNet/BlazePose TFLite model
 *     (v4-compatible frame processor, actively maintained)
 *   Option 2 — Custom Swift bridge to Google ML Kit Pose
 *     (more work, identical to iOS native approach)
 *   Option 3 — Wait for upstream plugin to support v4
 *
 * The pose-pipeline lib (feedback-engine, rep-counter, safety-checker,
 * mlkit-adapter) remains in apps/mobile/src/lib/pose/ — ready to wire up
 * once we have a working frame processor.
 *
 * REQUIRES DEV BUILD — will NOT run in Expo Go.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Vision Camera v4 — guarded import so Expo Go doesn't crash on startup.
let Camera: any = null;
let useCameraDevice: any = null;
let useCameraPermission: any = null;
try {
  const vc = require('react-native-vision-camera');
  Camera = vc.Camera;
  useCameraDevice = vc.useCameraDevice;
  useCameraPermission = vc.useCameraPermission;
} catch (e) {
  // Running in Expo Go — native modules unavailable
}

import { SAMPLE_EXERCISES } from '../lib/pose/sample-exercises';

export function CameraWorkoutProScreen({ route, navigation }: any) {
  const exerciseKey: 'squat' | 'pushup' = route?.params?.exercise || 'squat';
  const exercise = SAMPLE_EXERCISES[exerciseKey];

  // Native module availability check
  const nativeAvailable = Camera !== null;

  if (!nativeAvailable) {
    return <ExpoGoFallback />;
  }

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  const [reps, setReps] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const lastTapAt = useRef(0);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  /** Tap anywhere on camera to count a rep (manual mode). */
  const handleTap = () => {
    if (!running) return;
    const now = Date.now();
    if (now - lastTapAt.current < 400) return; // debounce
    lastTapAt.current = now;
    setReps((r) => r + 1);
    setCurrentPhase((p) => (p + 1) % exercise.phases.length);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!hasPermission) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Kamera — povolení</Text>
        <Text style={styles.overlayText}>FitAI potřebuje přístup ke kameře pro sledování formy.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Povolit kameru</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Kamera nedostupná</Text>
        <Text style={styles.overlayText}>Nepodařilo se najít přední kameru.</Text>
      </View>
    );
  }

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      {/* Camera preview (no frame processor — manual rep counter) */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>{exercise.nameCs}</Text>
          <Text style={styles.topSubtitle}>Camera workout · manual mode</Text>
        </View>
      </View>

      {/* Big rep counter center-right */}
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
      <View style={styles.bottomBar}>
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
        >
          <Text style={[styles.primaryBtnText, running && styles.primaryBtnTextActive]}>
            {running ? 'STOP' : 'START SET'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

/** Fallback when running in Expo Go without native modules. */
function ExpoGoFallback() {
  return (
    <View style={styles.overlay}>
      <Text style={styles.overlayTitle}>Vyžaduje Dev Build</Text>
      <Text style={styles.overlayText}>
        Tato obrazovka používá react-native-vision-camera + ML Kit Pose Detection,
        které nefungují v Expo Go.
      </Text>
      <Text style={styles.overlayHint}>
        Spusť: npx eas build --profile development --platform ios
      </Text>
    </View>
  );
}

function formScoreColor(score: number): string {
  if (score >= 85) return '#A8FF00';
  if (score >= 70) return '#FFD60A';
  if (score >= 50) return '#FF9F0A';
  return '#FF375F';
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
  overlayHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 24,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
  topSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 1, marginTop: 2 },

  visibilityDot: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
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
    minWidth: 110,
  },
  formScore: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  phaseName: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 4 },

  safetyBox: {
    position: 'absolute',
    top: '25%',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  safetyText: { fontSize: 14, fontWeight: '600', marginVertical: 2 },

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

  hintBox: {
    position: 'absolute',
    bottom: 130,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  hintText: { color: '#FFD60A', fontSize: 13, fontWeight: '600' },
});
