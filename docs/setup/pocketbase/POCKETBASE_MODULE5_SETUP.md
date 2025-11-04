# Настройка PocketBase - Модуль 5: Достижения и Геймификация

## Коллекция: achievements

### Создание коллекции

1. Откройте админ-панель PocketBase: `http://127.0.0.1:8090/_/`
2. Перейдите в Collections > New Collection
3. Название: `achievements`
4. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `key` | Text | Required, Unique, Max: 100 |
| `title` | Text | Required, Max: 200 |
| `description` | Text | Required, Max: 500 |
| `icon` | Text | Required, Max: 50 (название Lucide иконки) |
| `category` | Select | Options: lessons, missions, streaks, social, special. Required |
| `rarity` | Select | Options: common, rare, epic, legendary. Required |
| `xp_reward` | Number | Required, Min: 10, Max: 1000 |
| `unlock_condition` | JSON | Optional |
| `is_hidden` | Bool | Default: false |

### Индексы для achievements

Создайте индексы:
1. **Unique index на `key`** (предотвращает дубли)
2. Index на `category` (для быстрой фильтрации)
3. Index на `rarity` (для сортировки)

### API Rules для achievements

- **List/Search:** `@request.auth.id != ""`
- **View:** `@request.auth.id != ""`
- **Create:** (оставьте пустым - только через функцию `initializeAchievements()`)
- **Update:** (оставьте пустым - только админы)
- **Delete:** (оставьте пустым - только админы)

---

## Коллекция: user_achievements

### Создание коллекции

1. Перейдите в Collections > New Collection
2. Название: `user_achievements`
3. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `user` | Relation | Collection: users, Single, Required |
| `achievement` | Relation | Collection: achievements, Single, Required |
| `earned_at` | Date | Required |
| `progress` | Number | Required, Min: 0, Max: 100, Default: 0 |

### Индексы для user_achievements

Создайте индексы:
1. **Unique index** на комбинацию `user + achievement` (один пользователь = одно достижение)
2. Index на `user` (для быстрого поиска)
3. Index на `earned_at` (для сортировки по дате)

### API Rules для user_achievements

- **List/Search:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`
  
- **View:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`
  
- **Create:**
  - Rule: `@request.auth.id != "" && @request.data.user = @request.auth.id`
  
- **Update:**
  - Rule: `@request.auth.id = ""` (никто не может обновлять)
  
- **Delete:**
  - Rule: (оставьте пустым - только админы)

---

## Коллекция: leagues

### Создание коллекции

1. Перейдите в Collections > New Collection
2. Название: `leagues`
3. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `name` | Text | Required, Max: 100 |
| `level` | Number | Required, Min: 1, Max: 5 |
| `min_xp` | Number | Required, Min: 0 |
| `max_users` | Number | Required, Default: 50 |
| `season_start` | Date | Required |
| `season_end` | Date | Required |
| `rewards` | JSON | Optional |

### API Rules для leagues

- **List/Search:** `@request.auth.id != ""`
- **View:** `@request.auth.id != ""`
- **Create:** (оставьте пустым - только админы)
- **Update:** (оставьте пустым - только админы)
- **Delete:** (оставьте пустым - только админы)

---

## Коллекция: daily_streaks

### Создание коллекции

1. Перейдите в Collections > New Collection
2. Название: `daily_streaks`
3. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `user` | Relation | Collection: users, Single, Required |
| `date` | Text | Required, Max: 10 (формат YYYY-MM-DD) |
| `lessons_completed` | Number | Required, Default: 0 |
| `missions_completed` | Number | Required, Default: 0 |
| `xp_earned_today` | Number | Optional, Default: 0, Min: 0 |
| `lesson_mission_claimed` | Bool | Optional, Default: false |
| `real_mission_claimed` | Bool | Optional, Default: false |
| `xp_mission_claimed` | Bool | Optional, Default: false |

### Индексы для daily_streaks

Создайте индексы:
1. **Unique index** на комбинацию `user + date` (один пользователь = одна запись в день)
2. Index на `user`
3. Index на `date`

### API Rules для daily_streaks

- **List/Search:** `@request.auth.id != "" && user = @request.auth.id`
- **View:** `@request.auth.id != "" && user = @request.auth.id`
- **Create:** `@request.auth.id != "" && @request.data.user = @request.auth.id`
- **Update:** `@request.auth.id != "" && user = @request.auth.id`
- **Delete:** (оставьте пустым)

---

## ⚠️ ВАЖНО: Инициализация достижений

Достижения создаются **автоматически** через специальную функцию.

### Как инициализировать достижения

#### Способ 1: Через специальную страницу (РЕКОМЕНДУЕТСЯ)

1. **Авторизуйтесь в приложении** (если еще не авторизованы):
   ```
   http://localhost:3000/login
   ```

2. Откройте в браузере:
   ```
   http://localhost:3000/admin/init-achievements
   ```

3. Нажмите кнопку **"Запустить инициализацию"**

4. Дождитесь сообщения об успехе ✅

Это создаст **все 30 достижений** из `data/achievements.ts` в базе данных.

#### Способ 2: Через консоль разработчика (альтернатива)

Если страница не работает, можно запустить вручную:

1. Откройте файл `src/lib/achievements.ts`
2. Найдите функцию `initializeAchievements()`
3. Временно добавьте вызов в любой компонент:

```typescript
// В useEffect любого компонента
useEffect(() => {
  initializeAchievements().then(() => {
    console.log('Achievements initialized!');
  });
}, []);
```

4. Перезагрузите страницу
5. Удалите временный код

### Проверка

После инициализации проверьте:
1. Откройте PocketBase Admin UI
2. Перейдите в коллекцию `achievements`
3. Должно быть создано **30 записей**

---

## Создание лиг

### Лиги создаются вручную через Admin UI

Collections → **leagues** → **New record**

#### Лига 1: Бронзовая

```
name: Бронзовая лига
level: 1
min_xp: 0
max_users: 50
season_start: 2025-01-01 00:00:00.000Z
season_end: 2025-12-31 23:59:59.999Z
rewards: {"first": "500 XP + Золотой значок", "second": "300 XP + Серебряный значок", "third": "200 XP"}
```

#### Лига 2: Серебряная

```
name: Серебряная лига
level: 2
min_xp: 500
max_users: 50
season_start: 2025-01-01 00:00:00.000Z
season_end: 2025-12-31 23:59:59.999Z
rewards: {"first": "1000 XP + Золотой значок", "second": "600 XP + Серебряный значок", "third": "400 XP"}
```

#### Лига 3: Золотая

```
name: Золотая лига
level: 3
min_xp: 1500
max_users: 50
season_start: 2025-01-01 00:00:00.000Z
season_end: 2025-12-31 23:59:59.999Z
rewards: {"first": "2000 XP + Золотой значок", "second": "1200 XP + Серебряный значок", "third": "800 XP"}
```

#### Лига 4: Платиновая

```
name: Платиновая лига
level: 4
min_xp: 3500
max_users: 50
season_start: 2025-01-01 00:00:00.000Z
season_end: 2025-12-31 23:59:59.999Z
rewards: {"first": "3000 XP + Золотой значок", "second": "1800 XP + Серебряный значок", "third": "1200 XP"}
```

#### Лига 5: Алмазная

```
name: Алмазная лига
level: 5
min_xp: 7000
max_users: 50
season_start: 2025-01-01 00:00:00.000Z
season_end: 2025-12-31 23:59:59.999Z
rewards: {"first": "5000 XP + Золотой значок", "second": "3000 XP + Серебряный значок", "third": "2000 XP"}
```

### ✅ Все лиги созданы!

Теперь у вас есть полная система лиг от Бронзовой до Алмазной.

---

## Обновление коллекции users

### Добавьте недостающие поля

Откройте коллекцию **users** и убедитесь, что есть следующие поля:

| Поле | Тип | Настройки |
|------|-----|-----------|
| `experience_points` | Number | Default: 0 |
| `current_streak` | Number | Default: 0 |
| `total_lessons_completed` | Number | Default: 0 |
| `current_league` | Text | Default: "bronze", Max: 50 |

### Если полей нет, создайте их:

1. Откройте коллекцию `users`
2. Нажмите "New field"
3. Создайте каждое поле с указанными настройками

---

## Проверка настроек

После настройки проверьте:

1. ✅ Коллекция `achievements` создана
2. ✅ Коллекция `user_achievements` создана
3. ✅ Коллекция `leagues` создана
4. ✅ Коллекция `daily_streaks` создана
5. ✅ Коллекция `user_progress` создана
6. ✅ API Rules установлены для всех коллекций
7. ✅ Индексы созданы для всех коллекций
8. ✅ Запущена функция `initializeAchievements()`
9. ✅ Создано 5 лиг
10. ✅ Поля в коллекции `users` обновлены

---

## Как работает система достижений

### Автоматическая разблокировка

1. **Пользователь выполняет действие** (завершает урок, миссию, достигает стрика)
2. **Система автоматически проверяет** условия всех достижений
3. **Если условия выполнены**, достижение разблокируется:
   - Создается запись в `user_achievements`
   - Начисляется XP пользователю
   - Показывается модальное окно с конфетти 🎉

### Примеры разблокировки

#### Достижение "Первые шаги"
```javascript
// Условие: завершить 1 урок
// Разблокируется автоматически при:
await trackAction('lesson_completed', { /* данные урока */ });
```

#### Достижение "Неделя знаний"
```javascript
// Условие: стрик 7 дней
// Разблокируется автоматически при:
user.current_streak >= 7
```

#### Достижение "Полуночник" (скрытое)
```javascript
// Условие: завершить урок после 23:00
// Разблокируется автоматически при завершении урока поздно вечером
```

---

## Использование в приложении

### Страница достижений

```
http://localhost:3000/achievements
```

### Что увидит пользователь

1. **Статистика:**
   - Полученные достижения: X/30
   - В прогрессе: Y
   - Заблокированные: Z

2. **Фильтры:**
   - По категориям (Уроки, Миссии, Стрики, и т.д.)
   - По статусу (Полученные, В прогрессе, Заблокированные)
   - По редкости

3. **Карточки достижений:**
   - Иконка с прогресс-кольцом
   - Название и описание
   - XP награда
   - Дата получения (для полученных)

4. **Боковая панель:**
   - Прогресс уровня
   - Текущая лига
   - Топ-5 игроков
   - Советы

---

## Категории достижений

### 🎓 Lessons (Уроки)
- За прохождение уроков
- За безупречное выполнение
- За количество пройденных уроков

### 🎯 Missions (Миссии)
- За выполнение реальных заданий
- За челленджи
- За стрики миссий

### 🔥 Streaks (Стрики)
- За ежедневное использование
- За длинные стрики
- За восстановление стрика

### 👥 Social (Социальные)
- За завершение всех уроков навыка
- За освоение категорий

### ✨ Special (Особые)
- Скрытые достижения
- Уникальные условия
- Сюрпризы

---

## Редкость достижений

- **🥉 Common (Обычное)** — легко получить, 25-50 XP
- **🔷 Rare (Редкое)** — требуют усилий, 75-100 XP
- **⭐ Epic (Эпическое)** — серьезные достижения, 150-250 XP
- **💎 Legendary (Легендарное)** — вершина мастерства, 500-1000 XP

---

## Система уровней

### Расчет уровня

```
Уровень = Math.floor(XP / 100) + 1
```

### Примеры

- 0-99 XP = Уровень 1
- 100-199 XP = Уровень 2
- 500-599 XP = Уровень 6
- 1000+ XP = Уровень 11+

### Награды за уровни

Награды начисляются автоматически на уровнях:
- **5:** Персонализированные миссии
- **10:** Продвинутые уроки
- **15:** Эксклюзивные аватары
- **20:** XP Бонус +10%
- **25:** Статус "Ментор"
- **50:** Эксклюзивная тема
- **100:** Легендарный статус

---

## Система лиг

### Как работает

1. Пользователь автоматически попадает в лигу по своему XP
2. Может видеть топ игроков своей лиги
3. В конце сезона получает награды за позицию
4. Автоматически продвигается в следующую лигу при достижении XP

### Диапазоны XP

- 🥉 Бронзовая: 0-499 XP
- 🥈 Серебряная: 500-1499 XP
- 🥇 Золотая: 1500-3499 XP
- 💍 Платиновая: 3500-6999 XP
- 💎 Алмазная: 7000+ XP

---

## Готово!

Теперь система достижений и геймификации работает:
- ✅ 30 уникальных достижений
- ✅ Автоматическая разблокировка
- ✅ Система уровней с наградами
- ✅ 5 лиг с сезонными рейтингами
- ✅ Глобальный рейтинг
- ✅ Красивые уведомления с конфетти
- ✅ Социальный шеринг

## Следующие шаги

1. Настройте коллекции по инструкции
2. Запустите `initializeAchievements()` в консоли
3. Создайте 5 лиг через Admin UI
4. Откройте `/achievements` в приложении
5. Получите свое первое достижение! 🏆

---

## Примеры запросов (для разработчиков)

### Получить достижения пользователя

```javascript
const achievements = await pb.collection('user_achievements').getFullList({
  filter: `user = "${userId}"`,
  expand: 'achievement',
  sort: '-earned_at'
});
```

### Разблокировать достижение

```javascript
import { unlockAchievement } from '@/lib/achievements';

// Разблокировать достижение "first_lesson"
const result = await unlockAchievement(userId, 'first_lesson');
```

### Проверить все достижения

```javascript
import { checkAchievements } from '@/lib/achievements';

// Автоматически проверит и разблокирует подходящие
const newAchievements = await checkAchievements(
  userId, 
  'lesson_completed', 
  { perfect: true }
);
```

---

## Troubleshooting

### Проблема: Функция initializeAchievements() не работает

**Решение:**
1. Убедитесь, что вы авторизованы в приложении
2. Проверьте консоль на ошибки
3. Убедитесь, что коллекция `achievements` создана
4. Проверьте API Rules

### Проблема: Достижения не разблокируются

**Решение:**
1. Проверьте, что функция `checkAchievements()` вызывается
2. Посмотрите логи в консоли
3. Убедитесь, что условия достижения выполнены
4. Проверьте API Rules для `user_achievements`

### Проблема: XP не начисляется

**Решение:**
1. Проверьте функцию `unlockAchievement()` в `lib/achievements.ts`
2. Убедитесь, что у пользователя есть поле `experience_points`
3. Проверьте права доступа к коллекции `users`

---

## Опционально: Rewards System

Система наград пока не подключена к базе данных.
Для её реализации создайте коллекцию `rewards` по аналогии с `achievements`.

---

**Готово! Система достижений настроена и готова к использованию! 🎉**
