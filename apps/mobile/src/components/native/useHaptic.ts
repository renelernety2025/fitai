/**
 * Semantic haptic feedback helpers.
 * Use throughout interactive elements for native iOS feel.
 */

import { useMemo } from 'react';
import * as Haptics from 'expo-haptics';

interface HapticAPI {
  /** Light tap — buttons, chip selection, any non-destructive interaction */
  tap: () => void;
  /** Medium tap — toggles, switching modes */
  press: () => void;
  /** Heavy tap — deletions, destructive confirmations (use sparingly) */
  heavy: () => void;
  /** Selection change — picker/segmented control change */
  selection: () => void;
  /** Success — purchase complete, save complete, achievement unlocked */
  success: () => void;
  /** Warning — validation failure, soft error */
  warning: () => void;
  /** Error — hard failure, crash recovery */
  error: () => void;
}

export function useHaptic(): HapticAPI {
  return useMemo<HapticAPI>(
    () => ({
      tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
      press: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
      heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}),
      selection: () => Haptics.selectionAsync().catch(() => {}),
      success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
      warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
      error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
    }),
    [],
  );
}
