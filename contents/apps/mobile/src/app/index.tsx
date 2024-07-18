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
import 'react-native-url-polyfill/auto';

import { StorageManager } from '../components';
import ApplicationRoutes from '../routes';
import { tw } from '../tailwind';

LogBox.ignoreLogs(['VirtualizedLists', 'onAnimatedValueUpdate']);

enableFreeze(true);

const MS_IN_S = 1000;
const S_IN_A_MIN = 60;
const MIN_IN_AN_HOUR = 60;
const HOURS_IN_A_DAY = 24;
const MS_IN_DAYS = MS_IN_S * S_IN_A_MIN * MIN_IN_AN_HOUR * HOURS_IN_A_DAY;

const CACHE_TIME = MS_IN_DAYS * 1;
const STALE_TIME = MS_IN_S * S_IN_A_MIN * MIN_IN_AN_HOUR; // 5 minutes

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

function Application(): JSX.Element {
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
