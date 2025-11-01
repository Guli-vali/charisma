'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, ProgressBar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { calculateLevel, formatNumber } from '@/lib/utils';
import { Flame, Trophy, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const level = calculateLevel(user.experience_points);
  const progress = (user.experience_points % 100) / 100 * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {user.name}! 👋
          </h1>
          <p className="text-gray-600">
            Продолжайте развивать свою харизму
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Уровень
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{level}</div>
              <p className="text-sm text-gray-600 mt-2">{formatNumber(user.experience_points)} XP</p>
              <ProgressBar value={progress} variant="primary" size="sm" className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Серия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{user.current_streak}</div>
              <p className="text-sm text-gray-600 mt-2">дней подряд</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                Уроки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{user.total_lessons_completed}</div>
              <p className="text-sm text-gray-600 mt-2">завершено</p>
            </CardContent>
          </Card>
        </div>

        {/* League Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ваша лига</CardTitle>
            <CardDescription>Текущий статус: {user.current_league}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {user.current_league === 'bronze' && '🥉'}
                {user.current_league === 'silver' && '🥈'}
                {user.current_league === 'gold' && '🥇'}
                {user.current_league === 'platinum' && '💎'}
              </div>
              <div>
                <p className="font-semibold text-lg capitalize">{user.current_league}</p>
                <p className="text-sm text-gray-600">
                  Продолжайте учиться, чтобы повысить лигу
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ваши цели</CardTitle>
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
                <p className="text-gray-600">Вы еще не выбрали цели. Обновите профиль!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" asChild>
                <Link href="/lessons">Начать урок</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">Посмотреть профиль</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
