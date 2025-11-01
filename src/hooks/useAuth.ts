import { create } from 'zustand';
import { pb } from '@/lib/pocketbase';
import type { User, RegisterData } from '@/lib/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    set({ loading: true });
    try {
      const user = pb.getCurrentUser();
      set({ user, loading: false, initialized: true });
    } catch (error) {
      set({ user: null, loading: false, initialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const user = await pb.login(email, password);
      set({ user, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ loading: true });
    try {
      const user = await pb.register(data);
      set({ user, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    pb.logout();
    set({ user: null });
  },

  updateUser: async (userData: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    set({ loading: true });
    try {
      const updatedUser = await pb.updateProfile(currentUser.id, userData);
      set({ user: updatedUser, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw error;
    }
  },
}));
