/**
 * Standardized loading state — centered spinner with optional label.
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { v2 } from '../v2/V2';

interface LoadingStateProps {
  label?: string;
  inline?: boolean;
}

export function LoadingState({ label, inline = false }: LoadingStateProps) {
  return (
    <View
      style={{
        flex: inline ? undefined : 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 12,
      }}
    >
      <ActivityIndicator color={v2.faint} />
      {label && (
        <Text
          style={{
            color: v2.faint,
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}
