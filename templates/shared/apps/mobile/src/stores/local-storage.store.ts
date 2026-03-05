import { StateCreator, create } from 'zustand';
import { PersistOptions, createJSONStorage, persist } from 'zustand/middleware';

import { createThemeSlice, ThemeSlice } from './theme.slice';
import { createUserSlice, UserSlice } from './user.slice';

import { MmkvStorage } from '@/stores/mmkvStorage';

export type LocalStorageStore = UserSlice &
  ThemeSlice & {
    _hasHydrated: boolean;
    setHasHydrated: (hasHydrated: boolean) => void;
    clear: () => void;
  };

type MyPersist = (
  config: StateCreator<LocalStorageStore>,
  options: PersistOptions<LocalStorageStore>,
) => StateCreator<LocalStorageStore>;

export const useLocalStorageStore = create<LocalStorageStore, []>(
  (persist as unknown as MyPersist)(
    (set, get, store) =>
      (() => {
        const userSlice = createUserSlice(set, get, store);
        const themeSlice = createThemeSlice(set, get, store);

        return {
          ...userSlice,
          ...themeSlice,
          _hasHydrated: false,
          clear: () => {
            userSlice.signOut();
          },
          setHasHydrated: (hasHydrated) =>
            set({
              _hasHydrated: hasHydrated,
            }),
        };
      })(),
    {
      name: 'local-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      storage: createJSONStorage(() => MmkvStorage),
    },
  ),
);
