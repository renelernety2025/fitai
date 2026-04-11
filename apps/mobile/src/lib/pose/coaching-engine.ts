/**
 * CoachingEngine v2 — adaptive AI coaching brain.
 * Decides WHAT to say and WHEN based on workout context.
 *
 * Features:
 * - Per-rep detailed coaching (what to feel, where to push)
 * - Exercise-specific corrections and motivation
 * - Form trend detection (improving/declining)
 * - Auto set completion at target reps
 * - Deviation detection (wrong exercise movement)
 * - Rest phase conversation
 * - Adaptive intensity based on performance
 */

import { speak } from '../voice-coach';
import {
  repCount,
  praise,
  pushMotivation,
  formWarning,
  exerciseCorrection,
  perRepCoaching,
  muscleFocus,
  exerciseMotivation,
  deviationWarning,
  safetyVoice,
  setFinished,
  setStart,
  restTip,
  restConversation,
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
  consecutiveLowForm: number;
  consecutiveNoRep: number;
  setCompleted: boolean;
}

export interface CoachingCallbacks {
  onSetComplete?: (reps: number, avgForm: number) => void;
}

export function createCoachingEngine(
  exerciseKey: string,
  callbacks?: CoachingCallbacks,
) {
  const state: CoachingState = {
    exerciseKey,
    currentSet: 0,
    targetReps: 10,
    completedReps: 0,
    formScores: [],
    lastSpokenEvent: '',
    lastPhase: '',
    setStartedAt: 0,
    consecutiveLowForm: 0,
    consecutiveNoRep: 0,
    setCompleted: false,
  };

  function startSet(setNumber: number, targetReps: number) {
    state.currentSet = setNumber;
    state.targetReps = targetReps;
    state.completedReps = 0;
    state.formScores = [];
    state.lastSpokenEvent = '';
    state.lastPhase = '';
    state.setStartedAt = Date.now();
    state.consecutiveLowForm = 0;
    state.consecutiveNoRep = 0;
    state.setCompleted = false;
    speak(setStart(setNumber, targetReps));
  }

  function onRepCompleted(repNumber: number, formScore: number) {
    if (state.setCompleted) return;

    state.completedReps = repNumber;
    state.formScores.push(formScore);
    state.consecutiveNoRep = 0;

    // Track consecutive low form
    if (formScore < 50) {
      state.consecutiveLowForm++;
    } else {
      state.consecutiveLowForm = 0;
    }

    const repsLeft = state.targetReps - repNumber;
    const avgForm = average(state.formScores);
    const recentTrend = formTrend(state.formScores);

    // Priority 1: Target reached → auto complete set
    if (repsLeft <= 0) {
      state.setCompleted = true;
      speak(setFinished(repNumber, Math.round(avgForm), state.currentSet));
      callbacks?.onSetComplete?.(repNumber, Math.round(avgForm));
      return;
    }

    // Priority 2: Milestone (every 5)
    if (repNumber % 5 === 0 && repNumber > 0) {
      speak(milestone(repNumber));
      state.lastSpokenEvent = 'milestone';
      return;
    }

    // Priority 3: Near end — motivational push
    if (repsLeft <= 3 && state.targetReps > 5) {
      speak(pushMotivation(repsLeft));
      state.lastSpokenEvent = 'push';
      return;
    }

    // Priority 4: Consecutive low form (3+) → strong warning
    if (state.consecutiveLowForm >= 3 && state.lastSpokenEvent !== 'strongWarn') {
      speak('Stop. Forma je špatná. Zpomal, zkontroluj pozici a pokračuj čistě.');
      state.lastSpokenEvent = 'strongWarn';
      return;
    }

    // Priority 5: Form declining trend → warning
    if (recentTrend === 'declining' && state.lastSpokenEvent !== 'formWarn') {
      speak(formWarning());
      state.lastSpokenEvent = 'formWarn';
      return;
    }

    // Priority 6: Bad form → exercise-specific correction
    if (formScore < 50 && state.lastSpokenEvent !== 'correction') {
      speak(exerciseCorrection(state.exerciseKey));
      state.lastSpokenEvent = 'correction';
      return;
    }

    // Priority 7: Every 3rd rep with good form → per-rep coaching (what to feel)
    if (formScore >= 70 && repNumber % 3 === 0) {
      const coaching = perRepCoaching(state.exerciseKey);
      if (coaching) {
        speak(coaching);
        state.lastSpokenEvent = 'perRep';
        return;
      }
    }

    // Priority 8: Good form praise (every 4th rep)
    if (formScore >= 85 && repNumber % 4 === 0) {
      const intensity = avgForm >= 80 ? 'calm' : 'energetic';
      speak(praise(intensity));
      state.lastSpokenEvent = 'praise';
      return;
    }

    // Priority 9: Muscle focus hint (rep 2 and 7)
    if ((repNumber === 2 || repNumber === 7) && formScore >= 60) {
      const mf = muscleFocus(state.exerciseKey);
      if (mf) {
        speak(mf);
        state.lastSpokenEvent = 'muscleFocus';
        return;
      }
    }

    // Priority 10: Exercise motivation (rep 4)
    if (repNumber === 4) {
      speak(exerciseMotivation(state.exerciseKey));
      state.lastSpokenEvent = 'motivation';
      return;
    }

    // Default: count rep
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

    // Speak hints for first 3 reps, then only on bad form
    if (state.completedReps < 3 && coachingHintText) {
      speak(phaseHint(phaseName, coachingHintText));
      state.lastSpokenEvent = 'phaseHint';
    }
  }

  function onNoMovement() {
    state.consecutiveNoRep++;
    // If no rep detected for 10 seconds worth of checks (~50 frames)
    if (state.consecutiveNoRep === 50 && !state.setCompleted) {
      speak(deviationWarning(state.exerciseKey));
      state.consecutiveNoRep = 0;
    }
  }

  function onRestTick(secondsLeft: number) {
    if (secondsLeft === 60) {
      const avgForm = average(state.formScores);
      speak(restConversation(state.currentSet, Math.round(avgForm), state.exerciseKey));
    }
    if (secondsLeft === 30) speak(restTip());
    if (secondsLeft === 10) speak(restPrepare());
  }

  function endSet() {
    if (state.completedReps > 0 && !state.setCompleted) {
      const avg = Math.round(average(state.formScores));
      speak(setFinished(state.completedReps, avg, state.currentSet));
      state.setCompleted = true;
    }
  }

  return {
    startSet,
    onRepCompleted,
    onSafetyAlert,
    onPhaseChange,
    onNoMovement,
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
