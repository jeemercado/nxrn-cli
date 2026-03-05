import { StateCreator } from 'zustand';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type UserSlice = {
  pushNotificationsEnabled: boolean;
  setUser: (user: User | null) => void;
  setPushNotificationsEnabled: (value: boolean) => void;
  signOut: () => void;
  user: User | null;
  clear: () => void;
};

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  clear: () => set({ pushNotificationsEnabled: true, user: null }),
  pushNotificationsEnabled: true,
  setPushNotificationsEnabled: (value: boolean) => set({ pushNotificationsEnabled: value }),
  setUser: (user: User | null) => set({ user }),
  signOut: () => set({ user: null }),
  user: null,
});
