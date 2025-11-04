# Обновление схемы daily_streaks для дневных миссий

## ❌ Проблема

Дневные миссии показывают неправильный прогресс:
- "Завершить 1 урок" показывает 2/1 вместо 1/1
- "Заработать 50 XP" не отображает прогресс

## 🔍 Причина

В коллекции `daily_streaks` отсутствуют поля для отслеживания:
- Заработанного XP за день
- Флагов получения наград за миссии

## ✅ Решение

Добавить 4 новых поля в коллекцию `daily_streaks`:

### Новые поля:

| Поле | Тип | Настройки | Описание |
|------|-----|-----------|----------|
| `xp_earned_today` | Number | Default: 0 | Заработанный XP за день |
| `lesson_mission_claimed` | Bool | Default: false | Получена ли награда за урок |
| `real_mission_claimed` | Bool | Default: false | Получена ли награда за миссию |
| `xp_mission_claimed` | Bool | Default: false | Получена ли награда за XP |

## 📝 Инструкция по обновлению

### Способ 1: Через Admin UI (рекомендуется)

1. Откройте PocketBase Admin: `http://127.0.0.1:8090/_/`
2. Перейдите в Collections → `daily_streaks`
3. Добавьте каждое поле:

#### Поле 1: xp_earned_today
- Нажмите **New field**
- Type: **Number**
- Name: `xp_earned_today`
- Required: нет (unchecked)
- Min: 0
- Only integers: ✓
- Default value: 0
- Сохраните

#### Поле 2: lesson_mission_claimed
- Нажмите **New field**
- Type: **Bool**
- Name: `lesson_mission_claimed`
- Required: нет (unchecked)
- Default value: false
- Сохраните

#### Поле 3: real_mission_claimed
- Нажмите **New field**
- Type: **Bool**
- Name: `real_mission_claimed`
- Required: нет (unchecked)
- Default value: false
- Сохраните

#### Поле 4: xp_mission_claimed
- Нажмите **New field**
- Type: **Bool**
- Name: `xp_mission_claimed`
- Required: нет (unchecked)
- Default value: false
- Сохраните

### Способ 2: Через Console (быстрый)

1. Откройте PocketBase Admin
2. Settings → Backups → Console
3. Выполните следующий SQL:

```javascript
// Добавление полей через миграцию
const collection = $app.dao().findCollectionByNameOrId("daily_streaks");

// Добавляем поле xp_earned_today
collection.schema.addField(new SchemaField({
  "system": false,
  "id": "xp_earned_today_field",
  "name": "xp_earned_today",
  "type": "number",
  "required": false,
  "options": {
    "min": 0,
    "max": null,
    "noDecimal": true
  }
}));

// Добавляем флаги для миссий
collection.schema.addField(new SchemaField({
  "system": false,
  "id": "lesson_claimed_field",
  "name": "lesson_mission_claimed",
  "type": "bool",
  "required": false,
  "options": {}
}));

collection.schema.addField(new SchemaField({
  "system": false,
  "id": "real_claimed_field",
  "name": "real_mission_claimed",
  "type": "bool",
  "required": false,
  "options": {}
}));

collection.schema.addField(new SchemaField({
  "system": false,
  "id": "xp_claimed_field",
  "name": "xp_mission_claimed",
  "type": "bool",
  "required": false,
  "options": {}
}));

$app.dao().saveCollection(collection);

console.log("✅ Поля добавлены успешно!");
```

## 🔄 Обновление существующих записей

После добавления полей обновите существующие записи значениями по умолчанию:

```javascript
const streaks = $app.dao().findRecordsByExpr("daily_streaks");

for (const streak of streaks) {
  streak.set("xp_earned_today", 0);
  streak.set("lesson_mission_claimed", false);
  streak.set("real_mission_claimed", false);
  streak.set("xp_mission_claimed", false);
  
  $app.dao().saveRecord(streak);
}

console.log(`✅ Обновлено ${streaks.length} записей`);
```

## ✅ Проверка

После обновления схемы проверьте:

1. В коллекции `daily_streaks` должно быть **8 полей**:
   - user (Relation)
   - date (Text)
   - lessons_completed (Number)
   - missions_completed (Number)
   - xp_earned_today (Number) ✨ новое
   - lesson_mission_claimed (Bool) ✨ новое
   - real_mission_claimed (Bool) ✨ новое
   - xp_mission_claimed (Bool) ✨ новое

2. Пройдите урок и проверьте дашборд:
   - "Завершить 1 урок" должно показывать 1/1 ✅
   - "Заработать 50 XP" должно показывать X/50 ✅

## 🧪 Тестирование

### 1. Завершите урок
- Прогресс "Завершить 1 урок": 1/1 ✅
- Прогресс "Заработать 50 XP": 50/50 (или меньше в зависимости от награды) ✅

### 2. Нажмите "Получить награду"
- Миссия должна отметиться как completed
- XP должен начислиться

### 3. Проверьте запись в БД
Откройте коллекцию `daily_streaks` и посмотрите на сегодняшнюю запись:
```json
{
  "user": "...",
  "date": "2024-11-04",
  "lessons_completed": 1,
  "missions_completed": 0,
  "xp_earned_today": 50,
  "lesson_mission_claimed": true,
  "real_mission_claimed": false,
  "xp_mission_claimed": false
}
```

## 📊 Итоговая схема daily_streaks

```javascript
{
  "name": "daily_streaks",
  "type": "base",
  "schema": [
    {
      "name": "user",
      "type": "relation",
      "required": true,
      "options": {
        "collectionId": "_pb_users_auth_",
        "maxSelect": 1
      }
    },
    {
      "name": "date",
      "type": "text",
      "required": true,
      "options": {
        "max": 10,
        "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
      }
    },
    {
      "name": "lessons_completed",
      "type": "number",
      "required": true,
      "options": {
        "min": 0,
        "noDecimal": true
      }
    },
    {
      "name": "missions_completed",
      "type": "number",
      "required": true,
      "options": {
        "min": 0,
        "noDecimal": true
      }
    },
    {
      "name": "xp_earned_today",
      "type": "number",
      "required": false,
      "options": {
        "min": 0,
        "noDecimal": true
      }
    },
    {
      "name": "lesson_mission_claimed",
      "type": "bool",
      "required": false
    },
    {
      "name": "real_mission_claimed",
      "type": "bool",
      "required": false
    },
    {
      "name": "xp_mission_claimed",
      "type": "bool",
      "required": false
    }
  ],
  "indexes": [
    "CREATE UNIQUE INDEX idx_daily_streaks_user_date ON daily_streaks (user, date)"
  ]
}
```

## 🎯 Результат

После обновления:
- ✅ Прогресс миссий отображается корректно
- ✅ "Завершить 1 урок" показывает 1/1
- ✅ "Заработать 50 XP" показывает актуальный прогресс
- ✅ Награды можно получить только один раз за день
- ✅ Завтра счётчики обнуляются

---

**После обновления схемы перезагрузите страницу дашборда!**

