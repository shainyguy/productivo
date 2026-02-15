export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: string;
  weight: number;
  date: string;
  completed: boolean;
  streak: number;
  completedDates: string[];
}

export interface Task {
  id: string;
  name: string;
  emoji: string;
  category: string;
  priority: number;
  roi?: number; // Optional ROI
  deadline: string;
  status: 'pending' | 'completed' | 'overdue';
  plannedTime: number;
  actualTime?: number;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  project: string;
  mandatory: boolean;
  roi: number;
  comment: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  emoji: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  requirement: () => boolean;
}

export type UserClass = 'strategist' | 'executor' | 'builder';

export interface UserProfile {
  name: string;
  class: UserClass;
  level: number;
  xp: number;
  createdAt: string;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  streak: number;
  xp: number;
}
