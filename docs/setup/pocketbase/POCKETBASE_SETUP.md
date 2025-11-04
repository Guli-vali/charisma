# Настройка PocketBase

## Шаг 1: Установка PocketBase

1. Скачайте PocketBase с [официального сайта](https://pocketbase.io/docs/)
2. Запустите сервер:
   ```bash
   ./pocketbase serve
   ```
   Сервер будет доступен по адресу `http://127.0.0.1:8090`

## Шаг 2: Настройка коллекции users

1. Откройте админ-панель PocketBase: `http://127.0.0.1:8090/_/`
2. Создайте админ аккаунт (если еще не создан)
3. Перейдите в Settings > Collections
4. Откройте коллекцию `users` (встроенная коллекция)

## Шаг 3: Добавление полей в коллекцию users

Добавьте следующие поля в коллекцию `users`:

| Поле | Тип | Настройки |
|------|-----|-----------|
| `name` | Text | Обязательное поле, минимум 2 символа |
| `experience_points` | Number | По умолчанию: 0 |
| `current_streak` | Number | По умолчанию: 0 |
| `total_lessons_completed` | Number | По умолчанию: 0 |
| `current_league` | Select | Варианты: bronze, silver, gold, platinum. По умолчанию: bronze |
| `avatar_url` | URL | Опционально |
| `goals` | JSON | По умолчанию: `{"work": false, "dating": false, "leadership": false}` |

## Шаг 4: Настройка прав доступа

1. В Settings > Collections > users > API rules:
   - Включите "Allow guest access" для **create** (создание записей)
   - Это необходимо для регистрации новых пользователей

## Шаг 5: Настройка аутентификации

1. В Settings > Collections > users > Auth settings:
   - Отключите "Require email verification" (для разработки)
   - Или включите, если нужна проверка email

## Шаг 6: Настройка переменных окружения (опционально)

Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

Если PocketBase запущен на другом адресе, укажите его здесь.

## Готово!

Теперь вы можете:
- Зарегистрировать нового пользователя на `/register`
- Войти на `/login`
- Использовать защищенные роуты `/dashboard`, `/lessons`, `/profile`

## Важные замечания

- В продакшене обязательно включите проверку email
- Настройте CORS в PocketBase для продакшена
- Используйте HTTPS для продакшена
