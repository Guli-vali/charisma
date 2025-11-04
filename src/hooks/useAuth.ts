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
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

// Флаг для предотвращения множественных инициализаций
let isInitializing = false;
let initPromise: Promise<void> | null = null;

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    // Если уже инициализирован, не делаем ничего
    if (get().initialized) return;
    
    // Если идет инициализация, ждем её завершения
    if (isInitializing && initPromise) {
      return initPromise;
    }
    
    isInitializing = true;
    set({ loading: true });
    
    initPromise = (async () => {
      try {
        const user = pb.getCurrentUser();
        set({ user, loading: false, initialized: true });
      } catch (error) {
        set({ user: null, loading: false, initialized: true });
      } finally {
        isInitializing = false;
        initPromise = null;
      }
    })();
    
    return initPromise;
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

  /**
   * Перезагрузить данные текущего пользователя из PocketBase
   * Используется после обновлений профиля в других местах приложения
   */
  refreshUser: async () => {
    const currentUser = get().user;
    if (!currentUser) return;

    try {
      const freshUser = await pb.client.collection('users').getOne(currentUser.id, {
        requestKey: null,
      });
      set({ user: freshUser as User });
      console.log('✅ User data refreshed from PocketBase');
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  },

  /**
   * Обновить пользователя напрямую в store (без запроса к API)
   * Используется для оптимистичных обновлений
   */
  setUser: (user: User | null) => {
    set({ user });
  },
}));
