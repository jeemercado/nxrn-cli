import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useDeviceContext } from 'twrnc';

import CONFIG from '@/config';
import { useLocalStorageStore } from '@/stores';
import { tw } from '@/tailwind';

export function ThemeManager() {
  const storedScheme = useLocalStorageStore((s) => s.colorScheme);
  useDeviceContext(tw, {
    initialColorScheme: storedScheme,
    observeDeviceColorSchemeChanges: false,
  });

  const isDark = storedScheme === 'dark';

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    if (CONFIG.IS_ANDROID) {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, [isDark]);

  return null;
}
