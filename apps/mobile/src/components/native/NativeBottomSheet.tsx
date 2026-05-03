/**
 * Native iOS bottom sheet using @gorhom/bottom-sheet BottomSheetModal.
 * Replaces React Native <Modal> across all screens.
 *
 * Usage:
 *   const ref = useRef<NativeBottomSheetRef>(null);
 *   <NativeBottomSheet ref={ref} snapPoints={['50%','85%']}>
 *     ...content...
 *   </NativeBottomSheet>
 *   ref.current?.present();  // open
 *   ref.current?.dismiss();  // close
 */

import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { v2 } from '../v2/V2';

export interface NativeBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface NativeBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
  onDismiss?: () => void;
  fullHeight?: boolean;
}

export const NativeBottomSheet = forwardRef<NativeBottomSheetRef, NativeBottomSheetProps>(
  function NativeBottomSheet(
    { children, snapPoints, enablePanDownToClose = true, onDismiss, fullHeight = false },
    ref,
  ) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const points = useMemo(() => snapPoints ?? (fullHeight ? ['90%'] : ['50%', '85%']), [snapPoints, fullHeight]);

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={enablePanDownToClose ? 'close' : 'none'}
          opacity={0.55}
        />
      ),
      [enablePanDownToClose],
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={points}
        enablePanDownToClose={enablePanDownToClose}
        onDismiss={onDismiss}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#0a0a0a', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: v2.ghost, width: 44, height: 5 }}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 24 }}>{children}</View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
