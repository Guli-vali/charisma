import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Защищенные роуты
  const protectedRoutes = ['/dashboard', '/lessons', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Публичные роуты (аутентификация)
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Проверка аутентификации происходит на клиенте в layout компонентах
  // Middleware просто пропускает запросы, так как localStorage недоступен на сервере
  // Редиректы для авторизованных пользователей с /login и /register на /dashboard
  // выполняются в layout компонентах на клиенте

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
