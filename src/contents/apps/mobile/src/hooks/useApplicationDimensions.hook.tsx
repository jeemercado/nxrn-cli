import { StatusBar, useWindowDimensions } from 'react-native';

export function useApplicationDimensions() {
  const { height, width } = useWindowDimensions();

  return {
    height: height + (StatusBar?.currentHeight || 0),
    width,
  };
}
