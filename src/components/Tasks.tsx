import { useState, useRef } from 'react';
import { CheckCircle, Clock, AlertTriangle, Plus, Filter, Timer, Zap, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppContext';

const categories = ['Все', 'Бизнес', 'Контент', 'Маркетинг', 'Развитие', 'Другое'];

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
  const [newTask, setNewTask] = useState({ name: '', category: 'Бизнес', priority: 3, roi: 10000, deadline: '', plannedTime: 60 });
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const touchStartX = useRef(0);

  const filteredTasks = (filter === 'Все' ? tasks : tasks.filter(t => t.category === filter))
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priority - a.priority;
      if (sortBy === 'roi') return b.roi - a.roi;
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
      category: newTask.category,
      priority: newTask.priority,
      roi: newTask.roi,
      deadline: newTask.deadline,
      plannedTime: newTask.plannedTime,
    });
    setNewTask({ name: '', category: 'Бизнес', priority: 3, roi: 10000, deadline: '', plannedTime: 60 });
    setShowAdd(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipedId(null);
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setSwipedId(id);
    else if (diff < -50) setSwipedId(null);
  };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const totalROI = tasks.filter(t => t.status === 'completed').reduce((a, b) => a + b.roi, 0);
  const avgPriority = tasks.length > 0 ? (tasks.reduce((a, b) => a + b.priority, 0) / tasks.length).toFixed(1) : '0';
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Задачи</h1>
            <p className="text-gray-500 mt-1">Цели с фокусом на ROI 🎯</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-8 text-white text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Добавьте первую задачу</h2>
          <p className="text-white/80 mb-6">
            Задачи с ROI помогают фокусироваться на том, что приносит результат.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold"
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Новая задача</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Название задачи"
              value={newTask.name}
              onChange={e => setNewTask({ ...newTask, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <select
              value={newTask.category}
              onChange={e => setNewTask({ ...newTask, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Приоритет</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newTask.priority}
                  onChange={e => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
                <p className="text-center font-bold text-indigo-600">{newTask.priority}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">ROI (₽)</label>
                <input
                  type="number"
                  value={newTask.roi}
                  onChange={e => setNewTask({ ...newTask, roi: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Дедлайн</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">⏱️ План (мин)</label>
                <input
                  type="number"
                  value={newTask.plannedTime}
                  onChange={e => setNewTask({ ...newTask, plannedTime: parseInt(e.target.value) || 60 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleAddTask}
              disabled={!newTask.name || !newTask.deadline}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTimer(null)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Timer className="text-indigo-500" />
            ⏱️ Завершение задачи
          </h3>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 mb-2">Плановое время</p>
              <p className="text-3xl font-bold text-gray-900">{task.plannedTime} мин</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Фактическое время (мин)</label>
              <input
                type="number"
                value={actualTime}
                onChange={e => setActualTime(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl"
                placeholder="0"
              />
            </div>
            {actualTime > 0 && (
              <div className={`p-4 rounded-xl ${
                actualTime < task.plannedTime ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  <Zap size={20} />
                  <span className="font-medium">
                    {actualTime < task.plannedTime 
                      ? `🚀 Бонус XP: +${Math.round(((task.plannedTime - actualTime) / task.plannedTime) * 20)}`
                      : `⚠️ Штраф: -${Math.round(((actualTime - task.plannedTime) / task.plannedTime) * 10)}`
                    }
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => handleCompleteTask(showTimer!, actualTime)}
              disabled={actualTime <= 0}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium disabled:opacity-50"
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Задачи</h1>
          <p className="text-gray-500 mt-1">ROI + Время = Эффективность 🎯</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Добавить</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{completed}/{tasks.length}</p>
              <p className="text-xs md:text-sm text-gray-500">Выполнено</p>
            </div>
            <div className="text-2xl md:text-3xl">✅</div>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <p className="text-xl md:text-2xl font-bold text-gray-900">₽{(totalROI / 1000).toFixed(0)}K</p>
          <p className="text-xs md:text-sm text-gray-500">ROI реализ.</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <p className="text-xl md:text-2xl font-bold text-gray-900">{avgPriority}</p>
          <p className="text-xs md:text-sm text-gray-500">Ср. приоритет</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-indigo-100">
          <p className="text-xl md:text-2xl font-bold text-indigo-600">{fasterTasks}</p>
          <p className="text-xs md:text-sm text-gray-500">Быстрее плана</p>
          <p className="text-xs text-indigo-500 mt-1">+{timeBonus} XP</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 md:p-5 text-white col-span-2 md:col-span-1">
          <p className="text-xl md:text-2xl font-bold">{overdueCount}</p>
          <p className="text-xs md:text-sm opacity-80">Просрочено ⚠️</p>
          {overdueCount >= 3 && <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 mt-1 inline-block">x2 штраф</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <div className="flex gap-1 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                  filter === cat ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 ml-auto">
          {(['priority', 'deadline', 'roi'] as const).map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                sortBy === sort ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {sort === 'priority' ? '🔥' : sort === 'deadline' ? '📅' : '💰'}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const StatusIcon = statusLabels[task.status].icon;
          const isSwiped = swipedId === task.id;
          
          return (
            <div 
              key={task.id}
              className="relative overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, task.id)}
            >
              {/* Delete button */}
              <div className={`absolute right-0 top-0 bottom-0 w-20 bg-red-500 flex items-center justify-center transition-opacity ${isSwiped ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={() => deleteTask(task.id)} className="p-3 text-white">
                  <Trash2 size={24} />
                </button>
              </div>
              
              <div 
                className={`bg-white rounded-2xl p-4 md:p-5 border transition-all ${
                  task.status === 'overdue' ? 'border-red-200 bg-red-50/30' : 
                  task.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 
                  'border-gray-100'
                } ${isSwiped ? '-translate-x-20' : 'translate-x-0'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[task.status].color}`}>
                    <StatusIcon size={12} className="inline mr-1" />
                    {statusLabels[task.status].label}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${i < task.priority ? 'bg-indigo-500' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{task.name}</h3>
                
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{task.category}</span>
                  <span className="text-xs text-gray-400">📅 {task.deadline}</span>
                </div>

                {/* Time info */}
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <Timer size={14} className="text-indigo-400" />
                  <span className="text-gray-500">План: {task.plannedTime} мин</span>
                  {task.actualTime && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className={task.actualTime < task.plannedTime ? 'text-emerald-600' : 'text-red-500'}>
                        Факт: {task.actualTime} мин {task.actualTime < task.plannedTime ? '🚀' : '⚠️'}
                      </span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">ROI</p>
                    <p className="font-bold text-emerald-600">₽{task.roi.toLocaleString()}</p>
                  </div>
                  {task.status === 'completed' ? (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">XP</p>
                      <p className="font-bold text-indigo-600">+{task.priority * 10}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowTimer(task.id)}
                      className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl flex items-center gap-1"
                    >
                      <Timer size={16} />
                      Завершить
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showAdd && renderAddModal()}
      {showTimer && renderTimerModal()}
    </div>
  );
};
