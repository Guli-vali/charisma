# Настройка PocketBase - Модуль 4: Реальные миссии и трекинг

## Коллекция: missions

### Создание коллекции

1. Откройте админ-панель PocketBase: `http://127.0.0.1:8090/_/`
2. Перейдите в Collections > New Collection
3. Название: `missions`
4. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `type` | Select | Options: daily, weekly, challenge. Required, Default: daily |
| `category` | Select | Options: smalltalk, confidence, networking, leadership. Required |
| `title` | Text | Required, Min: 5, Max: 200 |
| `description` | Text | Required |
| `difficulty` | Select | Options: easy, medium, hard. Required, Default: easy |
| `xp_reward` | Number | Required, Min: 5, Max: 25 |
| `icon` | Text | Required, Max: 10 (emoji) |
| `is_active` | Bool | Default: true |

### API Rules для missions

- **List/Search:** `@request.auth.id != "" && is_active = true`
- **View:** `@request.auth.id != ""`
- **Create:** (оставьте пустым - только админы)
- **Update:** (оставьте пустым - только админы)
- **Delete:** (оставьте пустым - только админы)

⚠️ **Важно:** Не разрешайте обычным пользователям создавать миссии!

---

## Коллекция: user_missions

### Создание коллекции

1. Перейдите в Collections > New Collection
2. Название: `user_missions`
3. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `user` | Relation | Collection: users, Single, Required |
| `mission` | Relation | Collection: missions, Single, Required |
| `status` | Select | Options: assigned, completed, skipped, failed. Required, Default: assigned |
| `assigned_date` | **Date** | **Required** |
| `completed_date` | Date | Optional |
| `proof_text` | Text | Optional, Max: 500 |
| `mood_rating` | Number | Optional, Min: 1, Max: 5 |
| `was_difficult` | Bool | Optional |

### Индексы для user_missions

Создайте уникальный индекс:
- Fields: `user`, `mission`, `assigned_date`
- Unique: Yes (предотвращает дубли)

### API Rules для user_missions

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

## ⚠️ ВАЖНО: Создайте миссии перед использованием

Система выбирает миссии из **уже существующих** записей в коллекции `missions`.
Вам нужно создать минимум 9-12 миссий (по 3 для каждой комбинации категории и сложности).

---

## Тестовые миссии

### Создание тестовых миссий через админ-панель

Collections → **missions** → **New record**

#### Миссия 1: Легкая (SmallTalk)

```
type: daily
category: smalltalk
title: Поздоровайся с 3 незнакомыми людьми
description: Скажи "Здравствуйте" или "Добрый день" трем незнакомцам
difficulty: easy
xp_reward: 5
icon: 👋
is_active: ✓
```

#### Миссия 2: Средняя (Уверенность)

```
type: daily
category: confidence
title: Держи спину ровно весь день
description: Следи за осанкой в течение всего дня
difficulty: easy
xp_reward: 5
icon: 🧍
is_active: ✓
```

#### Миссия 3: Средняя (Networking)

```
type: daily
category: networking
title: Познакомься с кем-то новым
description: Представься человеку, с которым еще не знаком
difficulty: medium
xp_reward: 10
icon: 🤝
is_active: ✓
```

#### Миссия 4: Легкая (Confidence)

```
type: daily
category: confidence
title: Держи спину ровно весь день
description: Следи за осанкой в течение всего дня
difficulty: easy
xp_reward: 5
icon: 🧍
is_active: ✓
```

#### Миссия 5: Средняя (SmallTalk)

```
type: daily
category: smalltalk
title: Начни разговор в лифте
description: Заведи непринужденную беседу с человеком в лифте
difficulty: medium
xp_reward: 10
icon: 🗨️
is_active: ✓
```

#### Миссия 6: Сложная (Confidence)

```
type: daily
category: confidence
title: Выступи первым на встрече
description: Будь первым, кто начнет обсуждение
difficulty: hard
xp_reward: 15
icon: 🎤
is_active: ✓
```

#### Миссия 7: Легкая (Leadership)

```
type: daily
category: leadership
title: Помоги коллеге с задачей
description: Предложи помощь и поддержи кого-то
difficulty: easy
xp_reward: 5
icon: 🤲
is_active: ✓
```

#### Миссия 8: Средняя (Leadership)

```
type: daily
category: leadership
title: Возглавь обсуждение
description: Веди групповое обсуждение или встречу
difficulty: medium
xp_reward: 10
icon: 🎯
is_active: ✓
```

#### Миссия 9: Сложная (Networking)

```
type: daily
category: networking
title: Посети networking событие
description: Сходи на профессиональное мероприятие
difficulty: hard
xp_reward: 15
icon: 🎪
is_active: ✓
```

#### Миссия 10: Сложная (Leadership)

```
type: daily
category: leadership
title: Возглавь проект или инициативу
description: Стань лидером проекта или предложи новую инициативу
difficulty: hard
xp_reward: 15
icon: 👑
is_active: ✓
```

#### Миссия 11: Сложная (SmallTalk)

```
type: daily
category: smalltalk
title: Подойди к интересному человеку в кафе
description: Заведи разговор с незнакомцем, который кажется интересным
difficulty: hard
xp_reward: 15
icon: ☕
is_active: ✓
```

#### Миссия 12: Легкая (Networking)

```
type: daily
category: networking
title: Добавь 2 новых контакта в LinkedIn
description: Найди и добавь двух интересных людей
difficulty: easy
xp_reward: 5
icon: 🔗
is_active: ✓
```

### ✅ Полный набор создан!

Теперь у вас есть миссии для всех комбинаций категорий и сложностей. Система сможет генерировать разнообразные ежедневные задания.

---

## Автоматическая генерация миссий

### Как это работает

1. **Пользователь заходит на страницу миссий** (`/missions`)
2. **Система проверяет** миссии на сегодня
3. **Если миссий нет**, система выбирает 3 случайные миссии из БД:
   - 1 легкая (5 XP)
   - 1 средняя (10 XP)
   - 1 сложная (15 XP)

4. **Категории выбираются** на основе целей пользователя:
   - `work` → confidence, leadership
   - `dating` → smalltalk, confidence
   - `leadership` → leadership, networking

### Важно

- Миссии **выбираются** из уже созданных в БД
- Создайте минимум **9-12 миссий** через админ-панель (примеры выше)
- Миссии используются многократно для разных пользователей
- Каждый день система выбирает случайные миссии из доступных

---

## Проверка настроек

После настройки проверьте:

1. ✅ Коллекция `missions` создана
2. ✅ Коллекция `user_missions` создана
3. ✅ API Rules установлены
4. ✅ Индекс создан
5. ✅ Создано 3-5 тестовых миссий (опционально)

---

## Использование

### Открыть страницу миссий

```
http://localhost:3000/missions
```

### Что произойдет

1. Загрузятся миссии на сегодня
2. Если миссий нет, сгенерируются автоматически
3. Пользователь может:
   - Отметить миссию как выполненную (с фидбеком)
   - Пропустить миссию
   - Посмотреть историю
   - Увидеть свой стрик

---

## Категории миссий

### SmallTalk 💬
Легкие разговоры, приветствия, комплименты

### Confidence 💪
Уверенность, осанка, голос, отстаивание мнения

### Networking 🤝
Знакомства, обмен контактами, события

### Leadership 👑
Инициатива, управление, фидбек, проекты

---

## Сложности миссий

- **Easy (5 XP)** — простые задания, можно выполнить за 5 минут
- **Medium (10 XP)** — требуют усилий, 15-30 минут
- **Hard (15 XP)** — серьезные вызовы, могут занять час+

---

## Готово!

Теперь система реальных миссий работает:
- ✅ Ежедневные персонализированные задания
- ✅ Отслеживание выполнения с фидбеком
- ✅ Стрик миссий
- ✅ История выполнения
- ✅ Автоматическое начисление XP
- ✅ Интеграция с общей системой прогресса

## Следующие шаги

1. Настройте коллекции по инструкции
2. Откройте `/missions` в приложении
3. Выполните свою первую миссию!
4. Следите за стриком и зарабатывайте XP

---

## Опционально: Weekly Challenges

Weekly Challenges сейчас показываются как mock-данные.
Для их реализации создайте коллекцию `weekly_challenges` по аналогии с `missions`.
