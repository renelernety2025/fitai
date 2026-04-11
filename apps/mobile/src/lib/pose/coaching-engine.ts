/**
 * CoachingEngine — adaptive AI coaching brain.
 * Decides WHAT to say and WHEN based on workout context.
 *
 * Coaching styles adapt to performance:
 * - Good form (>85%) → calm praise, minimal interruption
 * - Declining form → specific corrections, more frequent
 * - Near end of set → motivational push
 * - Safety issue → urgent, immediate
 */

import { speak } from '../voice-coach';
import {
  repCount,
  praise,
  pushMotivation,
  formWarning,
  exerciseCorrection,
  safetyVoice,
  setFinished,
  setStart,
  restTip,
  restPrepare,
  phaseHint,
  milestone,
} from './coaching-phrases';
import type { SafetyAlert } from './types';

interface CoachingState {
  exerciseKey: string;
  currentSet: number;
  targetReps: number;
  completedReps: number;
  formScores: number[];
  lastSpokenEvent: string;
  lastPhase: string;
  setStartedAt: number;
}

export function createCoachingEngine(exerciseKey: string) {
  const state: CoachingState = {
    exerciseKey,
    currentSet: 0,
    targetReps: 10,
    completedReps: 0,
    formScores: [],
    lastSpokenEvent: '',
    lastPhase: '',
    setStartedAt: 0,
  };

  function startSet(setNumber: number, targetReps: number) {
    state.currentSet = setNumber;
    state.targetReps = targetReps;
    state.completedReps = 0;
    state.formScores = [];
    state.lastSpokenEvent = '';
    state.lastPhase = '';
    state.setStartedAt = Date.now();
    speak(setStart(setNumber, targetReps));
  }

  function onRepCompleted(repNumber: number, formScore: number) {
    state.completedReps = repNumber;
    state.formScores.push(formScore);

    const repsLeft = state.targetReps - repNumber;
    const avgForm = average(state.formScores);
    const recentTrend = formTrend(state.formScores);

    // Priority 1: Milestone celebration (every 5 reps)
    if (repNumber % 5 === 0 && repNumber > 0) {
      speak(milestone(repNumber));
      state.lastSpokenEvent = 'milestone';
      return;
    }

    // Priority 2: Near end of set — motivational push
    if (repsLeft > 0 && repsLeft <= 3 && state.targetReps > 5) {
      speak(pushMotivation(repsLeft));
      state.lastSpokenEvent = 'push';
      return;
    }

    // Priority 3: Set finished
    if (repsLeft <= 0) {
      speak(setFinished(repNumber, Math.round(avgForm)));
      state.lastSpokenEvent = 'setFinished';
      return;
    }

    // Priority 4: Form declining over last 3 reps
    if (recentTrend === 'declining' && state.lastSpokenEvent !== 'formWarn') {
      speak(formWarning());
      state.lastSpokenEvent = 'formWarn';
      return;
    }

    // Priority 5: Good form praise (not every rep — every 3rd with good form)
    if (formScore >= 85 && repNumber % 3 === 0) {
      const intensity = avgForm >= 80 ? 'calm' : 'energetic';
      speak(praise(intensity));
      state.lastSpokenEvent = 'praise';
      return;
    }

    // Priority 6: Bad form correction (specific to exercise)
    if (formScore < 50 && state.lastSpokenEvent !== 'correction') {
      speak(exerciseCorrection(state.exerciseKey));
      state.lastSpokenEvent = 'correction';
      return;
    }

    // Priority 7: Count rep (every rep not covered above)
    speak(repCount(repNumber));
    state.lastSpokenEvent = 'count';
  }

  function onSafetyAlert(alerts: SafetyAlert[]) {
    const critical = alerts.find((a) => a.severity === 'critical');
    if (critical) {
      speak(safetyVoice(critical.messageCs));
      state.lastSpokenEvent = 'safety';
    } else if (alerts.length > 0 && state.lastSpokenEvent !== 'safety') {
      speak(safetyVoice(alerts[0].messageCs));
      state.lastSpokenEvent = 'safety';
    }
  }

  function onPhaseChange(phaseName: string, coachingHintText?: string) {
    if (phaseName === state.lastPhase) return;
    state.lastPhase = phaseName;

    // Only speak phase hints at start of set (first 3 reps)
    // After that, user knows the movement
    if (state.completedReps < 3 && coachingHintText) {
      speak(phaseHint(phaseName, coachingHintText));
      state.lastSpokenEvent = 'phaseHint';
    }
  }

  function onRestTick(secondsLeft: number) {
    if (secondsLeft === 60) speak(restTip());
    if (secondsLeft === 10) speak(restPrepare());
  }

  function endSet() {
    if (state.completedReps > 0 && state.lastSpokenEvent !== 'setFinished') {
      const avg = Math.round(average(state.formScores));
      speak(setFinished(state.completedReps, avg));
    }
  }

  return {
    startSet,
    onRepCompleted,
    onSafetyAlert,
    onPhaseChange,
    onRestTick,
    endSet,
    getState: () => ({ ...state }),
  };
}

function average(arr: number[]): number {
  if (arr.length === 0) return 100;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function formTrend(scores: number[]): 'improving' | 'stable' | 'declining' {
  if (scores.length < 3) return 'stable';
  const last3 = scores.slice(-3);
  const prev3 = scores.slice(-6, -3);
  if (prev3.length === 0) return 'stable';

  const lastAvg = average(last3);
  const prevAvg = average(prev3);

  if (lastAvg < prevAvg - 10) return 'declining';
  if (lastAvg > prevAvg + 10) return 'improving';
  return 'stable';
}
