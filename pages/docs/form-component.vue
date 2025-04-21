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
      <h1 class="text-2xl font-bold mb-6">Документация: Компонент KirhTableForm</h1>
      
      <p class="text-gray-700 mb-6">
        KirhTableForm - это универсальный компонент для создания форм ввода с различными типами полей.
        Компонент поддерживает валидацию, автоматическую отправку данных на сервер и множество других функций.
      </p>
      
      <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
        <h2 class="text-lg font-semibold mb-2 text-indigo-800">Основные возможности:</h2>
        <ul class="list-disc list-inside text-gray-700">
          <li>Различные типы полей: текст, textarea, select, toggle, datetime и др.</li>
          <li>Валидация данных на стороне клиента и сервера</li>
          <li>Поддержка условного отображения полей</li>
          <li>Автоматическая отправка данных на сервер</li>
          <li>Режим редактирования существующих записей</li>
          <li>Подсказки при вводе текста (автоподсказки)</li>
          <li>Автоматическая транслитерация для генерации URL-совместимых строк</li>
          <li>Настраиваемый внешний вид</li>
          <li>Быстрое добавление связанных сущностей с автоматическим отображением имен</li>
          <li>Персистентное хранение данных селектов между сессиями</li>
        </ul>
      </div>

      <div class="flex flex-wrap mb-6">
        <div class="w-full md:w-1/2 mb-4 md:mb-0 md:pr-2">
          <div class="bg-green-50 border-l-4 border-green-500 p-4 h-full">
            <h3 class="text-lg font-semibold mb-2 text-green-800">Документация по разделам:</h3>
            <ul class="list-disc list-inside text-gray-700">
              <li><NuxtLink to="/docs/auto-suggest" class="text-blue-600 hover:underline">Автоподсказки в полях ввода</NuxtLink></li>
              <li><NuxtLink to="#transliteration" class="text-blue-600 hover:underline">Автоматическая транслитерация</NuxtLink></li>
              <li><NuxtLink to="#props" class="text-blue-600 hover:underline">Параметры компонента (Props)</NuxtLink></li>
              <li><NuxtLink to="#events" class="text-blue-600 hover:underline">События (Events)</NuxtLink></li>
              <li><NuxtLink to="#field-types" class="text-blue-600 hover:underline">Типы полей</NuxtLink></li>
              <li><NuxtLink to="#examples" class="text-blue-600 hover:underline">Примеры использования</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="w-full md:w-1/2 md:pl-2">
          <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 h-full">
            <h3 class="text-lg font-semibold mb-2 text-yellow-800">Демонстрации:</h3>
            <ul class="list-disc list-inside text-gray-700">
              <li><NuxtLink to="/auto-suggest-demo" class="text-blue-600 hover:underline">Демонстрация автоподсказок</NuxtLink></li>
              <li><NuxtLink to="#" class="text-blue-600 hover:underline">Базовая форма</NuxtLink></li>
              <li><NuxtLink to="#" class="text-blue-600 hover:underline">Форма с валидацией</NuxtLink></li>
              <li><NuxtLink to="#" class="text-blue-600 hover:underline">Комплексный пример</NuxtLink></li>
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
              <td class="p-2">URL API для отправки данных формы (обязательный параметр)</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">formOptions</td>
              <td class="p-2">Object</td>
              <td class="p-2">{}</td>
              <td class="p-2">Объект с настройками формы (структура описана ниже)</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">showForm</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Показывать ли форму при инициализации</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">editingRow</td>
              <td class="p-2">Object</td>
              <td class="p-2">null</td>
              <td class="p-2">Объект с данными для редактирования</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">defaultFieldValue</td>
              <td class="p-2">Any</td>
              <td class="p-2">null</td>
              <td class="p-2">Значение по умолчанию для поля, указанного в defaultFieldTarget</td>
            </tr>
            <tr>
              <td class="p-2 font-medium">defaultFieldTarget</td>
              <td class="p-2">String</td>
              <td class="p-2">null</td>
              <td class="p-2">Имя поля, для которого применяется defaultFieldValue</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Структура объекта formOptions:</h3>
      
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
              <td class="p-2">Массив объектов, описывающих поля формы</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">formTitle</td>
              <td class="p-2">String</td>
              <td class="p-2">'Форма'</td>
              <td class="p-2">Заголовок формы</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">autoOpen</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Автоматически открывать форму при инициализации</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">keepFormAfterSubmit</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">true</td>
              <td class="p-2">Сохранять ли форму открытой после отправки</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">readonly</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Режим только для чтения для всех полей</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">containerClass</td>
              <td class="p-2">String</td>
              <td class="p-2">''</td>
              <td class="p-2">CSS классы для контейнера формы</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">initialData</td>
              <td class="p-2">Object</td>
              <td class="p-2">null</td>
              <td class="p-2">Начальные данные для формы</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">hideOptions</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Скрыть дополнительные опции</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">hideButtons</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Скрыть все кнопки формы</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">hideSubmitButton</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Скрыть кнопку отправки</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">hideCancelButton</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Скрыть кнопку отмены</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">submitButtonText</td>
              <td class="p-2">String</td>
              <td class="p-2">'Сохранить'</td>
              <td class="p-2">Текст кнопки отправки</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">cancelButtonText</td>
              <td class="p-2">String</td>
              <td class="p-2">'Сбросить'</td>
              <td class="p-2">Текст кнопки отмены</td>
            </tr>
            <tr>
              <td class="p-2 font-medium">toggleButtonText</td>
              <td class="p-2">String</td>
              <td class="p-2">'Показать форму'</td>
              <td class="p-2">Текст кнопки переключения видимости формы</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Опции для текстовых полей:</h3>
      
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
              <td class="p-2 font-medium">transliterateFrom</td>
              <td class="p-2">String</td>
              <td class="p-2">null</td>
              <td class="p-2">Имя другого поля, из которого брать значение и автоматически транслитерировать его в текущее поле</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">readonly</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Поле только для чтения</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">placeholder</td>
              <td class="p-2">String</td>
              <td class="p-2">''</td>
              <td class="p-2">Плейсхолдер для поля ввода</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">cellClass</td>
              <td class="p-2">String</td>
              <td class="p-2">''</td>
              <td class="p-2">CSS классы для контейнера поля</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">inputClass</td>
              <td class="p-2">String</td>
              <td class="p-2">''</td>
              <td class="p-2">CSS классы для элемента ввода</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">hint</td>
              <td class="p-2">String</td>
              <td class="p-2">''</td>
              <td class="p-2">Подсказка для поля (отображается при наведении на иконку подсказки)</td>
            </tr>
            <tr>
              <td class="p-2 font-medium">autoSuggest</td>
              <td class="p-2">Object</td>
              <td class="p-2">null</td>
              <td class="p-2">Настройки для функции автоподсказок (описано в отдельном разделе)</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">pasteFromClipboard</td>
              <td class="p-2">Object</td>
              <td class="p-2">null</td>
              <td class="p-2">Настройки для функции вставки из буфера обмена</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="transliteration" class="text-lg font-semibold mb-4 pt-4 border-t bg-blue-50 p-2 rounded">Автоматическая транслитерация</h3>
      
      <div class="bg-blue-50 p-4 rounded-md mb-6">
        <p class="text-gray-700 mb-4">
          Компонент поддерживает автоматическую транслитерацию текста из одного поля в другое. Это особенно полезно для генерации 
          URL-совместимых строк (слагов) из названий на русском языке.
        </p>
        
        <h4 class="font-semibold mb-2">Как использовать:</h4>
        
        <p class="text-gray-700 mb-4">
          Для использования транслитерации добавьте в опции поля параметр <code>transliterateFrom</code> и укажите имя поля-источника.
        </p>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <pre class="text-xs text-gray-800 overflow-x-auto"><code>{
  name: 'slug',
  label: 'Слаг',
  type: 'text',
  required: true,
  options: {
    readonly: false,
    transliterateFrom: 'title', // Автоматическая транслитерация из поля title
    cellClass: 'bg-gray-100 rounded border px-1 w-64',
    inputClass: '...'
  },
  validation: {
    required: true,
    minLength: 2
  }
}</code></pre>
        </div>
        
        <p class="text-gray-700 mb-2">
          При вводе текста в поле-источник (в данном примере, 'title'), значение автоматически транслитерируется и помещается в текущее поле ('slug').
        </p>
        
        <p class="text-gray-700 mb-4">
          <span class="font-semibold">Пример:</span> При вводе "Спартак Москва" в поле title, в поле slug автоматически появится "spartak-moskva".
        </p>
        
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p class="text-sm text-yellow-800">
            <span class="font-bold">Примечание:</span> Транслитерация работает на событие ввода текста, выбор значения из автоподсказок и при инициализации формы.
          </p>
        </div>
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
              <td class="p-2 font-medium">update:showForm</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">Вызывается при изменении видимости формы</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">refresh</td>
              <td class="p-2">-</td>
              <td class="p-2">Вызывается после успешной отправки формы</td>
            </tr>
            <tr>
              <td class="p-2 font-medium">cancel</td>
              <td class="p-2">-</td>
              <td class="p-2">Вызывается при отмене формы</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h2 id="field-types" class="text-xl font-bold mb-4 pt-4 border-t">Типы полей</h2>
      
      <div class="mb-6">
        <p class="text-gray-700 mb-4">
          Компонент поддерживает различные типы полей, которые определяются в свойстве <code>type</code> 
          каждого элемента массива <code>columns</code>.
        </p>
        
        <div class="bg-gray-50 p-4 rounded-md overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-200">
                <th class="p-2 text-left">Тип</th>
                <th class="p-2 text-left">Описание</th>
                <th class="p-2 text-left">Дополнительные опции</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">text</td>
                <td class="p-2">Текстовое поле</td>
                <td class="p-2">placeholder, readonly, inputClass, <NuxtLink to="/docs/auto-suggest" class="text-blue-600 hover:underline">autoSuggest</NuxtLink>, clickableHint, hint, hintClass, pasteFromClipboard</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">textarea</td>
                <td class="p-2">Многострочное текстовое поле</td>
                <td class="p-2">placeholder, readonly, rows, inputClass, visual_type (для визуализации телефонов, email, ссылок)</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">datetime</td>
                <td class="p-2">Поле выбора даты и времени</td>
                <td class="p-2">placeholder, readonly, inputClass</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">select</td>
                <td class="p-2">Выпадающий список</td>
                <td class="p-2">
                  options, apiUrl, apiParams, readonly, enableSearch, emptyable, 
                  iconField, imageField, keyField, labelField, limit, placeholder, 
                  empty_option, list_item, options_list, sel_class
                </td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">toggle</td>
                <td class="p-2">Переключатель</td>
                <td class="p-2">defaultChecked, readonly, inputClass, toggleLabel, activeClass, inactiveClass</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">editor</td>
                <td class="p-2">Богатый текстовый редактор</td>
                <td class="p-2">
                  placeholder, readonly, uploadUrl, imageMaxWidth, imageQuality, inputClass
                </td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">hasmany</td>
                <td class="p-2">Связанные записи (один ко многим)</td>
                <td class="p-2">
                  parentModel, parentLabelField, modalTitle, hint, defaultValueField, defaultValueTargetField
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <h3 id="hasmany-field" class="text-lg font-semibold mb-4 pt-4 border-t bg-purple-50 p-2 rounded">Поле связи "один ко многим" (hasmany)</h3>
      
      <div class="bg-purple-50 p-4 rounded-md mb-6">
        <p class="text-gray-700 mb-4">
          Компонент поддерживает работу со связанными записями по принципу "один ко многим". Это позволяет 
          отображать и редактировать дочерние записи, связанные с текущей записью.
        </p>
        
        <h4 class="font-semibold mb-2">Функциональность поля hasmany:</h4>
        
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li>Отображает количество связанных записей</li>
          <li>Позволяет открывать модальное окно для работы со связанными записями</li>
          <li>Поддерживает добавление, редактирование и удаление связанных записей</li>
          <li>Автоматически устанавливает значение внешнего ключа при добавлении новых записей</li>
          <li>Поддерживает передачу значений из родительской записи в дочерние</li>
        </ul>
        
        <h4 class="font-semibold mb-2">Основные параметры:</h4>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <div class="overflow-x-auto">
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
                  <td class="p-2 font-medium">parentModel</td>
                  <td class="p-2">String</td>
                  <td class="p-2">Название родительской модели (используется для API запросов)</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="p-2 font-medium">parentLabelField</td>
                  <td class="p-2">String</td>
                  <td class="p-2">Поле родительской записи для отображения в заголовке модального окна</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="p-2 font-medium">modalTitle</td>
                  <td class="p-2">String</td>
                  <td class="p-2">Заголовок модального окна</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="p-2 font-medium">modalTitleAddField</td>
                  <td class="p-2">String</td>
                  <td class="p-2">Поле, значение которого добавляется к заголовку модального окна</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="p-2 font-medium">defaultValueField</td>
                  <td class="p-2">String</td>
                  <td class="p-2">Поле в родительской записи, значение которого передается в дочернюю форму</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="p-2 font-medium">defaultValueTargetField</td>
                  <td class="p-2">String</td>
                  <td class="p-2">Поле в форме дочерней записи, в которое передается значение</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <pre class="text-xs text-gray-800 overflow-x-auto">
<code>{
  name: 'streams_count',
  label: '',
  displayLabel: 'Видеотрансляции',
  title_icon: 'solar:stream-linear',
  type: 'hasmany',
  sortable: false,
  width: '60px',
  options: {
    // Информация о родительской модели
    parentModel: 'events',
    parentLabelField: 'title', // Поле для отображения в заголовке модального окна
    // Заголовок модального окна
    modalTitle: 'Стримы для события: ',
    modalTitleAddField: 'event_name',
    hint: 'ссылки на видеотрансляции',

    defaultValueField: 'date_from',      // Поле в родительской записи
    defaultValueTargetField: 'date',     // Поле в форме дочерней записи
  }
}</code></pre>
        </div>
        
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p class="text-sm text-yellow-800">
            <span class="font-bold">Примечание:</span> Поле hasmany обычно используется в таблице KirhTable для отображения связанных записей.
          </p>
        </div>
      </div>
      
      <h3 id="field-visualization" class="text-lg font-semibold mb-4 pt-4 border-t bg-cyan-50 p-2 rounded">Визуализация данных в полях textarea</h3>
      
      <div class="bg-cyan-50 p-4 rounded-md mb-6">
        <p class="text-gray-700 mb-4">
          Для полей типа <code>textarea</code> доступна функция визуализации специальных типов контента:
          телефонов, email-адресов и веб-ссылок. Это позволяет удобно отображать и использовать такие данные.
        </p>
        
        <h4 class="font-semibold mb-2">Типы визуализации:</h4>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-200">
                <th class="p-2 text-left">Тип</th>
                <th class="p-2 text-left">Значение</th>
                <th class="p-2 text-left">Описание</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">Телефоны</td>
                <td class="p-2"><code>visual_type: 'phone'</code></td>
                <td class="p-2">Распознает и форматирует номера телефонов с возможностью вызова</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">Email</td>
                <td class="p-2"><code>visual_type: 'email'</code></td>
                <td class="p-2">Распознает и форматирует email-адреса с возможностью перехода</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">Ссылки</td>
                <td class="p-2"><code>visual_type: 'site'</code></td>
                <td class="p-2">Распознает и форматирует веб-ссылки с возможностью перехода</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h4 class="font-semibold mb-2">Формат ввода данных:</h4>
        
        <p class="text-gray-700 mb-2">
          Данные вводятся в специальном формате: <code>значение|описание</code>. Каждая запись может быть 
          на новой строке или разделена запятыми.
        </p>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <pre class="text-xs text-gray-800 overflow-x-auto">
<code>// Пример для телефонов:
+79991234567|Основной телефон
+79997654321|Служба поддержки

// Пример для email:
info@example.com|Информация
support@example.com|Техподдержка

// Пример для сайтов:
https://example.com|Основной сайт
https://blog.example.com|Блог компании</code></pre>
        </div>
        
        <h4 class="font-semibold mb-2">Пример использования:</h4>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <pre class="text-xs text-gray-800 overflow-x-auto">
<code>{
  name: 'phones',
  label: '',
  displayLabel: 'Телефоны',
  title_icon: 'mingcute:phone-call-fill',
  type: 'textarea',
  width: '50px',
  uploadEnabled: false,
  sortable: false,
  options: {
    editorEnabled: false,
    hint: 'Телефоны команды',
    visual_type: 'phone',
    instruction: 'Введите номера телефонов в формате: +79991234567|описание. Каждый телефон через запятую или с новой строчки.',
    icon: 'majesticons:phone-retro',
    title: 'Редактирование телефонов',
    readonly: false,
    sel_class: "text-fuchsia-700 hover:text-fuchsia-600",
    placeholder: 'Введите адреса телефонов через запятую по шаблону: +79991234567|описание...',
  }
}</code></pre>
        </div>
      </div>
      
      <h3 id="check-freshness" class="text-lg font-semibold mb-4 pt-4 border-t bg-red-50 p-2 rounded">Проверка свежести данных в полях</h3>
      
      <div class="bg-red-50 p-4 rounded-md mb-6">
        <p class="text-gray-700 mb-4">
          Компонент KirhTable поддерживает проверку свежести данных при редактировании полей. Это позволяет 
          предотвратить ситуации, когда несколько пользователей одновременно редактируют одни и те же данные и 
          перезаписывают изменения друг друга.
        </p>
        
        <h4 class="font-semibold mb-2">Как работает проверка свежести:</h4>
        
        <ol class="list-decimal list-inside text-gray-700 mb-4 ml-2">
          <li class="mb-2">Когда пользователь начинает редактировать поле, система автоматически запрашивает текущее значение этого поля с сервера</li>
          <li class="mb-2">Если значение в локальной таблице отличается от серверного, показывается диалоговое окно с предупреждением</li>
          <li class="mb-2">Пользователь может выбрать один из вариантов:
            <ul class="list-disc list-inside ml-4 mt-1">
              <li>Продолжить свое редактирование (с текущим локальным значением)</li>
              <li>Использовать значение с сервера (и отказаться от локальных изменений)</li>
            </ul>
          </li>
          <li>Проверка выполняется только для полей, у которых явно включена опция <code>checkFreshness</code></li>
        </ol>
        
        <h4 class="font-semibold mb-2">Как включить проверку:</h4>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <pre class="text-xs text-gray-800 overflow-x-auto">
<code>// В настройках колонки таблицы
{
  name: 'important_field',
  label: 'Важное поле',
  type: 'text',
  options: {
    // Включить проверку свежести данных для этого поля
    checkFreshness: true,
    // Другие параметры поля...
  }
}</code></pre>
        </div>
        
        <p class="text-gray-700 mb-4">
          Когда проверка свежести включена для поля, система следит за его актуальностью перед каждым редактированием.
          Если пользователь выбирает продолжить редактирование после показа диалога, это поле временно исключается 
          из проверок до следующего обновления всей таблицы.
        </p>
        
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p class="text-sm text-yellow-800">
            <span class="font-bold">Примечание:</span> Проверка свежести данных требует наличия API-метода 
            <code>/check-field</code> на сервере, который возвращает актуальное значение поля. По умолчанию проверка 
            отключена для всех полей и должна быть явно включена через параметр <code>checkFreshness</code>.
          </p>
        </div>
      </div>
      
      <h3 id="id-filter" class="text-lg font-semibold mb-4 pt-4 border-t bg-orange-50 p-2 rounded">Фильтр по ID</h3>
      
      <div class="bg-orange-50 p-4 rounded-md mb-6">
        <p class="text-gray-700 mb-4">
          Компонент KirhTable теперь поддерживает быструю фильтрацию по идентификатору записи. 
          Это позволяет быстро найти конкретную запись по её ID.
        </p>
        
        <h4 class="font-semibold mb-2">Как включить:</h4>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <pre class="text-xs text-gray-800 overflow-x-auto">
<code>// В настройках таблицы
const tableOptions = ref({
  // ... другие настройки ...
  showIdFilter: true, // Включает фильтр по ID
});</code></pre>
        </div>
        
        <p class="text-gray-700 mb-2">
          При включенной опции <code>showIdFilter</code> в интерфейсе таблицы появляется поле для ввода ID
          и кнопка для применения фильтра.
        </p>
      </div>
      
      <h3 id="quick-add" class="text-lg font-semibold mb-4 pt-4 border-t bg-teal-50 p-2 rounded">Быстрое добавление связанных сущностей</h3>

      <div class="bg-teal-50 p-4 rounded-md mb-6">
        <p class="text-gray-700 mb-4">
          Компонент KirhTableForm теперь поддерживает быстрое добавление связанных сущностей прямо из формы. Это позволяет создавать 
          новые записи в связанных таблицах без необходимости покидать текущую форму.
        </p>
        
        <h4 class="font-semibold mb-2">Функциональность быстрого добавления:</h4>
        
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li>Добавление связанных сущностей через модальное окно</li>
          <li>Автоматическое заполнение соответствующих полей в основной форме</li>
          <li>Корректное отображение имен вместо ID в селектах после добавления</li>
          <li>Персистентное хранение данных между сессиями</li>
        </ul>
        
        <h4 class="font-semibold mb-2">Настройка быстрого добавления:</h4>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <pre class="text-xs text-gray-800 overflow-x-auto">
<code>// В настройках формы
const formOptions = ref({
  // ... другие настройки ...
  quickAdd: [
    {
      label: 'Добавить организацию',  // Текст кнопки
      icon: 'mdi:building',           // Иконка (опционально)
      title: 'Добавление организации', // Заголовок модального окна
      apiUrl: '/api/organizations',    // URL для отправки данных
      fillField: 'organization_id',    // Поле основной формы для заполнения
      valueField: 'id',                // Поле в ответе API с ID
      labelField: 'name',              // Поле в ответе API с названием
      emitRefresh: true,               // Отправлять событие refresh родителю
      instruction: 'Заполните все поля для добавления новой организации',
      fields: [
        {
          name: 'name',
          label: 'Название',
          type: 'text',
          required: true
        },
        {
          name: 'inn',
          label: 'ИНН',
          type: 'text',
          required: true
        },
        // Другие поля формы
      ]
    }
  ]
});</code></pre>
        </div>
        
        <h4 class="font-semibold mb-2">Работа с селектами:</h4>
        
        <p class="text-gray-700 mb-4">
          После добавления новой сущности через быстрое добавление, компонент автоматически:
        </p>
        
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li>Сохраняет объект с данными в глобальное хранилище</li>
          <li>Устанавливает ID в соответствующее поле формы</li>
          <li>Обновляет отображение селекта для показа имени вместо ID</li>
          <li>Сохраняет данные в localStorage для персистентности между сессиями</li>
        </ul>
        
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p class="text-sm text-yellow-800">
            <span class="font-bold">Примечание:</span> Данные селектов автоматически сохраняются в localStorage браузера и восстанавливаются при следующем открытии формы. Это обеспечивает корректное отображение имен вместо ID даже после перезагрузки страницы.
          </p>
        </div>
      </div>
      
      <h3 id="paste-from-clipboard" class="text-lg font-semibold mb-4 pt-4 border-t bg-indigo-50 p-2 rounded">Вставка из буфера обмена</h3>
      
      <div class="bg-indigo-50 p-4 rounded-md mb-6">
        <p class="text-gray-700 mb-4">
          Компонент KirhTableForm теперь поддерживает вставку из буфера обмена для текстовых полей. Это позволяет быстро вставлять
          скопированный текст в поля формы с автоматическим преобразованием при необходимости.
        </p>
        
        <h4 class="font-semibold mb-2">Функциональность вставки из буфера обмена:</h4>
        
        <ul class="list-disc list-inside text-gray-700 mb-4">
          <li>Кнопка для вставки из буфера обмена внутри текстового поля</li>
          <li>Автоматическое преобразование вставляемого текста с помощью функции transform</li>
          <li>Поддержка автоподсказок после вставки текста</li>
          <li>Поддержка транслитерации для зависимых полей после вставки</li>
          <li>Обработка ошибок и отображение уведомлений</li>
        </ul>
        
        <h4 class="font-semibold mb-2">Настройка вставки из буфера обмена:</h4>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <pre class="text-xs text-gray-800 overflow-x-auto">
<code>// В настройках поля
{
  name: 'email',
  label: 'Email адрес',
  type: 'text',
  options: {
    pasteFromClipboard: {
      title: 'Вставить email', // Подсказка при наведении на кнопку
      transform: 'return text.trim().toLowerCase();' // Функция преобразования текста
    }
  }
}</code></pre>
        </div>
        
        <h4 class="font-semibold mb-2">Параметры pasteFromClipboard:</h4>
        
        <div class="bg-white p-4 rounded-md mb-4">
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
                <td class="p-2 font-medium">title</td>
                <td class="p-2">String</td>
                <td class="p-2">'Вставить из буфера обмена'</td>
                <td class="p-2">Текст подсказки при наведении на кнопку</td>
              </tr>
              <tr class="border-b border-gray-200">
                <td class="p-2 font-medium">transform</td>
                <td class="p-2">String</td>
                <td class="p-2">null</td>
                <td class="p-2">Код JavaScript-функции для преобразования текста из буфера. Получает параметр text и должна возвращать преобразованный текст.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h4 class="font-semibold mb-2">Примеры использования transform:</h4>
        
        <div class="bg-white p-4 rounded-md mb-4">
          <pre class="text-xs text-gray-800 overflow-x-auto">
<code>// Очистка телефонного номера (оставляем только цифры)
transform: 'return text.replace(/[^0-9]/g, "");'

// Извлечение email из текста
transform: 'return text.trim().toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$/i)?.[0] || text;'

// Преобразование URL
transform: 'return text.trim().startsWith("http") ? text : "https://" + text;'

// Форматирование текста
transform: 'return text.trim().split("\\n").join(", ");'</code></pre>
        </div>
        
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p class="text-sm text-yellow-800">
            <span class="font-bold">Примечание:</span> Функция вставки из буфера обмена зависит от разрешений браузера. В некоторых браузерах доступ к буферу обмена может быть ограничен в целях безопасности и требовать разрешения пользователя.
          </p>
        </div>
      </div>
      
      <h2 id="examples" class="text-xl font-bold mb-4 pt-4 border-t">Примеры использования</h2>
      
      <h3 class="text-lg font-semibold mb-2">Базовый пример:</h3>
      
      <div class="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-6">
        <pre class="text-sm font-mono">
&lt;template&gt;
  &lt;KirhTableForm
    api-url="/api/users"
    :form-options="formOptions"
    :show-form="true"
    @refresh="handleRefresh"
  /&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue';
import KirhTableForm from '@/components/kirh/table/components/KirhTableForm.vue';

const formOptions = ref({
  autoOpen: true,
  formTitle: 'Форма пользователя',
  columns: [
    {
      name: 'name',
      label: 'Имя',
      type: 'text',
      width: '100%',
      required: true,
      options: {
        placeholder: 'Введите имя'
      }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      width: '100%',
      required: true
    },
    {
      name: 'is_active',
      label: 'Активен',
      type: 'toggle',
      width: '100%',
      options: {
        defaultChecked: true,
        toggleLabel: {
          on: 'Активен',
          off: 'Неактивен'
        }
      }
    }
  ]
});

const handleRefresh = () => {
  console.log('Форма успешно отправлена');
};
&lt;/script&gt;</pre>
      </div>
      
      <h3 class="text-lg font-semibold mb-2">Пример с автоподсказками:</h3>
      
      <div class="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-6">
        <pre class="text-sm font-mono">
// Смотрите подробную документацию по автоподсказкам:
// <NuxtLink to="/docs/auto-suggest" class="text-blue-500 hover:underline">/docs/auto-suggest</NuxtLink></pre>
      </div>
      
      <div class="mt-8 p-4 border-t border-gray-200">
        <div class="flex flex-wrap gap-4">
          <NuxtLink to="/auto-suggest-demo" class="text-blue-600 hover:underline">Перейти к демонстрации автоподсказок</NuxtLink>
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
// SEO-параметры для страницы
useSeoMeta({
  title: 'Документация: Компонент KirhTableForm',
  description: 'Полная документация по компоненту формы KirhTableForm, включая параметры, события, типы полей и примеры использования',
});
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