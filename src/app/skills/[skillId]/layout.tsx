'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';

export default function SkillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, initialized, initialize } = useAuth();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push('/login');
    }
  }, [initialized, loading, user, router]);

  if (!initialized || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
