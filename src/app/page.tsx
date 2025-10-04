'use client';

import { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter, 
  ProgressBar 
} from '@/components/ui';
import { 
  cn, 
  formatNumber, 
  calculateLevel
} from '@/lib/utils';

// Модель пользователя с примерными данными
const mockUser = {
  name: 'Алексей',
  level: calculateLevel(1250),
  xp: 1250,
  streak: 7,
  totalModules: 12,
  completedModules: 8,
  skills: {
    'Уверенность в себе': 85,
    'Ораторское искусство': 67,
    'Нетворкинг': 92,
    'Управление конфликтами': 41,
    'Эмоциональный интеллект': 73,
    'Лидерство': 58
  }
};

export default function CharismaProDemo() {
  const [selectedSkill, setSelectedSkill] = useState<string>('Уверенность в себе');
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const skillKey = selectedSkill as keyof typeof mockUser.skills;
  const skillProgress = mockUser.skills[skillKey];
  const isActive = (variant: string) => activeButton === variant;

    return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-bold text-3xl md:text-4xl flex items-center gap-3">
                <span className="bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">Charisma Pro</span>
                <span className="text-orange-500">🎯</span>
      </h1>
              <p className="text-gray-600 font-medium">
                Демо страница дизайн системы - &ldquo;Duolingo для социальных навыков и харизмы&rdquo;
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-xl">
                <span className="text-indigo-600 font-semibold">Уровень {mockUser.level}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{formatNumber(mockUser.xp)} XP</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-xl">
                <span className="text-amber-600 font-semibold">🔥 {mockUser.streak}</span>
                <span className="text-gray-500">дней подряд</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <Card elevated className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-4xl md:text-5xl">
                  Развивайте свою харизму
                </CardTitle>
                <CardDescription className="text-xl md:text-2xl text-gray-600">
                  Изучайте социальные навыки играючи, как новый язык
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{mockUser.completedModules}</div>
                    <div className="text-gray-600">Завершенных модулей</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">{mockUser.streak}</div>
                    <div className="text-gray-600">Дней активности</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">{mockUser.level}</div>
                    <div className="text-gray-600">Текущий уровень</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-center">
                <Button size="lg" variant="primary">
                  Продолжить обучение
                </Button>
              </CardFooter>
            </Card>
          </section>

          {/* Buttons Section */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Кнопки и их варианты</CardTitle>
                <CardDescription>
                  Различные стили кнопок для разных действий в приложении
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Primary variants */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Основные действия</h3>
                    <div className="flex flex-col gap-3">
                      <Button 
                        variant="primary" 
                        onClick={() => setActiveButton('primary')}
                        className={cn(isActive('primary') && 'ring-4 ring-indigo-200')}
                      >
                        Primary Action
                      </Button>
                      <Button 
                        variant="accent"
                        onClick={() => setActiveButton('accent')}
                        className={cn(isActive('accent') && 'ring-4 ring-amber-200')}
                      >
                        Accent Action
                      </Button>
                      <Button 
                        variant="success"
                        onClick={() => setActiveButton('success')}
                        className={cn(isActive('success') && 'ring-4 ring-emerald-200')}
                      >
                        Success Action
                      </Button>
                      <Button 
                        variant="error"
                        onClick={() => setActiveButton('error')}
                        className={cn(isActive('error') && 'ring-4 ring-red-200')}
                      >
                        Error Action
                      </Button>
                    </div>
                  </div>

                  {/* Secondary variants */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Дополнительные</h3>
                    <div className="flex flex-col gap-3">
                      <Button variant="outline">Outline Button</Button>
                      <Button variant="ghost">Ghost Button</Button>
                      <Button isLoading>Loading...</Button>
                      <Button disabled>Disabled Button</Button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Размеры</h3>
                    <div className="flex flex-col gap-3">
                      <Button size="sm" variant="primary">Small</Button>
                      <Button size="md" variant="primary">Medium</Button>
                      <Button size="lg" variant="primary">Large</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cards Section */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Карточки и содержимое</CardTitle>
                <CardDescription>
                  Различные типы карточек для отображения информации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Course Card */}
                  <Card interactive>
                    <CardHeader>
                      <CardTitle className="text-lg">Уверенность в себе</CardTitle>
                      <CardDescription>
                        Основы уверенного поведения в любой ситуации
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <ProgressBar 
                          value={85} 
                          variant="success" 
                          label="Прогресс" 
                          size="sm"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>8 из 10 уроков</span>
                          <span>850 XP</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="primary" size="sm" className="w-full">
                        Продолжить
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Skill Card */}
                  <Card interactive elevated>
                    <CardHeader>
                      <CardTitle className="text-lg">Ораторское искусство</CardTitle>
                      <CardDescription>
                        Научитесь говорить убедительно
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <ProgressBar 
                          value={67} 
                          variant="accent" 
                          label="Прогресс" 
                          size="sm"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>6 из 9 уроков</span>
                          <span>670 XP</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="accent" size="sm" className="w-full">
                        Начать курс
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Achievement Card */}
                  <Card interactive>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        🎯 Неделя успеха
                      </CardTitle>
                      <CardDescription>
                        Учитесь 7 дней подряд
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center py-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-amber-600">{mockUser.streak}</div>
                          <div className="text-sm text-gray-600">дней подряд</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" size="sm" className="w-full">
                        ⭐ Получено
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Progress Bars Section */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Прогресс и навыки</CardTitle>
                <CardDescription>
                  Отслеживайте прогресс в различных навыках харизмы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Skill Selection */}
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(mockUser.skills).map((skill) => (
                      <Button
                        key={skill}
                        variant={selectedSkill === skill ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedSkill(skill)}
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>

                  {/* Selected Skill Progress */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">{selectedSkill}</h3>
                    <ProgressBar
                      value={skillProgress}
                      variant="primary"
                      label="Ваш прогресс"
                      size="lg"
                      showLabel={true}
                    />
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-indigo-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-indigo-600">{skillProgress}%</div>
                        <div className="text-sm text-gray-600">Завершено</div>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-amber-600">{skillProgress * 10}</div>
                        <div className="text-sm text-gray-600">XP получено</div>
                      </div>
                    </div>
                  </div>

                  {/* All Skills Overview */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-gray-700">Все навыки</h4>
                    {Object.entries(mockUser.skills).map(([skill, progress]) => (
                      <div key={skill} className="flex items-center gap-3">
                        <span className="min-w-[140px] text-sm text-gray-700">
                          {skill}
                        </span>
                        <div className="flex-1">
                          <ProgressBar
                            value={progress}
                            variant={progress >= 80 ? 'success' : progress >= 60 ? 'accent' : 'primary'}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                        <span className="min-w-[40px] text-sm text-gray-600 text-right">
                          {progress}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Interactive Elements */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Интерактивные элементы</CardTitle>
                <CardDescription>
                  Примеры интерактивных компонентов в действии
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Interactive Card Demo */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Интерактивная карточка</h3>
                    <Card 
                      interactive 
                      className="cursor-pointer"
                      onClick={() => alert('Карточка кликнута!')}
                    >
                      <CardContent>
                        <p className="text-center text-gray-600 py-4">
                          Кликните на меня чтобы увидеть интерактивность!
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Color Variations */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Цветовые варианты</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="h-4 rounded bg-indigo-500"></div>
                        <div className="h-4 rounded bg-amber-500"></div>
                        <div className="h-4 rounded bg-emerald-500"></div>
                        <div className="h-4 rounded bg-red-500"></div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-600">Primary (Индиго)</div>
                        <div className="text-gray-600">Accent (Amber)</div>
                        <div className="text-gray-600">Success (Emerald)</div>
                        <div className="text-gray-600">Error (Red)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Design System Info */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>О дизайн системе Charisma Pro</CardTitle>
                <CardDescription>
                  Описание принципов и философии дизайна
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Философия</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>✨ <strong>Игровые элементы</strong> - превращаем обучение в игру</li>
                      <li>🎯 <strong>Прогресс визуализация</strong> - четко показываем достижения</li>
                      <li>🎨 <strong>Консистентность</strong> - единый стиль по всему приложению</li>
                      <li>📱 <strong>Адаптивность</strong> - работает на всех устройствах</li>
                      <li>⚡ <strong>Интерактивность</strong> - отзывчивые элементы интерфейса</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-700">Компоненты</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>🔘 <strong>Buttons</strong> - 6 вариантов | 3 размера</li>
                      <li>📋 <strong>Cards</strong> - обычные и интерактивные</li>
                      <li>📊 <strong>ProgressBar</strong> - отслеживание прогресса</li>
                      <li>🎨 <strong>Цветовая палитра</strong> - primary, accent, success, error</li>
                      <li>📝 <strong>Типографика</strong> - четкая иерархия текста</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
  }