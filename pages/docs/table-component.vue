<template>
  <div class="container mx-auto py-8">
    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="mb-4">
        <NuxtLink to="/docs" class="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Вернуться к документации
        </NuxtLink>
      </div>
      <h1 class="text-2xl font-bold mb-6">Документация: Компонент таблицы KirhTable</h1>
      
      <p class="text-gray-700 mb-6">
        KirhTable - это универсальный компонент для отображения данных в виде таблицы с множеством возможностей.
        Компонент предоставляет функционал для сортировки, фильтрации, пагинации и редактирования данных.
      </p>
      
      <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
        <h2 class="text-lg font-semibold mb-2 text-indigo-800">Основные возможности:</h2>
        <ul class="list-disc list-inside text-gray-700">
          <li>Загрузка данных с сервера (REST API)</li>
          <li>Пагинация и сортировка данных</li>
          <li>Фильтрация данных по различным критериям</li>
          <li>Настраиваемые столбцы и ячейки</li>
          <li>Встроенное редактирование записей через форму</li>
          <li>Экспорт данных в различные форматы</li>
          <li>Адаптивный дизайн под различные устройства</li>
        </ul>
      </div>

      <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
        <h2 class="text-lg font-semibold mb-2 text-indigo-800">Расширенные возможности таблицы:</h2>
        <ul class="list-disc list-inside text-gray-700">
          <li><strong>Управление полями таблицы</strong> - возможность скрывать/показывать определенные поля</li>
          <li><strong>Дополнительные фильтры</strong> - обычные и toggle-фильтры для более точной фильтрации данных</li>
          <li><strong>Кастомная пагинация</strong> - полный контроль над отображением и стилями пагинации</li>
          <li><strong>Фильтрация по ID</strong> - быстрый поиск записи по идентификатору</li>
          <li><strong>Условное форматирование</strong> - изменение стилей ячеек на основе их значений</li>
          <li><strong>Вложенные таблицы</strong> - возможность отображения детальной информации при клике на строку</li>
          <li><strong>Кастомные кнопки действий</strong> - добавление специальных кнопок для выполнения действий в строке</li>
          <li><strong>Режим предпросмотра</strong> - быстрый просмотр данных без перехода к полному редактированию</li>
        </ul>
      </div>

      <div class="flex flex-wrap mb-6">
        <div class="w-full md:w-1/2 mb-4 md:mb-0 md:pr-2">
          <div class="bg-green-50 border-l-4 border-green-500 p-4 h-full">
            <h3 class="text-lg font-semibold mb-2 text-green-800">Документация по разделам:</h3>
            <ul class="list-disc list-inside text-gray-700">
              <li><NuxtLink to="/docs/form-component" class="text-blue-600 hover:underline">Компонент формы для редактирования</NuxtLink></li>
              <li><NuxtLink to="#props" class="text-blue-600 hover:underline">Параметры компонента (Props)</NuxtLink></li>
              <li><NuxtLink to="#events" class="text-blue-600 hover:underline">События (Events)</NuxtLink></li>
              <li><NuxtLink to="#column-config" class="text-blue-600 hover:underline">Конфигурация столбцов</NuxtLink></li>
              <li><NuxtLink to="#examples" class="text-blue-600 hover:underline">Примеры использования</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="w-full md:w-1/2 md:pl-2">
          <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 h-full">
            <h3 class="text-lg font-semibold mb-2 text-yellow-800">Связанные компоненты:</h3>
            <ul class="list-disc list-inside text-gray-700">
              <li><NuxtLink to="/docs/form-component" class="text-blue-600 hover:underline">KirhTableForm - компонент формы</NuxtLink></li>
              <li><NuxtLink to="/docs/auto-suggest" class="text-blue-600 hover:underline">Автоподсказки в полях ввода</NuxtLink></li>
              <li><NuxtLink to="/docs" class="text-blue-600 hover:underline">Другие компоненты</NuxtLink></li>
            </ul>
          </div>
        </div>
      </div>
      
      <h2 id="props" class="text-xl font-bold mb-4 pt-4 border-t">Параметры компонента (Props)</h2>
      
      <div class="bg-gray-50 p-4 rounded-md overflow-x-auto mb-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2 text-left">Параметр</th>
              <th class="p-2 text-left">Тип</th>
              <th class="p-2 text-left">По умолчанию</th>
              <th class="p-2 text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">apiUrl</td>
              <td class="p-2">String</td>
              <td class="p-2">-</td>
              <td class="p-2">URL API для загрузки данных таблицы (обязательный параметр)</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">tableOptions</td>
              <td class="p-2">Object</td>
              <td class="p-2">{}</td>
              <td class="p-2">Объект с настройками таблицы (структура описана ниже)</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">apiParams</td>
              <td class="p-2">Object</td>
              <td class="p-2">{}</td>
              <td class="p-2">Дополнительные параметры для запроса к API</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">showSearch</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">true</td>
              <td class="p-2">Показывать строку поиска</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">showFilters</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">true</td>
              <td class="p-2">Показывать фильтры</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">showPagination</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">true</td>
              <td class="p-2">Показывать пагинацию</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">checkboxes</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Включить выбор строк через чекбоксы</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Структура объекта tableOptions:</h3>
      
      <div class="bg-gray-50 p-4 rounded-md overflow-x-auto mb-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2 text-left">Параметр</th>
              <th class="p-2 text-left">Тип</th>
              <th class="p-2 text-left">По умолчанию</th>
              <th class="p-2 text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">columns</td>
              <td class="p-2">Array</td>
              <td class="p-2">[]</td>
              <td class="p-2">Массив объектов, описывающих столбцы таблицы</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">title</td>
              <td class="p-2">String</td>
              <td class="p-2">'Таблица'</td>
              <td class="p-2">Заголовок таблицы</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">perPage</td>
              <td class="p-2">Number</td>
              <td class="p-2">10</td>
              <td class="p-2">Количество строк на странице</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">isEditable</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Включить редактирование строк</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">isDeletable</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Включить удаление строк</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">isAddable</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Включить добавление новых записей</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">formOptions</td>
              <td class="p-2">Object</td>
              <td class="p-2">{}</td>
              <td class="p-2">Настройки для формы редактирования (см. <NuxtLink to="/docs/form-component" class="text-blue-600 hover:underline">документацию по KirhTableForm</NuxtLink>)</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">allowExport</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Включить возможность экспорта данных</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">exportFormats</td>
              <td class="p-2">Array</td>
              <td class="p-2">['csv', 'excel']</td>
              <td class="p-2">Доступные форматы экспорта</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">defaultSortField</td>
              <td class="p-2">String</td>
              <td class="p-2">null</td>
              <td class="p-2">Поле для сортировки по умолчанию</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">defaultSortDirection</td>
              <td class="p-2">String</td>
              <td class="p-2">'asc'</td>
              <td class="p-2">Направление сортировки по умолчанию ('asc' или 'desc')</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h2 id="events" class="text-xl font-bold mb-4 pt-4 border-t">События (Events)</h2>
      
      <div class="bg-gray-50 p-4 rounded-md overflow-x-auto mb-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2 text-left">Событие</th>
              <th class="p-2 text-left">Параметры</th>
              <th class="p-2 text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">row-clicked</td>
              <td class="p-2">Object (данные строки)</td>
              <td class="p-2">Вызывается при клике на строку</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">row-edited</td>
              <td class="p-2">Object (обновленные данные)</td>
              <td class="p-2">Вызывается после редактирования строки</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">row-deleted</td>
              <td class="p-2">Object (удаленные данные)</td>
              <td class="p-2">Вызывается после удаления строки</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">row-added</td>
              <td class="p-2">Object (новые данные)</td>
              <td class="p-2">Вызывается после добавления новой строки</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">selection-changed</td>
              <td class="p-2">Array (выбранные строки)</td>
              <td class="p-2">Вызывается при изменении выбора строк</td>
            </tr>
            <tr>
              <td class="p-2 font-medium">data-loaded</td>
              <td class="p-2">Object (загруженные данные)</td>
              <td class="p-2">Вызывается после загрузки данных</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h2 id="column-config" class="text-xl font-bold mb-4 pt-4 border-t">Конфигурация столбцов</h2>
      
      <div class="mb-6">
        <p class="text-gray-700 mb-4">
          Каждый столбец таблицы определяется объектом в массиве <code>columns</code>. 
          Ниже приведены параметры для настройки столбцов:
        </p>
        
        <div class="bg-gray-50 p-4 rounded-md overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-200">
                <th class="p-2 text-left">Параметр</th>
                <th class="p-2 text-left">Тип</th>
                <th class="p-2 text-left">Описание</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">name</td>
                <td class="p-2">String</td>
                <td class="p-2">Имя поля в данных (обязательный параметр)</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">label</td>
                <td class="p-2">String</td>
                <td class="p-2">Заголовок столбца (обязательный параметр)</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">width</td>
                <td class="p-2">String</td>
                <td class="p-2">Ширина столбца (например, '150px' или '10%')</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">sortable</td>
                <td class="p-2">Boolean</td>
                <td class="p-2">Включить сортировку по этому столбцу</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">filterable</td>
                <td class="p-2">Boolean</td>
                <td class="p-2">Включить фильтрацию по этому столбцу</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">type</td>
                <td class="p-2">String</td>
                <td class="p-2">Тип данных: 'text', 'number', 'date', 'boolean', 'image', 'link', 'custom'</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">visible</td>
                <td class="p-2">Boolean</td>
                <td class="p-2">Отображать ли столбец</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">formatter</td>
                <td class="p-2">Function</td>
                <td class="p-2">Функция для форматирования значения в ячейке</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">cellClass</td>
                <td class="p-2">String, Function</td>
                <td class="p-2">CSS классы для ячейки</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">headerClass</td>
                <td class="p-2">String</td>
                <td class="p-2">CSS классы для заголовка столбца</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">align</td>
                <td class="p-2">String</td>
                <td class="p-2">Выравнивание текста: 'left', 'center', 'right'</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">template</td>
                <td class="p-2">String</td>
                <td class="p-2">Шаблон для отображения значения (для типа 'custom')</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <h2 id="examples" class="text-xl font-bold mb-4 pt-4 border-t">Примеры использования</h2>
      
      <h3 class="text-lg font-semibold mb-2">Базовый пример:</h3>
      
      <div class="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-6">
        <pre class="text-sm font-mono">
&lt;template&gt;
  &lt;KirhTable
    api-url="/api/users"
    :table-options="tableOptions"
    :api-params="{ status: 'active' }"
    @row-clicked="handleRowClick"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue';
import KirhTable from '@/components/kirh/table/KirhTable.vue';

const tableOptions = ref({
  title: 'Список пользователей',
  perPage: 15,
  isEditable: true,
  isDeletable: true,
  isAddable: true,
  columns: [
    {
      name: 'id',
      label: 'ID',
      width: '70px',
      sortable: true,
      align: 'center'
    },
    {
      name: 'name',
      label: 'Имя',
      sortable: true,
      filterable: true
    },
    {
      name: 'email',
      label: 'Email',
      sortable: true,
      filterable: true
    },
    {
      name: 'created_at',
      label: 'Дата регистрации',
      type: 'date',
      sortable: true,
      formatter: (value) => {
        return new Date(value).toLocaleDateString();
      }
    },
    {
      name: 'is_active',
      label: 'Статус',
      type: 'boolean',
      align: 'center',
      formatter: (value) => {
        return value ? 'Активен' : 'Неактивен';
      },
      cellClass: (value) => {
        return value ? 'bg-green-100' : 'bg-red-100';
      }
    }
  ],
  formOptions: {
    formTitle: 'Редактирование пользователя',
    columns: [
      {
        name: 'name',
        label: 'Имя',
        type: 'text',
        required: true
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        required: true
      },
      {
        name: 'is_active',
        label: 'Активен',
        type: 'toggle'
      }
    ]
  }
});

const handleRowClick = (row) => {
  console.log('Выбрана строка:', row);
};
&lt;/script&gt;</pre>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Структура объекта additionalFilters:</h3>
      
      <div class="bg-gray-50 p-4 rounded-md overflow-x-auto mb-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2 text-left">Параметр</th>
              <th class="p-2 text-left">Тип</th>
              <th class="p-2 text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">field</td>
              <td class="p-2">String</td>
              <td class="p-2">Имя поля в данных для фильтрации</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">label</td>
              <td class="p-2">String</td>
              <td class="p-2">Заголовок фильтра</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">type</td>
              <td class="p-2">String</td>
              <td class="p-2">Тип фильтра: 'select', 'toggle', 'multiselect' и т.д.</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">apiUrl</td>
              <td class="p-2">String</td>
              <td class="p-2">URL API для загрузки опций фильтра (для типа 'select')</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">apiParams</td>
              <td class="p-2">Object</td>
              <td class="p-2">Дополнительные параметры запроса для apiUrl</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">options</td>
              <td class="p-2">Array</td>
              <td class="p-2">Статические опции фильтра</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">activeLabel</td>
              <td class="p-2">String</td>
              <td class="p-2">Текст кнопки toggle-фильтра во включенном состоянии</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">inactiveLabel</td>
              <td class="p-2">String</td>
              <td class="p-2">Текст кнопки toggle-фильтра в выключенном состоянии</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">activeClass</td>
              <td class="p-2">String</td>
              <td class="p-2">CSS класс toggle-фильтра во включенном состоянии</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">initialClass</td>
              <td class="p-2">String</td>
              <td class="p-2">CSS класс toggle-фильтра в выключенном состоянии</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Расширенная настройка действий с записями:</h3>
      
      <div class="bg-gray-50 p-4 rounded-md overflow-x-auto mb-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2 text-left">Параметр</th>
              <th class="p-2 text-left">Тип</th>
              <th class="p-2 text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">rowClickable</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">Позволяет включить клик по строке для действия</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">rowClickAction</td>
              <td class="p-2">String</td>
              <td class="p-2">Действие при клике на строку: 'edit', 'view', 'toggle', 'custom'</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">customActions</td>
              <td class="p-2">Array</td>
              <td class="p-2">Массив пользовательских действий для строки</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">actionButtonClass</td>
              <td class="p-2">String</td>
              <td class="p-2">CSS класс для кнопок действий</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">editButtonLabel</td>
              <td class="p-2">String</td>
              <td class="p-2">Текст кнопки редактирования</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">deleteButtonLabel</td>
              <td class="p-2">String</td>
              <td class="p-2">Текст кнопки удаления</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">confirmDelete</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">Требовать подтверждение удаления</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">confirmDeleteMessage</td>
              <td class="p-2">String</td>
              <td class="p-2">Текст сообщения подтверждения удаления</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Расширенный пример использования с дополнительными фильтрами:</h3>
      
      <div class="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-6">
        <pre class="text-sm font-mono">
&lt;template&gt;
  &lt;KirhTable
    api-url="/api/products"
    :table-options="tableOptions"
    :additional-filters="filters"
    @row-clicked="handleRowClick"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue';
import KirhTable from '@/components/kirh/table/KirhTable.vue';

const filters = ref([
  {
    field: 'category_id',
    label: 'Категория',
    type: 'select',
    apiUrl: '/api/categories',
    placeholder: 'Выберите категорию',
    keyField: 'id',
    labelField: 'name'
  },
  {
    field: 'in_stock',
    label: 'В наличии',
    type: 'toggle',
    activeLabel: 'В наличии',
    inactiveLabel: 'Все товары',
    activeClass: 'bg-green-500 text-white',
    initialClass: 'bg-gray-200 text-gray-700'
  }
]);

const tableOptions = ref({
  title: 'Список товаров',
  perPage: 15,
  isEditable: true,
  isDeletable: true,
  isAddable: true,
  searchable: true,
  enableResetFilters: true,
  resetFiltersLabel: 'Сбросить фильтры',
  showIdFilter: true,
  pagination: true,
  rowClickable: true,
  rowClickAction: 'edit',
  defaultSortField: 'name',
  defaultSortDirection: 'asc',
  customActions: [
    {
      label: 'Просмотр',
      icon: 'eye',
      action: 'view',
      class: 'bg-blue-500 text-white'
    }
  ],
  columns: [
    {
      name: 'id',
      label: 'ID',
      width: '60px',
      sortable: true,
      align: 'center'
    },
    {
      name: 'name',
      label: 'Наименование',
      width: '250px',
      sortable: true,
      filterable: true
    },
    {
      name: 'category',
      label: 'Категория',
      sortable: true,
      filterable: true,
      formatter: (value, row) => row.category?.name || 'Не указана'
    },
    {
      name: 'price',
      label: 'Цена',
      type: 'number',
      align: 'right',
      sortable: true,
      formatter: (value) => `${value.toFixed(2)} ₽`,
      cellClass: (value) => value > 1000 ? 'bg-green-100' : ''
    },
    {
      name: 'in_stock',
      label: 'Наличие',
      type: 'boolean',
      align: 'center',
      formatter: (value) => value ? 'В наличии' : 'Отсутствует',
      cellClass: (value) => value ? 'bg-green-100' : 'bg-red-100',
    }
  ],
  formOptions: {
    formTitle: 'Редактирование товара',
    columns: [
      {
        name: 'name',
        label: 'Наименование',
        type: 'text',
        required: true
      },
      {
        name: 'category_id',
        label: 'Категория',
        type: 'select',
        apiUrl: '/api/categories',
        required: true
      },
      {
        name: 'price',
        label: 'Цена',
        type: 'text',
        required: true
      },
      {
        name: 'in_stock',
        label: 'В наличии',
        type: 'toggle'
      },
      {
        name: 'description',
        label: 'Описание',
        type: 'editor',
        options: {
          rows: 5
        }
      }
    ]
  }
});

const handleRowClick = (row) => {
  console.log('Выбрана строка:', row);
};
&lt;/script&gt;</pre>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Пример использования сортировки по умолчанию:</h3>
      
      <div class="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-6">
        <pre class="text-sm font-mono">
&lt;template&gt;
  &lt;KirhTable
    api-url="/api/users"
    :table-options="tableOptions"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue';
import KirhTable from '@/components/kirh/table/KirhTable.vue';

const tableOptions = ref({
  title: 'Список пользователей',
  columns: [
    {
      name: 'id',
      label: 'ID',
      width: '60px',
      sortable: true
    },
    {
      name: 'full_name',
      label: 'ФИО',
      sortable: true
    },
    {
      name: 'email',
      label: 'Email',
      sortable: true
    },
    {
      name: 'created_at',
      label: 'Дата регистрации',
      sortable: true
    }
  ],
  // Указываем параметры сортировки по умолчанию
  defaultSortField: 'full_name', // При загрузке таблица будет отсортирована по ФИО
  defaultSortDirection: 'asc', // В порядке возрастания (A-Z)
  
  // Остальные настройки
  sortable: true,
  pagination: true,
  pageSize: 20
});
&lt;/script&gt;</pre>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Интеграция с другими компонентами:</h3>
      
      <p class="text-gray-700 mb-4">
        Компонент KirhTable тесно интегрирован с другими компонентами системы:
      </p>
      
      <ul class="list-disc list-inside text-gray-700 mb-6">
        <li>
          <strong>KirhTableForm</strong> - используется для редактирования и добавления записей 
          (см. <NuxtLink to="/docs/form-component" class="text-blue-600 hover:underline">документацию</NuxtLink>)
        </li>
        <li>
          <strong>KirhSelectField</strong> - используется для фильтров типа select и для полей выбора в формах
        </li>
        <li>
          <strong>ToggleFilter</strong> - специальный компонент для быстрого переключения фильтров
        </li>
        <li>
          <strong>RichTextEditor</strong> - интегрирован в форму редактирования для полей типа editor
        </li>
      </ul>
      
      <h3 class="text-lg font-semibold mb-2">Обработка событий и взаимодействие с таблицей:</h3>
      
      <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
        <p class="text-gray-700 mb-2">
          Для полной интеграции таблицы в ваше приложение, рекомендуется обрабатывать следующие события:
        </p>
        
        <ul class="list-disc list-inside text-gray-700">
          <li><code>@row-clicked</code> - срабатывает при клике на строку</li>
          <li><code>@row-edited</code> - срабатывает после успешного редактирования записи</li>
          <li><code>@row-deleted</code> - срабатывает после успешного удаления записи</li>
          <li><code>@row-added</code> - срабатывает после успешного добавления новой записи</li>
          <li><code>@selection-changed</code> - срабатывает при изменении выбранных записей (в режиме с чекбоксами)</li>
          <li><code>@filter-changed</code> - срабатывает при изменении любого фильтра</li>
          <li><code>@data-loaded</code> - срабатывает после загрузки данных с сервера</li>
        </ul>
      </div>
      
      <div class="mt-8 p-4 border-t border-gray-200">
        <div class="flex flex-wrap gap-4">
          <NuxtLink to="/docs/form-component" class="text-blue-600 hover:underline">Документация по компоненту формы</NuxtLink>
          <NuxtLink to="/docs/auto-suggest" class="text-blue-600 hover:underline">Документация по автоподсказкам</NuxtLink>
          <NuxtLink to="/docs" class="text-blue-600 hover:underline">Назад к документации</NuxtLink>
        </div>
      </div>
      
      <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mt-8">
        <h3 class="text-lg font-semibold mb-2 text-blue-800">Дополнительная информация</h3>
        <p class="text-gray-700">
          Эта документация будет постоянно обновляться по мере добавления новых функций или изменения существующих.
          Если у вас есть вопросы или предложения, пожалуйста, обратитесь к разработчикам.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Здесь может быть код для интерактивной документации, если понадобится
</script>

<style scoped>
/* Стили для документации */
code {
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

table {
  border-collapse: collapse;
}

th, td {
  border: 1px solid #e2e8f0;
}
</style> 