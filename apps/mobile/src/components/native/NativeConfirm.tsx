/**
 * Native iOS confirmation bottom sheet.
 * Replaces Alert.alert(title, message, [{text, onPress}, {text:'Cancel'}]) flows.
 *
 * Usage (declarative):
 *   <NativeConfirm
 *     visible={showConfirm}
 *     title="Smazat příspěvek?"
 *     message="Tato akce je nevratná."
 *     confirmLabel="Smazat"
 *     destructive
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { v2 } from '../v2/V2';
import { useHaptic } from './useHaptic';
import { NativeBottomSheet, NativeBottomSheetRef } from './NativeBottomSheet';

interface NativeConfirmProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NativeConfirm({
  visible,
  title,
  message,
  confirmLabel = 'Potvrdit',
  cancelLabel = 'Zrušit',
  destructive = false,
  onConfirm,
  onCancel,
}: NativeConfirmProps) {
  const sheetRef = useRef<NativeBottomSheetRef>(null);
  const haptic = useHaptic();

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  return (
    <NativeBottomSheet ref={sheetRef} snapPoints={[message ? 280 : 220]} onDismiss={onCancel}>
      <View style={{ paddingTop: 8, gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: v2.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
          {message && (
            <Text style={{ color: v2.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>{message}</Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Pressable
            onPress={() => { haptic.tap(); onCancel(); }}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 16,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: v2.borderStrong,
              alignItems: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ color: v2.text, fontSize: 14, fontWeight: '600' }}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            onPress={() => { destructive ? haptic.warning() : haptic.success(); onConfirm(); }}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 16,
              borderRadius: 999,
              backgroundColor: destructive ? v2.red : v2.text,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                color: destructive ? '#fff' : '#000',
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              {confirmLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </NativeBottomSheet>
  );
}
