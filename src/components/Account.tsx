import { useState } from 'react';
import { User, Cloud, CloudOff, Download, Upload, Trash2, LogOut, Shield, Key, Copy, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const Account = ({ onClose }: { onClose: () => void }) => {
  const { profile, habits, tasks, finance, setProfile } = useApp();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncCode, setSyncCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(profile.name);

  // Generate sync code from data
  const generateSyncCode = () => {
    const data = {
      profile,
      habits,
      tasks,
      finance,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(data);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    setSyncCode(base64);
    return base64;
  };

  // Export data
  const handleExport = () => {
    const code = generateSyncCode();
    setSyncStatus('synced');
    
    // Copy to clipboard
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Import data
  const handleImport = () => {
    try {
      const jsonStr = decodeURIComponent(escape(atob(inputCode)));
      const data = JSON.parse(jsonStr);
      
      if (data.profile && data.habits && data.tasks && data.finance) {
        // Save to localStorage
        localStorage.setItem('pro_system_data', JSON.stringify({
          ...data,
          onboarded: true
        }));
        
        setSyncStatus('synced');
        // Reload to apply changes
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  };

  // Download as JSON file
  const handleDownloadBackup = () => {
    const data = {
      profile,
      habits,
      tasks,
      finance,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prosystem-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all data
  const handleClearData = () => {
    if (confirm('Вы уверены? Все данные будут удалены!')) {
      localStorage.removeItem('pro_system_data');
      window.location.reload();
    }
  };

  const handleSaveName = () => {
    if (newName.trim()) {
      setProfile({ name: newName.trim() });
      setEditName(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-t-3xl md:rounded-2xl p-5 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="text-indigo-500" size={24} />
            Аккаунт
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            ✕
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {editName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 outline-none"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="px-3 py-2 bg-white/20 rounded-lg">
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEditName(true)}
                  className="text-left"
                >
                  <h3 className="text-xl font-bold">{profile.name}</h3>
                  <p className="text-sm opacity-80">Нажмите для редактирования</p>
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{habits.length}</p>
              <p className="text-xs opacity-80">Привычек</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-xs opacity-80">Задач</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{finance.length}</p>
              <p className="text-xs opacity-80">Операций</p>
            </div>
          </div>
        </div>

        {/* Sync Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Cloud className="text-blue-500" size={20} />
            Синхронизация
          </h3>

          {/* Sync Status */}
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            syncStatus === 'synced' ? 'bg-emerald-50 text-emerald-700' :
            syncStatus === 'error' ? 'bg-red-50 text-red-700' :
            syncStatus === 'syncing' ? 'bg-blue-50 text-blue-700' :
            'bg-gray-50 text-gray-600'
          }`}>
            {syncStatus === 'synced' ? <Check size={20} /> :
             syncStatus === 'error' ? <CloudOff size={20} /> :
             syncStatus === 'syncing' ? <RefreshCw size={20} className="animate-spin" /> :
             <Cloud size={20} />}
            <span className="text-sm font-medium">
              {syncStatus === 'synced' ? 'Данные синхронизированы' :
               syncStatus === 'error' ? 'Ошибка синхронизации' :
               syncStatus === 'syncing' ? 'Синхронизация...' :
               'Локальное хранение'}
            </span>
          </div>

          {/* Export */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">📤 Экспорт данных</p>
                <p className="text-xs text-gray-500">Получите код для переноса на другое устройство</p>
              </div>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <Upload size={16} />
                Экспорт
              </button>
            </div>
            {syncCode && (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={syncCode.substring(0, 30) + '...'}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(syncCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`px-3 py-2 rounded-lg transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Код скопирован в буфер обмена</p>
              </div>
            )}
          </div>

          {/* Import */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">📥 Импорт данных</p>
                <p className="text-xs text-gray-500">Восстановите данные с другого устройства</p>
              </div>
              <button
                onClick={() => setShowImport(!showImport)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <Download size={16} />
                Импорт
              </button>
            </div>
            {showImport && (
              <div className="mt-3 space-y-3">
                <textarea
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  placeholder="Вставьте код синхронизации..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none h-20"
                />
                <button
                  onClick={handleImport}
                  disabled={!inputCode.trim()}
                  className="w-full py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  Восстановить данные
                </button>
              </div>
            )}
          </div>

          {/* Backup */}
          <button
            onClick={handleDownloadBackup}
            className="w-full p-4 bg-blue-50 text-blue-700 rounded-xl flex items-center gap-3"
          >
            <Download size={20} />
            <div className="text-left flex-1">
              <p className="font-medium">💾 Скачать бэкап</p>
              <p className="text-xs opacity-70">Сохранить данные как файл</p>
            </div>
          </button>
        </div>

        {/* Security Section */}
        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="text-green-500" size={20} />
            Безопасность
          </h3>
          
          <div className="p-4 bg-emerald-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Key className="text-emerald-600" size={20} />
              <div>
                <p className="font-medium text-emerald-700">Данные защищены</p>
                <p className="text-xs text-emerald-600">Хранятся локально на устройстве</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="font-semibold text-red-600 mb-3">⚠️ Опасная зона</h3>
          <div className="space-y-2">
            <button
              onClick={handleClearData}
              className="w-full p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3"
            >
              <Trash2 size={20} />
              <div className="text-left flex-1">
                <p className="font-medium">Удалить все данные</p>
                <p className="text-xs opacity-70">Это действие необратимо</p>
              </div>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('pro_system_data');
                window.location.reload();
              }}
              className="w-full p-4 bg-gray-50 text-gray-600 rounded-xl flex items-center gap-3"
            >
              <LogOut size={20} />
              <div className="text-left flex-1">
                <p className="font-medium">Выйти и начать заново</p>
                <p className="text-xs opacity-70">Пройти онбординг заново</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
