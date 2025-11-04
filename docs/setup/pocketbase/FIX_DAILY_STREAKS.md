# Исправление коллекции daily_streaks

## ❌ Проблема

При прохождении урока возникает ошибка:
```
Failed to create record.
> 209 | record = await pb.client.collection('daily_streaks').create(data, { requestKey });
```

## ✅ Решение

Код был обновлён для корректной работы с форматом даты **YYYY-MM-DD** (Text), как указано в схеме базы данных.

## 📋 Проверка коллекции

Откройте PocketBase Admin UI и убедитесь, что коллекция `daily_streaks` настроена правильно:

### 1. Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `user` | Relation | Collection: users, Single, Required |
| `date` | **Text** | Required, Max: 10 (формат YYYY-MM-DD) |
| `lessons_completed` | Number | Required, Default: 0 |
| `missions_completed` | Number | Required, Default: 0 |

⚠️ **ВАЖНО:** Поле `date` должно быть **Text**, а НЕ Date!

### 2. Индексы

Должны быть созданы следующие индексы:

```sql
-- Уникальный индекс (предотвращает дубли)
CREATE UNIQUE INDEX idx_daily_streaks_user_date ON daily_streaks (user, date)

-- Индекс для быстрого поиска по пользователю
CREATE INDEX idx_daily_streaks_user ON daily_streaks (user)

-- Индекс для поиска по дате
CREATE INDEX idx_daily_streaks_date ON daily_streaks (date)
```

### 3. API Rules

```javascript
// List/Search
@request.auth.id != "" && user = @request.auth.id

// View
@request.auth.id != "" && user = @request.auth.id

// Create
@request.auth.id != "" && @request.data.user = @request.auth.id

// Update
@request.auth.id != "" && user = @request.auth.id

// Delete
(оставьте пустым)
```

## 🔧 Если коллекция не существует

Создайте коллекцию вручную:

1. Откройте PocketBase Admin: `http://127.0.0.1:8090/_/`
2. Collections > New Collection
3. Name: `daily_streaks`
4. Type: Base
5. Добавьте 4 поля (см. таблицу выше)
6. Создайте индексы (см. SQL выше)
7. Установите API Rules (см. выше)

## 🔧 Если поле date имеет неправильный тип

Если поле `date` было создано как **Date** вместо **Text**:

1. Откройте коллекцию `daily_streaks`
2. Удалите поле `date`
3. Создайте новое поле:
   - Name: `date`
   - Type: **Text**
   - Required: ✓
   - Max: 10
   - Pattern (optional): `^\d{4}-\d{2}-\d{2}$`
4. Пересоздайте unique индекс на (user, date)

## 🧪 Тестирование

После исправления протестируйте:

1. Пройдите любой урок
2. Проверьте, что в коллекции `daily_streaks` появилась запись
3. Запись должна выглядеть так:
   ```json
   {
     "id": "abc123...",
     "user": "user_id...",
     "date": "2024-11-04",
     "lessons_completed": 1,
     "missions_completed": 0,
     "created": "2024-11-04 12:00:00",
     "updated": "2024-11-04 12:00:00"
   }
   ```

## ✅ Что было исправлено в коде

### До:
```typescript
// ❌ Неправильно - передавался полный ISO формат
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);
date: todayDate.toISOString() // "2024-11-04T00:00:00.000Z"
```

### После:
```typescript
// ✅ Правильно - передаётся только дата в формате YYYY-MM-DD
const today = new Date().toISOString().split('T')[0]; // "2024-11-04"
date: today
```

## 📁 Исправленные файлы

- ✅ `src/lib/api.ts` - функция `updateDailyStreak()`
- ✅ `src/lib/lessons.ts` - создание streak записи
- ✅ `src/lib/missions.ts` - создание streak записи

## 🎯 Результат

После исправлений:
- ✅ Уроки проходятся без ошибок
- ✅ Стрики корректно отслеживаются
- ✅ Записи в daily_streaks создаются правильно
- ✅ Нет дубликатов благодаря unique index

---

**Если проблема сохраняется, проверьте консоль браузера для более детальной информации об ошибке.**

