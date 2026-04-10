/**
 * CameraWorkoutProScreen — real-time pose detection workout
 *
 * Uses react-native-vision-camera v4 + custom ML Kit Pose frame processor
 * for automatic rep counting, form scoring, and safety alerts.
 * Pipeline: ML Kit → mlkitAdapter → repCounter → feedbackEngine → UI.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useRunOnJS } from 'react-native-worklets-core';

import { SAMPLE_EXERCISES, EXERCISE_LIST } from '../lib/pose/sample-exercises';
import type { ExerciseDefinition } from '../lib/pose/sample-exercises';
import { mlkitToLandmarks, hasVisiblePose } from '../lib/pose/mlkit-adapter';
import type { MlkitPose } from '../lib/pose/mlkit-adapter';
import { createRepCounter, type RepFrameResult } from '../lib/pose/rep-counter';
import { checkSafety } from '../lib/pose/safety-checker';
import { detectPose } from '../lib/pose/frame-processor';
import { PoseOverlay } from '../components/PoseOverlay';
import type { PoseLandmarks, SafetyAlert } from '../lib/pose/types';

export function CameraWorkoutProScreen({ route, navigation }: any) {
  const initialKey: string = route?.params?.exercise || '';
  const [selectedKey, setSelectedKey] = useState(initialKey);
  const exercise: ExerciseDefinition | null = selectedKey
    ? SAMPLE_EXERCISES[selectedKey] ?? null
    : null;

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const { width, height } = useWindowDimensions();

  const [running, setRunning] = useState(false);
  const [reps, setReps] = useState(0);
  const [formScore, setFormScore] = useState(100);
  const [phaseName, setPhaseName] = useState(exercise?.phases[0]?.nameCs ?? '');
  const [phaseFeedback, setPhaseFeedback] = useState('');
  const [landmarks, setLandmarks] = useState<PoseLandmarks | null>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [poseVisible, setPoseVisible] = useState(false);

  const repCounterRef = useRef(
    exercise ? createRepCounter(exercise.phases) : null,
  );
  const lastRepCount = useRef(0);
  const frameCount = useRef(0);

  const handlePose = useCallback(
    (pose: MlkitPose) => {
      if (!running || !exercise || !repCounterRef.current) return;

      frameCount.current++;

      const lm = mlkitToLandmarks(pose);
      const visible = hasVisiblePose(lm);
      setPoseVisible(visible);

      // Always update landmarks for skeleton overlay (even partial)
      if (frameCount.current % 2 === 0) {
        setLandmarks(visible ? lm : null);
      }

      // Process even with partial visibility — rep counter skips invisible joints
      if (!visible) return;

      const now = Date.now();
      const result: RepFrameResult = repCounterRef.current.processFrame(lm, now);

      setFormScore(result.formScore);
      setPhaseName(result.currentPhase.nameCs);
      setPhaseFeedback(
        result.feedback.isCorrect
          ? result.currentPhase.feedback_correct
          : result.feedback.errors[0] ?? '',
      );

      if (result.repJustCompleted && result.completedReps > lastRepCount.current) {
        lastRepCount.current = result.completedReps;
        setReps(result.completedReps);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (frameCount.current % 5 === 0) {
        const alerts = checkSafety(lm, exercise.name);
        setSafetyAlerts(alerts);
        if (alerts.some((a) => a.severity === 'critical')) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    },
    [running, exercise?.name],
  );

  const onPose = useRunOnJS(
    (pose: MlkitPose) => {
      handlePose(pose);
    },
    [handlePose],
  );

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      const pose = detectPose(frame);
      if (pose) {
        onPose(pose);
      }
    },
    [onPose],
  );

  const handleStart = useCallback(() => {
    if (!exercise) return;
    repCounterRef.current = createRepCounter(exercise.phases);
    lastRepCount.current = 0;
    frameCount.current = 0;
    setReps(0);
    setFormScore(100);
    setSafetyAlerts([]);
    setPhaseName(exercise.phases[0]?.nameCs ?? '');
    setPhaseFeedback('');
    setRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [exercise]);

  const handleStop = useCallback(() => {
    setRunning(false);
    setLandmarks(null);
    setPoseVisible(false);
  }, []);

  // Exercise picker
  if (!exercise) {
    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={16}>
            <Text style={styles.pickerBack}>← Zpět</Text>
          </Pressable>
          <Text style={styles.pickerTitle}>Vyber cvik</Text>
          <View style={{ width: 50 }} />
        </View>
        <Text style={styles.pickerSubtitle}>
          Pose detection automaticky počítá repy a hodnotí formu
        </Text>
        <ScrollView style={styles.pickerList} contentContainerStyle={{ paddingBottom: 40 }}>
          {EXERCISE_LIST.map((ex) => (
            <Pressable
              key={ex.key}
              style={styles.pickerCard}
              onPress={() => setSelectedKey(ex.key)}
            >
              <Text style={styles.pickerIcon}>{ex.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerName}>{ex.nameCs}</Text>
                <Text style={styles.pickerEn}>{ex.name}</Text>
              </View>
              <Text style={styles.pickerPhases}>
                {ex.phases.length} fází
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Kamera — povolení</Text>
        <Text style={styles.overlayText}>
          FitAI potřebuje přístup ke kameře pro real-time pose detection.
        </Text>
        <Pressable style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Povolit kameru</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>Kamera nedostupná</Text>
        <Text style={styles.overlayText}>Přední kamera nebyla nalezena.</Text>
      </View>
    );
  }

  const scoreColor =
    formScore >= 80 ? '#00d4aa' : formScore >= 50 ? '#FFB800' : '#FF375F';

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
      />

      <PoseOverlay
        landmarks={landmarks}
        width={width}
        height={height}
        mirrored
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            if (running) {
              handleStop();
            } else {
              setSelectedKey('');
            }
          }}
          style={styles.closeBtn}
          hitSlop={16}
        >
          <Text style={styles.closeBtnText}>{running ? '✕' : '←'}</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>{exercise.nameCs}</Text>
          <Text style={styles.topSubtitle}>
            {running ? 'POSE DETECTION ACTIVE' : 'READY'}
          </Text>
        </View>
      </View>

      {running && !poseVisible && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Namiř kameru na cvičící část těla
          </Text>
        </View>
      )}

      <View style={styles.repCounterBox}>
        <Text style={styles.repNumber}>{reps}</Text>
        <Text style={styles.repLabel}>REPS</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.phaseName}>{phaseName}</Text>
        <Text style={[styles.phaseHint, { color: scoreColor }]}>
          {running ? `Form: ${formScore}%` : 'Připraven'}
        </Text>
        {phaseFeedback !== '' && (
          <Text style={styles.feedbackText}>{phaseFeedback}</Text>
        )}
      </View>

      {safetyAlerts.length > 0 && (
        <View style={styles.alertBox}>
          {safetyAlerts.map((alert, i) => (
            <Text
              key={`alert-${i}`}
              style={[
                styles.alertText,
                alert.severity === 'critical' && styles.alertCritical,
              ]}
            >
              {alert.severity === 'critical' ? '!! ' : '* '}
              {alert.messageCs}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.bottomBar} pointerEvents="box-none">
        <Pressable
          style={[styles.primaryBtn, running && styles.primaryBtnActive]}
          onPress={running ? handleStop : handleStart}
          hitSlop={10}
        >
          <Text
            style={[
              styles.primaryBtnText,
              running && styles.primaryBtnTextActive,
            ]}
          >
            {running ? 'STOP' : 'START SET'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Exercise picker
  pickerContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pickerBack: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  pickerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pickerSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerList: { flex: 1 },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  pickerIcon: { fontSize: 28 },
  pickerName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  pickerEn: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  pickerPhases: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Camera workout
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
  permButton: {
    marginTop: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  permButtonText: { color: '#000', fontSize: 14, fontWeight: '600' },
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
  topTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  topSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  warningBox: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,184,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.5)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  warningText: {
    color: '#FFB800',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  repCounterBox: {
    position: 'absolute',
    top: '35%',
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
    top: '35%',
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 16,
    borderRadius: 16,
    minWidth: 140,
    maxWidth: 200,
  },
  phaseName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  phaseHint: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  feedbackText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 6,
  },
  alertBox: {
    position: 'absolute',
    bottom: 130,
    left: 20,
    right: 20,
    gap: 6,
  },
  alertText: {
    backgroundColor: 'rgba(255,184,0,0.2)',
    color: '#FFB800',
    fontSize: 14,
    fontWeight: '700',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
    overflow: 'hidden',
  },
  alertCritical: {
    backgroundColor: 'rgba(255,55,95,0.2)',
    color: '#FF375F',
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
  primaryBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  primaryBtnTextActive: { color: '#fff' },
});
