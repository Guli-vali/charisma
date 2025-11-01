'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { calculateLevel, formatNumber } from '@/lib/utils';
import { User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const level = calculateLevel(user.experience_points);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Профиль</h1>
          <p className="text-gray-600">Информация о вашем аккаунте</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-20 h-20 rounded-full" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-10 h-10 text-indigo-600" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Уровень</p>
                <p className="text-2xl font-bold text-indigo-600">{level}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Опыт</p>
                <p className="text-2xl font-bold text-indigo-600">{formatNumber(user.experience_points)} XP</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Серия</p>
                <p className="text-2xl font-bold text-orange-600">{user.current_streak} дней</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Завершено уроков</p>
                <p className="text-2xl font-bold text-emerald-600">{user.total_lessons_completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Лига</CardTitle>
            <CardDescription>Ваш текущий статус</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl">
                {user.current_league === 'bronze' && '🥉'}
                {user.current_league === 'silver' && '🥈'}
                {user.current_league === 'gold' && '🥇'}
                {user.current_league === 'platinum' && '💎'}
              </div>
              <div>
                <p className="font-semibold text-xl capitalize">{user.current_league}</p>
                <p className="text-sm text-gray-600">
                  Дата регистрации: {new Date(user.created).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Цели</CardTitle>
            <CardDescription>Выбранные направления развития</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.goals.work && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl">
                  <span className="text-lg">💼</span>
                  <span className="font-medium">Работа</span>
                </div>
              )}
              {user.goals.dating && (
                <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-xl">
                  <span className="text-lg">💕</span>
                  <span className="font-medium">Знакомства</span>
                </div>
              )}
              {user.goals.leadership && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                  <span className="text-lg">👑</span>
                  <span className="font-medium">Лидерство</span>
                </div>
              )}
              {!user.goals.work && !user.goals.dating && !user.goals.leadership && (
                <p className="text-gray-600">Цели не выбраны</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
