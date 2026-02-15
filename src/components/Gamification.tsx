import { useMemo } from 'react';
import { Trophy, Star, Zap, Flame, Target, Crown, Rocket, Award, Sword, Shield, Hammer, TrendingUp, AlertTriangle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { UserClass } from '../types';

const levelThresholds = [
  { level: 1, xp: 0, title: 'Новичок', color: 'from-gray-400 to-gray-500' },
  { level: 2, xp: 100, title: 'Ученик', color: 'from-emerald-400 to-emerald-600' },
  { level: 3, xp: 250, title: 'Практик', color: 'from-blue-400 to-blue-600' },
  { level: 4, xp: 500, title: 'Специалист', color: 'from-indigo-400 to-indigo-600' },
  { level: 5, xp: 800, title: 'Эксперт', color: 'from-purple-400 to-purple-600' },
  { level: 6, xp: 1200, title: 'Мастер', color: 'from-pink-400 to-pink-600' },
  { level: 7, xp: 1700, title: 'Гроссмейстер', color: 'from-orange-400 to-orange-600' },
  { level: 8, xp: 2300, title: 'Чемпион', color: 'from-red-400 to-red-600' },
  { level: 9, xp: 3000, title: 'Легенда', color: 'from-amber-400 to-amber-600' },
  { level: 10, xp: 4000, title: 'Титан', color: 'from-yellow-400 to-yellow-600' },
];

const userClasses: Record<UserClass, { name: string; emoji: string; icon: React.ReactNode; bonus: string; multiplier: number; description: string }> = {
  strategist: {
    name: 'Стратег',
    emoji: '🧠',
    icon: <Sword className="text-indigo-500" size={28} />,
    bonus: '+25% XP за высокий ROI',
    multiplier: 1.25,
    description: 'Фокус на планировании и высокодоходных проектах'
  },
  executor: {
    name: 'Исполнитель',
    emoji: '⚡',
    icon: <Zap className="text-amber-500" size={28} />,
    bonus: '+20% XP за скорость',
    multiplier: 1.20,
    description: 'Быстрое выполнение задач'
  },
  builder: {
    name: 'Строитель',
    emoji: '🏗️',
    icon: <Hammer className="text-emerald-500" size={28} />,
    bonus: '+30% XP за streak',
    multiplier: 1.30,
    description: 'Построение долгосрочных привычек'
  }
};

export const Gamification = () => {
  const { habits, tasks, finance, getXP, getLevel, profile, setClass } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const totalXP = getXP();
  const currentLevel = getLevel();
  
  // XP breakdown
  const habitXP = habits.reduce((sum, h) => sum + (h.completedDates.includes(today) ? h.weight * 10 : 0), 0);
  const taskXP = tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.priority * 10, 0);
  const streakBonus = habits.filter(h => h.streak >= 7).length * 20;
  
  const overdues = tasks.filter(t => t.status === 'overdue').length;
  const penaltyMultiplier = overdues >= 3 ? 2 : 1;
  const overduesPenalty = overdues * 15 * penaltyMultiplier;
  
  const totalIncome = finance.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const financialBonus = totalIncome > totalExpense * 1.5 ? 50 : 0;
  
  const timeBonus = tasks
    .filter(t => t.status === 'completed' && t.plannedTime && t.actualTime && t.actualTime < t.plannedTime)
    .reduce((acc, t) => acc + Math.round(((t.plannedTime - t.actualTime!) / t.plannedTime) * 20), 0);

  const noOverdueMultiplier = overdues === 0 ? 1.5 : 1;
  
  const currentLevelData = levelThresholds.reduce((prev, curr) => 
    totalXP >= curr.xp ? curr : prev
  , levelThresholds[0]);
  
  const nextLevelData = levelThresholds.find(l => l.xp > totalXP) || levelThresholds[levelThresholds.length - 1];
  const progressToNext = nextLevelData.xp > currentLevelData.xp 
    ? ((totalXP - currentLevelData.xp) / (nextLevelData.xp - currentLevelData.xp)) * 100 
    : 100;

  // Top habits
  const topHabits = [...habits]
    .sort((a, b) => (b.streak * b.weight) - (a.streak * a.weight))
    .slice(0, 5);

  // Achievements
  const achievements = useMemo(() => {
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    return [
      { id: '1', name: '🔥 Огненный старт', description: '7 дней дисциплины подряд', icon: '🔥', unlocked: maxStreak >= 7 },
      { id: '2', name: '⚡ Непрерывный поток', description: '30 дней без просрочек', icon: '⚡', unlocked: overdues === 0 && tasks.length >= 5 },
      { id: '3', name: '💰 Финансовый рост', description: '+50% рост дохода', icon: '💰', unlocked: totalIncome > totalExpense * 1.5 },
      { id: '4', name: '🎯 Снайпер задач', description: '10 задач выполнено', icon: '🎯', unlocked: completedTasks >= 10 },
      { id: '5', name: '🏆 Чемпион привычек', description: 'Streak 30 дней', icon: '🏆', unlocked: maxStreak >= 30 },
      { id: '6', name: '💎 Алмазная дисциплина', description: 'Индекс > 90%', icon: '💎', unlocked: habits.length > 0 && habits.filter(h => h.completedDates.includes(today)).length / habits.length >= 0.9 },
      { id: '7', name: '🚀 Ракетный ROI', description: 'ROI проекта > 300%', icon: '🚀', unlocked: finance.some(f => f.type === 'income' && f.roi > 300) },
      { id: '8', name: '🌟 Мастер уровней', description: 'Достичь Level 5', icon: '🌟', unlocked: currentLevel >= 5 },
      { id: '9', name: '⏱️ Мастер времени', description: '5 задач быстрее плана', icon: '⏱️', unlocked: tasks.filter(t => t.actualTime && t.plannedTime && t.actualTime < t.plannedTime).length >= 5 },
      { id: '10', name: '🛡️ Финансовый щит', description: 'Подушка > 3 мес', icon: '🛡️', unlocked: totalExpense > 0 && (totalIncome - totalExpense) / totalExpense > 3 },
    ];
  }, [habits, tasks, finance, totalIncome, totalExpense, overdues, currentLevel, today]);

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  // Empty state
  if (habits.length === 0 && tasks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Геймификация</h1>
          <p className="text-gray-500 mt-1">Твой путь к вершинам 🎮</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 md:p-8 text-white text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Начните зарабатывать XP!</h2>
          <p className="text-white/80 mb-6">
            Добавьте привычки и задачи, чтобы начать получать очки опыта и повышать уровень.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-3xl">🧘</p>
              <p className="text-sm mt-2">Привычки</p>
              <p className="text-xs opacity-70">+10-50 XP</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-3xl">✅</p>
              <p className="text-sm mt-2">Задачи</p>
              <p className="text-xs opacity-70">+10-50 XP</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-3xl">🔥</p>
              <p className="text-sm mt-2">Streak</p>
              <p className="text-xs opacity-70">+20 XP/7д</p>
            </div>
          </div>
        </div>

        {/* Class Selector */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-indigo-500" />
            Ваш класс: {userClasses[profile.class].emoji} {userClasses[profile.class].name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.entries(userClasses) as [UserClass, typeof userClasses['strategist']][]).map(([key, classInfo]) => (
              <button
                key={key}
                onClick={() => setClass(key)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  profile.class === key 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {classInfo.icon}
                  <span className="font-bold">{classInfo.emoji} {classInfo.name}</span>
                </div>
                <p className="text-xs text-gray-500">{classInfo.description}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">{classInfo.bonus}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Геймификация</h1>
          <p className="text-gray-500 mt-1">Твой путь к вершинам 🏆</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500">Статус</p>
            <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{currentLevelData.title}</p>
          </div>
          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${currentLevelData.color} flex items-center justify-center shadow-lg`}>
            <Crown className="text-white" size={28} />
          </div>
        </div>
      </div>

      {/* Class Selector */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-indigo-500" />
          🎮 ВЫБОР КЛАССА
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.entries(userClasses) as [UserClass, typeof userClasses['strategist']][]).map(([key, classInfo]) => (
            <button
              key={key}
              onClick={() => setClass(key)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                profile.class === key 
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {classInfo.icon}
                <span className="font-bold">{classInfo.emoji} {classInfo.name}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{classInfo.description}</p>
              <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">{classInfo.bonus}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Level Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${currentLevelData.color} flex items-center justify-center`}>
                <span className="text-2xl md:text-4xl font-bold">{currentLevelData.level}</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{currentLevelData.title}</h2>
                <p className="text-gray-400">Level {currentLevelData.level} из 10</p>
                <p className="text-indigo-400 text-sm mt-1">{userClasses[profile.class].emoji} {userClasses[profile.class].name}</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-4xl md:text-5xl font-bold text-indigo-400">{totalXP}</p>
              <p className="text-gray-400">Всего XP</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Прогресс до Level {nextLevelData.level}</span>
              <span className="text-indigo-400">{totalXP} / {nextLevelData.xp} XP</span>
            </div>
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${currentLevelData.color} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.min(100, progressToNext)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* XP Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-emerald-500" size={18} />
            <span className="text-xs text-gray-500">Привычки</span>
          </div>
          <p className="text-xl font-bold text-emerald-600">+{habitXP}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-blue-500" size={18} />
            <span className="text-xs text-gray-500">Задачи</span>
          </div>
          <p className="text-xl font-bold text-blue-600">+{taskXP}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="text-orange-500" size={18} />
            <span className="text-xs text-gray-500">Streak</span>
          </div>
          <p className="text-xl font-bold text-orange-600">+{streakBonus}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-indigo-500" size={18} />
            <span className="text-xs text-gray-500">Время</span>
          </div>
          <p className="text-xl font-bold text-indigo-600">+{timeBonus}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="text-purple-500" size={18} />
            <span className="text-xs text-gray-500">Финансы</span>
          </div>
          <p className="text-xl font-bold text-purple-600">+{financialBonus}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Star className="text-amber-500" size={18} />
            <span className="text-xs text-gray-500">Множитель</span>
          </div>
          <p className="text-xl font-bold text-amber-600">x{noOverdueMultiplier}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-red-500" size={18} />
            <span className="text-xs text-gray-500">Штрафы</span>
          </div>
          <p className="text-xl font-bold text-red-600">-{overduesPenalty}</p>
          {penaltyMultiplier > 1 && <p className="text-xs text-red-400">x{penaltyMultiplier}</p>}
        </div>
      </div>

      {/* Level Table & Top Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Star className="text-indigo-500" size={20} />
              Таблица уровней
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {levelThresholds.map(level => (
              <div 
                key={level.level}
                className={`flex items-center justify-between px-4 py-3 ${currentLevelData.level === level.level ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {level.level}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{level.title}</p>
                    <p className="text-xs text-gray-500">{level.xp} XP</p>
                  </div>
                </div>
                {currentLevelData.level === level.level && (
                  <span className="px-2 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full">Сейчас</span>
                )}
                {currentLevelData.level > level.level && (
                  <span className="text-emerald-500">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {topHabits.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="text-amber-500" size={20} />
                🏆 Рейтинг привычек
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {topHabits.map((habit, i) => (
                <div key={habit.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm ${
                      i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{habit.name}</p>
                      <p className="text-xs text-gray-500">Streak: {habit.streak} дней</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600 text-sm">{habit.streak * habit.weight} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="text-purple-500" size={24} />
          🏅 Достижения ({unlockedAchievements.length}/{achievements.length})
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {unlockedAchievements.map(achievement => (
            <div key={achievement.id} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h4 className="font-bold text-sm">{achievement.name}</h4>
              <p className="text-xs opacity-80 mt-1">{achievement.description}</p>
            </div>
          ))}
          {lockedAchievements.map(achievement => (
            <div key={achievement.id} className="bg-gray-100 rounded-2xl p-4 opacity-60">
              <div className="text-3xl mb-2 grayscale">🔒</div>
              <h4 className="font-bold text-gray-700 text-sm">{achievement.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
