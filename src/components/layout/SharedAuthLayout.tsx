'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';

/**
 * Общий layout для всех защищенных страниц
 * Инициализация auth происходит один раз в AuthProvider на уровне приложения
 */
export function SharedAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (initialized && !loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      router.replace('/login');
    }
  }, [initialized, loading, user, router, isRedirecting]);

  // Если пользователь не авторизован после инициализации, показываем минимальный спиннер
  // Редирект произойдет через useEffect
  if (initialized && !user && isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Показываем интерфейс сразу после инициализации, не ждем загрузки
  // Это делает переходы между страницами мгновенными
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50 to-amber-50">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

