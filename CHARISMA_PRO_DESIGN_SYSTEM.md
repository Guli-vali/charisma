# Charisma Pro Design System 🎯

Дизайн-система для приложения Charisma Pro - "Duolingo для социальных навыков и харизмы".

## 🎨 Цветовая палитра

### Основные цвета
- **Primary (Индиго)**: `#6366f1` - для основных элементов UI
- **Accent (Amber)**: `#f59e0b` - для прогресса, достижений, XP
- **Success (Emerald)**: `#10b981` - для правильных ответов, выполненных заданий
- **Error (Red)**: `#ef4444` - для неправильных ответов
- **Background**: `#f8fafc` - основной фон
- **Card**: `#ffffff` - цвет карточек

### Использование цветов в Tailwind
```tsx
// Основные элементы
className="bg-primary text-white"

// Прогресс и достижения
className="bg-accent text-white"

// Успешные действия
className="bg-success text-white"

// Ошибки
className="bg-error text-white"
```

## 📝 Типографика

### Заголовки
```tsx
className="font-bold text-2xl md:text-3xl text-gray-900"
```

### Подзаголовки
```tsx
className="font-semibold text-lg text-gray-700"
```

### Основной текст
```tsx
className="text-base text-gray-600"
```

### Кнопки
```tsx
className="font-medium text-sm"
```

## 🧩 Компоненты

### Button
```tsx
import { Button } from '@/components/ui';

// Варианты
<Button variant="primary">Основная</Button>
<Button variant="accent">Акцентная</Button>
<Button variant="success">Успех</Button>
<Button variant="error">Ошибка</Button>
<Button variant="outline">Контурная</Button>
<Button variant="ghost">Призрачная</Button>

// Размеры
<Button size="sm">Маленькая</Button>
<Button size="md">Средняя</Button>
<Button size="lg">Большая</Button>

// Состояния
<Button isLoading>Загрузка...</Button>
<Button disabled>Отклонена</Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Описание</CardDescription>
  </CardHeader>
  <CardContent>
    Основное содержимое карточки
  </CardContent>
</Card>

// Интерактивная карточка
<Card interactive>
  Содержимое с hover эффектами
</Card>
```

### ProgressBar
```tsx
import { ProgressBar } from '@/components/ui';

<ProgressBar
  value={65}
  max={100}
  variant="primary"
  label="Прогресс"
  size="md"
  showLabel={true}
/>
```

## ✨ Анимации

### CSS классы анимаций
- `animate-fade-in` - плавное появление
- `animate-scale-in` - масштабирование при появлении
- `animate-slide-up` - поднимание снизу вверх

### Hover эффекты
- `hover:scale-105` - небольшое увеличение при hover
- `hover:shadow-xl` - тень при hover
- ` for нажатия`
- `active:scale-95` - уменьшение при нажатии

### Переходы
- `transition-all duration-200` - стандартный переход
- `focus:ring-2 focus:ring-offset-2` - фокусное кольцо

## 🎯 Геймификация

### Система уровней
```typescript
// Функции для работы с уровнями и опытом
import { 
  calculateLevel, 
  calculateProgressToNextLevel, 
  calculateXpToNextLevel 
} from '@/lib/utils';

const level = calculateLevel(250); // Уровень пользователя
const progress = calculateProgressToNextLevel(250); // Прогресс к следующему уровню
const xpNeeded = calculateXpToNextLevel(250); // Опыт до следующего уровня
```

### Форматирование чисел
```typescript
import { formatNumber } from '@/lib/utils';

formatNumber(1500); // "1.5K"
formatNumber(1200000); // "1.2M"
```

## 📱 Адаптивность

### Breakpoints
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+

### Примеры адаптивных классов
```tsx
className="text-2xl md:text-3xl lg:text-4xl"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="flex flex-col md:flex-row"
```

## 🔧 Утилиты

### Утилитарные функции
```typescript
import { cn, clamp } from '@/lib/utils';

// Объединение классов Tailwind
cn("bg-primary", "text-white", isActive && "ring-2")

// Ограничение значения
clamp(value, 0, 100)
```

---

> 💡 **Tip**: Используйте компоненты из `@/components/ui` для соблюдения консистентности дизайна во всем приложении.
