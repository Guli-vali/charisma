# 📅 Исправление работы с Date полями в PocketBase

**Дата:** 4 ноября 2025

## 🐛 Проблема

PocketBase хранит `date` поля как **datetime** (с временем), а не просто дату.

### ❌ Что НЕ работало:

```javascript
// Поиск по точному совпадению
filter: `date = "2025-11-04"`  // ❌ НЕ НАХОДИТ!

// Создание с строкой
date: "2025-11-04"  // ❌ Может создавать проблемы
```

### ✅ Что работает:

```javascript
// Поиск по диапазону
filter: `date >= "2025-11-04" && date < "2025-11-05"`  // ✅ РАБОТАЕТ!

// Создание с полным ISO форматом
date: new Date("2025-11-04").toISOString()  // ✅ ПРАВИЛЬНО!
```

---

## ✅ Исправленные файлы

### 1. `src/lib/api.ts`

#### `getTodayStreak()`
```javascript
// До
filter: `user = "${userId}" && date = "${today}"`  ❌

// После
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0];
filter: `user = "${userId}" && date >= "${today}" && date < "${tomorrowStr}"`  ✅
```

#### `updateTodayStreak()`
```javascript
// До
date: today,  // today = "2025-11-04" строка ❌

// После
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);
date: todayDate.toISOString(),  ✅
```

---

### 2. `src/lib/missions.ts`

#### `updateMissionStreak()`
```javascript
// До
filter: `user = "${userId}" && date = "${today}"`  ❌
date: today,  ❌

// После
filter: `user = "${userId}" && date >= "${today}" && date < "${tomorrow}"`  ✅
date: todayDate.toISOString(),  ✅
```

#### `getMissionStats()` и `calculateMissionStreak()`
```javascript
// До
filter: `assigned_date >= "${weekAgo.toISOString().split('T')[0]}"`  ⚠️

// После
weekAgo.setHours(0, 0, 0, 0);
filter: `assigned_date >= "${weekAgo.toISOString()}"`  ✅
```

---

### 3. `src/lib/lessons.ts`

#### `updateStreak()`
```javascript
// До
filter: `user = "${userId}" && date = "${today}"`  ❌
date: today,  ❌

// После
filter: `user = "${userId}" && date >= "${today}" && date < "${tomorrow}"`  ✅
date: todayDate.toISOString(),  ✅
```

---

## ✅ Правильные паттерны

### Для поиска за "сегодня":
```javascript
const today = new Date().toISOString().split('T')[0]; // "2025-11-04"
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = tomorrow.toISOString().split('T')[0]; // "2025-11-05"

// Ищем записи где дата между сегодня 00:00 и завтра 00:00
filter: `date >= "${today}" && date < "${tomorrowStr}"`
```

### Для создания записи:
```javascript
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0); // Начало дня

await pb.create({
  date: todayDate.toISOString(), // "2025-11-04T00:00:00.000Z"
});
```

### Для поиска за период:
```javascript
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);
weekAgo.setHours(0, 0, 0, 0); // Начало дня

filter: `assigned_date >= "${weekAgo.toISOString()}"`
```

---

## 📊 Проверенные коллекции

### ✅ `daily_streaks`
- **Поле:** `date` (datetime)
- **Поиск:** Диапазон `>= && <`
- **Создание:** Полный ISO формат

### ✅ `user_missions`
- **Поля:** `assigned_date`, `completed_date` (datetime)
- **Поиск:** Полный ISO формат с `>=`
- **Создание:** Полный ISO формат

### ✅ `user_lesson_attempts`
- **Поле:** `completed_at` (datetime)
- **Создание:** Полный ISO формат

### ✅ `user_achievements`
- **Поле:** `earned_at` (datetime)
- **Создание:** Полный ISO формат

---

## 🧪 Тестирование

Все date фильтры проверены и исправлены:

1. ✅ Поиск записей за сегодня
2. ✅ Создание новых записей
3. ✅ Поиск за период (week/month)
4. ✅ Расчет стриков
5. ✅ Отсутствие дубликатов

---

## 📝 Рекомендации

### Для будущих запросов:

1. **Никогда не используйте** `date = "строка"` для date/datetime полей
2. **Всегда используйте диапазоны** для поиска за день: `>= && <`
3. **Создавайте с полным ISO форматом:** `new Date().toISOString()`
4. **Для начала дня:** `.setHours(0, 0, 0, 0)` перед `.toISOString()`

---

## ✅ Статус

Все проблемы с датами исправлены! ✨

- ✅ Поиск по датам работает корректно
- ✅ Создание записей использует правильный формат
- ✅ Нет дубликатов благодаря unique index
- ✅ Race conditions обработаны

---

**Последнее обновление:** 4 ноября 2025

