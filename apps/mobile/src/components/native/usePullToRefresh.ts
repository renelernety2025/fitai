/**
 * Standardized pull-to-refresh hook.
 * Returns RefreshControl-compatible {refreshing, onRefresh} pair.
 */

import { useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';

export interface PullToRefresh {
  refreshing: boolean;
  onRefresh: () => void;
}

export function usePullToRefresh(loadFn: () => Promise<unknown>): PullToRefresh {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await loadFn();
    } finally {
      setRefreshing(false);
    }
  }, [loadFn]);

  return { refreshing, onRefresh };
}
