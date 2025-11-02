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

// Lessons & Exercises Types
export type ExerciseType = 'multiple_choice' | 'fill_blanks' | 'true_false' | 'matching' | 'sequence';

export interface BaseExercise {
  type: ExerciseType;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple_choice';
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface FillBlanksExercise extends BaseExercise {
  type: 'fill_blanks';
  sentence: string;
  blanks: Record<string, string[]>;
  correct_answers: string[];
}

export interface TrueFalseExercise extends BaseExercise {
  type: 'true_false';
  statement: string;
  correct_answer: boolean;
  explanation: string;
}

export interface MatchingExercise extends BaseExercise {
  type: 'matching';
  instruction: string;
  left_items: string[];
  right_items: string[];
  correct_matches: Record<string, string>;
}

export interface SequenceExercise extends BaseExercise {
  type: 'sequence';
  instruction: string;
  items: string[];
  correct_order: number[];
}

export type Exercise = 
  | MultipleChoiceExercise 
  | FillBlanksExercise 
  | TrueFalseExercise 
  | MatchingExercise 
  | SequenceExercise;

export interface Lesson {
  id: string;
  skill_node: string;
  lesson_number: number;
  title: string;
  description: string;
  xp_reward: number;
  exercises: Exercise[];
  is_checkpoint: boolean;
  created: string;
}

export type LessonAttemptStatus = 'in_progress' | 'completed' | 'failed';

export interface UserLessonAttempt {
  id: string;
  user: string;
  lesson: string;
  status: LessonAttemptStatus;
  hearts_left: number;
  current_exercise: number;
  score: number;
  completed_at?: string;
  created: string;
}

// Real Missions Types
export type MissionType = 'daily' | 'weekly' | 'challenge';
export type MissionCategory = 'smalltalk' | 'confidence' | 'networking' | 'leadership';
export type MissionDifficulty = 'easy' | 'medium' | 'hard';
export type MissionStatus = 'assigned' | 'completed' | 'skipped' | 'failed';

export interface Mission {
  id: string;
  type: MissionType;
  category: MissionCategory;
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  xp_reward: number;
  icon: string;
  is_active: boolean;
  created: string;
}

export interface UserMission {
  id: string;
  user: string;
  mission: string;
  status: MissionStatus;
  assigned_date: string; // ISO DateTime string
  completed_date?: string;
  proof_text?: string;
  mood_rating?: number; // 1-5
  was_difficult?: boolean;
  created: string;
  expand?: {
    mission?: Mission;
  };
}

export interface MissionStats {
  total_completed: number;
  total_assigned: number;
  completion_rate: number;
  current_streak: number;
  favorite_category?: MissionCategory;
  total_xp_earned: number;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  start_date: string;
  end_date: string;
  target: number; // количество для выполнения
  xp_reward: number;
  icon: string;
}
