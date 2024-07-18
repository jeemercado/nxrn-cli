import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

import CONFIG from '../config';

const storage = new MMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: 'mmkv',
});

export const MmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = storage.getString(name);

    return value ?? null;
  },
  removeItem: (name) => storage.delete(name),
  setItem: (name, value) => storage.set(name, value),
};
