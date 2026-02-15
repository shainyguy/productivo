import { useState } from 'react';
import { Sparkles, Zap, Target, Sword, Shield, Hammer, ChevronRight, Rocket } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { UserClass } from '../types';

const steps = [
  { id: 'welcome', title: 'Добро пожаловать!' },
  { id: 'name', title: 'Как вас зовут?' },
  { id: 'class', title: 'Выберите класс' },
  { id: 'ready', title: 'Готово!' },
];

const classes: { id: UserClass; name: string; emoji: string; icon: React.ReactNode; bonus: string; description: string }[] = [
  {
    id: 'strategist',
    name: 'Стратег',
    emoji: '🧠',
    icon: <Sword className="text-indigo-500" size={40} />,
    bonus: '+25% XP за высокий ROI',
    description: 'Фокус на планировании и высокодоходных проектах'
  },
  {
    id: 'executor',
    name: 'Исполнитель',
    emoji: '⚡',
    icon: <Zap className="text-amber-500" size={40} />,
    bonus: '+20% XP за скорость',
    description: 'Быстрое выполнение задач и максимальная эффективность'
  },
  {
    id: 'builder',
    name: 'Строитель',
    emoji: '🏗️',
    icon: <Hammer className="text-emerald-500" size={40} />,
    bonus: '+30% XP за streak',
    description: 'Построение долгосрочных привычек и систем'
  }
];

export const Onboarding = () => {
  const { setProfile, setClass, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<UserClass>('builder');

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setProfile({ name: name.trim() });
    }
    if (step === 2) {
      setClass(selectedClass);
    }
    if (step === steps.length - 1) {
      completeOnboarding();
      return;
    }
    setStep(step + 1);
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-indigo-500' : 'bg-white/20'}`}
            />
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-white">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center">
                <Sparkles size={48} />
              </div>
              <h1 className="text-3xl font-bold">PRO SYSTEM 2.0</h1>
              <p className="text-white/70 text-lg">
                Продуктивность + Финансы + Геймификация
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-white/10 rounded-2xl">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="text-sm text-white/70">Привычки</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl">
                  <div className="text-2xl mb-2">💰</div>
                  <p className="text-sm text-white/70">Финансы</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl">
                  <div className="text-2xl mb-2">🎮</div>
                  <p className="text-sm text-white/70">XP & Уровни</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                  <Target size={32} />
                </div>
                <h2 className="text-2xl font-bold">Как вас зовут?</h2>
                <p className="text-white/60 mt-2">Это имя будет отображаться в системе</p>
              </div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Введите ваше имя"
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-xl"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Class Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                  <Shield size={32} />
                </div>
                <h2 className="text-2xl font-bold">Выберите ваш класс</h2>
                <p className="text-white/60 mt-2">Каждый класс даёт уникальные бонусы XP</p>
              </div>
              <div className="space-y-3">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                      selectedClass === cls.id 
                        ? 'border-indigo-500 bg-indigo-500/20' 
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="p-3 bg-white/10 rounded-xl">
                      {cls.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cls.emoji}</span>
                        <span className="font-bold text-lg">{cls.name}</span>
                      </div>
                      <p className="text-sm text-white/60 mt-1">{cls.description}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                        {cls.bonus}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center animate-pulse">
                <Rocket size={48} />
              </div>
              <h2 className="text-3xl font-bold">Всё готово, {name}!</h2>
              <p className="text-white/70 text-lg">
                Вы выбрали класс <span className="text-indigo-400 font-semibold">{classes.find(c => c.id === selectedClass)?.emoji} {classes.find(c => c.id === selectedClass)?.name}</span>
              </p>
              <div className="p-6 bg-white/10 rounded-2xl">
                <p className="text-white/80">
                  Начните с добавления привычек и задач. Система автоматически будет начислять XP и отслеживать ваш прогресс.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-white/5 rounded-xl">
                  <span className="text-2xl">📱</span>
                  <p className="text-white/60 mt-2">Работает на мобильных</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <span className="text-2xl">💾</span>
                  <p className="text-white/60 mt-2">Данные сохраняются</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`w-full mt-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            {step === steps.length - 1 ? 'Начать работу' : 'Продолжить'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
