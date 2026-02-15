import { useState, useRef } from 'react';
import { Check, X, Flame, Plus, TrendingUp, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppContext';

const categories = ['Все', 'Здоровье', 'Ментальное', 'Развитие', 'Продуктивность', 'Другое'];
const emojis = ['🌅', '🧘', '📚', '💪', '🚰', '📝', '🌙', '💼', '🏃', '🧠', '🎯', '✨'];

export const Habits = () => {
  const { habits, addHabit, toggleHabit, deleteHabit } = useApp();
  const [filter, setFilter] = useState('Все');
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', emoji: '🎯', category: 'Здоровье', weight: 3 });
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartX = useRef(0);

  const today = new Date().toISOString().split('T')[0];
  const filteredHabits = filter === 'Все' ? habits : habits.filter(h => h.category === filter);

  const handleAddHabit = () => {
    if (!newHabit.name) return;
    addHabit({
      name: `${newHabit.emoji} ${newHabit.name}`,
      emoji: newHabit.emoji,
      category: newHabit.category,
      weight: newHabit.weight,
      date: today,
      completed: false,
    });
    setNewHabit({ name: '', emoji: '🎯', category: 'Здоровье', weight: 3 });
    setShowAdd(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipedId(null);
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      setSwipedId(id);
    } else if (diff < -50) {
      setSwipedId(null);
    }
  };

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const avgStreak = habits.length > 0 ? Math.round(habits.reduce((a, b) => a + b.streak, 0) / habits.length) : 0;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const totalPoints = habits.reduce((sum, h) => sum + (h.completedDates.includes(today) ? h.weight * 10 : 0), 0);
  const streakBonusHabits = habits.filter(h => h.streak >= 7);

  // Empty state
  if (habits.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Привычки</h1>
            <p className="text-gray-500 mt-1">Ежедневные ритуалы 🧘</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-8 text-white text-center">
          <div className="text-6xl mb-4">🧘</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Добавьте первую привычку</h2>
          <p className="text-white/80 mb-6">
            Привычки — основа продуктивности. Начните с малого: спорт, чтение, медитация.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-white/90 transition-colors"
          >
            + Создать привычку
          </button>
        </div>

        {/* Add Modal */}
        {showAdd && renderAddModal()}
      </div>
    );
  }

  function renderAddModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">➕ Новая привычка</h3>
          <div className="space-y-4">
            {/* Emoji selector */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Эмодзи</label>
              <div className="flex flex-wrap gap-2">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewHabit({ ...newHabit, emoji })}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      newHabit.emoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Название (напр. Ранний подъём)"
              value={newHabit.name}
              onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <select
              value={newHabit.category}
              onChange={e => setNewHabit({ ...newHabit, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Важность (1-5)</label>
              <input
                type="range"
                min="1"
                max="5"
                value={newHabit.weight}
                onChange={e => setNewHabit({ ...newHabit, weight: parseInt(e.target.value) })}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>1</span>
                <span className="font-medium text-indigo-600">{newHabit.weight}</span>
                <span>5</span>
              </div>
            </div>
            <button
              onClick={handleAddHabit}
              disabled={!newHabit.name}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              Добавить привычку
            </button>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Привычки</h1>
          <p className="text-gray-500 mt-1">Ежедневные ритуалы 🧘</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Добавить</span>
        </button>
      </div>

      {/* Streak Bonus Alert */}
      {streakBonusHabits.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white flex items-center gap-4">
          <div className="text-3xl md:text-4xl">🔥</div>
          <div>
            <p className="font-bold">Бонус за Streak!</p>
            <p className="text-sm opacity-90">{streakBonusHabits.length} привычек с серией &gt;7 дней. +{streakBonusHabits.length * 20} XP!</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-emerald-50 rounded-xl">
              <Check className="text-emerald-500" size={20} />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{completionRate}%</p>
              <p className="text-xs md:text-sm text-gray-500">Сегодня</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-orange-50 rounded-xl">
              <Flame className="text-orange-500" size={20} />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{avgStreak}</p>
              <p className="text-xs md:text-sm text-gray-500">Ср. streak</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-indigo-50 rounded-xl">
              <TrendingUp className="text-indigo-500" size={20} />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{totalPoints}</p>
              <p className="text-xs md:text-sm text-gray-500">XP сегодня</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 md:p-5 text-white">
          <p className="text-xl md:text-2xl font-bold">{maxStreak} 🔥</p>
          <p className="text-xs md:text-sm opacity-80">Лучший streak</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              filter === cat 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habits List (Mobile Cards) */}
      <div className="space-y-3">
        {filteredHabits.map(habit => {
          const isCompletedToday = habit.completedDates.includes(today);
          const isSwiped = swipedId === habit.id;
          
          return (
            <div 
              key={habit.id}
              className="relative overflow-hidden"
              onTouchStart={(e) => handleTouchStart(e)}
              onTouchEnd={(e) => handleTouchEnd(e, habit.id)}
            >
              {/* Delete button (revealed on swipe) */}
              <div className={`absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center transition-opacity ${isSwiped ? 'opacity-100' : 'opacity-0'}`}>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-3 text-white"
                >
                  <Trash2 size={24} />
                </button>
              </div>
              
              <div 
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  isCompletedToday ? 'border-emerald-200 bg-emerald-50/30' : 
                  habit.streak === 0 ? 'border-red-100' : 'border-gray-100'
                } ${isSwiped ? '-translate-x-20' : 'translate-x-0'}`}
              >
                <div className="flex items-center gap-4">
                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                      isCompletedToday 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {isCompletedToday ? <Check size={24} /> : <X size={24} />}
                  </button>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{habit.name}</h3>
                      {habit.streak >= 7 && <span className="text-orange-500">🔥</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">{habit.category}</span>
                      <span className="text-xs text-gray-400">
                        Streak: <span className={habit.streak >= 7 ? 'text-orange-500 font-medium' : habit.streak === 0 ? 'text-red-500' : 'text-gray-600'}>{habit.streak}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Weight & Points */}
                  <div className="text-right">
                    <div className="flex gap-0.5 justify-end mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-3 rounded-sm ${i < habit.weight ? 'bg-indigo-500' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-bold ${isCompletedToday ? 'text-emerald-600' : 'text-gray-300'}`}>
                      +{habit.weight * 10} XP
                    </span>
                  </div>
                </div>
                
                {/* Progress bar (7-day completion) */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        habit.streak / 7 >= 0.7 ? 'bg-emerald-500' : 
                        habit.streak / 7 >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (habit.streak / 7) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{Math.min(100, Math.round((habit.streak / 7) * 100))}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Habits */}
      {habits.length >= 3 && (
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Топ привычек по Streak</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {[...habits].sort((a, b) => b.streak - a.streak).slice(0, 3).map((habit, i) => (
              <div key={habit.id} className={`p-4 rounded-xl ${
                i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                'bg-gradient-to-br from-orange-600 to-orange-700 text-white'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{habit.name}</p>
                    <p className="text-sm opacity-80">{habit.streak} дней</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && renderAddModal()}
    </div>
  );
};
