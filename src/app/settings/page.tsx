'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bell, Palette, Target, Lock, User, Mail, Key, Download, Trash2,
  Save, Check, Volume2, Sparkles, Globe, Clock, Shield, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getUserSettings,
  updateUserSettings,
  updateEmail,
  updatePassword,
  deleteAccount,
  type UserSettings,
} from '@/lib/profile';
import { exportAndDownload, getExportSummary } from '@/lib/dataExport';
import { initializeNotifications, requestNotificationPermission } from '@/lib/notifications';

type TabType = 'notifications' | 'appearance' | 'goals' | 'privacy' | 'account';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'notifications';
  
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (authUser) {
      loadSettings();
    }
  }, [authUser]);

  const loadSettings = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const data = await getUserSettings(authUser.id);
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (updates: Partial<UserSettings>) => {
    if (!authUser || !settings) return;

    try {
      setSaving(true);
      const updated = await updateUserSettings(authUser.id, updates);
      setSettings(updated);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (!authUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Не удалось загрузить настройки</p>
      </div>
    );
  }

  const tabs = [
    { id: 'notifications' as TabType, name: 'Уведомления', icon: Bell },
    { id: 'appearance' as TabType, name: 'Внешний вид', icon: Palette },
    { id: 'goals' as TabType, name: 'Цели', icon: Target },
    { id: 'privacy' as TabType, name: 'Приватность', icon: Lock },
    { id: 'account' as TabType, name: 'Аккаунт', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Настройки</h1>
          <p className="text-gray-600 mt-1">Управляйте своими предпочтениями</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {activeTab === 'notifications' && (
                <NotificationsTab
                  settings={settings}
                  onChange={handleChange}
                  onSave={handleSaveSettings}
                  saving={saving}
                  saveSuccess={saveSuccess}
                />
              )}
              {activeTab === 'appearance' && (
                <AppearanceTab
                  settings={settings}
                  onChange={handleChange}
                  onSave={handleSaveSettings}
                  saving={saving}
                  saveSuccess={saveSuccess}
                />
              )}
              {activeTab === 'goals' && (
                <GoalsTab
                  settings={settings}
                  onChange={handleChange}
                  onSave={handleSaveSettings}
                  saving={saving}
                  saveSuccess={saveSuccess}
                />
              )}
              {activeTab === 'privacy' && (
                <PrivacyTab
                  settings={settings}
                  onChange={handleChange}
                  onSave={handleSaveSettings}
                  saving={saving}
                  saveSuccess={saveSuccess}
                />
              )}
              {activeTab === 'account' && (
                <AccountTab userId={authUser.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== TAB COMPONENTS ====================

function NotificationsTab({
  settings,
  onChange,
  onSave,
  saving,
  saveSuccess,
}: {
  settings: UserSettings;
  onChange: (field: keyof UserSettings, value: any) => void;
  onSave: (updates: Partial<UserSettings>) => void;
  saving: boolean;
  saveSuccess: boolean;
}) {
  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      onChange('notifications_enabled', true);
      await initializeNotifications(settings.user);
    } else {
      alert('Пожалуйста, разрешите уведомления в настройках браузера');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Уведомления</h2>
        <p className="text-gray-600">Управляйте уведомлениями и напоминаниями</p>
      </div>

      {/* Master Switch */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="font-semibold text-gray-900">Push-уведомления</p>
              <p className="text-sm text-gray-600">Получать уведомления от приложения</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.notifications_enabled}
              onChange={(e) => {
                if (e.target.checked) {
                  handleEnableNotifications();
                } else {
                  onChange('notifications_enabled', false);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-checked:bg-indigo-600 rounded-full peer transition-all"></div>
            <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full peer-checked:translate-x-7 transition-transform"></div>
          </div>
        </label>
      </div>

      {/* Reminder Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Напоминания</h3>

        <ToggleSetting
          icon={<Bell className="w-5 h-5" />}
          label="Напоминания об уроках"
          description="Ежедневные напоминания о прохождении уроков"
          checked={settings.lesson_reminders}
          onChange={(checked) => onChange('lesson_reminders', checked)}
          disabled={!settings.notifications_enabled}
        />

        <ToggleSetting
          icon={<Target className="w-5 h-5" />}
          label="Напоминания о миссиях"
          description="Уведомления о доступных миссиях"
          checked={settings.mission_reminders}
          onChange={(checked) => onChange('mission_reminders', checked)}
          disabled={!settings.notifications_enabled}
        />

        {settings.lesson_reminders && (
          <div className="ml-10 p-4 bg-gray-50 rounded-xl">
            <label className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Время напоминания</p>
                <input
                  type="time"
                  value={settings.reminder_time}
                  onChange={(e) => onChange('reminder_time', e.target.value)}
                  className="mt-2 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Save Button */}
      <SaveButton onClick={() => onSave(settings)} saving={saving} saveSuccess={saveSuccess} />
    </div>
  );
}

function AppearanceTab({
  settings,
  onChange,
  onSave,
  saving,
  saveSuccess,
}: {
  settings: UserSettings;
  onChange: (field: keyof UserSettings, value: any) => void;
  onSave: (updates: Partial<UserSettings>) => void;
  saving: boolean;
  saveSuccess: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Внешний вид</h2>
        <p className="text-gray-600">Настройте внешний вид приложения</p>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Тема</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'auto'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => onChange('theme', theme)}
              className={`p-4 border-2 rounded-xl font-medium transition-all duration-200 ${
                settings.theme === theme
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {theme === 'light' && '☀️ Светлая'}
              {theme === 'dark' && '🌙 Темная'}
              {theme === 'auto' && '🔄 Авто'}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Язык интерфейса</h3>
        <div className="grid grid-cols-2 gap-3">
          {(['ru', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onChange('language', lang)}
              className={`p-4 border-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-3 ${
                settings.language === lang
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Globe className="w-5 h-5" />
              {lang === 'ru' && '🇷🇺 Русский'}
              {lang === 'en' && '🇬🇧 English'}
            </button>
          ))}
        </div>
      </div>

      {/* Effects */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Эффекты</h3>

        <ToggleSetting
          icon={<Volume2 className="w-5 h-5" />}
          label="Звуковые эффекты"
          description="Звуки при взаимодействии с приложением"
          checked={settings.sound_effects}
          onChange={(checked) => onChange('sound_effects', checked)}
        />

        <ToggleSetting
          icon={<Sparkles className="w-5 h-5" />}
          label="Анимации"
          description="Плавные анимации и переходы"
          checked={settings.animations_enabled}
          onChange={(checked) => onChange('animations_enabled', checked)}
        />
      </div>

      {/* Save Button */}
      <SaveButton onClick={() => onSave(settings)} saving={saving} saveSuccess={saveSuccess} />
    </div>
  );
}

function GoalsTab({
  settings,
  onChange,
  onSave,
  saving,
  saveSuccess,
}: {
  settings: UserSettings;
  onChange: (field: keyof UserSettings, value: any) => void;
  onSave: (updates: Partial<UserSettings>) => void;
  saving: boolean;
  saveSuccess: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Цели и прогресс</h2>
        <p className="text-gray-600">Установите цели для отслеживания прогресса</p>
      </div>

      {/* Weekly Goal */}
      <div className="space-y-3">
        <label className="font-semibold text-gray-900">
          Еженедельная цель: {settings.weekly_goal} {settings.weekly_goal === 1 ? 'урок' : 'уроков'}
        </label>
        <input
          type="range"
          min="1"
          max="21"
          value={settings.weekly_goal}
          onChange={(e) => onChange('weekly_goal', parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((settings.weekly_goal - 1) / 20) * 100}%, #e5e7eb ${((settings.weekly_goal - 1) / 20) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>1 урок/неделю</span>
          <span>21 урок/неделю</span>
        </div>
      </div>

      {/* Save Button */}
      <SaveButton onClick={() => onSave(settings)} saving={saving} saveSuccess={saveSuccess} />
    </div>
  );
}

function PrivacyTab({
  settings,
  onChange,
  onSave,
  saving,
  saveSuccess,
}: {
  settings: UserSettings;
  onChange: (field: keyof UserSettings, value: any) => void;
  onSave: (updates: Partial<UserSettings>) => void;
  saving: boolean;
  saveSuccess: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Приватность</h2>
        <p className="text-gray-600">Управляйте видимостью вашего профиля</p>
      </div>

      {/* Profile Visibility */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Видимость профиля</h3>
        <div className="space-y-2">
          {(['public', 'friends', 'private'] as const).map((privacy) => (
            <button
              key={privacy}
              onClick={() => onChange('privacy_profile', privacy)}
              className={`w-full p-4 border-2 rounded-xl font-medium text-left transition-all duration-200 ${
                settings.privacy_profile === privacy
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {privacy === 'public' && '🌐 Публичный'}
                    {privacy === 'friends' && '👥 Друзья'}
                    {privacy === 'private' && '🔒 Приватный'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {privacy === 'public' && 'Профиль виден всем'}
                    {privacy === 'friends' && 'Только для друзей'}
                    {privacy === 'private' && 'Никто не видит профиль'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Visibility Options */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Дополнительные настройки</h3>

        <ToggleSetting
          icon={<Eye className="w-5 h-5" />}
          label="Показывать в рейтингах"
          description="Ваше имя будет видно в таблицах лидеров"
          checked={settings.show_in_leaderboard}
          onChange={(checked) => onChange('show_in_leaderboard', checked)}
        />

        <ToggleSetting
          icon={<Eye className="w-5 h-5" />}
          label="История активности"
          description="Календарь активности виден другим пользователям"
          checked={settings.show_activity_history}
          onChange={(checked) => onChange('show_activity_history', checked)}
        />
      </div>

      {/* Save Button */}
      <SaveButton onClick={() => onSave(settings)} saving={saving} saveSuccess={saveSuccess} />
    </div>
  );
}

function AccountTab({ userId }: { userId: string }) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [exportSummary, setExportSummary] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadExportSummary();
  }, [userId]);

  const loadExportSummary = async () => {
    try {
      const summary = await getExportSummary(userId);
      setExportSummary(summary);
    } catch (error) {
      console.error('Error loading export summary:', error);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportAndDownload(userId);
      alert('Данные успешно экспортированы!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Не удалось экспортировать данные');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Аккаунт</h2>
        <p className="text-gray-600">Управление аккаунтом и данными</p>
      </div>

      {/* Email */}
      <div className="p-6 border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-gray-600" />
            <div>
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-sm text-gray-600">Изменить адрес электронной почты</p>
            </div>
          </div>
          <button
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showEmailForm ? 'Отмена' : 'Изменить'}
          </button>
        </div>
        {showEmailForm && <EmailChangeForm userId={userId} />}
      </div>

      {/* Password */}
      <div className="p-6 border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-gray-600" />
            <div>
              <p className="font-semibold text-gray-900">Пароль</p>
              <p className="text-sm text-gray-600">Изменить пароль</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showPasswordForm ? 'Отмена' : 'Изменить'}
          </button>
        </div>
        {showPasswordForm && <PasswordChangeForm userId={userId} />}
      </div>

      {/* Export Data */}
      <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="font-semibold text-gray-900">Экспорт данных</p>
              <p className="text-sm text-gray-600">Скачать полную копию ваших данных</p>
            </div>
          </div>
        </div>

        {exportSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">Уроков</p>
              <p className="text-xl font-bold text-gray-900">{exportSummary.totalLessons}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">Миссий</p>
              <p className="text-xl font-bold text-gray-900">{exportSummary.totalMissions}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">Достижений</p>
              <p className="text-xl font-bold text-gray-900">{exportSummary.totalAchievements}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600">В приложении</p>
              <p className="text-xl font-bold text-gray-900">{exportSummary.accountAge}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {exporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Экспорт...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Экспортировать данные
            </>
          )}
        </button>
      </div>

      {/* Delete Account */}
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-gray-900">Удалить аккаунт</p>
              <p className="text-sm text-gray-600">
                Это действие необратимо. Все ваши данные будут удалены.
              </p>
            </div>
          </div>
        </div>

        {!showDeleteForm ? (
          <button
            onClick={() => setShowDeleteForm(true)}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-200"
          >
            Удалить мой аккаунт
          </button>
        ) : (
          <DeleteAccountForm userId={userId} onCancel={() => setShowDeleteForm(false)} />
        )}
      </div>
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function ToggleSetting({
  icon,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer ${disabled ? 'opacity-50' : 'hover:bg-gray-50'}`}>
      <div className="flex items-center gap-3">
        <div className="text-gray-600">{icon}</div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-14 h-7 bg-gray-300 peer-checked:bg-indigo-600 rounded-full peer transition-all"></div>
        <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full peer-checked:translate-x-7 transition-transform"></div>
      </div>
    </label>
  );
}

function SaveButton({ onClick, saving, saveSuccess }: { onClick: () => void; saving: boolean; saveSuccess: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
        saveSuccess
          ? 'bg-green-600 text-white'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'
      } disabled:opacity-50`}
    >
      {saving ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Сохранение...
        </>
      ) : saveSuccess ? (
        <>
          <Check className="w-5 h-5" />
          Сохранено!
        </>
      ) : (
        <>
          <Save className="w-5 h-5" />
          Сохранить изменения
        </>
      )}
    </button>
  );
}

function EmailChangeForm({ userId }: { userId: string }) {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !password) return;

    try {
      setLoading(true);
      await updateEmail(userId, newEmail, password);
      alert('Email успешно изменен! Проверьте почту для подтверждения.');
      setNewEmail('');
      setPassword('');
    } catch (error: any) {
      alert(error.message || 'Не удалось изменить email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-200">
      <input
        type="email"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        placeholder="Новый email"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Текущий пароль"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Сохранение...' : 'Изменить email'}
      </button>
    </form>
  );
}

function PasswordChangeForm({ userId }: { userId: string }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 8) {
      alert('Пароль должен содержать минимум 8 символов');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(userId, oldPassword, newPassword);
      alert('Пароль успешно изменен!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      alert(error.message || 'Не удалось изменить пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-200">
      <div className="relative">
        <input
          type={showPasswords ? 'text' : 'password'}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Текущий пароль"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <input
        type={showPasswords ? 'text' : 'password'}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Новый пароль"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <input
        type={showPasswords ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Подтвердите пароль"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />

      <button
        type="button"
        onClick={() => setShowPasswords(!showPasswords)}
        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
      >
        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {showPasswords ? 'Скрыть пароли' : 'Показать пароли'}
      </button>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Сохранение...' : 'Изменить пароль'}
      </button>
    </form>
  );
}

function DeleteAccountForm({ userId, onCancel }: { userId: string; onCancel: () => void }) {
  const { user } = useAuth();
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user || confirmation !== user.email) {
      alert('Введите правильный email для подтверждения');
      return;
    }

    if (!confirm('Вы уверены? Это действие необратимо!')) {
      return;
    }

    try {
      setLoading(true);
      await deleteAccount(userId, confirmation);
      // Redirect will happen automatically after auth clears
    } catch (error: any) {
      alert(error.message || 'Не удалось удалить аккаунт');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-red-300">
      <p className="text-sm text-gray-700 font-medium">
        Введите ваш email <strong>{user?.email}</strong> для подтверждения:
      </p>
      <input
        type="email"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder="Ваш email"
        className="w-full px-4 py-3 border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
        <button
          onClick={handleDelete}
          disabled={loading || confirmation !== user?.email}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Удаление...' : 'Удалить навсегда'}
        </button>
      </div>
    </div>
  );
}

