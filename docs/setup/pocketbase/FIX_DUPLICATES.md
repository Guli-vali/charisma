# 🔧 Исправление дубликатов в daily_streaks

**Проблема:** Создается много записей в `daily_streaks` при выполнении миссии (race condition)

## ✅ Решение

### 1️⃣ Добавьте Unique Index в PocketBase

**Откройте PocketBase Admin:** http://127.0.0.1:8090/_/

1. **Collections** → **daily_streaks** → **Edit Collection**
2. Перейдите на вкладку **"Indexes"**
3. Нажмите **"New Index"**
4. Выберите **Type: Unique**
5. Добавьте поля:
   - `user`
   - `date`
6. Сохраните

**Или через SQL:**
```sql
CREATE UNIQUE INDEX idx_daily_streaks_user_date 
ON daily_streaks (user, date);
```

Это предотвратит создание дублей на уровне БД.

---

### 2️⃣ Удалите существующие дубликаты

**Откройте PocketBase Admin:** http://127.0.0.1:8090/_/

**Collections** → **daily_streaks**

#### Вариант A: Через UI (вручную)
1. Найдите записи с одинаковыми `user` и `date`
2. Оставьте одну с наибольшими значениями
3. Удалите остальные

#### Вариант B: Через API Preview (скрипт)

В PocketBase Admin → Collections → daily_streaks → **API Preview**

Выполните:

```javascript
// Получаем все записи
const allRecords = await pb.collection('daily_streaks').getFullList();

// Группируем по user + date
const grouped = {};
allRecords.forEach(record => {
  const key = `${record.user}_${record.date}`;
  if (!grouped[key]) {
    grouped[key] = [];
  }
  grouped[key].push(record);
});

// Находим дубликаты и оставляем лучший
for (const [key, records] of Object.entries(grouped)) {
  if (records.length > 1) {
    console.log(`Дубликаты для ${key}:`, records.length);
    
    // Находим запись с максимальными значениями
    const best = records.reduce((prev, curr) => {
      const prevScore = (prev.lessons_completed || 0) + 
                        (prev.missions_completed || 0) + 
                        (prev.xp_earned_today || 0);
      const currScore = (curr.lessons_completed || 0) + 
                        (curr.missions_completed || 0) + 
                        (curr.xp_earned_today || 0);
      return currScore > prevScore ? curr : prev;
    });
    
    // Удаляем остальные
    for (const record of records) {
      if (record.id !== best.id) {
        await pb.collection('daily_streaks').delete(record.id);
        console.log(`Удалена запись ${record.id}`);
      }
    }
    
    console.log(`Оставлена запись ${best.id} для ${key}`);
  }
}

console.log('✅ Очистка завершена');
```

---

### 3️⃣ Проверьте что дубликаты удалены

В PocketBase Admin → Collections → daily_streaks:

1. Выберите фильтр по пользователю
2. Убедитесь что для каждого дня есть только одна запись

---

## 🎯 Что было исправлено в коде

### Защита от Race Condition

**До:**
```javascript
// Проверяем есть ли запись
const existing = await getRecord();
if (!existing) {
  await create(); // ❌ Другой запрос может создать запись здесь!
}
```

**После:**
```javascript
// 1. RequestKey отменяет дублирующиеся запросы
const requestKey = `streak_${userId}_${date}`;

// 2. Ловим ошибку дубликата и обновляем
try {
  await create({ requestKey });
} catch (err) {
  if (err.status === 400) {
    // Duplicate - обновляем существующую
    const existing = await getRecord();
    await update(existing.id);
  }
}
```

---

## 🧪 Тестирование

1. **Удалите дубликаты** по инструкции выше
2. **Добавьте unique index**
3. **Перезагрузите приложение**
4. **Выполните реальную миссию**
5. **Проверьте** в PocketBase Admin → daily_streaks
6. **Должна быть** только **ОДНА** запись на сегодня ✅

---

## 📊 Проверка в консоли

При выполнении миссии вы должны видеть:

```
📊 Updating mission streak for user [...], xp: 10
📈 Updating existing streak: missions 0 → 1, xp 0 → 10
✅ Mission streak updated in DB
```

Или при первом создании:
```
📊 Updating mission streak for user [...], xp: 10
📝 Creating new streak record with missions_completed: 1
✅ New mission streak created in DB
```

**НЕ должно быть:** множественных вызовов с созданием новых записей!

---

## ✅ Готово!

После этих шагов:
- ✅ Дубликаты удалены
- ✅ Unique index предотвращает новые дубли
- ✅ Код обрабатывает race conditions
- ✅ Система работает стабильно

---

**Дата:** 4 ноября 2025

