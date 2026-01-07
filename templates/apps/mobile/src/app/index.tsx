import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { AsyncStorage, PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { createMMKV } from 'react-native-mmkv';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDeviceContext } from 'twrnc';

import { StorageManager } from '@/components';
import CONFIG from '@/config';
import ApplicationRoutes from '@/routes';
import { tw } from '@/tailwind';
import 'react-native-url-polyfill/auto';

LogBox.ignoreLogs(['VirtualizedLists', 'onAnimatedValueUpdate']);

const CACHE_TIME = 0;
const STALE_TIME = 0;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
    },
  },
});

const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'react-query-persist',
});

export const MmkvStorage: AsyncStorage = {
  getItem: (name) => {
    const value = storage.getString(name);

    return value ?? null;
  },
  removeItem: (name) => {
    storage.remove(name);
  },
  setItem: (name, value) => storage.set(name, value),
};

const persister = createAsyncStoragePersister({
  storage: MmkvStorage as AsyncStorage,
});

const persistOptions = { maxAge: CACHE_TIME, persister };

function Application() {
  useDeviceContext(tw, {
    initialColorScheme: 'light',
  });

  return (
    <GestureHandlerRootView style={tw`flex-1`}>
      <SafeAreaProvider>
        <KeyboardProvider>
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
