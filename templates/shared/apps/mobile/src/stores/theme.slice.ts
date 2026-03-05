import { StateCreator } from 'zustand';

export type ColorScheme = 'light' | 'dark';

export type ThemeSlice = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
};

export const createThemeSlice: StateCreator<ThemeSlice> = (set, get) => ({
  colorScheme: 'light',
  setColorScheme: (scheme: ColorScheme) => set({ colorScheme: scheme }),
  toggleColorScheme: () => set({ colorScheme: get().colorScheme === 'light' ? 'dark' : 'light' }),
});
