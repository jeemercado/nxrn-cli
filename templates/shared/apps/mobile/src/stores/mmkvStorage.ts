import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

import CONFIG from '@/config';

const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'mmkv',
});

export const MmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = storage.getString(name);

    return value ?? null;
  },
  removeItem: (name) => storage.remove(name),
  setItem: (name, value) => storage.set(name, value),
};
