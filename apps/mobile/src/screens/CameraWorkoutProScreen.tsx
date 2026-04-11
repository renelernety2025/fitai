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
import { PoseGuide } from '../components/PoseGuide';
import type { PoseLandmarks, SafetyAlert, ExercisePhaseDefinition } from '../lib/pose/types';
import { stopVoice } from '../lib/voice-coach';
import { createCoachingEngine, type CoachingCallbacks } from '../lib/pose/coaching-engine';
import { useVoiceInput } from '../lib/voice-input';

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
  const [currentPhaseObj, setCurrentPhaseObj] = useState<ExercisePhaseDefinition | null>(
    exercise?.phases[0] ?? null,
  );
  const [phaseFeedback, setPhaseFeedback] = useState('');
  const [landmarks, setLandmarks] = useState<PoseLandmarks | null>(null);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [poseVisible, setPoseVisible] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [targetReps, setTargetReps] = useState(10);
  const [resting, setResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [lastSetSummary, setLastSetSummary] = useState('');

  const voiceInput = useVoiceInput(selectedKey, formScore, reps);

  const repCounterRef = useRef(
    exercise ? createRepCounter(exercise.phases) : null,
  );
  const coachRef = useRef(
    selectedKey ? createCoachingEngine(selectedKey) : null,
  );
  const lastRepCount = useRef(0);
  const frameCount = useRef(0);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setCurrentPhaseObj(result.currentPhase);
      setPhaseFeedback(
        result.feedback.isCorrect
          ? result.currentPhase.feedback_correct
          : result.feedback.errors[0] ?? '',
      );

      // Coaching: phase change hint
      if (result.currentPhase.nameCs !== phaseName) {
        coachRef.current?.onPhaseChange(
          result.currentPhase.nameCs,
          result.currentPhase.coachingHint,
        );
      }

      if (result.repJustCompleted && result.completedReps > lastRepCount.current) {
        lastRepCount.current = result.completedReps;
        setReps(result.completedReps);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Coaching engine decides what to say
        coachRef.current?.onRepCompleted(result.completedReps, result.formScore);
      }

      if (frameCount.current % 5 === 0) {
        const alerts = checkSafety(lm, exercise?.name ?? '');
        setSafetyAlerts(alerts);
        if (alerts.length > 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          coachRef.current?.onSafetyAlert(alerts);
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
    coachRef.current = createCoachingEngine(selectedKey, {
      onSetComplete: () => {
        // Auto-stop when target reps reached
        setTimeout(() => {
          setRunning(false);
          setLandmarks(null);
          setPoseVisible(false);
          const avg = coachRef.current?.getState().formScores ?? [];
          const avgForm = avg.length > 0
            ? Math.round(avg.reduce((a: number, b: number) => a + b, 0) / avg.length)
            : 0;
          setLastSetSummary(`Set ${currentSet}: ${reps + targetReps} repů, forma ${avgForm}%`);
          setCurrentSet((s) => s + 1);
          startRest();
        }, 2000); // 2s delay to let voice finish
      },
    });
    lastRepCount.current = 0;
    frameCount.current = 0;
    setReps(0);
    setFormScore(100);
    setSafetyAlerts([]);
    setPhaseName(exercise.phases[0]?.nameCs ?? '');
    setPhaseFeedback('');
    setResting(false);
    setLastSetSummary('');
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    coachRef.current.startSet(currentSet, targetReps);
  }, [exercise, selectedKey, currentSet, targetReps]);

  const startRest = useCallback(() => {
    setResting(true);
    setRestSeconds(90);
    restTimerRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          setResting(false);
          return 0;
        }
        coachRef.current?.onRestTick(prev - 1);
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleStop = useCallback(() => {
    setRunning(false);
    setLandmarks(null);
    setPoseVisible(false);
    coachRef.current?.endSet();
    const avg = coachRef.current?.getState().formScores ?? [];
    const avgForm = avg.length > 0
      ? Math.round(avg.reduce((a: number, b: number) => a + b, 0) / avg.length)
      : 0;
    setLastSetSummary(`Set ${currentSet}: ${reps} repů, forma ${avgForm}%`);
    setCurrentSet((s) => s + 1);
    startRest();
  }, [currentSet, reps, startRest]);

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
                <Text style={styles.pickerDesc}>{ex.description}</Text>
                <Text style={styles.pickerMuscles}>
                  {ex.muscles.join(' · ')}
                </Text>
              </View>
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

      {/* Technogym-style guide dots at target joints */}
      <PoseGuide
        landmarks={landmarks}
        currentPhase={currentPhaseObj}
        formScore={formScore}
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
        {currentPhaseObj?.coachingHint && (
          <Text style={styles.coachingHint}>{currentPhaseObj.coachingHint}</Text>
        )}
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

      {/* Rest overlay */}
      {resting && (
        <View style={styles.restOverlay}>
          <Text style={styles.restTitle}>Odpočinek</Text>
          <Text style={styles.restTimer}>{restSeconds}s</Text>
          {lastSetSummary !== '' && (
            <Text style={styles.restSummary}>{lastSetSummary}</Text>
          )}
          <Text style={styles.restHint}>Set {currentSet} za chvíli</Text>
          <Pressable
            style={styles.skipRestBtn}
            onPress={() => {
              if (restTimerRef.current) clearInterval(restTimerRef.current);
              setResting(false);
              setRestSeconds(0);
            }}
          >
            <Text style={styles.skipRestText}>Přeskočit</Text>
          </Pressable>
        </View>
      )}

      {/* Set info + target reps */}
      {!running && !resting && exercise && (
        <View style={styles.setInfoBox}>
          <Text style={styles.setInfoLabel}>Set {currentSet}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <Pressable onPress={() => setTargetReps((r) => Math.max(1, r - 1))}>
              <Text style={styles.repAdjust}>-</Text>
            </Pressable>
            <Text style={styles.targetRepsText}>{targetReps} repů</Text>
            <Pressable onPress={() => setTargetReps((r) => r + 1)}>
              <Text style={styles.repAdjust}>+</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Voice input indicator */}
      {voiceInput.listening && (
        <View style={styles.voiceIndicator}>
          <Text style={styles.voiceIndicatorText}>Poslouchám...</Text>
          {voiceInput.transcript !== '' && (
            <Text style={styles.voiceTranscript}>{voiceInput.transcript}</Text>
          )}
        </View>
      )}
      {voiceInput.answering && (
        <View style={styles.voiceIndicator}>
          <Text style={styles.voiceIndicatorText}>Přemýšlím...</Text>
        </View>
      )}

      <View style={styles.bottomBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Mic button (during workout or rest) */}
          {(running || resting) && (
            <Pressable
              style={[styles.micBtn, voiceInput.listening && styles.micBtnActive]}
              onPress={() => {
                console.log('[MIC] Pressed, listening:', voiceInput.listening);
                if (voiceInput.listening) {
                  voiceInput.stopListening();
                } else {
                  voiceInput.startListening();
                }
              }}
              hitSlop={16}
            >
              <Text style={styles.micBtnText}>
                {voiceInput.listening ? '...' : 'MIC'}
              </Text>
            </Pressable>
          )}
          <Pressable
          style={[styles.primaryBtn, running && styles.primaryBtnActive]}
          onPress={running ? handleStop : resting ? undefined : handleStart}
          hitSlop={10}
          disabled={resting}
        >
          <Text
            style={[
              styles.primaryBtnText,
              running && styles.primaryBtnTextActive,
            ]}
          >
            {running ? 'STOP' : `START SET ${currentSet}`}
          </Text>
        </Pressable>
        </View>
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
  pickerDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  pickerMuscles: {
    color: '#6c63ff',
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 4,
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
  coachingHint: {
    color: 'rgba(108,99,255,0.8)',
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  feedbackText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
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

  // Rest overlay
  restOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  restTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  restTimer: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '800',
    letterSpacing: -3,
  },
  restSummary: {
    color: '#00d4aa',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  restHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  skipRestBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipRestText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },

  // Set info
  setInfoBox: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  setInfoLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  targetRepsText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  repAdjust: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 32,
    fontWeight: '300',
    paddingHorizontal: 12,
  },

  // Mic button
  micBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  micBtnActive: {
    backgroundColor: 'rgba(108,99,255,0.4)',
    borderColor: '#6c63ff',
  },
  micBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Voice indicator
  voiceIndicator: {
    position: 'absolute',
    bottom: 130,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(108,99,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.4)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  voiceIndicatorText: {
    color: '#6c63ff',
    fontSize: 14,
    fontWeight: '600',
  },
  voiceTranscript: {
    color: '#fff',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
});
