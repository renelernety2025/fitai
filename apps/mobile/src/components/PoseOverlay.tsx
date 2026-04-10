/**
 * PoseOverlay — draws skeleton lines + joint dots over camera preview.
 * Uses react-native-svg. Landmarks are in normalized [0,1] coords from ML Kit.
 */

import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import type { PoseLandmarks } from '../lib/pose/types';

interface Props {
  landmarks: PoseLandmarks | null;
  width: number;
  height: number;
  mirrored?: boolean;
}

// Bone connections (MediaPipe BlazePose indices)
const BONES: [number, number][] = [
  // torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // left arm
  [11, 13], [13, 15],
  // right arm
  [12, 14], [14, 16],
  // left leg
  [23, 25], [25, 27],
  // right leg
  [24, 26], [26, 28],
  // feet
  [27, 29], [29, 31], [28, 30], [30, 32],
];

const JOINT_INDICES = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

const BONE_COLOR = '#00d4aa';
const JOINT_COLOR = '#6c63ff';

export function PoseOverlay({ landmarks, width, height, mirrored }: Props) {
  if (!landmarks || landmarks.length < 33) return null;

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

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {BONES.map(([a, b], i) => {
        const x1 = toX(a);
        const y1 = toY(a);
        const x2 = toX(b);
        const y2 = toY(b);
        if (x1 < 0 || x2 < 0) return null;
        return (
          <Line
            key={`bone-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={BONE_COLOR}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.8}
          />
        );
      })}
      {JOINT_INDICES.map((idx) => {
        const cx = toX(idx);
        const cy = toY(idx);
        if (cx < 0) return null;
        return (
          <Circle
            key={`joint-${idx}`}
            cx={cx}
            cy={cy}
            r={6}
            fill={JOINT_COLOR}
            opacity={0.9}
          />
        );
      })}
    </Svg>
  );
}
