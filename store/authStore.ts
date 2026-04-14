import { create } from "zustand";

type QR = {
  token: string;
  title: string | null;
  description: string | null;
  color: string | null;
};

type User = {
  id: string;
  userName: string;
  phone?: string | null;
  bio: string;
  gender: string | null;
  dob: string | null;
  avatar: string | null;
  background: string | null;
  theme: string;
  birthdayVisibility: string;
  birthdayNotifyFriends: boolean;
  qr: QR;
};

type AuthStore = {
  user: User | null;

  setUser: (user: User) => void;
  clearUser: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  // login success → save user
  setUser: (user) => {
    set({ user });
    localStorage.setItem("user", JSON.stringify(user));
  },

  // logout → clear everything
  clearUser: () => {
    set({ user: null });
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  // reload page restore user
  hydrate: () => {
    const saved = localStorage.getItem("user");
    if (saved) {
      set({ user: JSON.parse(saved) });
    }
  },
}));