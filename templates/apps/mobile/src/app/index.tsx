import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableFreeze } from 'react-native-screens';
import { useDeviceContext } from 'twrnc';

import 'react-native-url-polyfill/auto';

import { StorageManager } from '../components';
import ApplicationRoutes from '../routes';
import { tw } from '../tailwind';

LogBox.ignoreLogs(['VirtualizedLists', 'onAnimatedValueUpdate']);

enableFreeze(true);

const CACHE_TIME = 0;
const STALE_TIME = 0;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const persistOptions = { maxAge: CACHE_TIME, persister };

function Application() {
  useDeviceContext(tw, {
    initialColorScheme: 'light',
  });

  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          <StorageManager>
            <ApplicationRoutes />
          </StorageManager>
        </PersistQueryClientProvider>
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
