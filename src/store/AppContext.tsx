import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Habit, Task, FinanceEntry, FinancialGoal, UserClass, UserProfile, Friend } from '../types';

interface AppState {
  habits: Habit[];
  tasks: Task[];
  finance: FinanceEntry[];
  goals: FinancialGoal[];
  profile: UserProfile;
  friends: Friend[];
  onboarded: boolean;
}

interface AppContextType extends AppState {
  // Habits
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
  completeTask: (id: string, actualTime: number) => void;
  deleteTask: (id: string) => void;
  // Finance
  addFinanceEntry: (entry: Omit<FinanceEntry, 'id'>) => void;
  deleteFinanceEntry: (id: string) => void;
  // Goals
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: string, current: number) => void;
  deleteGoal: (id: string) => void;
  // Profile
  setProfile: (profile: Partial<UserProfile>) => void;
  setClass: (userClass: UserClass) => void;
  completeOnboarding: () => void;
  // Computed
  getXP: () => number;
  getLevel: () => number;
  getSystemScore: () => number;
}

const defaultProfile: UserProfile = {
  name: 'Пользователь',
  class: 'builder',
  level: 1,
  xp: 0,
  createdAt: new Date().toISOString(),
};

const STORAGE_KEY = 'pro_system_data';

const loadFromStorage = (): Partial<AppState> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load data from storage', e);
  }
  return {};
};

const saveToStorage = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save data to storage', e);
  }
};

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const stored = loadFromStorage();
  
  const [habits, setHabits] = useState<Habit[]>(stored.habits || []);
  const [tasks, setTasks] = useState<Task[]>(stored.tasks || []);
  const [finance, setFinance] = useState<FinanceEntry[]>(stored.finance || []);
  const [goals, setGoals] = useState<FinancialGoal[]>(stored.goals || []);
  const [profile, setProfileState] = useState<UserProfile>(stored.profile || defaultProfile);
  const [friends] = useState<Friend[]>(stored.friends || []);
  const [onboarded, setOnboarded] = useState<boolean>(stored.onboarded || false);

  // Auto-save to localStorage
  useEffect(() => {
    saveToStorage({ habits, tasks, finance, goals, profile, friends, onboarded });
  }, [habits, tasks, finance, goals, profile, friends, onboarded]);

  // Check for overdue tasks daily
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTasks(prev => prev.map(t => {
      if (t.status === 'pending' && t.deadline < today) {
        return { ...t, status: 'overdue' as const };
      }
      return t;
    }));
  }, []);

  // Habits
  const addHabit = (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      streak: 0,
      completedDates: [],
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isCompleted = h.completedDates.includes(today);
        let newDates = isCompleted 
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today];
        
        // Calculate streak
        let streak = 0;
        const sortedDates = [...newDates].sort().reverse();
        for (let i = 0; i < sortedDates.length; i++) {
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - i);
          const expected = expectedDate.toISOString().split('T')[0];
          if (sortedDates[i] === expected) {
            streak++;
          } else {
            break;
          }
        }
        
        return {
          ...h,
          completed: !isCompleted,
          completedDates: newDates,
          streak,
          date: today,
        };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // Tasks
  const addTask = (task: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const completeTask = (id: string, actualTime: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'completed' as const, actualTime };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Finance
  const addFinanceEntry = (entry: Omit<FinanceEntry, 'id'>) => {
    const newEntry: FinanceEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setFinance(prev => [...prev, newEntry]);
    
    // Auto-update goals
    if (entry.type === 'income') {
      setGoals(prev => prev.map(g => ({
        ...g,
        current: Math.min(g.target, g.current + entry.amount * 0.1) // 10% to goals
      })));
    }
  };

  const deleteFinanceEntry = (id: string) => {
    setFinance(prev => prev.filter(f => f.id !== id));
  };

  // Goals
  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => {
    setGoals(prev => [...prev, { ...goal, id: Date.now().toString() }]);
  };

  const updateGoal = (id: string, current: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Profile
  const setProfile = (updates: Partial<UserProfile>) => {
    setProfileState(prev => ({ ...prev, ...updates }));
  };

  const setClass = (userClass: UserClass) => {
    setProfileState(prev => ({ ...prev, class: userClass }));
  };

  const completeOnboarding = () => {
    setOnboarded(true);
  };

  // Computed values
  const getXP = (): number => {
    // Habit points: weight * completed today
    const habitXP = habits.reduce((sum, h) => {
      const today = new Date().toISOString().split('T')[0];
      return sum + (h.completedDates.includes(today) ? h.weight * 10 : 0);
    }, 0);

    // Streak bonus: +20 XP per habit with streak > 7
    const streakBonus = habits.filter(h => h.streak >= 7).length * 20;

    // Task points: priority * 10 for completed, time bonus
    const taskXP = tasks.filter(t => t.status === 'completed').reduce((sum, t) => {
      let base = t.priority * 10;
      // Time efficiency bonus
      if (t.actualTime && t.plannedTime && t.actualTime < t.plannedTime) {
        base += Math.round(((t.plannedTime - t.actualTime) / t.plannedTime) * 20);
      }
      return sum + base;
    }, 0);

    // Overdue penalty
    const overdues = tasks.filter(t => t.status === 'overdue').length;
    const penaltyMultiplier = overdues >= 3 ? 2 : 1;
    const penalty = overdues * 15 * penaltyMultiplier;

    // Financial bonus
    const income = finance.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = finance.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const financialBonus = income > expense * 1.5 ? 50 : 0;

    // Class multiplier
    let classMultiplier = 1;
    if (profile.class === 'strategist') {
      const highROItasks = tasks.filter(t => t.status === 'completed' && (t.roi || 0) > 20000).length;
      classMultiplier = 1 + (highROItasks * 0.05);
    } else if (profile.class === 'executor') {
      const fastTasks = tasks.filter(t => t.status === 'completed' && t.actualTime && t.plannedTime && t.actualTime < t.plannedTime).length;
      classMultiplier = 1 + (fastTasks * 0.04);
    } else if (profile.class === 'builder') {
      const longStreaks = habits.filter(h => h.streak >= 7).length;
      classMultiplier = 1 + (longStreaks * 0.06);
    }

    const baseXP = habitXP + taskXP + streakBonus + financialBonus - penalty;
    return Math.max(0, Math.round(baseXP * classMultiplier));
  };

  const getLevel = (): number => {
    const xp = getXP();
    const thresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000];
    let level = 1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (xp >= thresholds[i]) {
        level = i + 1;
        break;
      }
    }
    return Math.min(10, level);
  };

  const getSystemScore = (): number => {
    // Discipline: % habits completed today
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
    const discipline = habits.length > 0 ? (completedToday / habits.length) * 100 : 0;

    // Task efficiency: % completed (not overdue)
    const completed = tasks.filter(t => t.status === 'completed').length;
    const taskEff = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

    // Financial: growth ratio
    const income = finance.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
    const expense = finance.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const financeScore = expense > 0 ? Math.min(100, ((income - expense) / expense) * 100) : (income > 0 ? 100 : 0);

    return Math.round(discipline * 0.4 + taskEff * 0.3 + Math.max(0, financeScore) * 0.3);
  };

  return (
    <AppContext.Provider value={{
      habits,
      tasks,
      finance,
      goals,
      profile,
      friends,
      onboarded,
      addHabit,
      toggleHabit,
      deleteHabit,
      addTask,
      completeTask,
      deleteTask,
      addFinanceEntry,
      deleteFinanceEntry,
      addGoal,
      updateGoal,
      deleteGoal,
      setProfile,
      setClass,
      completeOnboarding,
      getXP,
      getLevel,
      getSystemScore,
    }}>
      {children}
    </AppContext.Provider>
  );
};
