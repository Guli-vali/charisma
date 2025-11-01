# Настройка PocketBase - Модуль 3: Уроки и упражнения

## Коллекция: lessons

### Создание коллекции

1. Откройте админ-панель PocketBase: `http://127.0.0.1:8090/_/`
2. Перейдите в Collections > New Collection
3. Название: `lessons`
4. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `skill_node` | Text | Required, Min: 2, Max: 100 |
| `lesson_number` | Number | Required, Min: 1 |
| `title` | Text | Required, Min: 3, Max: 200 |
| `description` | Text | Required |
| `xp_reward` | Number | Required, Default: 10 |
| `exercises` | JSON | Required, Default: [] |
| `is_checkpoint` | Bool | Default: false |

### API Rules для lessons

- **List/Search:** `@request.auth.id != ""`
- **View:** `@request.auth.id != ""`
- **Create:** `@request.auth.id = ""` (только админы через админ-панель)
- **Update:** `@request.auth.id = ""` (только админы)
- **Delete:** `@request.auth.id = ""` (только админы)

---

## Коллекция: user_lesson_attempts

### Создание коллекции

1. Перейдите в Collections > New Collection
2. Название: `user_lesson_attempts`
3. Type: Base

### Поля коллекции

| Поле | Тип | Настройки |
|------|-----|-----------|
| `user` | Relation | Collection: users, Single, Required |
| `lesson` | Relation | Collection: lessons, Single, Required |
| `status` | Select | Options: in_progress, completed, failed. Required, Default: in_progress |
| `hearts_left` | Number | Min: 0, Max: 5, Default: 5 |
| `current_exercise` | Number | Min: 0, Default: 0 |
| `score` | Number | Min: 0, Default: 0 |
| `completed_at` | Date | Optional |

### API Rules для user_lesson_attempts

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

## Как добавить урок через админ-панель

### Шаг 1: Откройте коллекцию lessons

1. Перейдите в админ-панель: `http://127.0.0.1:8090/_/`
2. В левом меню выберите **Collections**
3. Найдите и кликните на коллекцию **lessons**

### Шаг 2: Создайте новую запись

1. Нажмите кнопку **New record** (в правом верхнем углу)
2. Откроется форма с полями

### Шаг 3: Заполните поля

#### Основные поля:
- **skill_node**: введите ID навыка, например `greetings`, `smalltalk`, `body_language`
  - Должен совпадать с ID из `skillTreeData.ts`
  
- **lesson_number**: номер урока (1, 2, 3...)
  - Уроки отображаются по порядку

- **title**: название урока
  - Например: "Как правильно здороваться"

- **description**: краткое описание
  - Например: "Основы приветствия в разных ситуациях"

- **xp_reward**: награда за урок
  - Обычно 10-20 XP

- **is_checkpoint**: отметьте галочку, если это финальный урок навыка
  - Обычно `false` для обычных уроков

#### Поле exercises (JSON):

1. Кликните в поле **exercises**
2. Вставьте JSON-массив упражнений (примеры ниже)
3. Убедитесь, что JSON валиден (используйте [jsonlint.com](https://jsonlint.com) для проверки)

### Шаг 4: Сохраните

1. Нажмите кнопку **Create** внизу формы
2. Запись появится в таблице

### Шаг 5: Проверьте в приложении

1. Откройте приложение: `http://localhost:3000`
2. Перейдите в Dashboard
3. Кликните на навык в дереве навыков
4. Или перейдите в `/skills/greetings` (замените на ваш skill_node)

---

## Пример урока (JSON для поля exercises)

Создайте тестовый урок через админ-панель:

### Урок 1: Приветствия

```json
{
  "skill_node": "greetings",
  "lesson_number": 1,
  "title": "Как правильно здороваться",
  "description": "Основы приветствия в разных ситуациях",
  "xp_reward": 15,
  "is_checkpoint": false,
  "exercises": [
    {
      "type": "multiple_choice",
      "question": "Лучший способ поздороваться с коллегой утром:",
      "options": [
        "Просто кивнуть головой",
        "Доброе утро! Как дела?",
        "Привет",
        "Здравствуйте"
      ],
      "correct_answer": 1,
      "explanation": "Приветствие с вопросом о делах показывает заинтересованность и создает позитивную атмосферу"
    },
    {
      "type": "true_false",
      "statement": "Зрительный контакт при приветствии всегда должен быть очень интенсивным",
      "correct_answer": false,
      "explanation": "Зрительный контакт важен, но слишком интенсивный может вызывать дискомфорт. Достаточно 2-3 секунд"
    },
    {
      "type": "fill_blanks",
      "sentence": "При знакомстве важно сначала {blank1}, затем {blank2}",
      "blanks": {
        "blank1": ["поздороваться", "представиться", "улыбнуться"],
        "blank2": ["задать вопрос", "выслушать", "рассказать о себе"]
      },
      "correct_answers": ["поздороваться", "представиться"]
    },
    {
      "type": "matching",
      "instruction": "Соедините ситуацию с подходящим приветствием",
      "left_items": ["Деловая встреча", "Встреча с другом", "Знакомство с родителями"],
      "right_items": ["Здравствуйте! Рад встрече", "Привет! Как дела?", "Добрый день! Очень приятно"],
      "correct_matches": {
        "0": "0",
        "1": "1",
        "2": "2"
      }
    },
    {
      "type": "sequence",
      "instruction": "Расставьте этапы приветствия в правильном порядке:",
      "items": [
        "Задать вопрос",
        "Установить зрительный контакт",
        "Улыбнуться",
        "Сказать приветствие"
      ],
      "correct_order": [1, 2, 3, 0]
    }
  ]
}
```

### Урок 2: SmallTalk

```json
{
  "skill_node": "smalltalk",
  "lesson_number": 1,
  "title": "Искусство легкого общения",
  "description": "Как начать и поддержать small talk",
  "xp_reward": 20,
  "is_checkpoint": false,
  "exercises": [
    {
      "type": "multiple_choice",
      "question": "Какая тема лучше всего подходит для small talk с незнакомым человеком?",
      "options": [
        "Политика",
        "Погода и актуальные события",
        "Личные проблемы",
        "Религия"
      ],
      "correct_answer": 1,
      "explanation": "Нейтральные темы (погода, новости, события) — безопасный способ начать разговор"
    },
    {
      "type": "true_false",
      "statement": "Small talk — это пустая трата времени",
      "correct_answer": false,
      "explanation": "Small talk помогает установить контакт и создать комфортную атмосферу для дальнейшего общения"
    },
    {
      "type": "sequence",
      "instruction": "Правильная последовательность развития разговора:",
      "items": [
        "Найти общую тему",
        "Начать с нейтральной темы",
        "Задать открытый вопрос",
        "Активно выслушать"
      ],
      "correct_order": [1, 0, 2, 3]
    }
  ]
}
```

---

## Проверка настроек

После настройки проверьте:

1. ✅ Коллекция `lessons` создана со всеми полями
2. ✅ Коллекция `user_lesson_attempts` создана
3. ✅ API Rules установлены правильно
4. ✅ Создано минимум 2 тестовых урока
5. ✅ JSON в поле `exercises` валидный

---

## 📋 Готовые шаблоны уроков для копирования

### Минимальный урок (2 упражнения)

**Поля:**
```
skill_node: greetings
lesson_number: 1
title: Базовое приветствие
description: Учимся правильно здороваться
xp_reward: 10
is_checkpoint: false
```

**exercises:**
```json
[
  {
    "type": "multiple_choice",
    "question": "Какое приветствие наиболее универсально?",
    "options": ["Привет", "Здравствуйте", "Йо"],
    "correct_answer": 1,
    "explanation": "Здравствуйте - универсальное приветствие для любой ситуации"
  },
  {
    "type": "true_false",
    "statement": "Важно улыбаться при приветствии",
    "correct_answer": true,
    "explanation": "Улыбка делает приветствие более теплым и располагающим"
  }
]
```

### Полный урок (5 упражнений всех типов)

Используйте примеры из секции "Урок 1: Приветствия" выше — там все 5 типов упражнений.

---

## 🎯 Советы по созданию контента

### Количество упражнений
- Минимум: 2-3 упражнения
- Оптимально: 4-5 упражнений
- Максимум: 7-8 упражнений (чтобы не утомить)

### Сложность
- Первые 1-2 упражнения — легкие (разминка)
- Средние — основной материал
- Последнее — сложное или обобщающее

### Вознаграждения XP
- Легкий урок (2-3 упражнения): 10 XP
- Средний урок (4-5 упражнений): 15 XP
- Сложный урок (6+ упражнений): 20 XP
- Контрольная точка: 25-30 XP

### Текст упражнений
- ✅ Используйте простой, понятный язык
- ✅ Объяснения должны быть краткими и полезными
- ✅ Варианты ответов не должны быть слишком похожими
- ❌ Избегайте двусмысленности в формулировках

---

## Типы упражнений

### 1. Multiple Choice (Множественный выбор)
```json
{
  "type": "multiple_choice",
  "question": "Ваш вопрос?",
  "options": ["Вариант 1", "Вариант 2", "Вариант 3"],
  "correct_answer": 0,
  "explanation": "Объяснение правильного ответа"
}
```

### 2. Fill Blanks (Заполнение пропусков)
```json
{
  "type": "fill_blanks",
  "sentence": "Текст с {blank1} и {blank2}",
  "blanks": {
    "blank1": ["вариант1", "вариант2"],
    "blank2": ["вариант3", "вариант4"]
  },
  "correct_answers": ["вариант1", "вариант3"]
}
```

### 3. True/False (Правда/Ложь)
```json
{
  "type": "true_false",
  "statement": "Утверждение для проверки",
  "correct_answer": true,
  "explanation": "Объяснение"
}
```

### 4. Matching (Сопоставление)
```json
{
  "type": "matching",
  "instruction": "Соедините пары",
  "left_items": ["Элемент 1", "Элемент 2"],
  "right_items": ["Пара 1", "Пара 2"],
  "correct_matches": {"0": "0", "1": "1"}
}
```

### 5. Sequence (Последовательность)
```json
{
  "type": "sequence",
  "instruction": "Расставьте по порядку",
  "items": ["Шаг А", "Шаг Б", "Шаг В"],
  "correct_order": [1, 0, 2]
}
```

---

---

## Быстрый старт: Создание первого урока

### Через JSON-редактор (рекомендуется)

1. Откройте админ-панель: `http://127.0.0.1:8090/_/`
2. Collections → **lessons** → **New record**
3. Заполните поля:

```
skill_node: greetings
lesson_number: 1
title: Как правильно здороваться
description: Основы приветствия в разных ситуациях
xp_reward: 15
is_checkpoint: false
```

4. В поле **exercises** вставьте (скопируйте и вставьте целиком):

```json
[
  {
    "type": "multiple_choice",
    "question": "Лучший способ поздороваться с коллегой утром:",
    "options": [
      "Просто кивнуть головой",
      "Доброе утро! Как дела?",
      "Привет",
      "Здравствуйте"
    ],
    "correct_answer": 1,
    "explanation": "Приветствие с вопросом о делах показывает заинтересованность и создает позитивную атмосферу"
  },
  {
    "type": "true_false",
    "statement": "Зрительный контакт при приветствии всегда должен быть очень интенсивным",
    "correct_answer": false,
    "explanation": "Зрительный контакт важен, но слишком интенсивный может вызывать дискомфорт. Достаточно 2-3 секунд"
  }
]
```

5. Нажмите **Create**

### Проверка

1. Откройте приложение: `http://localhost:3000/skills/greetings`
2. Вы увидите созданный урок
3. Кликните "Начать" и проверьте упражнения

---

## Список доступных skill_node (из skillTreeData.ts)

Используйте эти ID для поля `skill_node`:

- `greetings` — Приветствия (Level 1)
- `smalltalk` — SmallTalk (Level 1)
- `active_listening` — Активное слушание (Level 1)
- `body_language` — Язык тела (Level 2)
- `compliments` — Комплименты (Level 2)
- `stress_management` — Работа со стрессом (Level 2)
- `humor` — Юмор (Level 3)
- `storytelling` — Сторителлинг (Level 3)
- `influence` — Влияние (Level 3)
- `public_speaking` — Публичные выступления (Level 4)
- `negotiations` — Переговоры (Level 4)
- `leadership` — Лидерство (Level 4)

---

## Готово!

Теперь вы можете:
- ✅ Создавать уроки через админ-панель PocketBase
- ✅ Добавлять упражнения разных типов
- ✅ Пользователи могут проходить уроки
- ✅ Система сердец отслеживает ошибки
- ✅ Прогресс автоматически сохраняется
- ✅ XP начисляется при успешном завершении

## Важные замечания

- 📝 Уроки создаются только через админ-панель
- 🎯 Минимум 3 упражнения на урок для хорошего опыта
- 🎨 Чередуйте типы упражнений для разнообразия
- 🏁 `is_checkpoint: true` для финальных уроков навыка
- ⚠️ Проверяйте валидность JSON перед сохранением
- 🔄 После создания урока обновите страницу в браузере
