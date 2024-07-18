/* eslint-disable @typescript-eslint/no-explicit-any */
import { debounce, DebouncedFunc } from 'lodash';
import { useCallback } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): DebouncedFunc<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(debounce<T>(func, delay), []);
}
