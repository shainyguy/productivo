import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, Brain, Zap, Award, Skull, Flame, Star } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const Analytics = () => {
  const { habits, tasks, finance, getXP, getLevel, getSystemScore } = useApp();

  const today = new Date().toISOString().split('T')[0];
  
  const totalIncome = finance.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const disciplineIndex = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskEfficiency = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  const overdues = tasks.filter(t => t.status === 'overdue').length;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;
  
  const systemScore = getSystemScore();
  const totalXP = getXP();
  getLevel(); // Called for side effects

  // Habit categories performance
  const habitCategories = useMemo(() => {
    const categories: Record<string, { completed: number; total: number }> = {};
    habits.forEach(h => {
      if (!categories[h.category]) categories[h.category] = { completed: 0, total: 0 };
      categories[h.category].total += 1;
      if (h.completedDates.includes(today)) categories[h.category].completed += 1;
    });
    return Object.entries(categories).map(([name, data]) => ({
      name,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
  }, [habits, today]);

  const weakestZone = habitCategories.length > 0 
    ? habitCategories.reduce((prev, curr) => curr.rate < prev.rate ? curr : prev)
    : null;

  // Task categories
  const taskCategories = useMemo(() => {
    const categories: Record<string, { completed: number; total: number }> = {};
    tasks.forEach(t => {
      if (!categories[t.category]) categories[t.category] = { completed: 0, total: 0 };
      categories[t.category].total += 1;
      if (t.status === 'completed') categories[t.category].completed += 1;
    });
    return Object.entries(categories).map(([name, data]) => ({
      name,
      completion: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      total: data.total
    }));
  }, [tasks]);

  // Most profitable project
  const projectIncome = useMemo(() => {
    const projects: Record<string, number> = {};
    finance.filter(f => f.type === 'income' && f.project).forEach(f => {
      projects[f.project] = (projects[f.project] || 0) + f.amount;
    });
    return Object.entries(projects).sort((a, b) => b[1] - a[1])[0];
  }, [finance]);

  // Energy Leak
  const energyLeak = useMemo(() => {
    const weakestHabit = habits.length > 0 ? [...habits].sort((a, b) => a.streak - b.streak)[0] : null;
    
    const categoryOverdues: Record<string, number> = {};
    tasks.filter(t => t.status === 'overdue').forEach(t => {
      categoryOverdues[t.category] = (categoryOverdues[t.category] || 0) + 1;
    });
    const worstCategory = Object.entries(categoryOverdues).sort((a, b) => b[1] - a[1])[0];

    const projectPL: Record<string, number> = {};
    finance.forEach(f => {
      if (f.project) {
        projectPL[f.project] = (projectPL[f.project] || 0) + (f.type === 'income' ? f.amount : -f.amount);
      }
    });
    const worstProject = Object.entries(projectPL).sort((a, b) => a[1] - b[1])[0];

    return { weakestHabit, worstCategory, worstProject };
  }, [habits, tasks, finance]);

  // AI Diagnosis
  const aiDiagnosis = useMemo(() => {
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const diagnoses: string[] = [];
    
    if (maxStreak > 7) diagnoses.push('🚀 Momentum Phase — вы на волне успеха');
    if (overdues >= 3) diagnoses.push('⚠️ Risk Zone — наблюдается 3+ просрочки');
    if (expenseRatio > 70) diagnoses.push('💸 Cash Pressure — расходы превышают 70%');
    if (systemScore >= 70) diagnoses.push('✅ System Health — система эффективна');
    if (disciplineIndex >= 80) diagnoses.push('🏆 High Discipline — отличная дисциплина');

    return diagnoses.length > 0 ? diagnoses : ['✨ Стабильный режим работы'];
  }, [maxStreak, overdues, totalIncome, totalExpense, systemScore, disciplineIndex]);

  // Projection
  const projection = useMemo(() => {
    const avgDailyIncome = totalIncome / 30;
    const avgDailyExpense = totalExpense / 30;
    const projectedCapital = balance + (avgDailyIncome - avgDailyExpense) * 30;
    const projectedXP = totalXP * 2;
    const projectedLevel = Math.min(10, Math.floor(projectedXP / 200) + 1);

    return {
      capital: projectedCapital,
      capitalTrend: avgDailyIncome >= avgDailyExpense,
      xp: projectedXP,
      level: projectedLevel
    };
  }, [balance, totalIncome, totalExpense, totalXP]);

  // Radar data
  const radarData = [
    { subject: 'Дисциплина', A: disciplineIndex, fullMark: 100 },
    { subject: 'Задачи', A: taskEfficiency, fullMark: 100 },
    { subject: 'Финансы', A: Math.min(100, Math.max(0, totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0)), fullMark: 100 },
    { subject: 'Привычки', A: habits.length > 0 ? Math.min(100, (completedToday / habits.length) * 100) : 0, fullMark: 100 },
    { subject: 'Streak', A: Math.min(100, maxStreak * 10), fullMark: 100 },
  ];

  // Empty state
  if (habits.length === 0 && tasks.length === 0 && finance.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-gray-500 mt-1">Глубокая аналитика и прогнозы 📊</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-8 text-white text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Нет данных для анализа</h2>
          <p className="text-white/80">
            Добавьте привычки, задачи и финансовые записи, чтобы увидеть аналитику.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Аналитика</h1>
        <p className="text-gray-500 mt-1">Глубокая аналитика 📊</p>
      </div>

      {/* System Score */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Target size={18} />
              <span className="text-sm font-medium">ИНДЕКС СИСТЕМНОСТИ</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-bold">{systemScore}</span>
              <span className="text-xl text-gray-400">/100</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
            <div>
              <p className="text-xl md:text-2xl font-bold text-indigo-400">{disciplineIndex}%</p>
              <p className="text-xs text-gray-400">Дисципл.</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-purple-400">{taskEfficiency}%</p>
              <p className="text-xs text-gray-400">Задачи</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-emerald-400">
                {totalIncome > 0 ? `${Math.round(((totalIncome - totalExpense) / totalIncome) * 100)}%` : '0%'}
              </p>
              <p className="text-xs text-gray-400">Финансы</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
          <Target className="text-indigo-500 mb-2" size={20} />
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{disciplineIndex}%</p>
          <p className="text-xs md:text-sm text-gray-500">Дисциплина</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
          <AlertTriangle className="text-red-500 mb-2" size={20} />
          <p className="text-lg md:text-xl font-bold text-gray-900">{weakestZone?.name || 'N/A'}</p>
          <p className="text-xs md:text-sm text-gray-500">Слабая зона ({weakestZone?.rate || 0}%)</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
          <TrendingUp className="text-emerald-500 mb-2" size={20} />
          <p className="text-lg md:text-xl font-bold text-gray-900">{projectIncome?.[0] || 'N/A'}</p>
          <p className="text-xs md:text-sm text-gray-500">Топ проект</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 md:p-6 text-white">
          <Calendar className="mb-2 opacity-80" size={20} />
          <p className="text-2xl md:text-3xl font-bold">{Math.round(projection.xp)}</p>
          <p className="text-xs md:text-sm opacity-80">XP прогноз</p>
        </div>
      </div>

      {/* Projection Engine */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={20} />
          <span className="font-semibold">📅 ПРОГНОЗ НА 30 ДНЕЙ</span>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white/20 rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs opacity-80">Капитал</span>
              {projection.capitalTrend ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            </div>
            <p className="text-lg md:text-2xl font-bold">₽{(projection.capital/1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs opacity-80">XP</span>
              <Star size={14} />
            </div>
            <p className="text-lg md:text-2xl font-bold">{Math.round(projection.xp)}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs opacity-80">Уровень</span>
              <Award size={14} />
            </div>
            <p className="text-lg md:text-2xl font-bold">Lv {projection.level}</p>
          </div>
        </div>
      </div>

      {/* AI Diagnosis */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="text-indigo-500" size={20} />
          <span className="font-semibold text-gray-900">🧠 AI-ДИАГНОСТИКА</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {aiDiagnosis.map((diagnosis, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
              <span className="text-lg">{diagnosis.split(' ')[0]}</span>
              <span className="text-gray-700 text-sm">{diagnosis.slice(diagnosis.indexOf(' ') + 1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Energy Leak */}
      {(energyLeak.weakestHabit || energyLeak.worstCategory || energyLeak.worstProject) && (
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Skull size={20} />
            <span className="font-semibold">📉 УТЕЧКИ ЭНЕРГИИ</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/20 rounded-xl p-3 md:p-4">
              <p className="text-xs opacity-80 mb-1">Слабая привычка</p>
              <p className="font-bold">{energyLeak.weakestHabit?.name || '—'}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 md:p-4">
              <p className="text-xs opacity-80 mb-1">Проблем. категория</p>
              <p className="font-bold">{energyLeak.worstCategory?.[0] || '—'}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 md:p-4">
              <p className="text-xs opacity-80 mb-1">Убыт. проект</p>
              <p className="font-bold">{energyLeak.worstProject?.[0] || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Radar */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="text-indigo-500" size={18} />
            Профиль эффективности
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Эффективность" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Task categories */}
        {taskCategories.length > 0 && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="text-amber-500" size={18} />
              Задачи по категориям
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" width={70} />
                <Tooltip contentStyle={{ background: '#1e1e1e', border: 'none', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="completion" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Habit categories */}
      {habitCategories.length > 0 && (
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="text-orange-500" size={18} />
            Привычки по категориям
          </h3>
          <div className="space-y-3">
            {habitCategories.map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{cat.name}</span>
                  <span className={`font-medium ${cat.rate >= 70 ? 'text-emerald-600' : cat.rate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                    {cat.rate}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${cat.rate >= 70 ? 'bg-emerald-500' : cat.rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${cat.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="text-purple-500" size={18} />
          Ключевые метрики
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            <p className="text-xs text-gray-500">Всего задач</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-600">{completedTasks}</p>
            <p className="text-xs text-gray-500">Выполнено</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-red-600">{overdues}</p>
            <p className="text-xs text-gray-500">Просрочено</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-indigo-600">{maxStreak}</p>
            <p className="text-xs text-gray-500">Макс streak</p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 md:p-6 text-white">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Brain size={18} />
          💡 Рекомендации AI
        </h3>
        <div className="space-y-2">
          {weakestZone && (
            <div className="p-3 bg-white/10 rounded-xl">
              <p className="text-sm">
                🎯 Фокус на <span className="text-amber-400 font-medium">{weakestZone.name}</span> — ваша слабая зона ({weakestZone.rate}%)
              </p>
            </div>
          )}
          <div className="p-3 bg-white/10 rounded-xl">
            <p className="text-sm">
              📈 Прогноз XP через 30 дней: <span className="text-emerald-400 font-medium">{Math.round(projection.xp)} XP</span>
            </p>
          </div>
          {projectIncome && (
            <div className="p-3 bg-white/10 rounded-xl">
              <p className="text-sm">
                💰 <span className="text-indigo-400 font-medium">{projectIncome[0]}</span> — ваш лучший проект
              </p>
            </div>
          )}
          <div className="p-3 bg-white/10 rounded-xl">
            <p className="text-sm">
              🔥 Увеличьте streak привычек для бонусных XP (+20 за каждую с 7+ днями)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
