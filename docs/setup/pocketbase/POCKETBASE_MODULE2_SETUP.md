# Настройка PocketBase - Модуль 2: Dashboard и прогресс

## Коллекция: progress

### Создание коллекции

1. Откройте админ-панель PocketBase: `http://127.0.0.1:8090/_/`
2. Перейдите в Collections > New Collection
3. Название: `progress`
4. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `user` | Relation | Collection: users, Single, Required |
| `skill_tree_node` | Text | Required, Min: 2, Max: 100 |
| `status` | Select | Options: locked, available, completed. Required, Default: locked |
| `progress_percentage` | Number | Min: 0, Max: 100, Default: 0 |
| `completed_exercises` | JSON | Default: [] |

### API Rules для progress

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

## Коллекция: daily_streaks

### Создание коллекции

1. Перейдите в Collections > New Collection
2. Название: `daily_streaks`
3. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `user` | Relation | Collection: users, Single, Required |
| `date` | Text | Required, Pattern: `^\d{4}-\d{2}-\d{2}$` (YYYY-MM-DD) |
| `lessons_completed` | Number | Min: 0, Default: 0 |
| `missions_completed` | Number | Min: 0, Default: 0 |

### Индексы для daily_streaks

Создайте уникальный индекс для предотвращения дубликатов:
- Fields: `user`, `date`
- Unique: Yes

### API Rules для daily_streaks

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

## Тестовые данные (опционально)

### Создание тестового прогресса

Можете создать несколько записей для тестирования через админ-панель:

**Progress для первого скилла:**
```json
{
  "user": "<user_id>",
  "skill_tree_node": "greetings",
  "status": "completed",
  "progress_percentage": 100,
  "completed_exercises": ["ex1", "ex2", "ex3"]
}
```

**Progress для второго скилла:**
```json
{
  "user": "<user_id>",
  "skill_tree_node": "smalltalk",
  "status": "available",
  "progress_percentage": 50,
  "completed_exercises": ["ex1"]
}
```

### Создание streak записи

```json
{
  "user": "<user_id>",
  "date": "2024-01-15",
  "lessons_completed": 2,
  "missions_completed": 1
}
```

---

## Проверка настроек

После настройки проверьте:

1. ✅ Обе коллекции созданы
2. ✅ Все поля настроены правильно
3. ✅ API Rules установлены
4. ✅ Индекс на `daily_streaks` создан
5. ✅ Тестовые данные добавлены (опционально)

---

## Готово!

Теперь вы можете:
- Просматривать дерево навыков на Dashboard
- Отслеживать прогресс по каждому навыку
- Видеть дневные задания
- Отслеживать streak (серию дней)

## Важные замечания

- Streak рассчитывается автоматически на основе записей в `daily_streaks`
- Прогресс навыков обновляется при завершении упражнений
- API автоматически проверяет права доступа