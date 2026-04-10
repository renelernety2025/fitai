/**
 * PoseGuide — Technogym-style target dots for exercise guidance.
 * Shows pulsing circles at target joint positions for the current phase.
 * User moves their body to align with the dots.
 */

import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import type { PoseLandmarks } from '../lib/pose/types';
import type { ExercisePhaseDefinition } from '../lib/pose/types';
import { JOINT_MAP } from '../lib/pose/feedback-engine';

interface Props {
  landmarks: PoseLandmarks | null;
  currentPhase: ExercisePhaseDefinition | null;
  formScore: number;
  width: number;
  height: number;
  mirrored?: boolean;
}

// Target angle → approximate target position offset for the "middle" joint
// We show a dot at the joint that needs to move, colored by how close they are
const GUIDE_COLOR_GOOD = '#00d4aa';
const GUIDE_COLOR_MID = '#FFB800';
const GUIDE_COLOR_BAD = '#FF375F';

export function PoseGuide({
  landmarks,
  currentPhase,
  formScore,
  width,
  height,
  mirrored,
}: Props) {
  if (!landmarks || !currentPhase || currentPhase.rules.length === 0) {
    return null;
  }

  function toX(idx: number): number {
    const lm = landmarks![idx];
    if (!lm || (lm.visibility ?? 0) < 0.3) return -100;
    const x = lm.x * width;
    return mirrored ? width - x : x;
  }

  function toY(idx: number): number {
    const lm = landmarks![idx];
    if (!lm || (lm.visibility ?? 0) < 0.3) return -100;
    return lm.y * height;
  }

  // For each rule in the current phase, show a guide dot at the "middle" joint
  // (the joint whose angle is being measured — index [1] in the JOINT_MAP triple)
  const dots: { cx: number; cy: number; color: string; size: number }[] = [];

  for (const rule of currentPhase.rules) {
    const indices = JOINT_MAP[rule.joint];
    if (!indices) continue;

    const jointIdx = indices[1]; // middle joint (the one that bends)
    const cx = toX(jointIdx);
    const cy = toY(jointIdx);
    if (cx < 0) continue;

    // Color based on how close the angle is to the target range
    const color =
      formScore >= 80
        ? GUIDE_COLOR_GOOD
        : formScore >= 50
          ? GUIDE_COLOR_MID
          : GUIDE_COLOR_BAD;

    dots.push({ cx, cy, color, size: 18 });
  }

  if (dots.length === 0) return null;

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {dots.map((dot, i) => (
        <React.Fragment key={`guide-${i}`}>
          {/* Outer pulse ring */}
          <Circle
            cx={dot.cx}
            cy={dot.cy}
            r={dot.size + 8}
            fill="none"
            stroke={dot.color}
            strokeWidth={2}
            opacity={0.3}
          />
          {/* Main guide dot */}
          <Circle
            cx={dot.cx}
            cy={dot.cy}
            r={dot.size}
            fill={dot.color}
            opacity={0.5}
          />
          {/* Inner dot */}
          <Circle
            cx={dot.cx}
            cy={dot.cy}
            r={6}
            fill="#FFF"
            opacity={0.8}
          />
        </React.Fragment>
      ))}
    </Svg>
  );
}
