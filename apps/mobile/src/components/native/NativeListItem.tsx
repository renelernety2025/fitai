/**
 * Native iOS list item with swipe-actions support.
 * Wraps content in a Swipeable from react-native-gesture-handler.
 *
 * Usage:
 *   <NativeListItem
 *     onPress={open}
 *     rightActions={[{ label: 'Smazat', color: '#FF375F', onPress: del }]}
 *   >
 *     <Text>Item title</Text>
 *   </NativeListItem>
 */

import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { v2 } from '../v2/V2';
import { useHaptic } from './useHaptic';

export interface SwipeAction {
  label: string;
  color?: string;
  textColor?: string;
  onPress: () => void;
}

interface NativeListItemProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

function renderActions(actions: SwipeAction[], align: 'left' | 'right', haptic: ReturnType<typeof useHaptic>) {
  if (actions.length === 0) return null;
  return (
    <View style={{ flexDirection: 'row' }}>
      {actions.map((a, i) => (
        <Pressable
          key={i}
          onPress={() => { haptic.tap(); a.onPress(); }}
          style={({ pressed }) => ({
            backgroundColor: a.color ?? v2.red,
            paddingHorizontal: 24,
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 88,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: a.textColor ?? '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.6 }}>
            {a.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function NativeListItem({
  children,
  onPress,
  onLongPress,
  leftActions = [],
  rightActions = [],
  style,
  disabled,
}: NativeListItemProps) {
  const haptic = useHaptic();
  const hasSwipe = leftActions.length > 0 || rightActions.length > 0;

  const inner = (
    <Pressable
      onPress={() => { if (disabled) return; haptic.tap(); onPress?.(); }}
      onLongPress={() => { if (disabled) return; haptic.press(); onLongPress?.(); }}
      style={({ pressed }) => [
        {
          paddingVertical: 18,
          paddingHorizontal: 24,
          backgroundColor: pressed ? v2.surface : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );

  if (!hasSwipe) return inner;

  return (
    <Swipeable
      renderLeftActions={leftActions.length > 0 ? () => renderActions(leftActions, 'left', haptic) : undefined}
      renderRightActions={rightActions.length > 0 ? () => renderActions(rightActions, 'right', haptic) : undefined}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
    >
      {inner}
    </Swipeable>
  );
}
