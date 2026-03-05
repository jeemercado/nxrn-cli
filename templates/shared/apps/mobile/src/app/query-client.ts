import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { AsyncStorage } from '@tanstack/react-query-persist-client';
import { createMMKV } from 'react-native-mmkv';

import CONFIG from '@/config';

const CACHE_TIME = 0;
const STALE_TIME = 0;

export const queryClient = new QueryClient({
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

export const persistOptions = { maxAge: CACHE_TIME, persister };
