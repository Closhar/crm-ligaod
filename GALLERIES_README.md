# Модуль управления галереями

## Описание
Модуль предоставляет полнофункциональный интерфейс для управления галереями и изображениями с двухпанельным дизайном.

## Функциональность

### Левая панель - Список галерей
- **Просмотр галерей**: Отображение всех галерей из базы данных
- **Добавление галереи**: Создание новой галереи с названием
- **Удаление галереи**: Удаление галереи с подтверждением
- **Выбор галереи**: Клик по галерее для просмотра её изображений

### Правая панель - Управление изображениями
- **Просмотр изображений**: Сетка изображений выбранной галереи
- **Загрузка изображений**: Множественная загрузка изображений
- **Редактирование**: Изменение названий изображений
- **Удаление**: Удаление отдельных изображений

## Обработка изображений

### Автоматическая обработка при загрузке:
- **Принимает файлы любого размера**
- **Максимальная ширина**: 1600px
- **Формат**: JPEG
- **Качество**: 80%

### Поддерживаемые форматы:
- JPEG
- PNG
- GIF
- WebP

## API Endpoints

### Бэкенд API (Laravel)
- `GET /api/v1/galleries` - Получение списка галерей
- `POST /api/v1/galleries` - Создание галереи
- `GET /api/v1/galleries/{id}` - Получение галереи с изображениями
- `DELETE /api/v1/galleries/{id}` - Удаление галереи
- `POST /api/v1/galleries/{id}/upload-image` - Загрузка изображения в галерею
- `PUT /api/v1/galleries/{id}/image` - Обновление изображения (название)
- `POST /api/v1/galleries/{id}/delete-image` - Удаление изображения из галереи

## Структура базы данных

### Таблица `galleries`
```sql
- id (bigint, primary key)
- title (varchar(255))
- image (varchar(255), nullable)
- image_id (bigint, nullable)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

### Таблица `images`
```sql
- id (bigint, primary key)
- title (varchar(255), nullable)
- image (varchar(255), nullable)
- gallery_id (bigint, nullable, index)
- position (double, nullable)
- created_at (timestamp, nullable)
- updated_at (timestamp, nullable)
```

## Особенности реализации

### TypeScript типы
```typescript
interface Gallery {
  id: number;
  title: string;
  image?: string;
  image_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface GalleryImage {
  id: number;
  title: string | null;
  image: string;
  thumbnail: string;
  gallery_image_path: string;
}
```

### Состояния загрузки
- Индикаторы загрузки для всех операций
- Блокировка кнопок во время выполнения
- Обработка ошибок с пользовательскими сообщениями

### UX особенности
- Hover эффекты для изображений
- Модальные окна для редактирования
- Подтверждения для удаления
- Адаптивная сетка изображений
- Пустые состояния с иконками

## Использование

1. Откройте страницу `/galleries`
2. Создайте новую галерею или выберите существующую
3. Загрузите изображения в выбранную галерею
4. Редактируйте названия изображений при необходимости
5. Удаляйте ненужные изображения или галереи

## Требования
- Nuxt 3
- Vue 3
- TypeScript
- Tailwind CSS
- Laravel бэкенд с соответствующими API endpoints

## Конфигурация

API URL настраивается через переменную окружения `API_URL` в `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      API_URL: process.env.API_URL || 'http://localhost:8000'
    }
  }
})
``` 