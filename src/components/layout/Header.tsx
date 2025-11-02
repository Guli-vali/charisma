'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Charisma Pro Logo"
              width={32}
              height={32}
              className="rounded-lg"
              priority
            />
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Charisma Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Дашборд
            </Link>
            <Link href="/lessons" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Уроки
            </Link>
            <Link href="/missions" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Миссии
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Профиль
            </Link>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <>
                <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                  <span className="font-medium">{user.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Выйти
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Дашборд
              </Link>
              <Link href="/lessons" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Уроки
              </Link>
              <Link href="/missions" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Миссии
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Профиль
              </Link>
              {user && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
