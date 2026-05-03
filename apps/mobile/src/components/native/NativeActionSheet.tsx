/**
 * Native iOS ActionSheet wrapper.
 * Use for menu actions — share, delete, edit, report.
 * On Android falls back to a simple list (TODO if needed).
 */

import { ActionSheetIOS, Platform, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface ActionSheetOptions {
  title?: string;
  message?: string;
  /** Visible labels for each action. Last is conventionally "Cancel". */
  options: string[];
  /** Index of the cancel option (usually options.length - 1). */
  cancelIndex?: number;
  /** Index of destructive option (red text on iOS). */
  destructiveIndex?: number;
  /** Called with selected index, or cancelIndex if dismissed. */
  onSelect: (index: number) => void;
}

export function showActionSheet({
  title,
  message,
  options,
  cancelIndex = options.length - 1,
  destructiveIndex,
  onSelect,
}: ActionSheetOptions) {
  Haptics.selectionAsync().catch(() => {});

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        message,
        options,
        cancelButtonIndex: cancelIndex,
        destructiveButtonIndex: destructiveIndex,
        userInterfaceStyle: 'dark',
      },
      onSelect,
    );
    return;
  }

  // Android fallback — simple Alert with buttons (rare, mobile is iOS-first)
  Alert.alert(
    title ?? '',
    message,
    options.map((label, i) => ({
      text: label,
      style: i === destructiveIndex ? 'destructive' : i === cancelIndex ? 'cancel' : 'default',
      onPress: () => onSelect(i),
    })),
    { cancelable: true, onDismiss: () => onSelect(cancelIndex) },
  );
}
