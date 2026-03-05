import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { persistOptions, queryClient } from './query-client';

import { AlertManager, StorageManager, ThemeManager, ToastManager } from '@/components';
import ApplicationRoutes from '@/routes';
import { tw } from '@/tailwind';
import 'react-native-url-polyfill/auto';

LogBox.ignoreLogs([
  'VirtualizedLists',
  'onAnimatedValueUpdate',
  'InteractionManager',
  'This method is deprecated (as well as all React Native Firebase namespaced API)',
]);

function Application() {
  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <SafeAreaProvider>
        <KeyboardProvider navigationBarTranslucent statusBarTranslucent>
          <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
            <StorageManager>
              <>
                <ThemeManager />
                <ApplicationRoutes />
                <AlertManager />
                <ToastManager />
              </>
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
