# Настройка PocketBase - Модуль 6: Профиль и Настройки

## Коллекция: user_settings

### Создание коллекции

1. Откройте админ-панель PocketBase: `http://127.0.0.1:8090/_/`
2. Перейдите в Collections > New Collection
3. Название: `user_settings`
4. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `user` | Relation | Collection: users, Single, Required, Cascade delete |
| `notifications_enabled` | Bool | Required, Default: true |
| `lesson_reminders` | Bool | Required, Default: true |
| `mission_reminders` | Bool | Required, Default: true |
| `sound_effects` | Bool | Required, Default: true |
| `animations_enabled` | Bool | Required, Default: true |
| `theme` | Select | Options: light, dark, auto. Required, Default: auto |
| `language` | Select | Options: ru, en. Required, Default: ru |
| `privacy_profile` | Select | Options: public, friends, private. Required, Default: public |
| `show_in_leaderboard` | Bool | Required, Default: true |
| `show_activity_history` | Bool | Required, Default: true |
| `weekly_goal` | Number | Required, Min: 1, Max: 21, Default: 7 |
| `reminder_time` | Text | Optional, Pattern: HH:MM, Default: "19:00" |
| `timezone` | Text | Optional, Default: "Europe/Moscow" |

### Индексы для user_settings

Создайте индексы:
1. **Unique index на `user`** (один пользователь = одна запись настроек)

В PocketBase Admin UI:
- Перейдите в коллекцию `user_settings`
- Вкладка **Indexes**
- Добавьте: `CREATE UNIQUE INDEX idx_user_settings_user ON user_settings (user)`

### API Rules для user_settings

- **List/Search:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`
  
- **View:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`
  
- **Create:**
  - Rule: `@request.auth.id != "" && @request.data.user = @request.auth.id`
  
- **Update:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`
  
- **Delete:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`

---

## Коллекция: user_stats

### Создание коллекции

1. Перейдите в Collections > New Collection
2. Название: `user_stats`
3. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `user` | Relation | Collection: users, Single, Required, Cascade delete |
| `total_lessons` | Number | Required, Default: 0 |
| `total_missions` | Number | Required, Default: 0 |
| `total_xp` | Number | Required, Default: 0 |
| `current_streak` | Number | Required, Default: 0 |
| `longest_streak` | Number | Required, Default: 0 |
| `favorite_category` | Text | Optional (название любимой категории) |
| `join_date` | Date | Required (дата регистрации) |
| `last_active` | Date | Required (последняя активность) |
| `achievements_count` | Number | Required, Default: 0 |
| `days_active` | Number | Required, Default: 0 |
| `average_lesson_score` | Number | Optional (средний балл за уроки) |
| `total_practice_time` | Number | Required, Default: 0 (минуты в приложении) |

### Индексы для user_stats

Создайте индексы:
1. **Unique index на `user`** (один пользователь = одна запись статистики)
2. Index на `last_active` (для запросов по активности)

В PocketBase Admin UI:
- Перейдите в коллекцию `user_stats`
- Вкладка **Indexes**
- Добавьте: `CREATE UNIQUE INDEX idx_user_stats_user ON user_stats (user)`
- Добавьте: `CREATE INDEX idx_user_stats_last_active ON user_stats (last_active)`

### API Rules для user_stats

- **List/Search:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`
  
- **View:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`
  
- **Create:**
  - Rule: `@request.auth.id != "" && @request.data.user = @request.auth.id`
  
- **Update:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`
  
- **Delete:**
  - Rule: `@request.auth.id != "" && user = @request.auth.id`

---

## Обновление коллекции users

### Добавьте поле для аватара

Откройте коллекцию **users** и добавьте поле для загрузки аватара:

| Поле | Тип | Настройки |
|------|-----|-----------|
| `avatar` | File | Max files: 1, Max size: 2MB |

**Разрешенные типы файлов:**
- `image/jpeg`
- `image/png`
- `image/webp`

### Если полей нет, создайте их:

1. Откройте коллекцию `users`
2. Нажмите "New field"
3. Выберите тип "File"
4. Название: `avatar`
5. Настройте ограничения размера и типов

---

## ⚠️ ВАЖНО: Инициализация настроек для существующих пользователей

Если у вас уже есть пользователи в системе, нужно создать для них записи настроек и статистики.

### Способ 1: Через PocketBase Console (РЕКОМЕНДУЕТСЯ)

1. Откройте PocketBase Admin UI: `http://127.0.0.1:8090/_/`
2. Перейдите в **Settings** → **Backups** → **Console**
3. Вставьте и выполните следующий скрипт:

```javascript
// Инициализация настроек и статистики для всех пользователей
const users = $app.dao().findRecordsByExpr("users");

console.log(`Найдено пользователей: ${users.length}`);

for (const user of users) {
  try {
    // Создаем user_settings
    const settingsCollection = $app.dao().findCollectionByNameOrId("user_settings");
    const settingsRecord = new Record(settingsCollection);
    
    settingsRecord.set("user", user.id);
    settingsRecord.set("notifications_enabled", true);
    settingsRecord.set("lesson_reminders", true);
    settingsRecord.set("mission_reminders", true);
    settingsRecord.set("sound_effects", true);
    settingsRecord.set("animations_enabled", true);
    settingsRecord.set("theme", "auto");
    settingsRecord.set("language", "ru");
    settingsRecord.set("privacy_profile", "public");
    settingsRecord.set("show_in_leaderboard", true);
    settingsRecord.set("show_activity_history", true);
    settingsRecord.set("weekly_goal", 7);
    settingsRecord.set("reminder_time", "19:00");
    settingsRecord.set("timezone", "Europe/Moscow");
    
    $app.dao().saveRecord(settingsRecord);
    console.log(`✅ Настройки созданы для пользователя: ${user.get("email")}`);
    
    // Создаем user_stats
    const statsCollection = $app.dao().findCollectionByNameOrId("user_stats");
    const statsRecord = new Record(statsCollection);
    
    statsRecord.set("user", user.id);
    statsRecord.set("total_lessons", 0);
    statsRecord.set("total_missions", 0);
    statsRecord.set("total_xp", 0);
    statsRecord.set("current_streak", 0);
    statsRecord.set("longest_streak", 0);
    statsRecord.set("join_date", user.get("created"));
    statsRecord.set("last_active", new Date());
    statsRecord.set("achievements_count", 0);
    statsRecord.set("days_active", 0);
    statsRecord.set("total_practice_time", 0);
    
    $app.dao().saveRecord(statsRecord);
    console.log(`✅ Статистика создана для пользователя: ${user.get("email")}`);
    
  } catch (error) {
    console.log(`⚠️ Ошибка для пользователя ${user.get("email")}: ${error}`);
  }
}

console.log("✅ Инициализация завершена!");
```

### Способ 2: Автоматическая инициализация при входе

Настройки и статистика будут созданы автоматически при первом входе пользователя благодаря функции `initializeUserProfile()` в коде приложения.

```typescript
// Вызывается автоматически в lib/profile.ts
await initializeUserProfile(userId);
```

---

## Проверка настроек

После настройки проверьте:

1. ✅ Коллекция `user_settings` создана
2. ✅ Коллекция `user_stats` создана
3. ✅ Поле `avatar` добавлено в коллекцию `users`
4. ✅ API Rules установлены для обеих коллекций
5. ✅ Индексы созданы для обеих коллекций
6. ✅ Запущена инициализация для существующих пользователей

### Быстрая проверка через Admin UI

1. Откройте коллекцию `user_settings`
2. Должны быть записи для всех пользователей
3. Откройте коллекцию `user_stats`
4. Должны быть записи для всех пользователей

---

## Как работает система профиля

### Автоматическое создание настроек

1. **Новый пользователь регистрируется**
2. **При первом входе** система создает:
   - Запись в `user_settings` с настройками по умолчанию
   - Запись в `user_stats` с нулевыми значениями
3. **Пользователь может настроить** все параметры на странице `/settings`

### Обновление статистики

Статистика обновляется автоматически при:
- Завершении урока → `total_lessons++`, `total_xp += earned`
- Завершении миссии → `total_missions++`
- Разблокировке достижения → `achievements_count++`
- Изменении стрика → `current_streak`, `longest_streak`
- Любой активности → `last_active = now()`

### Пример обновления статистики

```javascript
// После завершения урока
import { updateUserStats } from '@/lib/profile';

await updateUserStats(userId, {
  total_lessons: stats.total_lessons + 1,
  total_xp: stats.total_xp + 50,
  last_active: new Date().toISOString()
});
```

---

## Использование в приложении

### Страницы модуля

```
http://localhost:3000/profile    - Профиль пользователя
http://localhost:3000/settings   - Настройки
http://localhost:3000/stats      - Детальная статистика
```

### Что увидит пользователь

#### 👤 Страница профиля

1. **Верхняя секция:**
   - Аватар с возможностью изменения
   - Имя и username
   - Уровень и прогресс-бар XP
   - Текущая лига

2. **Статистика:**
   - Уроков завершено
   - Миссий выполнено
   - Текущий стрик
   - Самый длинный стрик
   - Активных дней
   - Достижений получено

3. **Календарь активности:**
   - Тепловая карта за 365 дней
   - Статистика активности
   - Самая продуктивная неделя

4. **Мини-дерево навыков:**
   - Прогресс по всем навыкам
   - Рекомендация следующего навыка

#### ⚙️ Страница настроек

5 вкладок:

1. **🔔 Уведомления:**
   - Включить/выключить уведомления
   - Напоминания об уроках (+ время)
   - Напоминания о миссиях

2. **🎨 Внешний вид:**
   - Тема (светлая/темная/авто)
   - Язык интерфейса (ru/en)
   - Звуковые эффекты
   - Анимации

3. **🎯 Цели:**
   - Недельная цель уроков (1-21)

4. **🔒 Приватность:**
   - Видимость профиля
   - Показывать в рейтингах
   - История активности

5. **👤 Аккаунт:**
   - Изменить email
   - Изменить пароль
   - Экспорт данных
   - Удалить аккаунт

#### 📊 Страница статистики

1. **Общая статистика:**
   - Все ключевые метрики
   - Время в приложении

2. **Графики прогресса:**
   - Уроки и миссии по неделям/месяцам
   - Заработанный XP
   - Прогресс по навыкам

3. **Инсайты:**
   - Лучшее время для обучения
   - Паттерны активности
   - Рекомендации

---

## Примеры запросов

### Получить настройки пользователя

```javascript
const settings = await pb.collection('user_settings').getFirstListItem(
  `user="${userId}"`
);

console.log('Тема:', settings.theme);
console.log('Недельная цель:', settings.weekly_goal);
```

### Обновить настройки

```javascript
const updatedSettings = await pb.collection('user_settings').update(
  settingsId,
  {
    theme: 'dark',
    notifications_enabled: false,
    weekly_goal: 14
  }
);
```

### Получить статистику пользователя

```javascript
const stats = await pb.collection('user_stats').getFirstListItem(
  `user="${userId}"`
);

console.log('Уроков:', stats.total_lessons);
console.log('XP:', stats.total_xp);
console.log('Стрик:', stats.current_streak);
```

### Обновить статистику после урока

```javascript
await pb.collection('user_stats').update(statsId, {
  total_lessons: stats.total_lessons + 1,
  total_xp: stats.total_xp + 50,
  last_active: new Date()
});
```

### Пересчитать статистику

```javascript
// Через функцию из приложения
import { refreshUserStats } from '@/lib/profile';

// Пересчитает статистику из исходных данных
const freshStats = await refreshUserStats(userId);
```

---

## Обслуживание

### Когда обновлять статистику

Статистика должна обновляться:
- ✅ После завершения каждого урока
- ✅ После завершения каждой миссии
- ✅ После разблокировки достижения
- ✅ При изменении стрика
- ✅ При любой активности пользователя

### Периодическое обновление

Рекомендуется периодически пересчитывать статистику для точности:

```javascript
// Например, раз в неделю через cron
import { refreshUserStats } from '@/lib/profile';

// Для всех пользователей
const users = await pb.collection('users').getFullList();
for (const user of users) {
  await refreshUserStats(user.id);
}
```

---

## Резервное копирование

Обе коллекции содержат важные пользовательские данные.

### Что нужно делать:

1. ✅ Включить их в регулярные бэкапы PocketBase
2. ✅ Экспортировать данные перед обновлениями
3. ✅ Тестировать процедуры восстановления
4. ✅ Хранить бэкапы в безопасном месте

### Автоматический бэкап PocketBase

```bash
# Создать бэкап
./pocketbase backup

# Бэкапы сохраняются в pb_data/backups/
```

### Экспорт данных пользователя

Пользователи могут экспортировать свои данные через настройки:

```
Settings → Account → Export Data
```

Будет создан JSON файл с полной информацией:
- Профиль
- Настройки
- Статистика
- История уроков
- История миссий
- Достижения
- Активность за 365 дней

---

## Troubleshooting

### Проблема: Настройки не создаются для новых пользователей

**Причина:** Не вызывается функция `initializeUserProfile()`

**Решение:**
```typescript
// Добавьте в процесс регистрации
import { initializeUserProfile } from '@/lib/profile';

// После успешной регистрации
await initializeUserProfile(user.id);
```

### Проблема: Статистика не обновляется

**Причина:** Забыли вызвать `updateUserStats()` после действий

**Решение:**
```typescript
// После завершения урока
import { updateUserStats } from '@/lib/profile';

await updateUserStats(userId, {
  total_lessons: stats.total_lessons + 1,
  total_xp: stats.total_xp + xpEarned
});
```

### Проблема: Ошибка "Record not found" при получении настроек

**Причина:** Настройки не созданы для пользователя

**Решение:**
```typescript
import { createDefaultSettings } from '@/lib/profile';

// Создать настройки по умолчанию
await createDefaultSettings(userId);
```

### Проблема: Аватар не загружается

**Причина:** Неправильные настройки поля в коллекции users

**Решение:**
1. Откройте коллекцию `users`
2. Проверьте поле `avatar`:
   - Тип: File
   - Max files: 1
   - Max size: 2097152 (2MB)
   - Allowed types: image/jpeg, image/png, image/webp
3. Сохраните изменения

### Проблема: Статистика показывает неправильные данные

**Решение:** Пересчитать статистику
```typescript
import { refreshUserStats } from '@/lib/profile';

// Пересчитает все из исходных данных
await refreshUserStats(userId);
```

---

## Опционально: Миграция данных

Если у вас уже есть данные в других полях (например, в коллекции `users`), можно мигрировать их:

```javascript
// В PocketBase Console
const users = $app.dao().findRecordsByExpr("users");

for (const user of users) {
  // Получаем статистику
  const stats = $app.dao().findFirstRecordByFilter(
    "user_stats",
    `user = "${user.id}"`
  );
  
  if (stats) {
    // Мигрируем данные из старых полей
    stats.set("total_xp", user.get("experience_points") || 0);
    stats.set("current_streak", user.get("current_streak") || 0);
    stats.set("total_lessons", user.get("total_lessons_completed") || 0);
    
    $app.dao().saveRecord(stats);
    console.log(`Мигрировано для: ${user.get("email")}`);
  }
}
```

---

## Готово!

Теперь система профиля и настроек работает:
- ✅ 2 новые коллекции (user_settings, user_stats)
- ✅ Полное управление профилем
- ✅ Загрузка аватаров
- ✅ Гибкие настройки
- ✅ Детальная статистика
- ✅ Календарь активности за 365 дней
- ✅ Экспорт данных
- ✅ Безопасное удаление аккаунта

## Следующие шаги

1. Настройте коллекции по инструкции
2. Добавьте поле `avatar` в коллекцию users
3. Запустите инициализацию для существующих пользователей
4. Откройте `/profile` в приложении
5. Настройте свой профиль! 👤

---

**Готово! Модуль 6 настроен и готов к использованию! 🎉**
