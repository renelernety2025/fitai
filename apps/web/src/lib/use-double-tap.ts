import { useRef, useCallback } from 'react';

export function useDoubleTap(callback: () => void, delay = 300) {
  const lastTap = useRef(0);
  return useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      callback();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [callback, delay]);
}
