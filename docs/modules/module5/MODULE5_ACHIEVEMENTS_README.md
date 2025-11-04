# 🏆 Модуль 5: Достижения и Геймификация

Комплексная система достижений, лиг, наград и социальных элементов для максимальной вовлеченности пользователей.

## 📋 Содержание

- [Обзор](#обзор)
- [Установленные компоненты](#установленные-компоненты)
- [Быстрый старт](#быстрый-старт)
- [Использование](#использование)
- [API Reference](#api-reference)
- [Критерии приемки](#критерии-приемки)

---

## 🎯 Обзор

Модуль 5 включает в себя:

### ✅ Реализованные функции

1. **Система достижений** - 30+ уникальных достижений по 5 категориям
2. **Система уровней** - Прогрессивная система с наградами
3. **Система лиг** - 5 лиг с сезонными рейтингами
4. **Глобальный рейтинг** - Соревнование с другими игроками
5. **Награды** - Магазин виртуальных наград
6. **Социальный шеринг** - Делитесь достижениями в соцсетях

### 📊 Статистика

- **30 достижений** в 5 категориях
- **5 лиг** от Бронзовой до Алмазной
- **10 уровневых наград** за прогресс
- **Автоматическая проверка** достижений при каждом действии

---

## 📦 Установленные компоненты

### Библиотеки (`src/lib/`)

- ✅ `types.ts` - Типы для достижений, лиг и наград
- ✅ `achievements.ts` - API для работы с достижениями
- ✅ `leagues.ts` - API для работы с лигами
- ✅ `levels.ts` - Система уровней и наград

### Данные (`src/data/`)

- ✅ `achievements.ts` - Банк всех достижений приложения

### Хуки (`src/hooks/`)

- ✅ `useGamification.ts` - Автоматическая геймификация

### Компоненты (`src/components/`)

#### Достижения
- ✅ `achievements/AchievementsGrid.tsx` - Сетка достижений с фильтрами
- ✅ `achievements/AchievementCard.tsx` - Карточка достижения
- ✅ `achievements/AchievementProgress.tsx` - Прогресс достижения
- ✅ `achievements/AchievementUnlocked.tsx` - Модал получения достижения

#### Лиги
- ✅ `leagues/LeagueCard.tsx` - Карточка лиги

#### Профиль
- ✅ `profile/LevelProgress.tsx` - Прогресс уровня

#### Социальное
- ✅ `social/Leaderboard.tsx` - Глобальный рейтинг
- ✅ `social/ShareProgress.tsx` - Шеринг достижений

#### Награды
- ✅ `rewards/RewardSystem.tsx` - Магазин наград

### Страницы (`src/app/`)

- ✅ `achievements/page.tsx` - Главная страница достижений
- ✅ `achievements/layout.tsx` - Layout страницы

### Документация

- ✅ `POCKETBASE_MODULE5_SETUP.md` - Инструкции по настройке БД

---

## 🚀 Быстрый старт

### 1. Настройка PocketBase

Следуйте инструкциям в [POCKETBASE_MODULE5_SETUP.md](./POCKETBASE_MODULE5_SETUP.md):

```bash
# 1. Создайте коллекции в PocketBase Admin UI
#    - achievements
#    - user_achievements  
#    - leagues

# 2. Настройте API Rules
# 3. Инициализируйте достижения
```

### 2. Инициализация достижений

В консоли браузера или в скрипте:

```typescript
import { initializeAchievements } from '@/lib/achievements';

// Создаст все достижения в базе данных
await initializeAchievements();
```

### 3. Использование в компонентах

```typescript
import { useGamification } from '@/hooks/useGamification';

function MyComponent() {
  const { trackAction, newAchievements, showAchievementModal } = useGamification();

  // Отслеживание действия
  const handleLessonComplete = async () => {
    await trackAction('lesson_completed', { 
      perfect: true,
      duration_seconds: 120 
    });
  };

  return (
    <>
      <button onClick={handleLessonComplete}>
        Завершить урок
      </button>

      {/* Модал появится автоматически при получении достижения */}
    </>
  );
}
```

---

## 💡 Использование

### Отслеживание действий пользователя

```typescript
import { useGamification } from '@/hooks/useGamification';

const { trackAction } = useGamification();

// Завершение урока
await trackAction('lesson_completed', {
  perfect: true,           // Безупречное прохождение
  duration_seconds: 120    // Время прохождения
});

// Завершение миссии
await trackAction('mission_completed', {
  category: 'smalltalk'
});

// Достижение стрика
await trackAction('streak_achieved', {
  days: 7,
  restored: false
});

// Вход в приложение
await trackAction('login', {
  days_since_last_login: 1
});
```

### Получение достижений пользователя

```typescript
import { getUserAchievements, getAllAchievementsWithStatus } from '@/lib/achievements';

// Получить только полученные достижения
const earned = await getUserAchievements(userId);

// Получить все достижения со статусом
const all = await getAllAchievementsWithStatus(userId);
// Вернет массив с полями: unlocked, progress, earned_at
```

### Работа с уровнями

```typescript
import { getLevelInfo, getLevelProgress, getNextReward } from '@/lib/levels';

// Информация о текущем уровне
const levelInfo = getLevelInfo(userXp);
// { current_level, current_xp, xp_for_next_level, progress_percentage, total_xp }

// Расширенная информация с наградами
const progress = getLevelProgress(userXp);
// { ...levelInfo, next_level, next_reward }

// Следующая награда
const reward = getNextReward(currentLevel);
```

### Работа с лигами

```typescript
import { getUserLeague, getLeagueRanking, getGlobalLeaderboard } from '@/lib/leagues';

// Информация о лиге пользователя
const league = await getUserLeague(userId);
// { current, next, xp_to_next, position_in_league }

// Топ лиги
const topPlayers = await getLeagueRanking(leagueLevel, 10);

// Глобальный рейтинг
const leaderboard = await getGlobalLeaderboard(100);
```

### Компоненты

#### AchievementsGrid

```tsx
import { AchievementsGrid } from '@/components/achievements/AchievementsGrid';
import { getUserAchievements } from '@/lib/achievements';

const achievements = await getUserAchievements(userId);

<AchievementsGrid
  userAchievements={achievements}
  onAchievementClick={(achievement) => {
    // Показать детали
  }}
/>
```

#### LevelProgress

```tsx
import { LevelProgress } from '@/components/profile/LevelProgress';
import { getLevelProgress } from '@/lib/levels';

const progress = getLevelProgress(user.experience_points);

<LevelProgress
  levelProgress={progress}
  variant="full" // или "compact"
/>
```

#### LeagueCard

```tsx
import { LeagueCard } from '@/components/leagues/LeagueCard';
import { getUserLeague } from '@/lib/leagues';

const leagueInfo = await getUserLeague(userId);

<LeagueCard leagueInfo={leagueInfo} />
```

#### Leaderboard

```tsx
import { Leaderboard } from '@/components/social/Leaderboard';

<Leaderboard
  currentUserId={user.id}
  limit={100}
/>
```

#### ShareProgress

```tsx
import { ShareProgress } from '@/components/social/ShareProgress';

<ShareProgress
  type="achievement"
  data={{
    title: "Первые шаги",
    description: "Завершите свой первый урок",
    icon: "Baby"
  }}
  onClose={() => setShowShare(false)}
/>
```

---

## 📚 API Reference

### Achievements API

```typescript
// Проверить и разблокировать достижения
checkAchievements(userId: string, action: string, data?: Record<string, any>): Promise<UserAchievement[]>

// Разблокировать конкретное достижение
unlockAchievement(userId: string, achievementKey: string): Promise<UserAchievement | null>

// Получить достижения пользователя
getUserAchievements(userId: string, filter?: string): Promise<UserAchievement[]>

// Получить прогресс достижения
getAchievementProgress(userId: string, achievementKey: string): Promise<number>

// Получить все достижения со статусом
getAllAchievementsWithStatus(userId: string): Promise<AchievementWithStatus[]>

// Инициализация базы данных
initializeAchievements(): Promise<void>
```

### Levels API

```typescript
// Расчет уровня по XP
calculateLevel(totalXp: number): number

// Получить XP для уровня
getXpForLevel(level: number): number

// Получить информацию о уровне
getLevelInfo(totalXp: number): LevelInfo

// Получить расширенный прогресс
getLevelProgress(totalXp: number): LevelProgress

// Получить награду за уровень
getRewardForLevel(level: number): LevelReward | undefined

// Получить следующую награду
getNextReward(currentLevel: number): LevelReward | undefined

// Проверить наличие награды
hasRewardForLevel(level: number): boolean

// Получить ранг/звание
getLevelRank(level: number): string

// Получить цвет уровня
getLevelColor(level: number): string
```

### Leagues API

```typescript
// Получить лигу по XP
getLeagueByXp(xp: number): LeagueDefinition

// Получить следующую лигу
getNextLeague(currentXp: number): LeagueDefinition | null

// Получить лигу пользователя
getUserLeague(userId: string): Promise<UserLeagueInfo>

// Получить рейтинг лиги
getLeagueRanking(leagueLevel: number, limit?: number): Promise<LeagueRanking[]>

// Глобальный рейтинг
getGlobalRanking(limit?: number): Promise<LeagueRanking[]>

// Продвинуть в следующую лигу
promoteToNextLeague(userId: string): Promise<boolean>

// Статистика сезона
getLeagueSeasonStats(leagueId: string): Promise<SeasonStats>

// Расчет наград
calculateSeasonRewards(position: number): SeasonReward

// Конкуренты
getLeagueCompetitors(userId: string, limit?: number): Promise<LeagueRanking[]>

// Глобальный рейтинг
getGlobalLeaderboard(limit?: number): Promise<LeagueParticipant[]>

// Недельный рейтинг
getWeeklyLeaderboard(limit?: number): Promise<LeagueParticipant[]>
```

---

## ✅ Критерии приемки

### Функциональность

- [x] Достижения разблокируются автоматически при выполнении условий
- [x] Уведомления о новых достижениях появляются с анимацией
- [x] Система лиг корректно продвигает пользователей
- [x] Прогрессивные достижения отображают актуальный прогресс
- [x] Скрытые достижения не показывают условие до разблокировки
- [x] Награды за достижения применяются к профилю пользователя
- [x] Рейтинги обновляются корректно
- [x] Мобильная версия достижений удобна для просмотра

### Компоненты

- [x] `AchievementsGrid` - сетка с фильтрацией и статистикой
- [x] `AchievementCard` - карточка с прогрессом и статусом
- [x] `AchievementProgress` - детальный прогресс с советами
- [x] `AchievementUnlocked` - модал с конфетти и анимацией
- [x] `LevelProgress` - прогресс уровня с наградами
- [x] `LeagueCard` - карточка лиги с топом и наградами
- [x] `Leaderboard` - глобальный и недельный рейтинг
- [x] `ShareProgress` - шеринг в соцсети
- [x] `RewardSystem` - магазин наград

### API

- [x] `checkAchievements()` - автоматическая проверка
- [x] `unlockAchievement()` - разблокировка с начислением XP
- [x] `getUserAchievements()` - получение с фильтрацией
- [x] `getAchievementProgress()` - расчет прогресса
- [x] `getUserLeague()` - информация о лиге
- [x] `getLeagueRanking()` - топ лиги
- [x] `getLevelInfo()` - информация о уровне
- [x] `getLevelProgress()` - расширенный прогресс

### База данных

- [x] Коллекция `achievements` с индексами
- [x] Коллекция `user_achievements` с уникальными ограничениями
- [x] Коллекция `leagues` с сезонами
- [x] API Rules для безопасности
- [x] Инициализация данных

---

## 🎨 Дизайн

Все компоненты следуют дизайн-системе проекта:

- **Цвета по редкости:**
  - 🥉 Common: серый
  - 🔷 Rare: синий
  - ⭐ Epic: фиолетовый
  - 💎 Legendary: желтый

- **Анимации:**
  - Hover эффекты на карточках
  - Конфетти при получении достижения
  - Плавные переходы прогресса
  - Bounce анимация иконок

- **Респонсивность:**
  - Мобильная версия: 1 колонка
  - Планшет: 2 колонки
  - Десктоп: 3 колонки

---

## 🔧 Настройка

### Добавление нового достижения

1. Добавьте в `src/data/achievements.ts`:

```typescript
{
  key: "new_achievement",
  title: "Новое достижение",
  description: "Описание нового достижения",
  icon: "Star", // Имя иконки из Lucide
  category: "special",
  rarity: "rare",
  xp_reward: 100,
  unlock_condition: { type: "custom_action", value: 1 },
  is_hidden: false
}
```

2. Добавьте логику проверки в `lib/achievements.ts` в функцию `checkUnlockCondition()`:

```typescript
case 'custom_action':
  return data?.custom_condition === true;
```

3. Запустите `initializeAchievements()` для добавления в БД

### Изменение системы уровней

Отредактируйте константу `LEVEL_REWARDS` в `src/lib/levels.ts`:

```typescript
export const LEVEL_REWARDS: LevelReward[] = [
  {
    level: 15,
    reward_title: "Новая награда",
    reward_description: "Описание награды",
    icon: "Gift"
  },
  // ...
];
```

---

## 🐛 Known Issues

- [ ] TODO: Реализовать сезонный XP для недельных рейтингов
- [ ] TODO: Добавить звуковые эффекты для достижений
- [ ] TODO: Реализовать систему друзей для рейтинга

---

## 📞 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [POCKETBASE_MODULE5_SETUP.md](./POCKETBASE_MODULE5_SETUP.md)
2. Используйте [MODULE5_TESTING_CHECKLIST.md](./MODULE5_TESTING_CHECKLIST.md) для проверки
3. Убедитесь, что все коллекции созданы правильно
4. Проверьте консоль браузера на наличие ошибок
5. Убедитесь, что `initializeAchievements()` был запущен

---

## 📋 Тестирование

Используйте подробный чеклист для проверки всего модуля:
- **[MODULE5_TESTING_CHECKLIST.md](./MODULE5_TESTING_CHECKLIST.md)** - полная проверка (30+ пунктов)

### Быстрый тест (5 минут):

1. ✅ `/admin/init-achievements` - инициализация достижений
2. ✅ `/achievements` - просмотр страницы
3. ✅ `/dashboard` - виджет достижений
4. ✅ Выполнить миссию - проверить счетчик
5. ✅ Завершить урок - получить достижение "Первые шаги"

---

**Версия:** 1.0.0  
**Дата:** 2025-01-01  
**Модуль:** 5 - Достижения и Геймификация

