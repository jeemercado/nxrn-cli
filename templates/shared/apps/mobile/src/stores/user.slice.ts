import { StateCreator } from 'zustand';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type UserSlice = {
  setUser: (user: User | null) => void;
  signOut: () => void;
  user: User | null;
  clear: () => void;
};

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  clear: () => set({ user: null }),
  setUser: (user: User | null) => set({ user }),
  signOut: () => set({ user: null }),
  user: null,
});
