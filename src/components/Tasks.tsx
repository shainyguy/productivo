import { useState, useRef } from 'react';
import { CheckCircle, Clock, AlertTriangle, Plus, Filter, Timer, Zap, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../store/AppContext';

const categories = ['Все', 'Бизнес', 'Контент', 'Маркетинг', 'Развитие', 'Личное', 'Дом', 'Другое'];
const taskEmojis = ['📋', '💼', '📱', '🎯', '🚀', '💡', '📝', '🏠', '🛒', '🔧', '📞', '✉️', '🎨', '📊', '🔬', '🏃', '🧹', '🍳'];

const statusLabels = {
  pending: { label: 'В процессе', color: 'bg-blue-100 text-blue-600', icon: Clock },
  completed: { label: 'Выполнено', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle },
  overdue: { label: 'Просрочено', color: 'bg-red-100 text-red-600', icon: AlertTriangle }
};

export const Tasks = () => {
  const { tasks, addTask, completeTask, deleteTask } = useApp();
  const [filter, setFilter] = useState('Все');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'roi'>('priority');
  const [showAdd, setShowAdd] = useState(false);
  const [showTimer, setShowTimer] = useState<string | null>(null);
  const [actualTime, setActualTime] = useState<number>(0);
  const [newTask, setNewTask] = useState({ 
    name: '', 
    emoji: '📋',
    category: 'Личное', 
    priority: 3, 
    roi: 0, 
    hasRoi: false,
    deadline: '', 
    plannedTime: 30 
  });
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartX = useRef(0);

  const filteredTasks = (filter === 'Все' ? tasks : tasks.filter(t => t.category === filter))
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priority - a.priority;
      if (sortBy === 'roi') return (b.roi || 0) - (a.roi || 0);
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const handleCompleteTask = (id: string, time: number) => {
    completeTask(id, time);
    setShowTimer(null);
    setActualTime(0);
  };

  const handleAddTask = () => {
    if (!newTask.name || !newTask.deadline) return;
    addTask({
      name: newTask.name,
      emoji: newTask.emoji,
      category: newTask.category,
      priority: newTask.priority,
      roi: newTask.hasRoi ? newTask.roi : undefined,
      deadline: newTask.deadline,
      plannedTime: newTask.plannedTime,
    });
    setNewTask({ name: '', emoji: '📋', category: 'Личное', priority: 3, roi: 0, hasRoi: false, deadline: '', plannedTime: 30 });
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

  const handleSwipeComplete = (id: string) => {
    setShowTimer(id);
    setSwipedId(null);
  };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const totalROI = tasks.filter(t => t.status === 'completed' && t.roi).reduce((a, b) => a + (b.roi || 0), 0);
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  
  const tasksWithTime = tasks.filter(t => t.status === 'completed' && t.plannedTime && t.actualTime);
  const fasterTasks = tasksWithTime.filter(t => t.actualTime! < t.plannedTime).length;
  const timeBonus = tasksWithTime.reduce((acc, t) => {
    if (t.actualTime! < t.plannedTime) {
      return acc + Math.round(((t.plannedTime - t.actualTime!) / t.plannedTime) * 20);
    }
    return acc;
  }, 0);

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Задачи</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Цели с фокусом на результат 🎯</p>
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
          <div className="text-5xl md:text-6xl mb-4">✅</div>
          <h2 className="text-lg md:text-2xl font-bold mb-2">Добавьте первую задачу</h2>
          <p className="text-white/80 text-sm md:text-base mb-6">
            ROI опционален — для бытовых задач просто пропустите его
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 md:px-6 md:py-3 bg-white text-indigo-600 rounded-xl font-semibold text-sm md:text-base"
          >
            + Создать задачу
          </button>
        </div>

        {showAdd && renderAddModal()}
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
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">🎯 Новая задача</h3>
          <div className="space-y-4">
            {/* Emoji selector */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Иконка</label>
              <div className="flex flex-wrap gap-2">
                {taskEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewTask({ ...newTask, emoji })}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      newTask.emoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110' : 'bg-gray-100 hover:bg-gray-200 active:scale-95'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Название задачи"
              value={newTask.name}
              onChange={e => setNewTask({ ...newTask, name: e.target.value })}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-base"
            />
            
            <select
              value={newTask.category}
              onChange={e => setNewTask({ ...newTask, category: e.target.value })}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-base bg-white"
            >
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Дедлайн</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">⏱️ План (мин)</label>
                <input
                  type="number"
                  value={newTask.plannedTime}
                  onChange={e => setNewTask({ ...newTask, plannedTime: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Приоритет</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    onClick={() => setNewTask({ ...newTask, priority: p })}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      newTask.priority === p 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* ROI toggle */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-700 font-medium">💰 Указать ROI</span>
                  <p className="text-xs text-gray-500 mt-1">Опционально для бизнес-задач</p>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full transition-colors ${newTask.hasRoi ? 'bg-indigo-500' : 'bg-gray-300'}`}
                  onClick={() => setNewTask({ ...newTask, hasRoi: !newTask.hasRoi })}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${newTask.hasRoi ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </label>
              {newTask.hasRoi && (
                <div className="mt-3">
                  <input
                    type="number"
                    placeholder="Ожидаемый ROI в ₽"
                    value={newTask.roi || ''}
                    onChange={e => setNewTask({ ...newTask, roi: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleAddTask}
              disabled={!newTask.name || !newTask.deadline}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 text-base"
            >
              Создать задачу
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderTimerModal() {
    const task = tasks.find(t => t.id === showTimer);
    if (!task) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowTimer(null)}>
        <div className="bg-white rounded-t-3xl md:rounded-2xl p-5 md:p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Timer className="text-indigo-500" />
            ⏱️ Завершение задачи
          </h3>
          <div className="space-y-4">
            <div className="text-center p-5 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 mb-2 text-sm">Плановое время</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">{task.plannedTime} мин</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Фактическое время (мин)</label>
              <input
                type="number"
                value={actualTime || ''}
                onChange={e => setActualTime(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl"
                placeholder="0"
                autoFocus
              />
            </div>
            {actualTime > 0 && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                actualTime < task.plannedTime ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                <Zap size={20} />
                <span className="font-medium">
                  {actualTime < task.plannedTime 
                    ? `🚀 Бонус XP: +${Math.round(((task.plannedTime - actualTime) / task.plannedTime) * 20)}`
                    : `⚠️ Превышение времени`
                  }
                </span>
              </div>
            )}
            <button
              onClick={() => handleCompleteTask(showTimer!, actualTime)}
              disabled={actualTime <= 0}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              ✅ Завершить задачу
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
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Задачи</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Приоритеты + Время 🎯</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium text-sm md:text-base"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Добавить</span>
        </button>
      </div>

      {/* Stats - Mobile optimized */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl md:text-3xl">✅</span>
            <span className="text-xs md:text-sm text-gray-400">{tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0}%</span>
          </div>
          <p className="text-lg md:text-2xl font-bold text-gray-900">{completed}/{tasks.length}</p>
          <p className="text-xs md:text-sm text-gray-500">Выполнено</p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-100">
          <span className="text-2xl md:text-3xl">⏱️</span>
          <p className="text-lg md:text-2xl font-bold text-indigo-600 mt-2">{fasterTasks}</p>
          <p className="text-xs md:text-sm text-gray-500">Быстрее плана</p>
          <p className="text-xs text-indigo-500 mt-1">+{timeBonus} XP</p>
        </div>
        {totalROI > 0 && (
          <div className="bg-white rounded-xl p-3 md:p-5 border border-gray-100">
            <span className="text-2xl md:text-3xl">💰</span>
            <p className="text-lg md:text-2xl font-bold text-emerald-600 mt-2">₽{(totalROI / 1000).toFixed(0)}K</p>
            <p className="text-xs md:text-sm text-gray-500">ROI реализ.</p>
          </div>
        )}
        <div className={`rounded-xl p-3 md:p-5 ${overdueCount > 0 ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white' : 'bg-white border border-gray-100'}`}>
          <span className="text-2xl md:text-3xl">{overdueCount > 0 ? '🚨' : '✨'}</span>
          <p className={`text-lg md:text-2xl font-bold mt-2 ${overdueCount > 0 ? '' : 'text-gray-900'}`}>{overdueCount}</p>
          <p className={`text-xs md:text-sm ${overdueCount > 0 ? 'opacity-80' : 'text-gray-500'}`}>Просрочено</p>
          {overdueCount >= 3 && <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 mt-1 inline-block">x2 штраф</span>}
        </div>
      </div>

      {/* Filters - Horizontal scroll on mobile */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <Filter size={16} className="text-gray-400 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === cat ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 md:ml-auto">
          <span className="text-xs text-gray-400 self-center mr-2">Сортировка:</span>
          {(['priority', 'deadline', 'roi'] as const).map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                sortBy === sort ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {sort === 'priority' ? '🔥' : sort === 'deadline' ? '📅' : '💰'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List - Mobile swipe enabled */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const StatusIcon = statusLabels[task.status].icon;
          const isSwiped = swipedId === task.id;
          
          return (
            <div 
              key={task.id}
              className="relative overflow-hidden rounded-2xl"
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, task.id)}
            >
              {/* Swipe actions */}
              <div className={`absolute inset-y-0 right-0 flex transition-all ${isSwiped ? 'w-32' : 'w-0'}`}>
                <button 
                  onClick={() => handleSwipeComplete(task.id)} 
                  className="flex-1 bg-emerald-500 flex items-center justify-center"
                >
                  <CheckCircle className="text-white" size={24} />
                </button>
                <button 
                  onClick={() => deleteTask(task.id)} 
                  className="flex-1 bg-red-500 flex items-center justify-center"
                >
                  <Trash2 className="text-white" size={24} />
                </button>
              </div>
              
              <div 
                className={`bg-white p-4 border transition-transform ${
                  task.status === 'overdue' ? 'border-red-200 bg-red-50/30' : 
                  task.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 
                  'border-gray-100'
                } ${isSwiped ? '-translate-x-32' : 'translate-x-0'}`}
              >
                <div className="flex items-start gap-3">
                  {/* Emoji / Status */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                    task.status === 'completed' ? 'bg-emerald-100' : 
                    task.status === 'overdue' ? 'bg-red-100' : 
                    'bg-gray-100'
                  }`}>
                    {task.status === 'completed' ? '✅' : task.emoji || '📋'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[task.status].color}`}>
                        <StatusIcon size={10} className="inline mr-1" />
                        {statusLabels[task.status].label}
                      </span>
                      <div className="flex gap-0.5 ml-auto">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1.5 h-1.5 rounded-full ${i < task.priority ? 'bg-indigo-500' : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">{task.name}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">{task.category}</span>
                      <span className="text-gray-400">📅 {task.deadline}</span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <Timer size={12} /> {task.plannedTime}м
                      </span>
                      {task.actualTime && (
                        <span className={task.actualTime < task.plannedTime ? 'text-emerald-600' : 'text-red-500'}>
                          → {task.actualTime}м {task.actualTime < task.plannedTime ? '🚀' : '⚠️'}
                        </span>
                      )}
                    </div>

                    {/* ROI & Action */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      {task.roi ? (
                        <div>
                          <p className="text-xs text-gray-500">ROI</p>
                          <p className="font-bold text-emerald-600 text-sm">₽{task.roi.toLocaleString()}</p>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">Без ROI</div>
                      )}
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => setShowTimer(task.id)}
                          className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl flex items-center gap-1 active:scale-95"
                        >
                          <Timer size={14} />
                          <span className="hidden sm:inline">Завершить</span>
                          <span className="sm:hidden">✓</span>
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
                          +{task.priority * 10} XP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swipe hint for mobile */}
      {tasks.length > 0 && tasks.some(t => t.status === 'pending') && (
        <div className="md:hidden flex items-center justify-center gap-2 text-xs text-gray-400 py-2">
          <ChevronLeft size={14} />
          <span>Свайп влево для действий</span>
          <ChevronRight size={14} />
        </div>
      )}

      {/* Modals */}
      {showAdd && renderAddModal()}
      {showTimer && renderTimerModal()}
    </div>
  );
};
