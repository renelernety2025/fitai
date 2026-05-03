/**
 * Frosted glass overlay using expo-blur.
 * Use as backdrop for sheets/modals/HUD elements.
 */

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface NativeBlurOverlayProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'systemMaterialDark' | 'systemMaterialLight';
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function NativeBlurOverlay({
  intensity = 60,
  tint = 'systemMaterialDark',
  style,
  children,
}: NativeBlurOverlayProps) {
  return (
    <BlurView intensity={intensity} tint={tint} style={{ ...StyleSheet.absoluteFillObject, ...(style || {}) }}>
      {children}
    </BlurView>
  );
}
