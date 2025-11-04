/**
 * 🔧 Страница инициализации достижений
 * Административная страница для создания всех достижений в БД
 */

'use client';

import { useState, useEffect } from 'react';
import { initializeAchievements } from '@/lib/achievements';
import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function InitAchievementsPage() {
  const { user, loading, initialized, initialize } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Инициализация при загрузке
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const handleInitialize = async () => {
    setStatus('loading');
    setMessage('Инициализация достижений...');

    try {
      await initializeAchievements();
      setStatus('success');
      setMessage('✅ Все достижения успешно созданы в базе данных!');
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      console.error('Initialization error:', error);
    }
  };

  // Показываем загрузку пока проверяем авторизацию
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md text-center">
          <Icons.Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Проверка авторизации...</p>
        </Card>
      </div>
    );
  }

  // Если не авторизован, показываем ссылку на логин
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Lock className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Требуется авторизация
            </h2>
            <p className="text-gray-600">
              Войдите в систему для инициализации достижений
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 px-4 bg-indigo-600 text-white text-center rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Войти в систему
            </Link>
            <Link
              href="/register"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Зарегистрироваться
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              После авторизации вы сможете инициализировать систему достижений
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Инициализация достижений
            </h1>
            <p className="text-gray-600">
              Создание всех 30 достижений в базе данных PocketBase
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Icons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Что делает эта функция:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Создает 30 достижений в коллекции <code>achievements</code></li>
                  <li>Пропускает уже существующие достижения</li>
                  <li>Безопасна для повторного запуска</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Icons.AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Перед запуском убедитесь:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Коллекция <code>achievements</code> создана в PocketBase</li>
                  <li>У вас есть права на создание записей</li>
                  <li>API Rules настроены правильно</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleInitialize}
            disabled={status === 'loading'}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
              status === 'loading'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95'
            }`}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <Icons.Loader2 className="w-5 h-5 animate-spin" />
                Инициализация...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Icons.Play className="w-5 h-5" />
                Запустить инициализацию
              </span>
            )}
          </button>

          {/* Status */}
          {status !== 'idle' && (
            <div
              className={`mt-6 p-4 rounded-lg border ${
                status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {status === 'success' ? (
                  <Icons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : status === 'error' ? (
                  <Icons.XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Icons.Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      status === 'success'
                        ? 'text-green-800'
                        : status === 'error'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}
                  >
                    {message}
                  </p>
                  {status === 'success' && (
                    <div className="mt-3">
                      <a
                        href="/achievements"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                      >
                        <Icons.Trophy className="w-4 h-4" />
                        Перейти к достижениям
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icons.BookOpen className="w-5 h-5 text-indigo-600" />
              Следующие шаги
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Запустите инициализацию кнопкой выше</li>
              <li>Проверьте PocketBase Admin UI → коллекция <code>achievements</code></li>
              <li>Убедитесь, что создано 30 записей</li>
              <li>Перейдите на страницу достижений и начните зарабатывать!</li>
            </ol>
          </div>

          {/* Links */}
          <div className="mt-6 flex gap-3">
            <a
              href="http://127.0.0.1:8090/_/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              <Icons.Database className="w-4 h-4" />
              PocketBase Admin
            </a>
            <a
              href="/achievements"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              <Icons.Trophy className="w-4 h-4" />
              Достижения
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

