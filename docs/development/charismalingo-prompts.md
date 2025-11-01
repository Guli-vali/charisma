# Charisma Pro - Детальные промпты для разработки

## 🎨 ОБЩИЙ КОНТЕКСТ И ДИЗАЙН-СИСТЕМА (используй во всех модулях)

### Концепция приложения
Charisma Pro - это "Duolingo для социальных навыков и харизмы". Приложение обучает пользователей через геймифицированные упражнения, симуляции диалогов и реальные миссии.

### Дизайн-система
**Цветовая палитра:**
- Основной: `#6366f1` (индиго) - для основных элементов UI
- Акцентный: `#f59e0b` (amber) - для прогресса, достижений, XP
- Успех: `#10b981` (emerald) - для правильных ответов, выполненных заданий
- Ошибка: `#ef4444` (red) - для неправильных ответов
- Фон: `#f8fafc` (slate-50) - основной фон
- Карточки: `#ffffff` с тенью `shadow-lg`

**Типографика:**
- Заголовки: `font-bold text-2xl md:text-3xl text-gray-900`
- Подзаголовки: `font-semibold text-lg text-gray-700`
- Основной текст: `text-base text-gray-600`
- Кнопки: `font-medium text-sm`

**Компоненты:**
- Все кнопки имеют `rounded-xl` и `transition-all duration-200`
- Карточки: `rounded-2xl bg-white shadow-lg p-6`
- Прогресс-бары: `h-3 rounded-full bg-gray-200` с заливкой цветом
- Иконки: Используй Lucide React, размер `w-6 h-6`

**Анимации:**
- Hover эффекты: `hover:scale-105 hover:shadow-xl`
- Нажатия: `active:scale-95`
- Появление элементов: `animate-fade-in`

---

## 📱 МОДУЛЬ 1: ОСНОВА ПРИЛОЖЕНИЯ И АУТЕНТИФИКАЦИЯ

### Техническое задание
Создай Next.js 15 приложение с TypeScript, Tailwind CSS и бекендом на PocketBase.

### Детальные требования:

**1. Настройка проекта:**
```bash
npx create-next-app@latest charisma-pro --typescript --tailwind --eslint --app
```

**2. Зависимости для установки:**

```json
{
  "pocketbase"
  "lucide-react"
  "react-hook-form"
  "@hookform/resolvers"
  "zod"
  "framer-motion"
  "sonner",
  "zustand"
}
```

**3. Структура папок:**

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── lessons/
│   ├── profile/
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── progress.tsx
│   ├── auth/
│   └── layout/
├── lib/
│   ├── pocketbase.ts
│   ├── types.ts
│   └── utils.ts
└── hooks/
```

**4. PocketBase схема коллекций:**
```javascript
// users (встроенная коллекция, добавить поля):
{
  "experience_points": "number", // default: 0
  "current_streak": "number", // default: 0
  "total_lessons_completed": "number", // default: 0
  "current_league": "select", // options: "bronze", "silver", "gold", "platinum"
  "avatar_url": "url",
  "goals": "json", // {"work": true, "dating": false, "leadership": true}
  "created": "date",
  "updated": "date"
}
```

**5. Компонент аутентификации (Login):**
```tsx
// Создай форму входа с полями:
// - Email (с валидацией)
// - Password (минимум 8 символов)
// - "Запомнить меня" чекбокс
// - Кнопка "Войти" (с состоянием загрузки)
// - Ссылка "Нет аккаунта? Регистрация"

// Стилизация:
// - Центрированная карточка на весь экран
// - Градиентный фон от индиго к пурпурному
// - Логотип Charisma наверху
// - Анимация появления карточки
```

**6. Компонент регистрации (Register):**
```tsx
// Создай форму регистрации с полями:
// - Имя (обязательное)
// - Email (с валидацией)
// - Password (минимум 8 символов)
// - Подтверждение пароля
// - Выбор целей (чекбоксы): "Работа", "Знакомства", "Лидерство"
// - Кнопка "Создать аккаунт"
// - Ссылка "Уже есть аккаунт? Войти"
```

**7. PocketBase настройка (lib/pocketbase.ts):**
```tsx
// Создай класс для работы с PocketBase:
// - Подключение к локальному серверу
// - Методы авторизации (login, register, logout)
// - Получение текущего пользователя
// - Обновление профиля пользователя
// - Обработка ошибок и типизация
```

**8. Layout компонент:**
```tsx
// Создай основной layout с:
// - Header (логотип, меню, аватар пользователя)
// - Sidebar для навигации (скрытый на мобильных)
// - Мобильное меню (бургер)
// - Footer с основными ссылками
// - Toast уведомления (sonner)
```

**9. Защищенные роуты:**
```tsx
// Создай middleware для проверки аутентификации
// Перенаправление неавторизованных на /login
// Перенаправление авторизованных с /login на /dashboard
```

**10. Типы TypeScript (lib/types.ts):**
```tsx
export interface User {
  id: string;
  email: string;
  name: string;
  experience_points: number;
  current_streak: number;
  total_lessons_completed: number;
  current_league: 'bronze' | 'silver' | 'gold' | 'platinum';
  avatar_url?: string;
  goals: {
    work: boolean;
    dating: boolean;
    leadership: boolean;
  };
  created: string;
  updated: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
```

### Критерии приемки:
- [ ] Успешная регистрация создает пользователя в PocketBase
- [ ] Вход работает с правильными credentials
- [ ] Защищенные роуты недоступны без авторизации
- [ ] UI соответствует дизайн-системе
- [ ] Мобильная адаптивность
- [ ] Обработка ошибок и loading states
- [ ] Валидация форм с помощью react-hook-form + zod
- [ ] Состояние приложения управляется через zustand

---

## 📊 МОДУЛЬ 2: DASHBOARD И СИСТЕМА ПРОГРЕССА

### Техническое задание
Создай главную страницу (дашборд) с отображением прогресса пользователя, текущих целей и быстрым доступом к урокам.

### Детальные требования:

**1. PocketBase коллекции для прогресса:**
```javascript
// progress
{
  "user": "relation(users)", // связь с пользователем
  "skill_tree_node": "text", // "basic_smalltalk", "confidence_bodylanguage"
  "status": "select", // "locked", "available", "completed"
  "progress_percentage": "number", // 0-100
  "completed_exercises": "json", // массив ID завершенных упражнений
  "created": "date",
  "updated": "date"
}

// daily_streaks
{
  "user": "relation(users)",
  "date": "date", // YYYY-MM-DD
  "lessons_completed": "number",
  "missions_completed": "number",
  "created": "date"
}
```

**2. Dashboard Layout:**
```tsx
// Создай сетку компонентов:
// ┌─────────────────┬─────────────┐
// │   Приветствие   │   Стрик     │
// │   + XP          │   + Лига    │
// ├─────────────────┼─────────────┤
// │   Дерево навыков (полная ширина) │
// ├─────────────────────────────────┤
// │   Дневные задания │ Достижения │
// └─────────────────────────────────┘
```

**3. Компонент "Приветствие и XP":**
```tsx
// WelcomeCard.tsx
// - "Добро пожаловать, {name}!"
// - Текущий XP с прогресс-баром до следующего уровня
// - Уровень пользователя (calculated: XP / 100)
// - Анимация при изменении XP
// - Gradient фон от индиго к синему
```

**4. Компонент "Стрик и Лига":**
```tsx
// StreakCard.tsx
// - Иконка огня + текущий streak
// - "X дней подряд"
// - Календарь на неделю с отметками активности
// - Текущая лига с иконкой
// - Прогресс до следующей лиги
```

**5. Дерево навыков (главный компонент):**
```tsx
// SkillTree.tsx
// Структура дерева:
// Level 1: [Приветствия] → [SmallTalk] → [Активное слушание]
//                                ↓
// Level 2:           [Язык тела] → [Комплименты] → [Работа со стрессом]
//                                ↓
// Level 3:                 [Юмор] → [Сторителлинг] → [Влияние]
//                                ↓
// Level 4:          [Публичные выступления] → [Переговоры] → [Лидерство]

// Каждый узел:
// - Круглая иконка с навыком
// - Цвет статуса: серый (locked), синий (available), зеленый (completed)
// - Прогресс-бар вокруг иконки (% завершения)
// - При клике - переход к урокам этого навыка
// - Соединительные линии между узлами
```

**6. Компонент "Дневные задания":**
```tsx
// DailyMissions.tsx
// Список из 3 заданий:
// - "Завершить 1 урок" (прогресс: X/1)
// - "Выполнить реальную миссию" (чекбокс)
// - "Заработать 50 XP" (прогресс: X/50)
// 
// За каждое задание: +10 XP, +5 XP к стрику
// Обновляются ежедневно в 00:00
```

**7. Компонент "Достижения":**
```tsx
// AchievementsCard.tsx
// Сетка 2x2 с последними достижениями:
// - Иконка достижения
// - Название
// - Дата получения
// - Кнопка "Смотреть все"
//
// Примеры достижений:
// - "Первые шаги" (завершить первый урок)
// - "Неделя силы" (7 дней streak)
// - "Мастер smalltalk" (завершить все базовые уроки)
```

**8. API функции (lib/api.ts):**
```tsx
// getUserProgress(userId: string)
// updateProgress(userId: string, skillNode: string, progress: number)
// getDailyMissions(userId: string, date: string)
// completeDailyMission(userId: string, missionType: string)
// getUserAchievements(userId: string)
// calculateUserLevel(xp: number): number
// getNextLevelXP(level: number): number
```

**9. Hooks для состояния:**
```tsx
// useUserProgress.ts
// - Загрузка прогресса пользователя
// - Обновление прогресса в реальном времени
// - Кэширование с React Query или SWR

// useDailyMissions.ts
// - Загрузка дневных заданий
// - Отметка выполнения
// - Автообновление в полночь
```

**10. Мобильная адаптация:**
```tsx
// Мобильная версия:
// - Дерево навыков становится вертикальным списком
// - Карточки стека вертикально
// - Swipe жесты для навигации
// - Фиксированная навигация внизу
```

### Критерии приемки:
- [ ] Dashboard загружается с актуальным прогрессом пользователя
- [ ] Дерево навыков правильно отображает статусы узлов
- [ ] Дневные задания обновляются и отслеживают прогресс
- [ ] Стрик корректно считается и отображается
- [ ] Переходы между компонентами анимированы
- [ ] Мобильная версия работает без горизонтального скролла
- [ ] XP и уровень обновляются в реальном времени
- [ ] Loading states для всех асинхронных операций

---

## 🎓 МОДУЛЬ 3: СИСТЕМА УРОКОВ И УПРАЖНЕНИЙ

### Техническое задание
Создай систему интерактивных уроков с различными типами упражнений и механикой прохождения как в Duolingo.

### Детальные требования:

**1. PocketBase коллекции для уроков:**
```javascript
// lessons
{
  "skill_node": "text", // "basic_smalltalk", "confidence_bodylanguage"
  "lesson_number": "number", // 1, 2, 3...
  "title": "text", // "Как начать разговор"
  "description": "text",
  "xp_reward": "number", // обычно 10-20
  "exercises": "json", // массив упражнений
  "is_checkpoint": "bool", // финальный урок в навыке
  "created": "date"
}

// user_lesson_attempts
{
  "user": "relation(users)",
  "lesson": "relation(lessons)",
  "status": "select", // "in_progress", "completed", "failed"
  "hearts_left": "number", // 0-5
  "current_exercise": "number", // индекс текущего упражнения
  "score": "number", // 0-100
  "completed_at": "date",
  "created": "date"
}
```

**2. Типы упражнений (exercises JSON schema):**
```json
{
  "type": "multiple_choice",
  "question": "Лучший способ начать разговор с коллегой:",
  "options": [
    "Привет! Как дела?",
    "Слушай, мне нужна твоя помощь...",
    "Доброе утро! Как выходные прошли?"
  ],
  "correct_answer": 2,
  "explanation": "Вопрос о выходных показывает интерес к человеку как к личности"
},
{
  "type": "fill_blanks",
  "sentence": "При знакомстве важно сначала {blank1}, затем {blank2}",
  "blanks": {
    "blank1": ["поздороваться", "представиться"],
    "blank2": ["задать вопрос", "выслушать"]
  },
  "correct_answers": ["представиться", "задать вопрос"]
},
{
  "type": "true_false",
  "statement": "Зрительный контакт должен быть постоянным во время разговора",
  "correct_answer": false,
  "explanation": "Постоянный зрительный контакт может вызывать дискомфорт"
},
{
  "type": "matching",
  "instruction": "Соедини ситуацию с подходящим тоном",
  "left_items": ["Деловая встреча", "Вечеринка", "Первое свидание"],
  "right_items": ["Формальный", "Расслабленный", "Заинтересованный"],
  "correct_matches": {"0": "0", "1": "1", "2": "2"}
},
{
  "type": "sequence",
  "instruction": "Расставь этапы знакомства в правильном порядке:",
  "items": ["Задать открытый вопрос", "Поздороваться", "Представиться", "Найти общую тему"],
  "correct_order": [1, 2, 0, 3]
}
```

**3. Компонент урока (LessonPage):**
```tsx
// pages/lessons/[lessonId]/page.tsx
// Структура:
// ┌─────────────────────────────────────┐
// │ Header: прогресс, сердца, выход     │
// ├─────────────────────────────────────┤
// │                                     │
// │         Упражнение                  │
// │      (динамический компонент)        │
// │                                     │
// ├─────────────────────────────────────┤
// │  Кнопка "Проверить" / "Продолжить"  │
// └─────────────────────────────────────┘
```

**4. Компонент MultipleChoice:**
```tsx
// components/exercises/MultipleChoice.tsx
// - Вопрос сверху крупным шрифтом
// - 2-4 варианта ответа как кнопки
// - При выборе: правильный - зеленый, неправильный - красный
// - Анимация появления объяснения
// - Звуковые эффекты (опционально)
```

**5. Компонент FillBlanks:**
```tsx
// components/exercises/FillBlanks.tsx
// - Предложение с выделенными пропусками
// - Drag & drop слова из банка слов
// - Или dropdown с вариантами
// - Проверка после заполнения всех пропусков
```

**6. Компонент TrueFalse:**
```tsx
// components/exercises/TrueFalse.tsx
// - Утверждение по центру
// - Две большие кнопки: "ПРАВДА" и "ЛОЖЬ"
// - Цветовая индикация ответа
// - Краткое объяснение после ответа
```

**7. Компонент Matching:**
```tsx
// components/exercises/Matching.tsx
// - Два столбца элементов
// - Drag & drop или клик для соединения
// - Визуальные линии соединения
// - Проверка всех пар одновременно
```

**8. Компонент Sequence:**
```tsx
// components/exercises/Sequence.tsx
// - Перемешанные элементы как карточки
// - Drag & drop для перестановки
// - Номера порядка на карточках
// - Плавные анимации перемещения
```

**9. Система сердец и прогресса:**
```tsx
// components/lesson/LessonHeader.tsx
// - Прогресс-бар: X из Y упражнений
// - 5 сердец, уменьшаются за ошибки
// - При 0 сердец: предложение начать заново или выйти
// - Кнопка паузы/выхода с подтверждением
```

**10. Завершение урока:**
```tsx
// components/lesson/LessonComplete.tsx
// - Поздравительная анимация
// - Заработанный XP (+10, +15, +20)
// - Обновление прогресса навыка
// - Кнопки: "Продолжить" (следующий урок) / "На главную"
// - Возможность поделиться достижением
```

**11. API функции:**
```tsx
// lib/lessons.ts
// getLessonById(lessonId: string)
// startLessonAttempt(userId: string, lessonId: string)
// submitExerciseAnswer(attemptId: string, exerciseIndex: number, answer: any)
// completeLessonAttempt(attemptId: string, finalScore: number)
// getUserLessonProgress(userId: string, skillNode: string)
```

**12. Состояние урока:**
```tsx
// hooks/useLessonState.ts
// - Текущее упражнение
// - Количество сердец
// - Счет правильных ответов
// - Сохранение прогресса в localStorage (резерв)
// - Синхронизация с сервером
```

### Критерии приемки:
- [ ] Все типы упражнений работают корректно
- [ ] Система сердец уменьшается за неправильные ответы
- [ ] Прогресс сохраняется между сессиями
- [ ] Анимации плавные и не мешают UX
- [ ] Мобильная версия удобна для взаимодействия
- [ ] Есть возможность вернуться к пропущенным урокам
- [ ] XP начисляется только при успешном завершении
- [ ] Обработка edge cases (закрытие браузера, потеря связи)

---

## 🎯 МОДУЛЬ 4: РЕАЛЬНЫЕ МИССИИ И ТРЕКИНГ

### Техническое задание
Создай систему ежедневных реальных заданий, которые пользователь выполняет в жизни и отмечает в приложении.

### Детальные требования:

**1. PocketBase коллекции:**
```javascript
// missions
{
  "type": "select", // "daily", "weekly", "challenge"
  "category": "select", // "smalltalk", "confidence", "networking", "leadership"
  "title": "text", // "Сделай 3 комплимента незнакомым людям"
  "description": "text",
  "difficulty": "select", // "easy", "medium", "hard"
  "xp_reward": "number", // 5-25 в зависимости от сложности
  "icon": "text", // название иконки из lucide
  "is_active": "bool",
  "created": "date"
}

// user_missions
{
  "user": "relation(users)",
  "mission": "relation(missions)",
  "status": "select", // "assigned", "completed", "skipped", "failed"
  "assigned_date": "date",
  "completed_date": "date",
  "proof_text": "text", // опциональное описание выполнения
  "created": "date"
}
```

**2. Банк миссий по категориям:**
```tsx
// data/missions.ts
const MISSIONS_BANK = {
  smalltalk: {
    easy: [
      "Поздоровайся с 3 незнакомыми людьми",
      "Задай кассиру вопрос о его дне",
      "Сделай комплимент коллеге"
    ],
    medium: [
      "Начни разговор в лифте",
      "Поддерживай беседу 5+ минут с незнакомцем",
      "Познакомься с кем-то новым на работе"
    ],
    hard: [
      "Подойди к интересному человеку в кафе",
      "Заведи разговор на networking событии",
      "Выступи с инициативой на встрече"
    ]
  },
  confidence: {
    easy: [
      "Держи спину ровно весь день",
      "Говори на 20% громче обычного",
      "Смотри в глаза при разговоре"
    ],
    medium: [
      "Выскажи свое мнение в групповом чате",
      "Попроси скидку в магазине",
      "Откажись от просьбы, которая тебе неудобна"
    ]
  },
  // ... другие категории
};
```

**3. Компонент ежедневных миссий:**
```tsx
// components/missions/DailyMissions.tsx
// Отображение:
// ┌─────────────────────────────────────┐
// │ 📅 Задания на сегодня (3/3)        │
// ├─────────────────────────────────────┤
// │ ✅ Поздоровайся с 3 незнакомцами    │
// │    [Выполнено] [+10 XP]             │
// ├─────────────────────────────────────┤
// │ 🔥 Сделай комплимент коллеге        │
// │    [Отметить выполненным] [Пропуск] │
// ├─────────────────────────────────────┤
// │ 💪 Держи уверенную осанку           │
// │    [Отметить выполненным] [Пропуск] │
// └─────────────────────────────────────┘
```

**4. Модальное окно выполнения миссии:**
```tsx
// components/missions/MissionCompleteModal.tsx
// При клике "Отметить выполненным":
// - Заголовок миссии
// - "Как прошло выполнение?" (опциональное поле)
// - Слайдер настроения (1-5 звезд)
// - "Было ли сложно?" (да/нет)
// - Кнопки: "Подтвердить выполнение" / "Отмена"
```

**5. Система персонализации миссий:**
```tsx
// lib/missionGenerator.ts
// generateDailyMissions(user: User): Mission[]
// - Анализ целей пользователя (work, dating, leadership)
// - Учет уровня пользователя (новичок = легкие задания)
// - Ротация типов заданий (не повторять вчерашние)
// - Баланс сложности (1 легкое, 1 среднее, 1 сложное)
```

**6. Компонент истории миссий:**
```tsx
// components/missions/MissionHistory.tsx
// - Календарь с отметками выполненных дней
// - Список последних 10 выполненных миссий
// - Статистика: общий процент выполнения, любимая категория
// - Фильтры по категориям и датам
```

**7. Система стриков для миссий:**
```tsx
// components/missions/MissionStreak.tsx
// - Отдельный счетчик стрика для реальных заданий
// - "X дней подряд выполняешь задания"
// - Бонусы за длинные стрики (множитель XP)
// - Напоминания о важности регулярности
```

**8. Push-уведомления (Web Push):**
```tsx
// lib/notifications.ts
// - Напоминания о невыполненных миссиях (18:00)
// - Мотивационные сообщения утром
// - Поздравления с выполнением всех заданий дня
// - Предупреждения о потере стрика
```

**9. Компонент вызовов (Challenges):**
```tsx
// components/missions/ChallengeCard.tsx
// Недельные вызовы:
// - "Неделя уверенности" (7 заданий на уверенность)
// - "Мастер networking" (познакомься с 10 людьми)
// - "Комплимент-марафон" (20 комплиментов за неделю)
// - Прогресс-бар, награды, таблица лидеров
```

**10. Интеграция с основной системой:**
```tsx
// - Выполнение миссий дает XP
// - Влияет на общий стрик пользователя  
// - Открывает достижения
// - Показатель в профиле: "Выполнено X реальных заданий"
// - Миссии влияют на открытие новых навыков в дереве
```

**11. API функции:**
```tsx
// lib/missions.ts
// generateUserDailyMissions(userId: string, date: string)
// completeMission(userId: string, missionId: string, feedback?: string)
// skipMission(userId: string, missionId: string)
// getUserMissionStats(userId: string, period: 'week' | 'month' | 'all')
// getMissionHistory(userId: string, limit: number)
```

### Критерии приемки:
- [ ] Ежедневно генерируются 3 персонализированные миссии
- [ ] Пользователь может отметить выполнение с опциональным фидбеком
- [ ] Стрик миссий ведется отдельно от стрика уроков
- [ ] История выполненных заданий доступна в календаре
- [ ] Push-уведомления работают в поддерживаемых браузерах
- [ ] Недельные вызовы обновляются автоматически
- [ ] Пропущенные миссии не ломают общий UX
- [ ] XP за миссии интегрирован с общей системой прогресса

---

## 🏆 МОДУЛЬ 5: ДОСТИЖЕНИЯ И ГЕЙМИФИКАЦИЯ

### Техническое задание
Создай комплексную систему достижений, лиг, наград и социальных элементов для максимальной вовлеченности.

### Детальные требования:

**1. PocketBase коллекции:**
```javascript
// achievements
{
  "key": "text", // "first_lesson", "week_streak", "smalltalk_master"
  "title": "text", // "Первые шаги"
  "description": "text", // "Завершите свой первый урок"
  "icon": "text", // lucide icon name
  "category": "select", // "lessons", "missions", "streaks", "social", "special"
  "rarity": "select", // "common", "rare", "epic", "legendary"
  "xp_reward": "number",
  "unlock_condition": "json", // {"type": "lessons_completed", "value": 1}
  "is_hidden": "bool", // показывать ли до получения
  "created": "date"
}

// user_achievements
{
  "user": "relation(users)",
  "achievement": "relation(achievements)",
  "earned_at": "date",
  "progress": "number", // для прогрессивных достижений
  "created": "date"
}

// leagues
{
  "name": "text", // "Бронзовая лига"
  "level": "number", // 1, 2, 3, 4
  "min_xp": "number", // минимальный XP для входа
  "max_users": "number", // лимит участников
  "season_start": "date",
  "season_end": "date",
  "rewards": "json" // награды за топ позиции
}
```

**2. Система достижений:**
```tsx
// data/achievements.ts
const ACHIEVEMENTS = [
  // Уроки
  {
    key: "first_lesson",
    title: "Первые шаги",
    description: "Завершите свой первый урок",
    icon: "Baby",
    category: "lessons",
    rarity: "common",
    xp_reward: 25,
    condition: { type: "lessons_completed", value: 1 }
  },
  {
    key: "lesson_streak_7",
    title: "Неделя знаний",
    description: "Проходите уроки 7 дней подряд",
    icon: "Calendar",
    category: "streaks", 
    rarity: "rare",
    xp_reward: 100
  },
  
  // Миссии
  {
    key: "first_mission",
    title: "В реальный мир",
    description: "Выполните первое реальное задание",
    icon: "MapPin",
    category: "missions",
    rarity: "common",
    xp_reward: 30
  },
  
  // Социальные
  {
    key: "smalltalk_master", 
    title: "Мастер светских бесед",
    description: "Завершите все уроки по SmallTalk",
    icon: "MessageCircle",
    category: "social",
    rarity: "epic",
    xp_reward: 200
  },
  
  // Особые
  {
    key: "night_owl",
    title: "Полуночник",
    description: "Завершите урок после 23:00",
    icon: "Moon",
    category: "special",
    rarity: "rare",
    xp_reward: 50,
    is_hidden: true
  }
];
```

**3. Компонент достижений:**
```tsx
// components/achievements/AchievementsGrid.tsx
// Сетка 2x3 на десктопе, 1x6 на мобильном:
// ┌─────────┬─────────┬─────────┐
// │ 🏆 Rare │ ⭐ Epic │ 💎 Leg  │
// │ Титул   │ Титул   │ Титул   │
// │ Описание│ Описание│ Описание│
// ├─────────┼─────────┼─────────┤
// │ 🥉 Com  │ 🔒 Lock │ ❓ Hid  │
// │ Титул   │ Титул   │ ???     │
// │ Описание│ 5/10    │ Секрет  │
// └─────────┴─────────┴─────────┘

// Цвета по редкости:
// common: gray-400, rare: blue-500, epic: purple-500, legendary: yellow-500
```

**4. Система лиг:**
```tsx
// components/leagues/LeagueCard.tsx
// Текущая лига пользователя:
// - Иконка лиги (бронза/серебро/золото/платина/алмаз)
// - Название и текущая позиция
// - XP до следующей лиги
// - Топ-5 игроков лиги с аватарами
// - Время до конца сезона
// - Награды за топ позиции
```

**5. Компонент прогресса достижения:**
```tsx
// components/achievements/AchievementProgress.tsx
// Для достижений с прогрессом:
// - Circular progress bar вокруг иконки
// - "X/Y выполнено"
// - Estimated time до получения
// - Подсказки как ускорить прогресс
```

**6. Уведомления о достижениях:**
```tsx
// components/achievements/AchievementUnlocked.tsx
// Toast/Modal при получении достижения:
// - Анимация появления с конфетти
// - Иконка достижения (увеличенная)
// - Заголовок "Достижение получено!"
// - Название и описание
// - Количество полученного XP
// - Кнопка "Поделиться" (опционально)
// - Звуковой эффект (если включен)
```

**7. Страница достижений:**
```tsx
// pages/achievements/page.tsx
// Фильтры по категориям: Все | Уроки | Миссии | Стрики | Социальные | Особые
// Фильтры по статусу: Все | Полученные | В прогрессе | Заблокированные
// Сортировка: По дате | По редкости | По прогрессу
// 
// Статистика сверху:
// - Общее количество достижений: X/Y
// - Редкие достижения: X/Y  
// - Общий XP от достижений: X
// - Прогресс до следующей категории
```

**8. Система наград:**
```tsx
// components/rewards/RewardSystem.tsx
// Типы наград:
// - XP бонусы
// - Эксклюзивные аватары
// - Уникальные рамки профиля
// - Доступ к бета-функциям
// - Виртуальные значки
// 
// Магазин наград (тратим заработанные очки):
// - Смена темы приложения
// - Дополнительные слоты для целей
// - Персональные челленджи
```

**9. Социальные функции:**
```tsx
// components/social/Leaderboard.tsx
// Глобальный рейтинг:
// - Топ-100 по общему XP
// - Топ недели/месяца
// - Рейтинг друзей (если добавлена дружба)
// - Фильтры по навыкам
// 
// components/social/ShareProgress.tsx
// Возможность поделиться:
// - Полученным достижением
// - Пройденным уровнем
// - Текущим стриком
// - Завершенным челленджем
```

**10. Система уровней:**
```tsx
// lib/levels.ts
// Расчет уровня: level = Math.floor(xp / 100) + 1
// Особые уровни с наградами:
// - Уровень 5: Разблокировка персонализированных миссий
// - Уровень 10: Доступ к продвинутым урокам
// - Уровень 25: Статус "Ментор" в сообществе
// - Уровень 50: Эксклюзивная тема оформления
// - Уровень 100: Легендарный статус

// components/profile/LevelProgress.tsx
// Отображение текущего уровня с прогрессом до следующего
```

**11. API функции:**
```tsx
// lib/achievements.ts
// checkAchievements(userId: string, action: string, data: any)
// unlockAchievement(userId: string, achievementKey: string) 
// getUserAchievements(userId: string, filter?: string)
// getAchievementProgress(userId: string, achievementKey: string)
// 
// lib/leagues.ts
// getUserLeague(userId: string)
// getLeagueRanking(leagueId: string)
// promoteToNextLeague(userId: string)
// calculateSeasonRewards(leagueId: string)
```

**12. Gamification хуки:**
```tsx
// hooks/useGamification.ts
// - Автоматическая проверка достижений после действий
// - Показ уведомлений о прогрессе
// - Расчет бонусов и множителей
// - Интеграция с аналитикой действий пользователя
```

### Критерии приемки:
- [ ] Достижения разблокируются автоматически при выполнении условий
- [ ] Уведомления о новых достижениях появляются с анимацией
- [ ] Система лиг корректно продвигает пользователей
- [ ] Прогрессивные достижения отображают актуальный прогресс
- [ ] Скрытые достижения не показывают условие до разблокировки
- [ ] Награды за достижения применяются к профилю пользователя
- [ ] Рейтинги обновляются в реальном времени
- [ ] Мобильная версия достижений удобна для просмотра

---

## 👤 МОДУЛЬ 6: ПРОФИЛЬ И НАСТРОЙКИ

### Техническое задание
Создай персональный профиль пользователя с настройками, статистикой и возможностью кастомизации.

### Детальные требования:

**1. PocketBase коллекции:**
```javascript
// user_settings
{
  "user": "relation(users)",
  "notifications_enabled": "bool", // default: true
  "lesson_reminders": "bool", // default: true
  "mission_reminders": "bool", // default: true
  "sound_effects": "bool", // default: true
  "theme": "select", // "light", "dark", "auto"
  "language": "select", // "ru", "en"
  "privacy_profile": "select", // "public", "friends", "private"
  "weekly_goal": "number", // уроков в неделю, default: 7
  "reminder_time": "text", // "19:00"
  "timezone": "text", // "Europe/Moscow"
  "created": "date",
  "updated": "date"
}

// user_stats (кэш для быстрого отображения)
{
  "user": "relation(users)",
  "total_lessons": "number",
  "total_missions": "number", 
  "total_xp": "number",
  "longest_streak": "number",
  "favorite_category": "text",
  "join_date": "date",
  "last_active": "date",
  "achievements_count": "number",
  "updated": "date"
}
```

**2. Основной профиль:**
```tsx
// pages/profile/page.tsx
// Структура профиля:
// ┌─────────────────────────────────────┐
// │ Аватар | Имя | Уровень | XP         │
// │ Текущая лига | Стрик | Статус       │  
// ├─────────────────────────────────────┤
// │ Статистика за все время             │
// │ ┌─────────┬─────────┬─────────┐     │
// │ │ Уроков  │ Миссий  │ Дней    │     │
// │ │   145   │   89    │   23    │     │
// │ └─────────┴─────────┴─────────┘     │
// ├─────────────────────────────────────┤
// │ Прогресс по навыкам (мини-дерево)   │
// ├─────────────────────────────────────┤
// │ Последние достижения (горизонт.)    │
// ├─────────────────────────────────────┤
// │ График активности (календарь)       │
// └─────────────────────────────────────┘
```

**3. Компонент аватара:**
```tsx
// components/profile/AvatarUpload.tsx
// - Текущий аватар в круге (или инициалы если нет)
// - Кнопка редактирования (камера иконка)
// - Модальное окно для загрузки/обрезки
// - Preset аватары для выбора
// - Валидация: макс 2MB, только изображения
// - Интеграция с PocketBase файлами
```

**4. Статистика пользователя:**
```tsx
// components/profile/ProfileStats.tsx
// Карточки статистики:
// - Всего уроков завершено
// - Всего миссий выполнено  
// - Текущий стрик
// - Самый длинный стрик
// - Дней в приложении
// - Любимая категория навыков
// - Средний рейтинг за урок
// - Время в приложении (примерное)
```

**5. График активности:**
```tsx
// components/profile/ActivityCalendar.tsx
// GitHub-style календарь активности:
// - Квадратики за последние 365 дней
// - Цвет интенсивности: нет активности (gray) → высокая (green)
// - Tooltip при hover: "X уроков, Y миссий"
// - Статистика периода: "Активных дней: X/365"
// - Самая продуктивная неделя/месяц
```

**6. Мини-дерево навыков:**
```tsx
// components/profile/SkillsMiniTree.tsx
// Компактное отображение прогресса:
// - Все навыки в виде progress bars
// - Процент завершения каждого навыка
// - Общий прогресс по всем навыкам
// - Следующий рекомендуемый навык
// - Клик переводит в полное дерево навыков
```

**7. Страница настроек:**
```tsx
// pages/settings/page.tsx
// Группы настроек:

// 🔔 Уведомления
// - Push-уведомления (вкл/выкл)
// - Напоминания об уроках (время)
// - Напоминания о миссиях (вкл/выкл)
// - Достижения и прогресс (вкл/выкл)

// 🎨 Внешний вид  
// - Тема: Светлая | Темная | Авто
// - Язык интерфейса
// - Звуковые эффекты (вкл/выкл)
// - Анимации (вкл/выкл)

// 🎯 Цели и прогресс
// - Еженедельная цель уроков (слайдер 1-21)
// - Категории для миссий (чекбоксы)
// - Уровень сложности миссий

// 🔒 Приватность
// - Видимость профиля (публичный/друзья/приватный)
// - Показывать в рейтингах (да/нет)
// - История активности (видимая/скрытая)

// 📱 Аккаунт
// - Изменить email
// - Изменить пароль  
// - Экспорт данных
// - Удалить аккаунт
```

**8. Компонент редактирования профиля:**
```tsx
// components/profile/EditProfile.tsx
// Модальное окно или отдельная страница:
// - Имя пользователя
// - Загрузка аватара
// - Краткая биография (опционально)
// - Цели обучения (work/dating/leadership)
// - Часовой пояс
// - Кнопки: Сохранить | Отменить
```

**9. Экспорт и импорт данных:**
```tsx
// lib/dataExport.ts
// exportUserData(userId: string): JSON
// - Весь прогресс пользователя
// - История уроков и миссий
// - Достижения и статистика
// - Настройки профиля
// - Формат: JSON для резервного копирования
```

**10. Уведомления и напоминания:**
```tsx
// lib/notifications.ts  
// scheduleReminders(userId: string, settings: UserSettings)
// - Ежедневные напоминания в выбранное время
// - Еженедельные отчеты о прогрессе
// - Уведомления о потере стрика
// - Поздравления с достижениями
// - Персонализированные мотивационные сообщения
```

**11. Система друзей (опционально):**
```tsx
// components/profile/FriendsList.tsx
// Если добавляем социальный аспект:
// - Поиск пользователей по имени
// - Отправка/принятие заявок в друзья  
// - Сравнение прогресса с друзьями
// - Совместные челленджи
// - Приватные сообщения или комменты
```

**12. Страница статистики:**
```tsx
// pages/stats/page.tsx
// Подробная аналитика:
// - Графики прогресса по неделям/месяцам
// - Breakdown по категориям навыков
// - Лучшее/худшее время для обучения
// - Корреляция между уроками и миссиями
// - Прогнозы достижения целей
// - Рекомендации по улучшению
```

**13. API функции:**
```tsx
// lib/profile.ts
// getUserProfile(userId: string)
// updateUserProfile(userId: string, data: Partial<User>)
// getUserSettings(userId: string) 
// updateUserSettings(userId: string, settings: Partial<UserSettings>)
// getUserStats(userId: string)
// refreshUserStats(userId: string) // пересчет кэша
// uploadAvatar(userId: string, file: File)
// deleteAccount(userId: string, confirmation: string)
```

### Критерии приемки:
- [ ] Профиль отображает актуальную статистику пользователя
- [ ] Аватар загружается и отображается корректно
- [ ] Все настройки сохраняются и применяются
- [ ] Push-уведомления работают согласно настройкам
- [ ] Календарь активности показывает реальные данные  
- [ ] Экспорт данных создает полный backup профиля
- [ ] Смена темы применяется мгновенно
- [ ] Удаление аккаунта требует подтверждения
- [ ] Мобильная версия профиля удобна для редактирования

---

## 🚀 МОДУЛЬ 7: ДЕПЛОЙ И ФИНАЛЬНАЯ ИНТЕГРАЦИЯ

### Техническое задание
Подготовить приложение к production deployment, настроить мониторинг и оптимизировать производительность.

### Детальные требования:

**1. Production конфигурация:**
```tsx
// next.config.js
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-pocketbase-domain.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_POCKETBASE_URL: process.env.NEXT_PUBLIC_POCKETBASE_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },
  // PWA конфигурация
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};
```

**2. PWA поддержка:**
```json
// public/manifest.json
{
  "name": "Charisma Pro",
  "short_name": "Charisma",
  "description": "Duolingo для социальных навыков и харизмы",
  "start_url": "/",
  "display": "standalone", 
  "background_color": "#6366f1",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["education", "lifestyle"],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ]
}
```

**3. Service Worker:**
```tsx
// public/sw.js
// Кэширование статических ресурсов
// Офлайн fallback для основных страниц
// Background sync для сохранения прогресса
// Push notifications handling
```

**4. Система аналитики:**
```tsx
// lib/analytics.ts
// Интеграция с Google Analytics или Plausible
// Трекинг событий:
// - lesson_started, lesson_completed
// - mission_completed, achievement_unlocked  
// - user_registered, user_login
// - streak_broken, league_promoted
// 
// Privacy-first подход, GDPR compliance
```

**5. Error Boundary и логирование:**
```tsx
// components/ErrorBoundary.tsx
// Глобальная обработка ошибок React
// Красивая страница ошибки с возможностью восстановления
// Автоматическая отправка ошибок в Sentry (опционально)
```

**6. Производительность:**
```tsx
// lib/performance.ts
// Lazy loading компонентов
// Image optimization с Next.js Image
// Мemoization тяжелых вычислений
// Virtual scrolling для длинных списков
// Bundle analyzer для оптимизации размера
```

**7. SEO оптимизация:**
```tsx
// Мета-теги для всех страниц
// Open Graph для социальных сетей  
// JSON-LD структурированные данные
// Sitemap.xml генерация
// robots.txt настройка
```

**8. База данных оптимизация:**
```javascript
// PocketBase индексы для быстрых запросов:
// - users.email (уникальный)
// - progress.user + progress.skill_tree_node (составной)
// - user_missions.user + user_missions.assigned_date
// - user_achievements.user
// - lessons.skill_node
```

**9. Docker конфигурация:**
```dockerfile
# Dockerfile для Next.js приложения
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder  
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

**10. PocketBase production setup:**
```bash
# docker-compose.yml
version: '3.8'
services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: pocketbase
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - pocketbase_data:/pb/pb_data
    environment:
      - ENCRYPTION_KEY=${PB_ENCRYPTION_KEY}
    
  app:
    build: .
    container_name: charisma-app
    restart: unless-stopped  
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_POCKETBASE_URL=http://pocketbase:8080
    depends_on:
      - pocketbase

volumes:
  pocketbase_data:
```

**11. Backup стратегия:**
```bash
# scripts/backup.sh
#!/bin/bash
# Автоматический backup PocketBase данных
# Ежедневное копирование в cloud storage
# Retention policy (хранить 30 дней)
# Уведомления о статусе backup
```

**12. Мониторинг и здоровье:**
```tsx
// pages/api/health.ts
// Health check endpoint
// Проверка подключения к PocketBase
// Статус основных сервисов
// Метрики производительности

// lib/monitoring.ts
// Uptime мониторинг
// Performance metrics
// Error rate tracking
// User analytics dashboard
```

**13. CI/CD Pipeline:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        # SSH deployment или Docker registry push
```

**14. Security:**
```tsx
// middleware.ts
// Rate limiting
// CSRF protection
// Content Security Policy headers
// XSS protection
// PocketBase CORS настройка
```

**15. Финальная проверка:**
```tsx
// Чеклист для production:
// □ Все environment variables настроены
// □ HTTPS сертификаты установлены  
// □ Database backups работают
// □ Мониторинг настроен
// □ Error tracking активен
// □ PWA installable на мобильных
// □ Performance scores > 90 в Lighthouse
// □ Все формы защищены от spam
// □ GDPR compliance соблюден
// □ Analytics настроена
```

### Критерии приемки:
- [ ] Приложение успешно деплоится в production
- [ ] PWA устанавливается на мобильных устройствах
- [ ] Офлайн режим работает для просмотра прогресса
- [ ] Backup и восстановление данных функционируют
- [ ] Мониторинг отправляет уведомления о проблемах
- [ ] Performance оптимизации дают Lighthouse score > 90
- [ ] SEO метатеги корректно отображаются в соцсетях
- [ ] Error boundary ловит и обрабатывает критические ошибки
- [ ] Все API endpoints защищены rate limiting
- [ ] Пользовательские данные шифруются в transit и at rest

---

## 📋 ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ

### Общие принципы разработки:

**1. Код-стиль:**
- Используй TypeScript строго (no any types)
- Компоненты должны быть переиспользуемыми
- Следуй принципам SOLID
- Документируй сложные функции JSDoc комментариями

**2. Naming conventions:**
- Компоненты: PascalCase (UserProfile.tsx)
- Хуки: camelCase с префиксом use (useUserProgress.ts)
- Утилиты: camelCase (formatDate.ts)
- Константы: UPPER_SNAKE_CASE (MAX_LESSONS_PER_DAY)

**3. Структура компонентов:**
```tsx
// Импорты (React, библиотеки, локальные)
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

// Типы
interface Props {
  userId: string;
  onComplete: () => void;
}

// Компонент
export function ComponentName({ userId, onComplete }: Props) {
  // Состояние
  const [loading, setLoading] = useState(false);
  
  // Эффекты и хуки
  // Обработчики событий
  // Вычисляемые значения
  // Рендер
  
  return (
    <div className="component-container">
      {/* JSX */}
    </div>
  );
}
```

**4. Error handling:**
- Все async функции должны иметь try-catch
- Показывай пользователю понятные сообщения об ошибках
- Логируй ошибки для отладки
- Предусматривай fallback состояния

**5. Accessibility:**
- Все интерактивные элементы доступны с клавиатуры
- ARIA labels для screen readers  
- Достаточный цветовой контраст
- Semantic HTML везде где возможно

**6. Performance:**
- Мемоизируй тяжелые вычисления с useMemo
- Используй useCallback для функций в зависимостях
- Lazy load страницы и тяжелые компоненты
- Оптимизируй изображения через next/image

### Порядок разработки модулей:

1. **Модуль 1** - Основа (аутентификация, layout)
2. **Модуль 2** - Dashboard (прогресс, дерево навыков)  
3. **Модуль 3** - Уроки (core функционал)
4. **Модуль 4** - Миссии (реальные задания)
5. **Модуль 5** - Геймификация (достижения, лиги)
6. **Модуль 6** - Профиль (настройки, статистика)
7. **Модуль 7** - Деплой (production готовность)

### Тестирование каждого модуля:

После завершения каждого модуля проверь:
- [ ] Все компоненты рендерятся без ошибок
- [ ] API вызовы работают корректно
- [ ] Мобильная адаптация выглядит хорошо
- [ ] Loading states показываются
- [ ] Error states обрабатываются
- [ ] TypeScript компилируется без предупреждений
- [ ] Базовая функциональность работает как ожидается

### Дополнительные фишки (если останется время):

- **Темная тема** с system preference detection
- **Интернационализация** (i18n) для русского и английского
- **Анимации** с Framer Motion для улучшения UX
- **Voice записи** для практики произношения (если браузер поддерживает)
- **Календарная интеграция** для планирования уроков
- **Экспорт прогресса** в PDF отчеты
- **Gamification sound effects** для большей вовлеченности
- **Social sharing** прогресса в соцсети
- **Referral система** для привлечения новых пользователей
- **Premium подписка** с дополнительным контентом

### Финальный чеклист готовности:

- [ ] Все 7 модулей реализованы и протестированы
- [ ] Дизайн консистентен во всем приложении  
- [ ] Мобильная версия полностью функциональна
- [ ] Performance Lighthouse score > 90
- [ ] SEO оптимизация завершена
- [ ] Backup стратегия настроена
- [ ] Мониторинг и error tracking активны
- [ ] Documentation написана для всех API
- [ ] Пользователь может пройти полный flow от регистрации до завершения уроков

---

## 🎯 ЗАКЛЮЧЕНИЕ

Эта документация содержит все необходимое для создания полноценного приложения Charisma Pro - "Duolingo для социальных навыков". 

Каждый модуль детально описан с техническими требованиями, компонентами, API функциями и критериями приемки. Следуя этому плану поэтапно, ты получишь современное, геймифицированное приложение для развития харизмы и социальных навыков.

**Ключевые преимущества итогового продукта:**
- Научно обоснованный подход к обучению социальным навыкам
- Геймификация на уровне Duolingo с достижениями и лигами  
- Интеграция виртуального обучения с реальной практикой
- Персонализация под цели пользователя (работа/знакомства/лидерство)
- Modern tech stack (Next.js 14 + TypeScript + PocketBase)
- PWA с офлайн поддержкой
- Production-ready архитектура с масштабируемостью

Удачи в разработке! 🚀 