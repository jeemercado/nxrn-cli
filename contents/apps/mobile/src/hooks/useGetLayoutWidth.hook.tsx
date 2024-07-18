import { useState } from 'react';
import { LayoutChangeEvent } from 'react-native';

import { useDebounce } from './useDebounce.hook';

export function useGetLayoutWidth(
  initialWidth = 0,
): [number, (event: LayoutChangeEvent) => void, number] {
  const [actualWidth, setLayoutActualWidth] = useState<number>(0);
  const debouncedOnSetActualWidth = useDebounce(setLayoutActualWidth, 1);

  const [layoutWidth, setLayoutWidth] = useState<number>(initialWidth);
  const debouncedOnSetWidth = useDebounce(setLayoutWidth, 1);

  function onLayout(event: LayoutChangeEvent) {
    const { width } = event.nativeEvent.layout;

    if (width === 0 && width <= initialWidth) {
      return;
    }

    debouncedOnSetActualWidth(Math.round(width));
    debouncedOnSetWidth(Math.round(width));
  }

  return [layoutWidth, onLayout, actualWidth];
}
