/**
 * Standardized error state — message + retry button.
 * Used when data load fails; not for inline form validation errors.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { v2 } from '../v2/V2';
import { useHaptic } from './useHaptic';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Něco se nepovedlo načíst.', onRetry }: ErrorStateProps) {
  const haptic = useHaptic();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 14,
      }}
    >
      <Text style={{ fontSize: 32, opacity: 0.5 }}>⚠</Text>
      <Text
        style={{
          color: v2.muted,
          fontSize: 14,
          lineHeight: 20,
          textAlign: 'center',
          maxWidth: 280,
        }}
      >
        {message}
      </Text>
      {onRetry && (
        <Pressable
          onPress={() => { haptic.tap(); onRetry(); }}
          style={({ pressed }) => ({
            marginTop: 8,
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 999,
            backgroundColor: v2.text,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: '#000', fontSize: 14, fontWeight: '700' }}>Zkusit znovu</Text>
        </Pressable>
      )}
    </View>
  );
}
