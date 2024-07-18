/* eslint-disable @typescript-eslint/no-explicit-any */
import { throttle, DebouncedFunc } from 'lodash';
import { useCallback } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): DebouncedFunc<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(throttle<T>(func, delay), []);
}
