import { StateCreator, create } from 'zustand';
import { PersistOptions, createJSONStorage, persist } from 'zustand/middleware';

import { MmkvStorage } from './mmkvStorage';

const initialState = {
  _hasHydrated: false,
  user: null,
};

// TODO: Replace this with actual user type from api-lib
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type LocalStorageState = {
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setUser: (user: User | null) => void;
  signOut: () => void;
  user: User | null;
};

type MyPersist = (
  config: StateCreator<LocalStorageState>,
  options: PersistOptions<LocalStorageState>,
) => StateCreator<LocalStorageState>;

export const useLocalStorageState = create<LocalStorageState, []>(
  (persist as unknown as MyPersist)(
    (set, get) => ({
      _hasHydrated: initialState._hasHydrated,
      setHasHydrated: (hasHydrated) =>
        set({
          _hasHydrated: hasHydrated,
        }),
      setUser: (user) =>
        set({
          user,
        }),
      signOut: () => {
        set({
          user: initialState.user,
        });
      },
      user: initialState.user,
    }),
    {
      name: 'local-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      storage: createJSONStorage(() => MmkvStorage),
    },
  ),
);
