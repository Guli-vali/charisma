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

// Progress & Skills Types
export type SkillStatus = 'locked' | 'available' | 'completed';

export interface SkillTreeNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  prerequisites: string[];
  xp_reward: number;
}

export interface UserProgress {
  id: string;
  user: string;
  skill_tree_node: string;
  status: SkillStatus;
  progress_percentage: number;
  completed_exercises: string[];
  created: string;
  updated: string;
}

export interface DailyStreak {
  id: string;
  user: string;
  date: string; // YYYY-MM-DD
  lessons_completed: number;
  missions_completed: number;
  created: string;
}

export interface DailyMission {
  id: string;
  type: 'complete_lesson' | 'earn_xp' | 'real_mission';
  title: string;
  description: string;
  target: number;
  current: number;
  xp_reward: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at?: string;
}
