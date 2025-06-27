# Система разделов меню

Система разделов меню позволяет организовать пункты меню админки в логические группы с возможностью сортировки.

## Структура базы данных

### Таблица `menu_sections`
- `id` - уникальный идентификатор
- `name` - название раздела
- `icon` - иконка раздела (код из iconify)
- `description` - описание раздела
- `sort_order` - порядок сортировки
- `status` - активность раздела
- `created_at`, `updated_at` - временные метки

### Таблица `admin_pages` (обновлена)
- `id` - уникальный идентификатор
- `title` - название страницы
- `slug` - URL страницы
- `icon` - иконка страницы
- `description` - описание страницы
- `menu` - отображать в меню
- `menu_section_id` - связь с разделом меню (новое поле)
- `sort_order` - порядок сортировки (новое поле)
- `created_at`, `updated_at` - временные метки

## Установка

### 1. Выполните миграции
```bash
php artisan migrate
```

### 2. Запустите сидеры
```bash
php artisan db:seed --class=MenuSectionsSeeder
php artisan db:seed --class=AdminPagesSeeder
```

## Использование

### Управление разделами меню

1. Перейдите в раздел **Система → Разделы меню**
2. Создайте новые разделы или отредактируйте существующие
3. Для каждого раздела укажите:
   - Название
   - Иконку (код из [iconify](https://icon-sets.iconify.design/))
   - Описание
   - Порядок сортировки
   - Статус активности

### Управление страницами админки

1. Перейдите в раздел **Система → Страницы АДМ**
2. При создании или редактировании страницы укажите:
   - Название страницы
   - Слаг (URL)
   - Иконку
   - Описание
   - Раздел меню (опционально)
   - Порядок сортировки
   - Отображать в меню

### Структура меню

Меню формируется следующим образом:

1. **Разделы с подменю** - если у страницы указан раздел меню, она появляется в подменю этого раздела
2. **Отдельные пункты** - если у страницы не указан раздел, она отображается как отдельный пункт меню
3. **Сортировка** - внутри разделов и среди отдельных пунктов сортировка происходит по полю `sort_order`

## API Endpoints

### Разделы меню
- `GET /api/menu-sections` - список разделов
- `POST /api/menu-sections` - создание раздела
- `GET /api/menu-sections/{id}` - получение раздела
- `PUT /api/menu-sections/{id}` - обновление раздела
- `DELETE /api/menu-sections/{id}` - удаление раздела
- `GET /api/menu-sections/select` - список для селекта

### Страницы админки
- `GET /api/admin-pages` - список страниц
- `POST /api/admin-pages` - создание страницы
- `GET /api/admin-pages/{id}` - получение страницы
- `PUT /api/admin-pages/{id}` - обновление страницы
- `DELETE /api/admin-pages/{id}` - удаление страницы

### Меню админки
- `GET /api/v1/amenu` - получение структуры меню

## Примеры использования

### Создание раздела меню
```php
use App\Models\MenuSection;

$section = MenuSection::create([
    'name' => 'Мой раздел',
    'icon' => 'fluent:folder-20-filled',
    'description' => 'Описание раздела',
    'sort_order' => 1,
    'status' => true
]);
```

### Создание страницы в разделе
```php
use App\Models\AdminPage;

$page = AdminPage::create([
    'title' => 'Моя страница',
    'slug' => 'my-page',
    'icon' => 'fluent:document-20-filled',
    'description' => 'Описание страницы',
    'menu' => true,
    'menu_section_id' => $section->id,
    'sort_order' => 1
]);
```

### Получение структуры меню
```php
use App\Models\MenuSection;
use App\Models\AdminPage;

// Получаем разделы с их страницами
$sections = MenuSection::active()
    ->ordered()
    ->with(['adminPages' => function ($query) {
        $query->inMenu()->ordered();
    }])
    ->get();

// Получаем страницы без раздела
$pagesWithoutSection = AdminPage::inMenu()
    ->whereNull('menu_section_id')
    ->ordered()
    ->get();
```

## Фильтрация и поиск

### В админке
- Фильтр по статусу раздела
- Фильтр по разделу меню для страниц
- Фильтр по отображению в меню
- Поиск по названию и описанию

### В API
- Параметр `q` для поиска
- Параметр `status` для фильтрации по статусу
- Параметр `menu_section_id` для фильтрации по разделу
- Параметр `menu` для фильтрации по отображению в меню

## Безопасность

- Удаление раздела возможно только если в нем нет страниц
- Все операции с разделами и страницами требуют авторизации
- Валидация данных на стороне сервера

## Расширение функциональности

### Добавление новых полей
1. Создайте миграцию для добавления полей
2. Обновите модели `MenuSection` и `AdminPage`
3. Обновите контроллеры
4. Обновите интерфейсы админки

### Кастомная логика сортировки
Переопределите методы в моделях:
```php
// В MenuSection
public function scopeOrdered($query)
{
    return $query->orderBy('custom_field', 'asc');
}

// В AdminPage
public function scopeOrdered($query)
{
    return $query->orderBy('custom_field', 'asc');
}
```

### Дополнительные фильтры
Добавьте новые scope методы в модели:
```php
public function scopeByCustomField($query, $value)
{
    return $query->where('custom_field', $value);
}
``` 