# 🧹 Очистка daily_streaks (исправление ошибок 400/404)

## 🔧 Проблема решена в коде!

Исправлен поиск по полю `date` в БД:

**До:**
```javascript
date = "2025-11-04"  // ❌ Точное совпадение не работает с date полями
```

**После:**
```javascript
date >= "2025-11-04" && date < "2025-11-05"  // ✅ Диапазон работает!
```

---

## 🗑️ Удалите сломанные данные

### Вариант 1: Через UI (рекомендуется)

1. **Откройте:** http://127.0.0.1:8090/_/
2. **Collections** → **daily_streaks**
3. **Select All** (галочка вверху таблицы)
4. **Delete** (кнопка корзины)
5. **Confirm**

### Вариант 2: Через API Preview

В PocketBase Admin → Collections → daily_streaks → **API Preview**

```javascript
// Удалить все записи
const all = await pb.collection('daily_streaks').getFullList();
for (const record of all) {
  await pb.collection('daily_streaks').delete(record.id);
  console.log('Deleted:', record.id);
}
console.log('✅ All records deleted');
```

---

## ✅ Проверка

После очистки:
1. **Collections** → **daily_streaks** должно быть **0 records**
2. Перезагрузите страницу приложения
3. Выполните реальную миссию

В консоли должны увидеть:
```
📊 Updating mission streak for user [...], xp: 15
📝 Creating new streak record with missions_completed: 1
✅ New mission streak created in DB
```

**БЕЗ ошибок 400/404!** ✅

---

## 🧪 Полный тест после очистки

1. Очистите `daily_streaks`
2. Перезагрузите приложение
3. **Выполните миссию**:
   ```
   ✅ New mission streak created in DB
   missions_completed: 1
   xp_earned_today: 15
   ```

4. **Вернитесь на дашборд**:
   ```
   🔍 getTodayStreak for user [...], date: 2025-11-04
   ✅ Found today streak: { missions_completed: 1, ... }
   ✅ Daily missions generated: [...]
   ```

5. **Проверьте "Дневные задания":**
   - "Выполнить реальную миссию" → **1/1** ✅
   - Кнопка "Получить награду +10 XP" видна

6. **Нажмите "Получить награду"**
7. **Получите +10 XP**
8. **Миссия выполнена!** ✅

---

**Дата исправления:** 4 ноября 2025

