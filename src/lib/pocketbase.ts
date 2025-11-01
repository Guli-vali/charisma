import PocketBase from 'pocketbase';
import type { User, RegisterData } from './types';

// URL для PocketBase (локальный сервер)
const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

class PocketBaseClient {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase(PB_URL);
    
    // PocketBase автоматически загружает токен из localStorage при инициализации
    // На сервере это безопасно игнорируется
  }

  // Получить экземпляр PocketBase
  get client() {
    return this.pb;
  }

  // Авторизация
  async login(email: string, password: string): Promise<User> {
    try {
      // authWithPassword автоматически сохраняет токен в localStorage
      const authData = await this.pb.collection('users').authWithPassword(email, password);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.mapUser(authData.record as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error?.message || 'Ошибка авторизации');
    }
  }

  // Регистрация
  async register(data: RegisterData): Promise<User> {
    try {
      // В PocketBase для регистрации используем create без авторизации
      // Это работает если в настройках коллекции users включен "Allow guest access" для создания
      const userData = {
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        name: data.name,
        experience_points: 0,
        current_streak: 0,
        total_lessons_completed: 0,
        current_league: 'bronze',
        goals: data.goals,
      };

      // Создаем пользователя (без авторизации)
      await this.pb.collection('users').create(userData);
      
      // Автоматически авторизуем после успешной регистрации
      // authWithPassword автоматически сохраняет токен в localStorage
      const authData = await this.pb.collection('users').authWithPassword(data.email, data.password);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.mapUser(authData.record as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error?.message || 'Ошибка регистрации');
    }
  }

  // Выход
  logout(): void {
    // Очищает токен из localStorage
    this.pb.authStore.clear();
  }

  // Получить текущего пользователя
  getCurrentUser(): User | null {
    if (!this.pb.authStore.isValid) {
      return null;
    }

    const record = this.pb.authStore.record;
    if (!record) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.mapUser(record as any);
  }

  // Обновить профиль пользователя
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      const record = await this.pb.collection('users').update(userId, data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.mapUser(record as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error?.message || 'Ошибка обновления профиля');
    }
  }

  // Проверка авторизации
  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  // Маппинг данных пользователя из PocketBase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapUser(record: any): User {
    return {
      id: record.id,
      email: record.email,
      name: record.name || record.username || '',
      experience_points: record.experience_points || 0,
      current_streak: record.current_streak || 0,
      total_lessons_completed: record.total_lessons_completed || 0,
      current_league: record.current_league || 'bronze',
      avatar_url: record.avatar_url || undefined,
      goals: record.goals || {
        work: false,
        dating: false,
        leadership: false,
      },
      created: record.created,
      updated: record.updated,
    };
  }
}

// Экспортируем singleton экземпляр
export const pb = new PocketBaseClient();
export default pb;
