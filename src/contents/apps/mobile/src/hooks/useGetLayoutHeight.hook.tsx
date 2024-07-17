import { useState } from 'react';
import { LayoutChangeEvent } from 'react-native';

import { useDebounce } from './useDebounce.hook';

export function useGetLayoutHeight(
  initialHeight = 0,
): [number, (event: LayoutChangeEvent) => void, number] {
  const [actualHeight, setLayoutActualHeight] = useState<number>(0);
  const debouncedOnSetActualHeight = useDebounce(setLayoutActualHeight, 1);

  const [layoutHeight, setLayoutHeight] = useState<number>(initialHeight);
  const debouncedOnSetHeight = useDebounce(setLayoutHeight, 1);

  function onLayout(event: LayoutChangeEvent) {
    const { height } = event.nativeEvent.layout;

    if (height === 0 && height <= initialHeight) {
      return;
    }

    debouncedOnSetActualHeight(Math.round(height));
    debouncedOnSetHeight(Math.round(height));
  }

  return [layoutHeight, onLayout, actualHeight];
}
