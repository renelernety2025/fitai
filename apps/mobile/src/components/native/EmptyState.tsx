/**
 * Standardized empty state — icon + title + body + optional CTA.
 * Feels iOS-native via large quiet typography and ample spacing.
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { v2 } from '../v2/V2';
import { useHaptic } from './useHaptic';

interface EmptyStateProps {
  icon?: string;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  const haptic = useHaptic();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 12,
      }}
    >
      {icon && <Text style={{ fontSize: 48, opacity: 0.4 }}>{icon}</Text>}
      <Text style={{ color: v2.text, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>{title}</Text>
      {body && (
        <Text
          style={{
            color: v2.muted,
            fontSize: 14,
            lineHeight: 20,
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          {body}
        </Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={() => { haptic.tap(); onAction(); }}
          style={({ pressed }) => ({
            marginTop: 12,
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: v2.borderStrong,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ color: v2.text, fontSize: 14, fontWeight: '600' }}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
