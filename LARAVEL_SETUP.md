# Настройка Laravel бэкенда для галерей

## Установка зависимостей

### 1. Установите Intervention Image для обработки изображений:
```bash
composer require intervention/image
```

### 2. Опубликуйте конфигурацию Intervention Image:
```bash
php artisan vendor:publish --provider="Intervention\Image\ImageServiceProviderLaravelRecent"
```

## Настройка файлов

### 1. Разместите файлы в правильных директориях:

**Контроллер:**
```
app/Http/Controllers/Api/ApiGalleryController.php
```

**Модели:**
```
app/Models/Gallery.php
app/Models/Image.php
```

**Миграции:**
```
database/migrations/YYYY_MM_DD_HHMMSS_create_galleries_table.php
database/migrations/YYYY_MM_DD_HHMMSS_create_images_table.php
```

### 2. Добавьте маршруты в `routes/api.php`:
```php
<?php

use App\Http\Controllers\Api\ApiGalleryController;
use Illuminate\Support\Facades\Route;

// API маршруты для галерей (с префиксом /api/v1)
Route::prefix('api/v1')->group(function () {
    
    // Основные CRUD операции для галерей
    Route::apiResource('galleries', ApiGalleryController::class);
    
    // Дополнительные маршруты для работы с изображениями
    Route::post('/galleries/{id}/upload-image', [ApiGalleryController::class, 'uploadImage']);
    Route::put('/galleries/{id}/image', [ApiGalleryController::class, 'updateImage']);
    Route::post('/galleries/{id}/delete-image', [ApiGalleryController::class, 'deleteImage']);
    
});
```

## Выполнение миграций

### 1. Создайте символическую ссылку для storage:
```bash
php artisan storage:link
```

### 2. Выполните миграции:
```bash
php artisan migrate
```

## Настройка конфигурации

### 1. Проверьте настройки в `config/filesystems.php`:
```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

### 2. Убедитесь, что в `.env` файле правильно настроен APP_URL:
```env
APP_URL=http://localhost:8000
```

## Проверка работоспособности

### 1. Проверьте доступные маршруты:
```bash
php artisan route:list --path=api/v1/galleries
```

### 2. Протестируйте API endpoints:

**Создание галереи:**
```bash
curl -X POST http://localhost:8000/api/v1/galleries \
  -H "Content-Type: application/json" \
  -d '{"title": "Тестовая галерея"}'
```

**Получение списка галерей:**
```bash
curl http://localhost:8000/api/v1/galleries
```

**Получение галереи с изображениями:**
```bash
curl http://localhost:8000/api/v1/galleries/1
```

## Возможные проблемы и решения

### 1. Ошибка "Class 'Intervention\Image\Facades\Image' not found"
**Решение:** Убедитесь, что Intervention Image установлен и опубликован:
```bash
composer require intervention/image
php artisan vendor:publish --provider="Intervention\Image\ImageServiceProviderLaravelRecent"
```

### 2. Ошибка доступа к storage
**Решение:** Проверьте права доступа к папке storage:
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### 3. Ошибка "Method does not exist"
**Решение:** Очистите кэш маршрутов и конфигурации:
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

## Структура папок для изображений

После загрузки изображений они будут сохраняться в:
```
storage/app/public/galleries/{gallery_id}/
├── {filename}.jpg          # Основное изображение (1600px ширина)
└── thmb_{filename}.jpg     # Thumbnail (50px высота)
```

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/v1/galleries` | Получить список галерей |
| POST | `/api/v1/galleries` | Создать галерею |
| GET | `/api/v1/galleries/{id}` | Получить галерею с изображениями |
| PUT | `/api/v1/galleries/{id}` | Обновить галерею |
| DELETE | `/api/v1/galleries/{id}` | Удалить галерею |
| POST | `/api/v1/galleries/{id}/upload-image` | Загрузить изображение |
| PUT | `/api/v1/galleries/{id}/image` | Обновить название изображения |
| POST | `/api/v1/galleries/{id}/delete-image` | Удалить изображение |

## Обработка изображений

Контроллер автоматически:
- Принимает изображения любого размера
- Изменяет размер изображений до 1600px по ширине
- Создает thumbnails размером 50px по высоте
- Сохраняет в формате JPEG с качеством 80%
- Поддерживает форматы: JPEG, PNG, JPG, GIF, WebP 