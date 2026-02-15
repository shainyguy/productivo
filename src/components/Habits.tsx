import { useState, useRef } from 'react';
import { Check, Flame, Plus, TrendingUp, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';

const categories = ['Все', 'Здоровье', 'Ментальное', 'Развитие', 'Продуктивность', 'Финансы', 'Отношения', 'Другое'];

const defaultEmojis = ['🌅', '🧘', '📚', '💪', '🚰', '📝', '🌙', '💼', '🏃', '🧠', '🎯', '✨', '🍎', '💊', '🧹', '🛏️', '📱', '🎨'];

// Extended emoji picker categories
const emojiCategories = {
  'Частые': ['🎯', '💪', '🧘', '📚', '🏃', '💊', '🧠', '✨'],
  'Здоровье': ['💪', '🏃', '🚴', '🏊', '🧘', '🍎', '🥗', '💊', '💤', '🚰', '🧹', '🛁'],
  'Работа': ['💼', '📝', '💻', '📊', '📈', '🎯', '⏰', '📧', '📞', '🤝', '💡', '🚀'],
  'Развитие': ['📚', '🧠', '🎨', '🎵', '✍️', '🎓', '🌍', '💭', '📖', '🔬', '💪', '⭐'],
  'Духовное': ['🧘', '🙏', '🌅', '🌙', '☀️', '🌸', '🕯️', '✨', '💫', '🌈', '❤️', '🙌'],
  'Финансы': ['💰', '💵', '📈', '🏦', '💳', '🎰', '📊', '💎', '🪙', '📑', '🧾', '💸'],
  'Дом': ['🏠', '🧹', '🛏️', '🍳', '🧺', '🪴', '🛒', '🔧', '🗑️', '🧼', '🍽️', '🪥'],
};

export const Habits = () => {
  const { habits, addHabit, toggleHabit, deleteHabit } = useApp();
  const [filter, setFilter] = useState('Все');
  const [showAdd, setShowAdd] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('Частые');
  const [newHabit, setNewHabit] = useState({ name: '', emoji: '🎯', category: 'Здоровье', weight: 3 });
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartX = useRef(0);

  const today = new Date().toISOString().split('T')[0];
  const filteredHabits = filter === 'Все' ? habits : habits.filter(h => h.category === filter);

  const handleAddHabit = () => {
    if (!newHabit.name) return;
    addHabit({
      name: newHabit.name,
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
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 80) setSwipedId(id);
    else if (diff < -50) setSwipedId(null);
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
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Привычки</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Ежедневные ритуалы 🧘</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm md:text-base"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white text-center">
          <div className="text-5xl md:text-6xl mb-4">🧘</div>
          <h2 className="text-lg md:text-2xl font-bold mb-2">Добавьте первую привычку</h2>
          <p className="text-white/80 text-sm md:text-base mb-6">
            Привычки — основа продуктивности. Начните с малого.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 md:px-6 md:py-3 bg-white text-indigo-600 rounded-xl font-semibold text-sm md:text-base"
          >
            + Создать привычку
          </button>
        </div>

        {showAdd && renderAddModal()}
      </div>
    );
  }

  function renderEmojiPicker() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-[60]" onClick={() => setShowEmojiPicker(false)}>
        <div 
          className="bg-white rounded-t-3xl md:rounded-2xl p-5 w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
          <h3 className="text-lg font-bold text-gray-900 mb-4">Выберите иконку</h3>
          
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
            {Object.keys(emojiCategories).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedEmojiCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedEmojiCategory === cat ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Emoji grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-6 gap-2">
              {emojiCategories[selectedEmojiCategory as keyof typeof emojiCategories].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewHabit({ ...newHabit, emoji });
                    setShowEmojiPicker(false);
                  }}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all active:scale-90 ${
                    newHabit.emoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAddModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowAdd(false)}>
        <div 
          className="bg-white rounded-t-3xl md:rounded-2xl p-5 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up" 
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">➕ Новая привычка</h3>
          <div className="space-y-4">
            {/* Emoji selector - tap to open full picker */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Иконка</label>
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setShowEmojiPicker(true)}
                  className="w-16 h-16 rounded-2xl text-3xl flex items-center justify-center bg-indigo-100 ring-2 ring-indigo-500 transition-all active:scale-95"
                >
                  {newHabit.emoji}
                </button>
                <div className="flex flex-wrap gap-2 flex-1">
                  {defaultEmojis.slice(0, 8).map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNewHabit({ ...newHabit, emoji })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90 ${
                        newHabit.emoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowEmojiPicker(true)}
                    className="w-10 h-10 rounded-xl text-sm flex items-center justify-center bg-gray-100 text-gray-500"
                  >
                    ➕
                  </button>
                </div>
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Название (напр. Ранний подъём)"
              value={newHabit.name}
              onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-base"
            />
            
            <select
              value={newHabit.category}
              onChange={e => setNewHabit({ ...newHabit, category: e.target.value })}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-base bg-white"
            >
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <div>
              <label className="block text-sm text-gray-600 mb-3">Важность: <span className="font-bold text-indigo-600">{newHabit.weight}/5</span></label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(w => (
                  <button
                    key={w}
                    onClick={() => setNewHabit({ ...newHabit, weight: w })}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      newHabit.weight === w 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">Чем выше важность, тем больше XP</p>
            </div>
            
            <button
              onClick={handleAddHabit}
              disabled={!newHabit.name}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 text-base"
            >
              Добавить привычку
            </button>
          </div>
        </div>
        
        {showEmojiPicker && renderEmojiPicker()}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Привычки</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Ежедневные ритуалы 🧘</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm md:text-base"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Добавить</span>
        </button>
      </div>

      {/* Streak Bonus Alert */}
      {streakBonusHabits.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl md:rounded-2xl p-3 md:p-4 text-white flex items-center gap-3">
          <div className="text-2xl md:text-4xl">🔥</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm md:text-base">Бонус за Streak!</p>
            <p className="text-xs md:text-sm opacity-90">{streakBonusHabits.length} привычек с серией &gt;7 дней. +{streakBonusHabits.length * 20} XP!</p>
          </div>
        </div>
      )}

      {/* Stats - Mobile optimized */}
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-100 text-center">
          <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1 md:mb-2 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Check className="text-emerald-500" size={18} />
          </div>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{completionRate}%</p>
          <p className="text-[10px] md:text-sm text-gray-500">Сегодня</p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-100 text-center">
          <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1 md:mb-2 rounded-lg bg-orange-50 flex items-center justify-center">
            <Flame className="text-orange-500" size={18} />
          </div>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{avgStreak}</p>
          <p className="text-[10px] md:text-sm text-gray-500">Ср. streak</p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-100 text-center">
          <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1 md:mb-2 rounded-lg bg-indigo-50 flex items-center justify-center">
            <TrendingUp className="text-indigo-500" size={18} />
          </div>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{totalPoints}</p>
          <p className="text-[10px] md:text-sm text-gray-500">XP</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-3 md:p-5 text-white text-center">
          <p className="text-lg md:text-2xl font-bold">{maxStreak}</p>
          <p className="text-[10px] md:text-sm opacity-80">🔥 Рекорд</p>
        </div>
      </div>

      {/* Filters - Horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap text-sm transition-all ${
              filter === cat 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habits List - Mobile swipe */}
      <div className="space-y-2 md:space-y-3">
        {filteredHabits.map(habit => {
          const isCompletedToday = habit.completedDates.includes(today);
          const isSwiped = swipedId === habit.id;
          
          return (
            <div 
              key={habit.id}
              className="relative overflow-hidden rounded-xl md:rounded-2xl"
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, habit.id)}
            >
              {/* Swipe actions */}
              <div className={`absolute inset-y-0 right-0 flex transition-all ${isSwiped ? 'w-20' : 'w-0'}`}>
                <button 
                  onClick={() => {
                    deleteHabit(habit.id);
                    setSwipedId(null);
                  }} 
                  className="flex-1 bg-red-500 flex items-center justify-center"
                >
                  <Trash2 className="text-white" size={22} />
                </button>
              </div>
              
              <div 
                className={`bg-white p-3 md:p-4 border transition-all ${
                  isCompletedToday ? 'border-emerald-200 bg-emerald-50/50' : 
                  habit.streak === 0 ? 'border-red-100' : 'border-gray-100'
                } ${isSwiped ? '-translate-x-20' : 'translate-x-0'}`}
              >
                <div className="flex items-center gap-3">
                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0 ${
                      isCompletedToday 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompletedToday ? <Check size={24} /> : <span className="text-xl">{habit.emoji}</span>}
                  </button>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base truncate">{habit.name}</h3>
                      {habit.streak >= 7 && <span className="text-orange-500 shrink-0">🔥</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">{habit.category}</span>
                      <span className={`text-xs ${habit.streak >= 7 ? 'text-orange-500 font-medium' : habit.streak === 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {habit.streak} дн
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 md:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            habit.streak / 7 >= 0.7 ? 'bg-emerald-500' : 
                            habit.streak / 7 >= 0.4 ? 'bg-amber-500' : 'bg-red-400'
                          }`}
                          style={{ width: `${Math.min(100, (habit.streak / 7) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{Math.min(100, Math.round((habit.streak / 7) * 100))}%</span>
                    </div>
                  </div>
                  
                  {/* Weight & Points */}
                  <div className="text-right shrink-0">
                    <div className="flex gap-0.5 justify-end mb-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 md:w-1.5 h-2 md:h-3 rounded-sm ${i < habit.weight ? 'bg-indigo-500' : 'bg-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs md:text-sm font-bold ${isCompletedToday ? 'text-emerald-600' : 'text-gray-300'}`}>
                      +{habit.weight * 10}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swipe hint */}
      {habits.length > 0 && (
        <div className="md:hidden flex items-center justify-center gap-2 text-xs text-gray-400 py-2">
          <ChevronLeft size={14} />
          <span>Свайп влево для удаления</span>
          <ChevronRight size={14} />
        </div>
      )}

      {/* Top Habits */}
      {habits.length >= 3 && (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">🏆 Топ по Streak</h3>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {[...habits].sort((a, b) => b.streak - a.streak).slice(0, 3).map((habit, i) => (
              <div key={habit.id} className={`p-3 md:p-4 rounded-xl text-center ${
                i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                'bg-gradient-to-br from-orange-600 to-orange-700 text-white'
              }`}>
                <span className="text-xl md:text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                <p className="font-bold text-xs md:text-sm mt-1 truncate">{habit.emoji} {habit.name.split(' ')[0]}</p>
                <p className="text-xs md:text-sm opacity-80">{habit.streak} дн</p>
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
