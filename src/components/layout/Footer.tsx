import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Charisma Pro</h3>
            <p className="text-sm text-gray-600">
              Duolingo для социальных навыков и харизмы. Развивайтесь играючи.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Навигация</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
                  Дашборд
                </Link>
              </li>
              <li>
                <Link href="/lessons" className="hover:text-indigo-600 transition-colors">
                  Уроки
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-indigo-600 transition-colors">
                  Профиль
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Поддержка</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-indigo-600 transition-colors">
                  Помощь
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-indigo-600 transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Charisma Pro. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
