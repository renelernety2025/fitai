import type { PoseLandmarks } from './pose-detection';
import type { ExercisePhaseDefinition, RepDataEntry } from '@fitai/shared';
import { calculateAngle, JOINT_MAP, type PoseFeedback } from './feedback-engine';

const TOLERANCE = 15;
const CONFIRM_FRAMES = 3;

export interface RepState {
  currentPhase: number;
  phaseEnteredAt: number;
  completedReps: number;
  partialRep: boolean;
  currentRepScores: number[];
}

export interface RepFrameResult {
  currentPhase: ExercisePhaseDefinition;
  phaseIndex: number;
  formScore: number;
  repJustCompleted: boolean;
  completedReps: number;
  lastRepData: RepDataEntry | null;
  isPartialRep: boolean;
  feedback: PoseFeedback;
}

function scorePhase(landmarks: PoseLandmarks, rules: ExercisePhaseDefinition['rules']): number {
  if (rules.length === 0) return 100;
  let correct = 0;
  for (const rule of rules) {
    const indices = JOINT_MAP[rule.joint];
    if (!indices) { correct++; continue; }
    const angle = calculateAngle(landmarks[indices[0]], landmarks[indices[1]], landmarks[indices[2]]);
    if (angle >= rule.angle_min - TOLERANCE && angle <= rule.angle_max + TOLERANCE) {
      correct++;
    }
  }
  return Math.round((correct / rules.length) * 100);
}

function matchesPhase(landmarks: PoseLandmarks, phase: ExercisePhaseDefinition): boolean {
  return scorePhase(landmarks, phase.rules) >= 60;
}

export function createRepCounter(phases: ExercisePhaseDefinition[]) {
  let state: RepState = {
    currentPhase: 0,
    phaseEnteredAt: 0,
    completedReps: 0,
    partialRep: false,
    currentRepScores: [],
  };

  let confirmBuffer: number[] = [];
  let repStartTime = 0;

  function processFrame(landmarks: PoseLandmarks, timestampMs: number): RepFrameResult {
    const current = phases[state.currentPhase];
    const formScore = scorePhase(landmarks, current.rules);
    let repJustCompleted = false;
    let lastRepData: RepDataEntry | null = null;

    // Check if next phase matches
    const nextIdx = (state.currentPhase + 1) % phases.length;
    const nextPhase = phases[nextIdx];

    if (matchesPhase(landmarks, nextPhase)) {
      confirmBuffer.push(nextIdx);
    } else {
      confirmBuffer = [];
    }

    // Confirm transition after CONFIRM_FRAMES consecutive matches
    const minDuration = current.minDurationMs ?? 200;
    const elapsed = timestampMs - state.phaseEnteredAt;

    if (
      confirmBuffer.length >= CONFIRM_FRAMES &&
      confirmBuffer.every((i) => i === nextIdx) &&
      elapsed >= minDuration
    ) {
      // Save score for current phase
      state.currentRepScores.push(formScore);

      // Transition
      if (nextIdx === 0 && state.currentPhase !== 0) {
        // Completed a full cycle = 1 rep
        state.completedReps++;
        repJustCompleted = true;

        const avgScore = state.currentRepScores.length
          ? Math.round(state.currentRepScores.reduce((a, b) => a + b, 0) / state.currentRepScores.length)
          : 0;

        lastRepData = {
          repNumber: state.completedReps,
          formScore: avgScore,
          phaseScores: [...state.currentRepScores],
          durationMs: timestampMs - repStartTime,
          partialRep: state.partialRep,
        };

        state.currentRepScores = [];
        state.partialRep = false;
        repStartTime = timestampMs;
      }

      state.currentPhase = nextIdx;
      state.phaseEnteredAt = timestampMs;
      confirmBuffer = [];
    }

    // Check for backward movement (partial rep)
    if (state.currentPhase > 0) {
      const prevIdx = state.currentPhase - 1;
      if (matchesPhase(landmarks, phases[prevIdx]) && !matchesPhase(landmarks, nextPhase)) {
        state.partialRep = true;
      }
    }

    const errors: string[] = [];
    if (formScore < 70) errors.push(current.feedback_wrong);

    return {
      currentPhase: current,
      phaseIndex: state.currentPhase,
      formScore,
      repJustCompleted,
      completedReps: state.completedReps,
      lastRepData,
      isPartialRep: state.partialRep,
      feedback: {
        isCorrect: formScore >= 70,
        errors,
        score: formScore,
        currentPoseName: current.nameCs,
      },
    };
  }

  function getState(): RepState {
    return { ...state };
  }

  function reset() {
    state = {
      currentPhase: 0,
      phaseEnteredAt: 0,
      completedReps: 0,
      partialRep: false,
      currentRepScores: [],
    };
    confirmBuffer = [];
    repStartTime = 0;
  }

  return { processFrame, getState, reset };
}
