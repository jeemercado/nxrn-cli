import { useCallback } from 'react';
import { useAppColorScheme } from 'twrnc';

import { useLocalStorageStore } from '@/stores';
import { ColorScheme } from '@/stores/theme.slice';
import { tw } from '@/tailwind';

export function useToggleDarkMode() {
  const [colorScheme, , setTwColorScheme] = useAppColorScheme(tw);
  const setStoredColorScheme = useLocalStorageStore((s) => s.setColorScheme);

  const toggleColorScheme = useCallback(() => {
    const next: ColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setTwColorScheme(next);
    setStoredColorScheme(next);
  }, [colorScheme, setTwColorScheme, setStoredColorScheme]);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setTwColorScheme(scheme);
      setStoredColorScheme(scheme);
    },
    [setTwColorScheme, setStoredColorScheme],
  );

  return {
    colorScheme: (colorScheme ?? 'light') as ColorScheme,
    setColorScheme,
    toggleColorScheme,
  };
}
