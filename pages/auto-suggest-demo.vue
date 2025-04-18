<template>
  <div class="container mx-auto py-8">
    <div class="bg-white shadow-md rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-6">Демонстрация формы с автоподсказками</h1>
      
      <p class="text-gray-700 mb-6">
        Эта страница демонстрирует работу формы с функцией автоподсказок при вводе текста.
        В поле "Имя пользователя" при вводе будут отображаться подсказки, при клике на которые
        данные будут автоматически заполнены. В поле "Email" подсказки служат только для 
        информирования о дубликатах, без возможности выбора.
      </p>
      
      <div class="bg-gray-100 p-4 rounded-md mb-6">
        <h2 class="text-lg font-semibold mb-2">Инструкция:</h2>
        <ol class="list-decimal list-inside text-gray-800 space-y-2">
          <li>Введите несколько букв в поле "Имя пользователя" (например, "Иван" или "Петр")</li>
          <li>Выберите подходящий вариант из выпадающего списка</li>
          <li>Обратите внимание, что поля "Email" и "ID пользователя" будут автоматически заполнены</li>
          <li>В поле "Email" введите "test" или "info" для проверки работы информационных подсказок</li>
        </ol>
      </div>
      
      <FormWithAutoSuggest />
      
      <!-- Документация по использованию компонента -->
      <div class="mt-12 border-t pt-6">
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
        apiUrl: '/api/user-suggestions',
        minLength: 3,
        debounce: 300,
        clickable: true,
        labelField: 'name',
        valueField: 'name',
        showCount: true,
        forceLocalApi: true,
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
        clickable: false,
        forceLocalApi: true,
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
          <li class="text-blue-700 font-semibold">По умолчанию к URL, начинающимся с '/api/', добавляется префикс API_URL. Используйте <code>forceLocalApi: true</code> для локальных запросов.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import FormWithAutoSuggest from '~/examples/FormWithAutoSuggest.vue';
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
</style> 