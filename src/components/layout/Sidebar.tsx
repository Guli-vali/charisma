'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Дашборд', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Уроки', href: '/lessons', icon: BookOpen },
  { name: 'Профиль', href: '/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600">
          <Home className="w-4 h-4" />
          <span>На главную</span>
        </Link>
      </div>
    </aside>
  );
}
