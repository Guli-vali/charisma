import { redirect } from 'next/navigation';

/**
 * Корневая страница - перенаправляет на дашборд
 */
export default function HomePage() {
  redirect('/dashboard');
}
