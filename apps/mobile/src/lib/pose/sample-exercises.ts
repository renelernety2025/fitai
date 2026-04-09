/**
 * Sample exercise definitions for mobile pose detection.
 * In production these come from the API (`/api/exercises/:id`) but for
 * the first dev build we hardcode a few so the screen can run standalone.
 */

import type { ExercisePhaseDefinition } from './types';

export const SQUAT_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Start — stojka',
    rules: [
      { joint: 'left_knee', angle_min: 160, angle_max: 180 },
      { joint: 'right_knee', angle_min: 160, angle_max: 180 },
      { joint: 'left_hip', angle_min: 160, angle_max: 180 },
      { joint: 'right_hip', angle_min: 160, angle_max: 180 },
    ],
    feedback_correct: 'Rovně stojíš',
    feedback_wrong: 'Narovnej se',
    minDurationMs: 300,
  },
  {
    name: 'eccentric',
    nameCs: 'Dřepovaní dolů',
    rules: [
      { joint: 'left_knee', angle_min: 80, angle_max: 140 },
      { joint: 'right_knee', angle_min: 80, angle_max: 140 },
      { joint: 'left_hip', angle_min: 80, angle_max: 140 },
      { joint: 'right_hip', angle_min: 80, angle_max: 140 },
    ],
    feedback_correct: 'Klesej pomalu',
    feedback_wrong: 'Hlídej tempo',
    minDurationMs: 500,
  },
  {
    name: 'bottom',
    nameCs: 'Dno dřepu',
    rules: [
      { joint: 'left_knee', angle_min: 60, angle_max: 100 },
      { joint: 'right_knee', angle_min: 60, angle_max: 100 },
      { joint: 'left_hip', angle_min: 60, angle_max: 100 },
      { joint: 'right_hip', angle_min: 60, angle_max: 100 },
    ],
    feedback_correct: 'Dobrá hloubka',
    feedback_wrong: 'Dolů trochu víc',
    minDurationMs: 300,
  },
  {
    name: 'concentric',
    nameCs: 'Tlak nahoru',
    rules: [
      { joint: 'left_knee', angle_min: 100, angle_max: 160 },
      { joint: 'right_knee', angle_min: 100, angle_max: 160 },
      { joint: 'left_hip', angle_min: 100, angle_max: 160 },
      { joint: 'right_hip', angle_min: 100, angle_max: 160 },
    ],
    feedback_correct: 'Tlač patami',
    feedback_wrong: 'Tlač explozivně',
    minDurationMs: 400,
  },
];

export const PUSHUP_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Prkno nahoře',
    rules: [
      { joint: 'left_elbow', angle_min: 150, angle_max: 180 },
      { joint: 'right_elbow', angle_min: 150, angle_max: 180 },
    ],
    feedback_correct: 'Rovné tělo',
    feedback_wrong: 'Narovnej paže',
    minDurationMs: 300,
  },
  {
    name: 'down',
    nameCs: 'Klesej dolů',
    rules: [
      { joint: 'left_elbow', angle_min: 60, angle_max: 110 },
      { joint: 'right_elbow', angle_min: 60, angle_max: 110 },
    ],
    feedback_correct: 'Dobrý tempo',
    feedback_wrong: 'Pomalu',
    minDurationMs: 400,
  },
  {
    name: 'up',
    nameCs: 'Tlak nahoru',
    rules: [
      { joint: 'left_elbow', angle_min: 100, angle_max: 160 },
      { joint: 'right_elbow', angle_min: 100, angle_max: 160 },
    ],
    feedback_correct: 'Tlač explozivně',
    feedback_wrong: 'Dokonči pohyb',
    minDurationMs: 300,
  },
];

export const SAMPLE_EXERCISES = {
  squat: { name: 'Squat', nameCs: 'Dřep', phases: SQUAT_PHASES },
  pushup: { name: 'Push-up', nameCs: 'Klik', phases: PUSHUP_PHASES },
};
