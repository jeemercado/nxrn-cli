import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDeviceContext } from 'twrnc';

import { persistOptions, queryClient } from './query-client';

import { StorageManager } from '@/components';
import ApplicationRoutes from '@/routes';
import { tw } from '@/tailwind';
import 'react-native-url-polyfill/auto';

LogBox.ignoreLogs(['VirtualizedLists', 'onAnimatedValueUpdate']);

function Application() {
  useDeviceContext(tw, {
    initialColorScheme: 'light',
  });

  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <SafeAreaProvider>
        <KeyboardProvider navigationBarTranslucent statusBarTranslucent>
          <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
            <StorageManager>
              <ApplicationRoutes />
            </StorageManager>
          </PersistQueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HeadlessCheck({ isHeadless }: any) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <Application />;
}

export default HeadlessCheck;
