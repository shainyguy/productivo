import { useState, useEffect } from 'react';
import { LayoutDashboard, Target, CheckSquare, Wallet, Gamepad2, BarChart3, Menu, X, Sparkles, AlertTriangle, User } from 'lucide-react';
import { AppProvider, useApp } from './store/AppContext';
import { Dashboard } from './components/Dashboard';
import { Habits } from './components/Habits';
import { Tasks } from './components/Tasks';
import { Finance } from './components/Finance';
import { Gamification } from './components/Gamification';
import { Analytics } from './components/Analytics';
import { Onboarding } from './components/Onboarding';
import { Account } from './components/Account';

type Tab = 'dashboard' | 'habits' | 'tasks' | 'finance' | 'gamification' | 'analytics';

const navItems = [
  { id: 'dashboard' as Tab, label: 'Панель', shortLabel: 'Главная', icon: LayoutDashboard, emoji: '📊' },
  { id: 'habits' as Tab, label: 'Привычки', shortLabel: 'Привычки', icon: Target, emoji: '🧘' },
  { id: 'tasks' as Tab, label: 'Задачи', shortLabel: 'Задачи', icon: CheckSquare, emoji: '✅' },
  { id: 'finance' as Tab, label: 'Финансы', shortLabel: 'Финансы', icon: Wallet, emoji: '💰' },
  { id: 'gamification' as Tab, label: 'RPG', shortLabel: 'RPG', icon: Gamepad2, emoji: '🎮' },
  { id: 'analytics' as Tab, label: 'Аналитика', shortLabel: 'Анализ', icon: BarChart3, emoji: '📈' },
];

const AppContent = () => {
  const { onboarded, habits, tasks, finance, getXP, getLevel, getSystemScore, profile } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!onboarded) {
    return <Onboarding />;
  }

  const level = getLevel();
  const xp = getXP();
  const systemScore = getSystemScore();
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  
  // Alert check
  const overdues = tasks.filter(t => t.status === 'overdue').length;
  const totalIncome = finance.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const hasAlert = overdues >= 5 || totalExpense > totalIncome;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'habits': return <Habits />;
      case 'tasks': return <Tasks />;
      case 'finance': return <Finance />;
      case 'gamification': return <Gamification />;
      case 'analytics': return <Analytics />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop only */}
      <aside className={`hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex-col z-50`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">PRO SYSTEM</h1>
              <p className="text-xs text-gray-500">v2.0 Premium</p>
            </div>
          </div>
        </div>

        {/* System Score Mini */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Индекс системы</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                systemScore >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 
                systemScore >= 40 ? 'bg-amber-500/20 text-amber-400' : 
                'bg-red-500/20 text-red-400'
              }`}>
                {systemScore >= 70 ? '🟢' : systemScore >= 40 ? '🟡' : '🔴'}
              </span>
            </div>
            <div className="text-2xl font-bold">{systemScore}</div>
            <div className="h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  systemScore >= 70 ? 'bg-emerald-500' : systemScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${systemScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-auto text-sm">{item.emoji}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setShowAccount(true)}
            className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white text-left hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-lg font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{profile.name}</p>
                <p className="text-xs text-gray-400">Level {level} • {profile.class === 'strategist' ? '🧠' : profile.class === 'executor' ? '⚡' : '🏗️'}</p>
              </div>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${(xp % 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">{xp} XP</p>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              
              {/* Mobile Logo */}
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="text-white" size={16} />
                </div>
                <span className="font-bold text-gray-900">PRO</span>
              </div>

              {/* Desktop Date */}
              <div className="hidden md:block text-sm text-gray-500">
                {new Date().toLocaleDateString('ru-RU', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
              
              {hasAlert && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg animate-pulse">
                  <AlertTriangle size={14} />
                  <span className="text-xs font-medium hidden sm:inline">Внимание</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Quick Stats */}
              <div className="flex items-center gap-1 px-2 py-1.5 bg-orange-50 text-orange-600 rounded-lg">
                <span className="text-sm">🔥</span>
                <span className="font-semibold text-xs">{maxStreak}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <span className="text-sm">⭐</span>
                <span className="font-semibold text-xs">Lv{level}</span>
              </div>
              <div className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg ${
                systemScore >= 70 ? 'bg-emerald-50 text-emerald-600' : 
                systemScore >= 40 ? 'bg-amber-50 text-amber-600' : 
                'bg-red-50 text-red-600'
              }`}>
                <span className="text-sm">{systemScore >= 70 ? '🟢' : systemScore >= 40 ? '🟡' : '🔴'}</span>
                <span className="font-semibold text-xs">{systemScore}%</span>
              </div>
              
              {/* Account Button - Mobile */}
              <button
                onClick={() => setShowAccount(true)}
                className="md:hidden p-2 bg-gray-100 rounded-xl"
              >
                <User size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 safe-area-pb">
        <div className="grid grid-cols-5 gap-1 px-2 py-1">
          {navItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-gray-400'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-indigo-100' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-medium">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sidebar Sheet */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 animate-slide-in shadow-2xl">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">PRO SYSTEM</h1>
                <p className="text-xs text-gray-500">v2.0 Premium</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
              <X size={20} />
            </button>
          </div>

          {/* User Card in Mobile Sidebar */}
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={() => {
                setShowAccount(true);
                setSidebarOpen(false);
              }}
              className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-xs text-gray-400">Level {level} • {xp} XP</p>
                </div>
              </div>
            </button>
          </div>

          {/* System Score */}
          <div className="p-4 border-b border-gray-100">
            <div className={`p-4 rounded-xl ${
              systemScore >= 70 ? 'bg-emerald-50' : systemScore >= 40 ? 'bg-amber-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Индекс системы</span>
                <span className={`text-2xl font-bold ${
                  systemScore >= 70 ? 'text-emerald-600' : systemScore >= 40 ? 'text-amber-600' : 'text-red-600'
                }`}>{systemScore}%</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    systemScore >= 70 ? 'bg-emerald-500' : systemScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${systemScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100 active:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                      <span className="ml-auto">{item.emoji}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* Account Modal */}
      {showAccount && <Account onClose={() => setShowAccount(false)} />}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
