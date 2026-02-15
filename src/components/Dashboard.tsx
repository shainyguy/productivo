import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap, DollarSign, Trophy, Flame, Star, AlertTriangle, Shield, Brain, Skull, Sparkles } from 'lucide-react';
import { useApp } from '../store/AppContext';

const ACCENT = '#6366f1';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  accent?: boolean;
}

const StatCard = ({ title, value, subtitle, icon, trend, accent }: StatCardProps) => (
  <div className={`rounded-2xl p-4 md:p-6 transition-all duration-300 hover:scale-[1.02] ${accent ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-white border border-gray-100'}`}>
    <div className="flex items-start justify-between">
      <div className={`p-2 md:p-3 rounded-xl ${accent ? 'bg-white/20' : 'bg-indigo-50'}`}>
        {icon}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs md:text-sm font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="mt-3 md:mt-4">
      <p className={`text-xl md:text-3xl font-bold ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs md:text-sm mt-1 ${accent ? 'text-white/70' : 'text-gray-500'}`}>{title}</p>
      {subtitle && <p className={`text-xs mt-2 ${accent ? 'text-white/50' : 'text-gray-400'}`}>{subtitle}</p>}
    </div>
  </div>
);

export const Dashboard = () => {
  const { habits, tasks, finance, getXP, getLevel, getSystemScore, profile } = useApp();

  const today = new Date().toISOString().split('T')[0];
  
  const totalIncome = finance.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;
  
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const disciplineIndex = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskEfficiency = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  const financialGrowth = totalExpense > 0 ? Math.round(((totalIncome - totalExpense) / totalExpense) * 100) : (totalIncome > 0 ? 100 : 0);
  const overdues = tasks.filter(t => t.status === 'overdue').length;

  const systemScore = getSystemScore();
  const totalXP = getXP();
  const level = getLevel();
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;

  const systemStatus = useMemo(() => {
    if (systemScore >= 70) return { status: '🟢 Система в росте', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (systemScore >= 40) return { status: '🟡 Стабильность', color: 'text-amber-500', bg: 'bg-amber-500' };
    return { status: '🔴 Деградация', color: 'text-red-500', bg: 'bg-red-500' };
  }, [systemScore]);

  // AI Diagnosis
  const aiDiagnosis = useMemo(() => {
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    if (maxStreak > 7) return { message: '🚀 Momentum Phase — вы на волне!', color: 'from-emerald-500 to-teal-600' };
    if (overdues >= 3) return { message: '⚠️ Risk Zone — много просрочек', color: 'from-amber-500 to-orange-600' };
    if (expenseRatio > 70) return { message: '💸 Cash Pressure — расходы > 70%', color: 'from-red-500 to-pink-600' };
    return { message: '✨ Стабильный режим работы', color: 'from-indigo-500 to-purple-600' };
  }, [maxStreak, overdues, totalIncome, totalExpense]);

  // Alerts
  const alerts = useMemo(() => {
    const list: string[] = [];
    if (overdues >= 5) list.push('5+ просрочек');
    if (balance < 0) list.push('Отрицательный баланс');
    if (disciplineIndex < 30 && habits.length > 0) list.push('Низкая дисциплина');
    return list;
  }, [overdues, balance, disciplineIndex, habits.length]);

  // Energy Leak
  const energyLeak = useMemo(() => {
    const weakestHabit = habits.length > 0 ? [...habits].sort((a, b) => a.streak - b.streak)[0] : null;
    
    const categoryOverdues = tasks.filter(t => t.status === 'overdue')
      .reduce((acc: Record<string, number>, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {});
    const worstCategory = Object.entries(categoryOverdues).sort((a, b) => b[1] - a[1])[0];

    const projectPL = finance.reduce((acc: Record<string, number>, f) => {
      if (f.project) {
        acc[f.project] = (acc[f.project] || 0) + (f.type === 'income' ? f.amount : -f.amount);
      }
      return acc;
    }, {});
    const worstProject = Object.entries(projectPL).sort((a, b) => a[1] - b[1])[0];

    return { weakestHabit, worstCategory, worstProject };
  }, [habits, tasks, finance]);

  // Charts data
  const incomeExpenseData = useMemo(() => {
    const last4Weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      
      const weekIncome = finance
        .filter(f => f.type === 'income' && f.date >= weekStart.toISOString().split('T')[0] && f.date < weekEnd.toISOString().split('T')[0])
        .reduce((a, b) => a + b.amount, 0);
      const weekExpense = finance
        .filter(f => f.type === 'expense' && f.date >= weekStart.toISOString().split('T')[0] && f.date < weekEnd.toISOString().split('T')[0])
        .reduce((a, b) => a + b.amount, 0);
      
      last4Weeks.push({ name: `Нед ${4 - i}`, income: weekIncome, expense: weekExpense });
    }
    return last4Weeks;
  }, [finance]);

  const donutData = [
    { name: 'Выполнено', value: completedTasks, color: ACCENT },
    { name: 'В процессе', value: tasks.filter(t => t.status === 'pending').length, color: '#94a3b8' },
    { name: 'Просрочено', value: overdues, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Year heatmap (last 30 days for simplicity)
  const heatmapData = useMemo(() => {
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
      days.push({ date: dateStr, value: completedCount });
    }
    return days;
  }, [habits]);

  // Projection
  const projection = useMemo(() => {
    const avgDailyIncome = totalIncome / 30;
    const avgDailyExpense = totalExpense / 30;
    const projectedCapital = balance + (avgDailyIncome - avgDailyExpense) * 30;
    const projectedXP = totalXP * 2;
    const projectedLevel = Math.min(10, Math.floor(projectedXP / 200) + 1);

    return {
      capital: projectedCapital,
      capitalTrend: avgDailyIncome > avgDailyExpense ? 'up' : 'down',
      xp: projectedXP,
      level: projectedLevel
    };
  }, [balance, totalIncome, totalExpense, totalXP]);

  // Capital history simulation
  const capitalHistory = useMemo(() => {
    const history = [];
    let cumulative = 0;
    const sortedFinance = [...finance].sort((a, b) => a.date.localeCompare(b.date));
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = sortedFinance.filter(f => f.date === dateStr);
      dayTransactions.forEach(t => {
        cumulative += t.type === 'income' ? t.amount : -t.amount;
      });
      
      history.push({ date: dateStr, value: Math.max(0, cumulative) });
    }
    return history;
  }, [finance]);

  const survivalMin = 200000;
  const comfortZone = 500000;
  const freedomZone = 1000000;

  // Empty state
  if (habits.length === 0 && tasks.length === 0 && finance.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Привет, {profile.name}! 👋</h1>
          <p className="text-gray-500 mt-1">Добро пожаловать в PRO SYSTEM</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-8 text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-4">🚀 Начните свой путь</h2>
          <p className="text-white/80 mb-6">
            Добавьте первые привычки, задачи и финансовые записи, чтобы система начала отслеживать ваш прогресс.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-2xl p-4 text-center">
              <div className="text-4xl mb-2">🧘</div>
              <p className="font-medium">Привычки</p>
              <p className="text-sm text-white/70 mt-1">Ежедневные ритуалы</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-medium">Задачи</p>
              <p className="text-sm text-white/70 mt-1">Цели с ROI</p>
            </div>
            <div className="bg-white/20 rounded-2xl p-4 text-center">
              <div className="text-4xl mb-2">💰</div>
              <p className="font-medium">Финансы</p>
              <p className="text-sm text-white/70 mt-1">Доходы и расходы</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">💡 Советы для старта</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">1.</span>
              Добавьте 3-5 ключевых привычек (спорт, чтение, медитация)
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">2.</span>
              Создайте задачи с приоритетом и ожидаемым ROI
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">3.</span>
              Записывайте все доходы и расходы для финансового анализа
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500">4.</span>
              Отслеживайте прогресс и зарабатывайте XP!
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 md:p-6 text-white animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold">🚨 ВНИМАНИЕ</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {alerts.map((alert, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm font-medium">
                    {alert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Центр управления 🚀</p>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500">Уровень</p>
            <p className="text-xl md:text-2xl font-bold text-indigo-600">Level {level}</p>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Star className="text-white" size={24} fill="white" />
          </div>
        </div>
      </div>

      {/* System Score Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-indigo-400" size={20} />
                <span className="text-indigo-400 font-medium text-sm">ИНДЕКС СИСТЕМНОСТИ</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl md:text-7xl font-bold">{systemScore}</span>
                <span className="text-2xl md:text-3xl text-gray-400">/ 100</span>
              </div>
              <div className={`mt-4 px-4 py-2 rounded-full inline-flex items-center gap-2 ${systemStatus.bg}/20`}>
                <span className={`text-sm md:text-lg font-semibold ${systemStatus.color}`}>{systemStatus.status}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-indigo-400">{disciplineIndex}%</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">Дисциплина</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-400">{taskEfficiency}%</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">Задачи</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-emerald-400">{financialGrowth > 0 ? '+' : ''}{financialGrowth}%</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">Финансы</div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${systemStatus.bg}`}
                style={{ width: `${systemScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Diagnosis + Energy Leak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className={`bg-gradient-to-br ${aiDiagnosis.color} rounded-2xl p-4 md:p-6 text-white`}>
          <div className="flex items-center gap-3 mb-4">
            <Brain size={24} />
            <span className="font-semibold">🧠 AI-ДИАГНОЗ</span>
          </div>
          <p className="text-xl md:text-2xl font-bold">{aiDiagnosis.message}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{maxStreak}</div>
              <div className="text-xs opacity-80">Макс Streak</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{overdues}</div>
              <div className="text-xs opacity-80">Просрочек</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{totalIncome > 0 ? Math.round((totalExpense/totalIncome)*100) : 0}%</div>
              <div className="text-xs opacity-80">Расх/Дох</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 rounded-xl">
              <Skull className="text-red-500" size={24} />
            </div>
            <span className="font-semibold text-gray-900">📉 УТЕЧКИ ЭНЕРГИИ</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <span className="text-gray-600 text-sm">Слабая привычка</span>
              <span className="font-bold text-red-600 text-sm">{energyLeak.weakestHabit?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <span className="text-gray-600 text-sm">Проблем. категория</span>
              <span className="font-bold text-orange-600 text-sm">{energyLeak.worstCategory?.[0] || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <span className="text-gray-600 text-sm">Убыт. проект</span>
              <span className="font-bold text-amber-600 text-sm">{energyLeak.worstProject?.[0] || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Projection */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Target size={24} />
          <span className="font-semibold">📅 ПРОГНОЗ НА 30 ДНЕЙ</span>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="bg-white/20 rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm opacity-80">Капитал</span>
              {projection.capitalTrend === 'up' ? 
                <TrendingUp className="text-emerald-300" size={16} /> : 
                <TrendingDown className="text-red-300" size={16} />
              }
            </div>
            <p className="text-lg md:text-2xl font-bold mt-2">₽{(projection.capital/1000).toFixed(0)}K</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm opacity-80">XP</span>
              <TrendingUp className="text-emerald-300" size={16} />
            </div>
            <p className="text-lg md:text-2xl font-bold mt-2">{Math.round(projection.xp)}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 md:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm opacity-80">Уровень</span>
              <Star className="text-amber-300" size={16} />
            </div>
            <p className="text-lg md:text-2xl font-bold mt-2">Lv {projection.level}</p>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-500" size={20} />
            <span className="font-semibold text-gray-700">Прогресс до Level {level + 1}</span>
          </div>
          <span className="text-sm text-gray-500">{totalXP} XP</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(totalXP % 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <StatCard
          title="Дисциплина"
          value={`${disciplineIndex}%`}
          icon={<Target className="text-indigo-500" size={20} />}
          accent
        />
        <StatCard
          title="Задачи"
          value={`${taskEfficiency}%`}
          icon={<Zap className="text-indigo-500" size={20} />}
        />
        <StatCard
          title="Финансы"
          value={`${financialGrowth > 0 ? '+' : ''}${financialGrowth}%`}
          icon={<DollarSign className="text-indigo-500" size={20} />}
        />
        <StatCard
          title="Баланс"
          value={`₽${(balance / 1000).toFixed(0)}K`}
          icon={<TrendingUp className="text-indigo-500" size={20} />}
        />
        <StatCard
          title="XP"
          value={totalXP}
          icon={<Trophy className="text-indigo-500" size={20} />}
        />
        <StatCard
          title="Streak"
          value={`${maxStreak} 🔥`}
          icon={<Flame className="text-indigo-500" size={20} />}
        />
      </div>

      {/* Charts */}
      {finance.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Доходы vs Расходы</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v/1000}K`} />
                <Tooltip 
                  contentStyle={{ background: '#1e1e1e', border: 'none', borderRadius: 12, color: '#fff' }}
                  formatter={(value) => [`₽${Number(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="income" fill={ACCENT} radius={[8, 8, 0, 0]} name="Доход" />
                <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} name="Расход" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {tasks.length > 0 && (
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Статус задач</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e1e1e', border: 'none', borderRadius: 12, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Year Heatmap */}
      {habits.length > 0 && (
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Heatmap года (365 дней)</h3>
          <div className="overflow-x-auto">
            <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(53, 1fr)', gridTemplateRows: 'repeat(7, 1fr)', minWidth: '700px' }}>
              {heatmapData.map((day, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-indigo-300"
                  style={{
                    background: day.value === 0 ? '#1e1e1e' : 
                      day.value === 1 ? '#3730a3' :
                      day.value === 2 ? '#4f46e5' :
                      day.value === 3 ? '#6366f1' :
                      day.value === 4 ? '#818cf8' : '#a5b4fc'
                  }}
                  title={`${day.date}: ${day.value} привычек`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>Меньше</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map(v => (
                <div key={v} className="w-3 h-3 rounded-sm" style={{
                  background: v === 0 ? '#1e1e1e' : 
                    v === 1 ? '#3730a3' :
                    v === 2 ? '#4f46e5' :
                    v === 3 ? '#6366f1' :
                    v === 4 ? '#818cf8' : '#a5b4fc'
                }} />
              ))}
            </div>
            <span>Больше</span>
          </div>
        </div>
      )}

      {/* Capital Graph */}
      {finance.length > 0 && (
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="text-emerald-500" size={20} />
            💎 Капитал с зонами свободы
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={capitalHistory}>
              <defs>
                <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip 
                contentStyle={{ background: '#1e1e1e', border: 'none', borderRadius: 12, color: '#fff' }}
                formatter={(value) => [`₽${Number(value).toLocaleString()}`, 'Капитал']}
              />
              <ReferenceLine y={survivalMin} stroke="#ef4444" strokeDasharray="5 5" />
              <ReferenceLine y={comfortZone} stroke="#f59e0b" strokeDasharray="5 5" />
              <ReferenceLine y={freedomZone} stroke="#10b981" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#capitalGradient)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600">Выживание (₽200K)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-600">Комфорт (₽500K)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-600">Свобода (₽1M)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
