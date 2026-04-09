/**
 * CameraWorkoutProScreen — native pose detection workout (Phase 6 part 2)
 *
 * Uses react-native-vision-camera v4 + ML Kit Pose plugin to run real-time
 * pose detection at ~30 fps. Maps plugin output → MediaPipe 33-landmark
 * standard → feeds into ported feedback-engine / rep-counter / safety-checker.
 *
 * REQUIRES DEV BUILD — will NOT run in Expo Go.
 * Run via: npx eas build --profile development --platform ios
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../lib/auth-context';

// Vision Camera + ML Kit Pose plugin — only imported when dev build
// Guarded imports so Expo Go doesn't crash on startup.
let Camera: any = null;
let useCameraDevice: any = null;
let useCameraPermission: any = null;
let PoseCamera: any = null;
try {
  const vc = require('react-native-vision-camera');
  Camera = vc.Camera;
  useCameraDevice = vc.useCameraDevice;
  useCameraPermission = vc.useCameraPermission;
  const poseLib = require('react-native-vision-camera-v3-pose-detection');
  PoseCamera = poseLib.Camera;
} catch (e) {
  // Running in Expo Go — native modules unavailable
}

import { createRepCounter } from '../lib/pose/rep-counter';
import { checkSafety } from '../lib/pose/safety-checker';
import { mlkitToLandmarks, hasVisiblePose } from '../lib/pose/mlkit-adapter';
import { SAMPLE_EXERCISES } from '../lib/pose/sample-exercises';
import type { PoseLandmarks, SafetyAlert } from '../lib/pose/types';
import type { RepFrameResult } from '../lib/pose/rep-counter';

export function CameraWorkoutProScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const exerciseKey: 'squat' | 'pushup' = route?.params?.exercise || 'squat';
  const exercise = SAMPLE_EXERCISES[exerciseKey];

  // Native module availability check
  const nativeAvailable = Camera !== null && PoseCamera !== null;

  if (!nativeAvailable) {
    return <ExpoGoFallback />;
  }

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');

  const [reps, setReps] = useState(0);
  const [formScore, setFormScore] = useState(100);
  const [currentPhase, setCurrentPhase] = useState(exercise.phases[0].nameCs);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [landmarksVisible, setLandmarksVisible] = useState(false);
  const [running, setRunning] = useState(false);

  const repCounterRef = useRef(createRepCounter(exercise.phases));
  const lastSafetyHapticAt = useRef(0);
  const lastRepAt = useRef(0);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  /** Callback called from worklet when pose detected on a frame. */
  const onPoseDetected = (rawPose: any) => {
    try {
      const landmarks: PoseLandmarks = mlkitToLandmarks(rawPose);
      const visible = hasVisiblePose(landmarks);
      setLandmarksVisible(visible);
      if (!visible || !running) return;

      const now = Date.now();
      const result: RepFrameResult = repCounterRef.current.processFrame(landmarks, now);

      setFormScore(result.formScore);
      setCurrentPhase(result.currentPhase.nameCs);

      if (result.repJustCompleted && result.completedReps !== lastRepAt.current) {
        lastRepAt.current = result.completedReps;
        setReps(result.completedReps);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Safety check — throttled to avoid haptic spam
      const alerts = checkSafety(landmarks, exercise.nameCs);
      setSafetyAlerts(alerts);
      if (alerts.some((a) => a.severity === 'critical') && now - lastSafetyHapticAt.current > 2000) {
        lastSafetyHapticAt.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (e) {
      // Silent — worklet errors would otherwise crash the camera
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Kamera — povolení</Text>
        <Text style={styles.overlayText}>FitAI potřebuje přístup ke kameře pro pose detection.</Text>
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
    <View style={styles.container}>
      {/* Camera view with pose detection frame processor */}
      <PoseCamera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        callback={onPoseDetected}
        options={{ mode: 'stream', performanceMode: 'min' }}
      />

      {/* Pose visibility indicator */}
      <View style={[styles.visibilityDot, { backgroundColor: landmarksVisible ? '#A8FF00' : '#FF375F' }]} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>{exercise.nameCs}</Text>
          <Text style={styles.topSubtitle}>Phase 6 part 2 · Native pose detection</Text>
        </View>
      </View>

      {/* Big rep counter center-right */}
      <View style={styles.repCounterBox}>
        <Text style={styles.repNumber}>{reps}</Text>
        <Text style={styles.repLabel}>REPS</Text>
      </View>

      {/* Form score + phase */}
      <View style={styles.infoBox}>
        <Text style={[styles.formScore, { color: formScoreColor(formScore) }]}>
          {formScore}%
        </Text>
        <Text style={styles.phaseName}>{currentPhase}</Text>
      </View>

      {/* Safety alerts */}
      {safetyAlerts.length > 0 && (
        <View style={styles.safetyBox}>
          {safetyAlerts.map((alert, i) => (
            <Text
              key={i}
              style={[
                styles.safetyText,
                { color: alert.severity === 'critical' ? '#FF375F' : '#FF9F0A' },
              ]}
            >
              ⚠ {alert.messageCs}
            </Text>
          ))}
        </View>
      )}

      {/* Start/Stop button */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.primaryBtn, running && styles.primaryBtnActive]}
          onPress={() => {
            if (running) {
              repCounterRef.current.reset();
              setReps(0);
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

      {/* Landmark visibility hint */}
      {!landmarksVisible && running && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>⚠ Postav se celý do záběru kamery</Text>
        </View>
      )}
    </View>
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
