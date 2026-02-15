import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, Target, Shield, Trash2, Calculator } from 'lucide-react';
import { useApp } from '../store/AppContext';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
const incomeCategories = ['Фриланс', 'Зарплата', 'Инвестиции', 'Курсы', 'Консалтинг', 'Другое'];
const expenseCategories = ['Подписки', 'Оборудование', 'Аренда', 'Маркетинг', 'Налоги', 'Транспорт', 'Еда', 'Другое'];

export const Finance = () => {
  const { finance, addFinanceEntry, deleteFinanceEntry } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: 0,
    project: '',
    mandatory: false,
    roi: 0,
    comment: ''
  });
  const [scenario, setScenario] = useState({ incomeChange: 0, expenseChange: 0 });

  const totalIncome = finance.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = finance.filter(e => e.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;
  const mandatoryExpense = finance.filter(e => e.type === 'expense' && e.mandatory).reduce((a, b) => a + b.amount, 0);
  const mandatoryRatio = totalExpense > 0 ? Math.round((mandatoryExpense / totalExpense) * 100) : 0;
  const incomeEntries = finance.filter(e => e.type === 'income' && e.roi > 0);
  const avgROI = incomeEntries.length > 0 
    ? Math.round(incomeEntries.reduce((a, b) => a + b.roi, 0) / incomeEntries.length)
    : 0;
  const financialCushion = totalExpense > 0 ? (balance / totalExpense).toFixed(1) : '∞';

  // Capital zones
  const survivalMin = 200000;
  const comfortZone = 500000;
  const freedomZone = 1000000;

  // Capital history
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

  const currentCapital = capitalHistory.length > 0 ? capitalHistory[capitalHistory.length - 1].value : 0;
  const currentZone = currentCapital >= freedomZone ? 'freedom' : 
                      currentCapital >= comfortZone ? 'comfort' : 
                      currentCapital >= survivalMin ? 'survival' : 'danger';

  // Expense by category
  const expenseByCategory = finance
    .filter(e => e.type === 'expense')
    .reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
  const expensePieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  // Income by project
  const incomeByProject = finance
    .filter(e => e.type === 'income' && e.project)
    .reduce((acc: Record<string, number>, e) => {
      acc[e.project] = (acc[e.project] || 0) + e.amount;
      return acc;
    }, {});
  const projectData = Object.entries(incomeByProject).map(([name, value]) => ({ name, value }));

  // Scenario analysis
  const scenarioResult = useMemo(() => {
    const newIncome = totalIncome * (1 + scenario.incomeChange / 100);
    const newExpense = totalExpense * (1 - scenario.expenseChange / 100);
    const newBalance = newIncome - newExpense;
    const improvement = newBalance - balance;
    return { newIncome, newExpense, newBalance, improvement };
  }, [totalIncome, totalExpense, balance, scenario]);

  const handleAddEntry = () => {
    if (!newEntry.category || newEntry.amount <= 0) return;
    addFinanceEntry({
      date: new Date().toISOString().split('T')[0],
      ...newEntry
    });
    setNewEntry({ type: 'income', category: '', amount: 0, project: '', mandatory: false, roi: 0, comment: '' });
    setShowAdd(false);
  };

  // Empty state
  if (finance.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Финансы</h1>
            <p className="text-gray-500 mt-1">Контроль денежных потоков 💰</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 md:p-8 text-white text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Начните отслеживать финансы</h2>
          <p className="text-white/80 mb-6">
            Записывайте доходы и расходы для полной финансовой картины.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold"
          >
            + Добавить запись
          </button>
        </div>

        {showAdd && renderAddModal()}
      </div>
    );
  }

  function renderAddModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowAdd(false)}>
        <div className="bg-white rounded-t-3xl md:rounded-2xl p-5 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
          <h3 className="text-xl font-bold text-gray-900 mb-4">💵 Новая запись</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setNewEntry({ ...newEntry, type: 'income', category: '' })}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  newEntry.type === 'income' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                📈 Доход
              </button>
              <button
                onClick={() => setNewEntry({ ...newEntry, type: 'expense', category: '' })}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  newEntry.type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                📉 Расход
              </button>
            </div>
            <select
              value={newEntry.category}
              onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Выберите категорию</option>
              {(newEntry.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Сумма"
              value={newEntry.amount || ''}
              onChange={e => setNewEntry({ ...newEntry, amount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {newEntry.type === 'income' && (
              <>
                <input
                  type="text"
                  placeholder="Проект (опционально)"
                  value={newEntry.project}
                  onChange={e => setNewEntry({ ...newEntry, project: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="ROI %"
                  value={newEntry.roi || ''}
                  onChange={e => setNewEntry({ ...newEntry, roi: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </>
            )}
            {newEntry.type === 'expense' && (
              <>
                <input
                  type="text"
                  placeholder="Проект (опционально)"
                  value={newEntry.project}
                  onChange={e => setNewEntry({ ...newEntry, project: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEntry.mandatory}
                    onChange={e => setNewEntry({ ...newEntry, mandatory: e.target.checked })}
                    className="w-5 h-5 accent-indigo-500"
                  />
                  <span className="text-gray-700">Обязательный расход</span>
                </label>
              </>
            )}
            <input
              type="text"
              placeholder="Комментарий"
              value={newEntry.comment}
              onChange={e => setNewEntry({ ...newEntry, comment: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleAddEntry}
              disabled={!newEntry.category || newEntry.amount <= 0}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              Добавить
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Финансы</h1>
          <p className="text-gray-500 mt-1">Контроль над деньгами 💰</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScenario(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 bg-amber-50 text-amber-600 rounded-xl font-medium"
          >
            <Calculator size={18} />
            <span className="hidden md:inline">Сценарий</span>
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 md:p-5 text-white">
          <TrendingUp size={20} className="mb-2 opacity-80" />
          <p className="text-xl md:text-2xl font-bold">₽{(totalIncome / 1000).toFixed(0)}K</p>
          <p className="text-xs md:text-sm opacity-80">Доходы</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-4 md:p-5 text-white">
          <TrendingDown size={20} className="mb-2 opacity-80" />
          <p className="text-xl md:text-2xl font-bold">₽{(totalExpense / 1000).toFixed(0)}K</p>
          <p className="text-xs md:text-sm opacity-80">Расходы</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 md:p-5 text-white">
          <Wallet size={20} className="mb-2 opacity-80" />
          <p className="text-xl md:text-2xl font-bold">₽{(balance / 1000).toFixed(0)}K</p>
          <p className="text-xs md:text-sm opacity-80">Баланс</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Target className="text-indigo-500" size={16} />
            <span className="text-xs text-gray-500">Обязательные</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{mandatoryRatio}%</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="text-emerald-500" size={16} />
            <span className="text-xs text-gray-500">Ср. ROI</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{avgROI}%</p>
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <PiggyBank className="text-purple-500" size={16} />
            <span className="text-xs text-gray-500">Подушка</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{financialCushion} мес</p>
        </div>
      </div>

      {/* Capital with Zones */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="text-emerald-500" size={20} />
          💎 Капитал: зоны свободы
        </h3>
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
          <div className={`p-3 md:p-4 rounded-xl text-center ${currentZone === 'danger' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-red-50'}`}>
            <p className="text-xs md:text-sm text-red-600">🔴 Опасность</p>
            <p className="text-sm md:text-lg font-bold text-red-700">&lt;₽200K</p>
          </div>
          <div className={`p-3 md:p-4 rounded-xl text-center ${currentZone === 'survival' ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-orange-50'}`}>
            <p className="text-xs md:text-sm text-orange-600">🟠 Выжив.</p>
            <p className="text-sm md:text-lg font-bold text-orange-700">₽200-500K</p>
          </div>
          <div className={`p-3 md:p-4 rounded-xl text-center ${currentZone === 'comfort' ? 'bg-amber-100 ring-2 ring-amber-500' : 'bg-amber-50'}`}>
            <p className="text-xs md:text-sm text-amber-600">🟡 Комфорт</p>
            <p className="text-sm md:text-lg font-bold text-amber-700">₽500K-1M</p>
          </div>
          <div className={`p-3 md:p-4 rounded-xl text-center ${currentZone === 'freedom' ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-emerald-50'}`}>
            <p className="text-xs md:text-sm text-emerald-600">🟢 Свобода</p>
            <p className="text-sm md:text-lg font-bold text-emerald-700">&gt;₽1M</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={capitalHistory}>
            <defs>
              <linearGradient id="capitalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#1e1e1e', border: 'none', borderRadius: 12, color: '#fff' }} formatter={(value) => [`₽${Number(value).toLocaleString()}`, '']} />
            <ReferenceLine y={survivalMin} stroke="#ef4444" strokeDasharray="5 5" />
            <ReferenceLine y={comfortZone} stroke="#f59e0b" strokeDasharray="5 5" />
            <ReferenceLine y={freedomZone} stroke="#10b981" strokeDasharray="5 5" />
            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#capitalGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {projectData.length > 0 && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Доходы по проектам</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(v) => `${v/1000}K`} />
                <Tooltip contentStyle={{ background: '#1e1e1e', border: 'none', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {expensePieData.length > 0 && (
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🍩 Структура расходов</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expensePieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {expensePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e1e1e', border: 'none', borderRadius: 12, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">📋 Последние операции</h3>
        </div>
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {[...finance].reverse().slice(0, 20).map(entry => (
            <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className={`text-2xl`}>{entry.type === 'income' ? '📈' : '📉'}</span>
                <div>
                  <p className="font-medium text-gray-900">{entry.category}</p>
                  <p className="text-xs text-gray-500">{entry.date} • {entry.comment || entry.project || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${entry.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {entry.type === 'income' ? '+' : '-'}₽{entry.amount.toLocaleString()}
                </span>
                <button onClick={() => deleteFinanceEntry(entry.id)} className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Modal */}
      {showScenario && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={() => setShowScenario(false)}>
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-5 md:p-6 w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="text-amber-500" />
              📊 Финансовый сценарий
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Увеличить доход на %</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={scenario.incomeChange}
                  onChange={e => setScenario({ ...scenario, incomeChange: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
                <p className="text-center font-bold text-emerald-600">+{scenario.incomeChange}%</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Сократить расходы на %</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={scenario.expenseChange}
                  onChange={e => setScenario({ ...scenario, expenseChange: parseInt(e.target.value) })}
                  className="w-full accent-red-500"
                />
                <p className="text-center font-bold text-red-600">-{scenario.expenseChange}%</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                <p className="text-sm opacity-80 mb-2">Результат сценария:</p>
                <p className="text-2xl font-bold">₽{(scenarioResult.newBalance / 1000).toFixed(0)}K</p>
                <p className="text-sm mt-1">
                  {scenarioResult.improvement >= 0 ? '↑' : '↓'} ₽{Math.abs(scenarioResult.improvement / 1000).toFixed(0)}K к текущему
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && renderAddModal()}
    </div>
  );
};
