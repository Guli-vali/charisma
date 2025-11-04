# 🗂️ Руководство по управлению состоянием

## Архитектура состояния

Приложение использует **Zustand** для глобального состояния и **React hooks** для локального.

---

## ✅ Zustand Store (Глобальное состояние)

### 📍 Местонахождение: `src/hooks/useAuth.ts`

### 🎯 Что хранится:
```typescript
interface AuthState {
  user: User | null;              // Текущий пользователь
  loading: boolean;               // Загрузка
  initialized: boolean;           // Инициализирован ли store
  
  // Методы:
  login()                         // Вход
  register()                      // Регистрация
  logout()                        // Выход
  initialize()                    // Инициализация при загрузке
  updateUser()                    // Обновление профиля (с API)
  refreshUser()                   // Перезагрузка из PocketBase
  setUser()                       // Прямое обновление (оптимистичное)
}
```

### 📊 User содержит:
- `id`, `email`, `name`
- `experience_points` ⭐️ (XP)
- `current_streak` 🔥 (Стрик)
- `total_lessons_completed` 📚
- `current_league` 🏆 (Лига)
- `goals` 🎯

---

## 🔄 Синхронизация после обновлений

### Правило:
**После ЛЮБОГО обновления профиля пользователя в PocketBase → вызвать `refreshUser()`**

### ✅ Реализовано в:

#### 1. **Завершение урока** (`src/lib/lessons.ts`)
```typescript
await pb.updateProfile(userId, { 
  experience_points: ...,
  total_lessons_completed: ...,
  current_streak: ...
});

// ✅ Синхронизация Zustand
const { useAuth } = await import('@/hooks/useAuth');
await useAuth.getState().refreshUser();
```

#### 2. **Завершение миссии** (`src/lib/missions.ts`)
```typescript
await pb.updateProfile(userId, {
  experience_points: ...
});

// ✅ Синхронизация Zustand
const { useAuth } = await import('@/hooks/useAuth');
await useAuth.getState().refreshUser();
```

#### 3. **Получение достижения** (`src/lib/achievements.ts`)
```typescript
await pb.client.collection('users').update(userId, {
  experience_points: ...
});

// ✅ Синхронизация Zustand
const { useAuth } = await import('@/hooks/useAuth');
await useAuth.getState().refreshUser();
```

---

## 🔍 Локальное состояние (React hooks)

Используется для данных, специфичных для конкретного компонента:

### 1. **useLessonState** (`src/hooks/useLessonState.ts`)
- Состояние текущего урока
- Попытка прохождения
- Упражнения, сердца, score
- **Почему локальное:** данные нужны только на странице урока

### 2. **useUserProgress** (`src/hooks/useUserProgress.ts`)
- Прогресс по навыкам
- **Почему локальное:** загружается при необходимости, не нужно глобально

### 3. **useMissions** (`src/hooks/useMissions.ts`)
- Список доступных миссий
- **Почему локальное:** специфично для страницы миссий

### 4. **useGamification** (`src/hooks/useGamification.ts`)
- Очередь достижений для показа
- Информация о лиге/уровне
- **Почему локальное:** UI состояние для модалок

---

## 📋 Чек-лист для новых функций

При добавлении новой функции, которая обновляет профиль пользователя:

- [ ] Обновляется XP? → Добавить `refreshUser()`
- [ ] Обновляется streak? → Добавить `refreshUser()`
- [ ] Обновляется total_lessons_completed? → Добавить `refreshUser()`
- [ ] Обновляется лига? → Добавить `refreshUser()`

### Пример:
```typescript
// ❌ НЕПРАВИЛЬНО
await pb.updateProfile(userId, { experience_points: newXP });
// Zustand store НЕ обновлен!

// ✅ ПРАВИЛЬНО
await pb.updateProfile(userId, { experience_points: newXP });

const { useAuth } = await import('@/hooks/useAuth');
await useAuth.getState().refreshUser();
```

---

## 🎯 Доступ к Zustand вне React компонентов

### В React компонентах:
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, refreshUser } = useAuth();
  // ...
}
```

### В обычных функциях (lib/):
```typescript
// Динамический импорт
const { useAuth } = await import('@/hooks/useAuth');

// Прямой доступ к store
const currentUser = useAuth.getState().user;
await useAuth.getState().refreshUser();
```

---

## 🚀 Оптимизации

### 1. **Оптимистичные обновления**
Используйте `setUser()` для немедленного обновления UI:

```typescript
// 1. Сразу обновляем UI (оптимистично)
const { user, setUser } = useAuth.getState();
if (user) {
  setUser({
    ...user,
    experience_points: user.experience_points + reward,
  });
}

// 2. Затем сохраняем в PocketBase
await pb.updateProfile(userId, { experience_points: newXP });

// 3. Перезагружаем для точности (опционально)
await refreshUser();
```

### 2. **Debounce для частых обновлений**
Если обновления происходят часто (например, в реальном времени), используйте debounce:

```typescript
import { debounce } from 'lodash';

const debouncedRefresh = debounce(() => {
  useAuth.getState().refreshUser();
}, 1000);
```

---

## 🐛 Troubleshooting

### Проблема: "UI не обновляется после действия"
**Решение:** Проверьте, вызывается ли `refreshUser()` после обновления PocketBase

### Проблема: "Данные обновляются только после перезагрузки страницы"
**Решение:** Это означает, что забыли добавить `refreshUser()` → добавьте!

### Проблема: "Zustand store не обновляется"
**Проверьте:**
1. ✅ `refreshUser()` вызывается?
2. ✅ Нет ошибок в консоли?
3. ✅ PocketBase обновление успешно?

---

## 📊 Диаграмма потока данных

```
[Пользователь завершает урок]
         ↓
[completeLessonAttempt()]
         ↓
[pb.updateProfile()] ← Обновление PocketBase
         ↓
[useAuth.refreshUser()] ← Синхронизация Zustand
         ↓
[Zustand store обновлен]
         ↓
[React компоненты обновляются автоматически]
         ↓
[UI показывает новые XP/streak/level]
```

---

## ✅ Итого

### Что использовать когда:

| Данные | Store | Причина |
|--------|-------|---------|
| User profile (XP, streak, level) | **Zustand** | Нужно глобально |
| Lesson state (current exercise, hearts) | **React state** | Локально для урока |
| Missions list | **React state** | Загружается при необходимости |
| Achievements queue | **React state** | UI состояние для модалок |
| User progress (skills) | **React state** | Специфично для дерева навыков |

---

## 🔧 Обслуживание

При добавлении новых полей в User:
1. Обновите `src/lib/types.ts`
2. Проверьте все места обновления профиля
3. Добавьте `refreshUser()` если нужно

При создании нового действия с XP:
1. Обновите профиль в PocketBase
2. **ОБЯЗАТЕЛЬНО** добавьте `refreshUser()`
3. Проверьте, что UI обновляется

---

**Дата создания:** 2025-11-04  
**Последнее обновление:** 2025-11-04  
**Версия:** 1.0.0

