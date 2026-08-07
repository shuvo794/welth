import { create } from "zustand";

interface UserState {
  currency: string;
  setCurrency: (value: string) => void;
  needsOnboarding: boolean | null; // null = not yet determined
  setNeedsOnboarding: (value: boolean | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currency: "BDT",
  setCurrency: (value) => set({ currency: value }),
  needsOnboarding: true,
  setNeedsOnboarding: (value) => set({ needsOnboarding: value }),
}));
