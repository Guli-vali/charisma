# 🔧 Исправление Дневных Миссий - Обновление БД

**Дата:** 4 ноября 2025

## 🐛 Проблемы которые были исправлены:

1. ✅ "Завершить 1 урок" - теперь обновляется после каждого урока
2. ✅ "Выполнить реальную миссию" - нельзя получить награду бесконечно
3. ✅ "Заработать 50 XP" - теперь отслеживается и дает награду

## 📊 Обновление схемы БД

### Шаг 1: Обновите коллекцию `daily_streaks`

Добавьте следующие поля в коллекцию `daily_streaks`:

| Поле | Тип | Описание | Значение по умолчанию |
|------|-----|----------|----------------------|
| `xp_earned_today` | Number | Заработанный XP за день | 0 |
| `lesson_mission_claimed` | Bool | Награда за урок получена | false |
| `real_mission_claimed` | Bool | Награда за миссию получена | false |
| `xp_mission_claimed` | Bool | Награда за XP получена | false |

### Шаг 2: Выполните через PocketBase Admin UI

1. Откройте PocketBase Admin UI: http://127.0.0.1:8090/_/
2. Перейдите в **Collections** → **daily_streaks**
3. Нажмите **Edit Collection**
4. Добавьте поля:

#### Поле: `xp_earned_today`
```
Name: xp_earned_today
Type: Number
Required: No
Min: 0
Default: 0
```

#### Поле: `lesson_mission_claimed`
```
Name: lesson_mission_claimed
Type: Bool
Required: No
Default: false
```

#### Поле: `real_mission_claimed`
```
Name: real_mission_claimed
Type: Bool
Required: No
Default: false
```

#### Поле: `xp_mission_claimed`
```
Name: xp_mission_claimed
Type: Bool
Required: No
Default: false
```

5. Нажмите **Save**

### Шаг 3: Очистите старые данные (опционально)

Если у вас есть старые записи в `daily_streaks` без этих полей:

```javascript
// В PocketBase Admin → Collections → daily_streaks → API Preview
// Выполните этот код для обновления всех записей:

const records = await pb.collection('daily_streaks').getFullList();
for (const record of records) {
  await pb.collection('daily_streaks').update(record.id, {
    xp_earned_today: record.xp_earned_today || 0,
    lesson_mission_claimed: record.lesson_mission_claimed || false,
    real_mission_claimed: record.real_mission_claimed || false,
    xp_mission_claimed: record.xp_mission_claimed || false
  });
}
```

## 🎯 Как работает новая система

### 1. Отслеживание прогресса

При завершении урока:
- `lessons_completed` увеличивается на 1
- `xp_earned_today` увеличивается на `lesson.xp_reward` (только при первом прохождении)

При завершении реальной миссии:
- `missions_completed` увеличивается на 1
- `xp_earned_today` увеличивается на `mission.xp_reward`

### 2. Получение наград

Когда пользователь нажимает "Получить награду":
- Проверяется, что цель достигнута (`current >= target`)
- Проверяется, что награда еще не получена (`!*_mission_claimed`)
- Если оба условия выполнены:
  - Устанавливается флаг `*_mission_claimed = true`
  - Начисляется +10 XP (бонус за миссию)
  - Пользователь не может получить награду повторно

### 3. Типы миссий

#### a) Завершить 1 урок
- **Цель:** `lessons_completed >= 1`
- **Флаг:** `lesson_mission_claimed`
- **Обновляется:** Автоматически при завершении урока

#### b) Выполнить реальную миссию
- **Цель:** `missions_completed >= 1`
- **Флаг:** `real_mission_claimed`
- **Кнопка:** "Отметить как выполненное"

#### c) Заработать 50 XP
- **Цель:** `xp_earned_today >= 50`
- **Флаг:** `xp_mission_claimed`
- **Обновляется:** Автоматически при заработке XP

## 🧪 Тестирование

### Тест 1: Миссия "Завершить 1 урок"
1. Откройте дашборд - миссия показывает 0/1
2. Пройдите любой урок до конца
3. Вернитесь на дашборд - должно показать 1/1
4. Нажмите "Получить награду +10 XP"
5. Проверьте что XP увеличился
6. Кнопка должна исчезнуть, миссия отмечена как выполненная

### Тест 2: Миссия "Выполнить реальную миссию"
1. Нажмите "Отметить как выполненное"
2. Получите +10 XP
3. Попробуйте нажать еще раз - кнопка должна быть неактивна

### Тест 3: Миссия "Заработать 50 XP"
1. Пройдите несколько уроков чтобы заработать 50+ XP
2. Вернитесь на дашборд - должно показать 50+/50
3. Нажмите "Получить награду +10 XP"
4. Бонус должен быть начислен только один раз

## 📝 Изменения в коде

### Измененные файлы:
- `src/lib/types.ts` - добавлены поля в `DailyStreak`
- `src/lib/api.ts` - обновлена логика `getDailyMissions` и `completeDailyMission`
- `src/lib/lessons.ts` - добавлено отслеживание XP в `completeLessonAttempt`
- `src/lib/missions.ts` - обновлена `updateMissionStreak` для XP
- `src/components/dashboard/DailyMissions.tsx` - добавлена кнопка для получения награды
- `src/app/dashboard/page.tsx` - обновлена логика `handleCompleteMission`

## ✅ Готово!

После выполнения этих шагов дневные миссии будут работать корректно:
- ✅ Отслеживание прогресса в реальном времени
- ✅ Защита от повторного получения наград
- ✅ Правильный подсчет XP за день
- ✅ Автоматическое обновление при возврате на дашборд

---

**Важно:** После обновления схемы БД, перезапустите приложение и проверьте все три миссии!

