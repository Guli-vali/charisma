# ⚡ Быстрый старт Модуля 5

## 🚨 ВАЖНО: Перед тестированием

Достижения НЕ будут работать, пока вы не выполните эти шаги:

---

## Шаг 1: Создайте коллекции в PocketBase

### Откройте PocketBase Admin UI
```
http://127.0.0.1:8090/_/
```

### Создайте 3 коллекции:

#### 1. Коллекция `achievements`

**Collections → New Collection → Base**

Название: `achievements`

**Поля:**
1. `key` - Text, Required, Max: 100
2. `title` - Text, Required, Max: 200
3. `description` - Text, Required, Max: 500
4. `icon` - Text, Required, Max: 50
5. `category` - Select (Options: `lessons`, `missions`, `streaks`, `social`, `special`), Required
6. `rarity` - Select (Options: `common`, `rare`, `epic`, `legendary`), Required
7. `xp_reward` - Number, Required, Min: 10
8. `unlock_condition` - JSON, Optional
9. `is_hidden` - Bool, Default: false

**API Rules:**
- List/View: `@request.auth.id != ""`
- Create/Update/Delete: (пусто)

#### 2. Коллекция `user_achievements`

**Collections → New Collection → Base**

Название: `user_achievements`

**Поля:**
1. `user` - Relation (users, Single, Required)
2. `achievement` - Relation (achievements, Single, Required)
3. `earned_at` - Date, Required
4. `progress` - Number, Required, Min: 0, Max: 100, Default: 0

**API Rules:**
- List/View: `@request.auth.id != "" && user = @request.auth.id`
- Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- Update/Delete: (пусто)

#### 3. Коллекция `leagues`

**Collections → New Collection → Base**

Название: `leagues`

**Поля:**
1. `name` - Text, Required
2. `level` - Number, Required
3. `min_xp` - Number, Required
4. `max_users` - Number, Required, Default: 50
5. `season_start` - Date, Required
6. `season_end` - Date, Required
7. `rewards` - JSON, Optional

**API Rules:**
- List/View: `@request.auth.id != ""`
- Create/Update/Delete: (пусто)

---

#### 4. Коллекция `daily_streaks` (ВАЖНО!)

**Collections → New Collection → Base**

Название: `daily_streaks`

**Поля:**
1. `user` - Relation (users, Single, Required)
2. `date` - Text, Required, Max: 10 (формат YYYY-MM-DD)
3. `lessons_completed` - Number, Required, Default: 0
4. `missions_completed` - Number, Required, Default: 0

**Индексы:**
- Unique index на `user + date`

**API Rules:**
- List/View: `@request.auth.id != "" && user = @request.auth.id`
- Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- Update: `@request.auth.id != "" && user = @request.auth.id`
- Delete: (пусто)

⚠️ **Без этой коллекции стрики работать НЕ будут!**

---

#### 5. Коллекция `user_progress` (ВАЖНО!)

**Collections → New Collection → Base**

Название: `user_progress`

**Поля:**
1. `user` - Relation (users, Single, Required)
2. `skill_tree_node` - Text, Required, Max: 100
3. `status` - Select (Options: `locked`, `available`, `completed`), Required, Default: locked
4. `progress_percentage` - Number, Required, Default: 0, Min: 0, Max: 100
5. `completed_exercises` - JSON, Optional

**Индексы:**
- Unique index на `user + skill_tree_node`

**API Rules:**
- List/View: `@request.auth.id != "" && user = @request.auth.id`
- Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- Update: `@request.auth.id != "" && user = @request.auth.id`
- Delete: (пусто)

⚠️ **Без этой коллекции новые навыки НЕ будут разблокироваться!**

---

## Шаг 2: Инициализируйте достижения

### Откройте страницу инициализации:
```
http://localhost:3000/admin/init-achievements
```

### Нажмите кнопку "Запустить инициализацию"

✅ Должно появиться: "Все достижения успешно созданы в базе данных!"

### Проверьте:
```
http://127.0.0.1:8090/_/ → Collections → achievements
```
Должно быть **30 записей**

---

## Шаг 3: Создайте лиги (опционально)

Можете пропустить - система работает и без лиг в БД (использует константы).

Но если хотите:
```
Collections → leagues → New record
```

Создайте 5 записей (Бронзовая, Серебряная, Золотая, Платиновая, Алмазная)

См. детали в POCKETBASE_MODULE5_SETUP.md

---

## ✅ Готово! Теперь проверьте:

### Тест 1: Завершите урок

1. Откройте `/lessons`
2. Начните любой урок
3. Завершите его
4. **Должно появиться:** Модальное окно "🎉 Достижение получено!" - "Первые шаги"

### Тест 2: Выполните миссию

1. Откройте `/missions`
2. Нажмите "Отметить выполненным" на миссии
3. Подтвердите выполнение
4. **Должно появиться:** Модальное окно "🎉 Достижение получено!" - "В реальный мир"

### Тест 3: Проверьте страницу достижений

1. Откройте `/achievements`
2. **Должны видеть:**
   - Ваш уровень
   - Вашу лигу
   - Полученные достижения (2 шт: "Первые шаги" + "В реальный мир")
   - Статистику: Миссии: 1, Уроки: 1

### Тест 4: Dashboard

1. Откройте `/dashboard`
2. **Должен быть виджет "Достижения"** с вашими 2 достижениями

---

## 🐛 Если не работает:

### Проблема: "Достижение не получено"

**Проверьте:**
1. Коллекция `achievements` создана? → http://127.0.0.1:8090/_/
2. В коллекции 30 записей?
3. API Rules настроены правильно?
4. В консоли браузера есть ошибки? (F12 → Console)

### Проблема: "Autocancelled error"

**Исправлено в коде** - просто перезагрузите страницу.

### Проблема: "Страница не загружается"

1. Проверьте что PocketBase запущен: `http://127.0.0.1:8090/`
2. Проверьте что вы авторизованы
3. Обновите страницу (Ctrl+R)

---

## 📊 Проверочный чеклист (5 минут)

- [ ] ✅ PocketBase запущен
- [ ] ✅ Коллекция `achievements` создана (30 полей)
- [ ] ✅ Коллекция `user_achievements` создана
- [ ] ✅ Инициализация выполнена (30 достижений)
- [ ] ✅ Завершен урок → получено "Первые шаги"
- [ ] ✅ Выполнена миссия → получено "В реальный мир"
- [ ] ✅ Страница `/achievements` показывает 2 достижения
- [ ] ✅ Dashboard показывает виджет достижений

---

**Всё работает?** 🎉 Переходите к полному чеклисту: [MODULE5_TESTING_CHECKLIST.md](./MODULE5_TESTING_CHECKLIST.md)

**Есть проблемы?** 🔧 См. troubleshooting в [POCKETBASE_MODULE5_SETUP.md](./POCKETBASE_MODULE5_SETUP.md)

