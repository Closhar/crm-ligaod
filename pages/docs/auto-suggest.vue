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
      <h1 class="text-2xl font-bold mb-6">Документация: Компонент формы с автоподсказками</h1>
      
      <p class="text-gray-700 mb-6">
        Компонент KirhTableForm поддерживает функционал автоподсказок при вводе текста в текстовых полях.
        В этой документации описаны возможности и способы настройки автоподсказок для полей ввода.
      </p>
      
      <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6">
        <h2 class="text-lg font-semibold mb-2 text-indigo-800">Общее описание функционала</h2>
        <p class="text-gray-700">
          Автоподсказки позволяют выводить варианты для выбора при вводе текста в поле ввода. Подсказки могут быть:
        </p>
        <ul class="list-disc list-inside text-gray-700 mt-2">
          <li><strong>Кликабельными</strong> - пользователь может выбрать значение из списка</li>
          <li><strong>Информативными</strong> - просто отображают связанную информацию без возможности выбора</li>
        </ul>
        <p class="text-gray-700 mt-2">
          При выборе значения из автоподсказок можно автоматически заполнять связанные поля формы, например,
          выбор имени пользователя может заполнить поля email, телефон, ID и т.д.
        </p>
      </div>
      
      <h2 class="text-xl font-bold mb-4">Документация по использованию autoSuggest</h2>
      
      <p class="text-gray-700 mb-4">
        Опция <code class="bg-gray-100 px-1 rounded">autoSuggest</code> доступна для текстовых полей (type="text") и позволяет 
        отображать подсказки при вводе текста. Подсказки могут быть как информативными, так и кликабельными.
      </p>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Параметры опции autoSuggest:</h3>
      
      <div class="bg-gray-50 p-4 rounded-md overflow-x-auto">
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
              <td class="p-2">URL API для получения подсказок (обязательный параметр)</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">apiParams</td>
              <td class="p-2">Object</td>
              <td class="p-2">{}</td>
              <td class="p-2">Дополнительные параметры запроса в формате объекта</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">minLength</td>
              <td class="p-2">Number</td>
              <td class="p-2">2</td>
              <td class="p-2">Минимальная длина ввода для активации подсказок</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">debounce</td>
              <td class="p-2">Number</td>
              <td class="p-2">300</td>
              <td class="p-2">Задержка между запросами в миллисекундах</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">labelField</td>
              <td class="p-2">String</td>
              <td class="p-2">'name'</td>
              <td class="p-2">Поле в данных API для отображения в списке подсказок</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">valueField</td>
              <td class="p-2">String</td>
              <td class="p-2">'value'</td>
              <td class="p-2">Поле в данных API для использования в качестве значения</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">clickable</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Можно ли выбрать значение из списка кликом</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">showCount</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Показывать счетчик, если он есть в данных API</td>
            </tr>
            <tr>
              <td class="p-2 font-medium">fillFields</td>
              <td class="p-2">Object</td>
              <td class="p-2">null</td>
              <td class="p-2">Объект для маппинга полей { поле_формы: поле_из_подсказки }</td>
            </tr>
            <tr>
              <td class="p-2 font-medium">forceLocalApi</td>
              <td class="p-2">Boolean</td>
              <td class="p-2">false</td>
              <td class="p-2">Не добавлять префикс API_URL к URL запроса (локальный запрос)</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Пример использования:</h3>
      
      <div class="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
        <pre class="text-sm font-mono">
// Определение колонок формы
columns: [
  {
    name: 'username',
    label: 'Имя пользователя',
    type: 'text',
    width: '50%',
    required: true,
    options: {
      placeholder: 'Введите имя пользователя',
      autoSuggest: {
        apiUrl: '/api/user-suggestions', // URL для локального запроса
        minLength: 3,
        debounce: 300,
        clickable: true,
        labelField: 'name',
        valueField: 'name',
        showCount: true,
        forceLocalApi: true, // Не добавлять префикс API_URL (локальный запрос)
        fillFields: {
          email: 'email',
          user_id: 'id'
        }
      }
    }
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text',
    width: '50%',
    options: {
      autoSuggest: {
        apiUrl: '/api/email-suggestions',
        minLength: 2,
        clickable: false, // Нельзя выбрать - только для информации
        forceLocalApi: true, // Не добавлять префикс API_URL (локальный запрос)
        apiParams: {
          check_duplicates: true
        }
      }
    }
  },
  // другие поля...
]</pre>
      </div>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Формат данных с сервера:</h3>
      
      <p class="text-gray-700 mb-2">
        API должен возвращать массив объектов. Каждый объект должен содержать поля, которые указаны 
        в параметрах <code>labelField</code> и <code>valueField</code>. Дополнительно можно включить поля:
      </p>
      
      <ul class="list-disc list-inside text-gray-700 mb-4">
        <li><code>count</code> - для отображения счетчика (если включен <code>showCount</code>)</li>
        <li><code>message</code> - для отображения дополнительной информации</li>
        <li>Любые другие поля, которые используются в <code>fillFields</code></li>
      </ul>
      
      <div class="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
        <pre class="text-sm font-mono">
// Пример ответа API
[
  {
    "id": 1,
    "name": "Иванов Иван",
    "email": "ivanov@example.com",
    "count": 42,
    "message": "Дополнительная информация"
  },
  {
    "id": 2,
    "name": "Петров Петр",
    "email": "petrov@example.com",
    "count": 28
  }
]</pre>
      </div>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Важные особенности:</h3>
      
      <ul class="list-disc list-inside text-gray-700">
        <li>Если поле <code>clickable: true</code>, то при клике на подсказку значение будет выбрано и вставлено в поле</li>
        <li>Если указан объект <code>fillFields</code>, то при выборе подсказки указанные поля будут автоматически заполнены</li>
        <li>API запрос будет содержать параметры <code>q</code> (текст запроса) и <code>field</code> (имя поля), плюс дополнительные параметры из <code>apiParams</code></li>
        <li>Для оптимизации нагрузки на сервер используется debounce, т.е. запрос будет отправлен только после паузы в печати</li>
        <li>Индикатор загрузки автоматически отображается во время выполнения запроса</li>
        <li class="text-blue-700 font-semibold">При указании URL используйте относительные пути, так как запросы выполняются локально</li>
      </ul>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Требования к серверному API:</h3>
      
      <p class="text-gray-700 mb-4">
        Сервер должен обрабатывать следующие параметры:
      </p>
      
      <div class="bg-gray-50 p-4 rounded-md overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2 text-left">Параметр</th>
              <th class="p-2 text-left">Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">q</td>
              <td class="p-2">Текст для поиска, введенный в поле</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="p-2 font-medium">field</td>
              <td class="p-2">Имя поля, для которого запрашиваются подсказки</td>
            </tr>
            <tr>
              <td class="p-2 font-medium">другие параметры</td>
              <td class="p-2">Любые дополнительные параметры из объекта apiParams</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="mt-8 p-4 border-t border-gray-200">
        <div class="flex flex-wrap gap-4">
          <NuxtLink to="/auto-suggest-demo" class="text-blue-600 hover:underline">Перейти к демонстрации автоподсказок</NuxtLink>
          <NuxtLink to="/docs/form-component" class="text-blue-600 hover:underline">Документация по компоненту формы</NuxtLink>
          <NuxtLink to="/docs" class="text-blue-600 hover:underline">Назад к документации</NuxtLink>
        </div>
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