export interface User {
  id: string;
  email: string;
  name: string;
  experience_points: number;
  current_streak: number;
  total_lessons_completed: number;
  current_league: 'bronze' | 'silver' | 'gold' | 'platinum';
  avatar_url?: string;
  goals: {
    work: boolean;
    dating: boolean;
    leadership: boolean;
  };
  created: string;
  updated: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  goals: {
    work: boolean;
    dating: boolean;
    leadership: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
