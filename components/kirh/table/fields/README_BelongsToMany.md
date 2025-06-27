# KirhBelongsToManyField

Компонент для управления отношениями `belongsToMany` в таблице KirhTable.

## Описание

`KirhBelongsToManyField` - это компонент для отображения и управления связями "многие ко многим" в таблице. В отличие от `KirhMorphedByManyField`, который предназначен для полиморфных отношений, этот компонент работает с обычными отношениями `belongsToMany`.

## Особенности

- **Ячейка таблицы**: Отображает количество связанных записей с возможностью наведения для просмотра деталей
- **Модальное окно**: Позволяет управлять связями через красивые чекбоксы
- **Поиск**: Встроенный поиск по связанным элементам
- **Массовые операции**: Кнопки "Выбрать все" и "Снять выбор"
- **Автосохранение**: Изменения сохраняются автоматически при выборе/отмене элементов

## Использование

### В конфигурации таблицы

```javascript
{
  name: 'sports',
  label: '',
  displayLabel: 'Виды спорта',
  title_icon: 'i-mdi:run',
  type: 'belongsToMany',
  width: '50px',
  sortable: false,
  options: {
    relationField: 'sports',           // Название поля отношения
    relationLabel: 'видов спорта',     // Лейбл для отображения
    titleField: 'title',               // Поле для отображения названия
    mainField: 'title',                // Основное поле для заголовка модального окна
    searchEndpoint: '/api/sports',     // API endpoint для поиска
    searchField: 'title',              // Поле для поиска
    valueField: 'id',                  // Поле значения
    searchParam: 'q',                  // Параметр поиска
    minSearchLength: 2,                // Минимальная длина для поиска
    empty_class: 'bg-red-400 hover:bg-red-300 text-gray-50', // CSS класс для пустого состояния
    tooltipField: 'title',             // Поле для отображения в тултипе
  }
}
```

### Пример полной конфигурации

```vue
<template>
  <KirhTable
    :api-url="apiUrl"
    :table-options="tableOptions"
    :form-options="formOptions"
  />
</template>

<script setup>
import { ref } from 'vue';

const api = 'http://localhost:8000';

const tableOptions = ref({
  columns: [
    {
      name: 'id',
      label: 'ID',
      type: 'text',
      width: '60px',
      sortable: true,
      options: {
        readonly: true,
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1',
      }
    },
    {
      name: 'title',
      label: 'Название',
      type: 'text',
      width: '200px',
      sortable: true,
      options: {
        readonly: false,
        cellClass: 'text-xs font-bold bg-gray-100 rounded text-gray-800 border px-1',
      }
    },
    {
      name: 'sports',
      label: '',
      displayLabel: 'Виды спорта',
      title_icon: 'i-mdi:run',
      type: 'belongsToMany',
      width: '50px',
      sortable: false,
      options: {
        relationField: 'sports',
        relationLabel: 'видов спорта',
        titleField: 'title',
        mainField: 'title',
        searchEndpoint: api + '/api/sports',
        searchField: 'title',
        valueField: 'id',
        searchParam: 'q',
        minSearchLength: 2,
        empty_class: 'bg-red-400 hover:bg-red-300 text-gray-50',
        tooltipField: 'title',
      }
    },
  ],
  editable: true,
  editrow: false,
  deleteable: true,
  sortable: true,
  pagination: true,
  pageSize: 10,
});

const formOptions = ref({
  showForm: true,
  columns: [
    {
      name: 'title',
      label: 'Название',
      type: 'text',
      required: true,
      options: {
        readonly: false,
        placeholder: 'название',
      },
      validation: {
        required: true,
        minLength: 2
      }
    },
  ]
});

const apiUrl = ref(api + '/api/items');
</script>
```

## Опции конфигурации

### Основные опции

| Опция | Тип | Описание | По умолчанию |
|-------|-----|----------|--------------|
| `relationField` | String | Название поля отношения в модели | - |
| `relationLabel` | String | Лейбл для отображения в интерфейсе | 'элементов' |
| `titleField` | String | Поле для отображения названия элемента | 'title' |
| `mainField` | String | Основное поле для заголовка модального окна | 'title' |
| `searchEndpoint` | String | API endpoint для поиска связанных элементов | - |
| `searchField` | String | Поле для поиска | 'title' |
| `valueField` | String | Поле значения | 'id' |
| `searchParam` | String | Параметр поиска в API | 'q' |
| `minSearchLength` | Number | Минимальная длина для поиска | 2 |
| `empty_class` | String | CSS класс для пустого состояния | 'bg-red-400 hover:bg-red-300 text-gray-50' |
| `tooltipField` | String | Поле для отображения в тултипе | 'title' |

### Дополнительные опции

| Опция | Тип | Описание | По умолчанию |
|-------|-----|----------|--------------|
| `hint` | String | Подсказка для поля | - |

## API Endpoints

Компонент использует следующие API endpoints:

### 1. Поиск элементов
```
GET /api/{model}?q={search_query}&per_page=1000
```

### 2. Получение текущих связей
```
GET /api/relations/get?model_type={model_type}&model_id={model_id}&relation_name={relation_name}
```

### 3. Сохранение связей
```
POST /api/relations/save
{
  "model_type": "model_type",
  "model_id": "model_id", 
  "relation_name": "relation_name",
  "related_ids": [1, 2, 3]
}
```

## События

Компонент эмитит следующие события:

- `update:modelValue` - при изменении выбранных элементов

## Стилизация

Компонент использует Tailwind CSS классы и поддерживает кастомизацию через опции:

- `empty_class` - для стилизации пустого состояния
- Встроенные классы для чекбоксов и модального окна

## Отличия от KirhMorphedByManyField

| Аспект | KirhBelongsToManyField | KirhMorphedByManyField |
|--------|------------------------|------------------------|
| Тип отношения | belongsToMany | morphedByMany (полиморфное) |
| Интерфейс | Чекбоксы в сетке | Поиск + добавление |
| Массовые операции | "Выбрать все" / "Снять выбор" | Нет |
| Отображение | Сетка с чекбоксами | Список с поиском |
| Использование | Обычные связи | Полиморфные связи |

## Примеры использования

### Спортивные сооружения и виды спорта
```javascript
{
  name: 'sports',
  type: 'belongsToMany',
  options: {
    relationField: 'sports',
    relationLabel: 'видов спорта',
    searchEndpoint: '/api/sports',
    tooltipField: 'title',
  }
}
```

### Команды и игроки
```javascript
{
  name: 'players',
  type: 'belongsToMany',
  options: {
    relationField: 'players',
    relationLabel: 'игроков',
    searchEndpoint: '/api/players',
    tooltipField: 'full_name',
  }
}
```

### Соревнования и участники
```javascript
{
  name: 'participants',
  type: 'belongsToMany',
  options: {
    relationField: 'participants',
    relationLabel: 'участников',
    searchEndpoint: '/api/participants',
    tooltipField: 'name',
  }
}
``` 