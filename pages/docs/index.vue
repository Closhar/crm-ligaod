<template>
  <div class="container mx-auto py-8">
    <div class="bg-white shadow-md rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-6">Документация по компонентам KirhTable</h1>
      
      <p class="text-gray-700 mb-6">
        В этом разделе представлена документация по компонентам системы KirhTable - набора компонентов
        для создания таблиц и форм с различными функциональными возможностями.
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div class="bg-blue-50 p-4 rounded-md shadow">
          <h2 class="text-lg font-semibold mb-2 text-blue-800">
            <NuxtLink to="/docs/form-component" class="hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Компонент формы KirhTableForm
            </NuxtLink>
          </h2>
          <p class="text-gray-700 mb-2">
            Полная документация по компоненту формы KirhTableForm, включая параметры, события, типы полей и примеры использования.
          </p>
          <NuxtLink to="/docs/form-component" class="text-blue-600 hover:underline text-sm">Подробнее &rarr;</NuxtLink>
        </div>
        
        <div class="bg-green-50 p-4 rounded-md shadow">
          <h2 class="text-lg font-semibold mb-2 text-green-800">
            <NuxtLink to="/docs/auto-suggest" class="hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Автоподсказки в полях формы
            </NuxtLink>
          </h2>
          <p class="text-gray-700 mb-2">
            Документация по функционалу автоподсказок в текстовых полях формы - как настроить, использовать и кастомизировать.
          </p>
          <NuxtLink to="/docs/auto-suggest" class="text-green-600 hover:underline text-sm">Подробнее &rarr;</NuxtLink>
        </div>
        
        <div class="bg-purple-50 p-4 rounded-md shadow">
          <h2 class="text-lg font-semibold mb-2 text-purple-800">
            <NuxtLink to="/docs/table-component" class="hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Компонент таблицы KirhTable
            </NuxtLink>
          </h2>
          <p class="text-gray-700 mb-2">
            Описание компонента таблицы KirhTable, его параметров, событий и примеров использования.
          </p>
          <NuxtLink to="/docs/table-component" class="text-purple-600 hover:underline text-sm">Подробнее &rarr;</NuxtLink>
        </div>
      </div>
      
      <h2 class="text-xl font-bold mb-4">Демонстрации</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-yellow-50 p-4 rounded-md shadow">
          <h2 class="text-lg font-semibold mb-2 text-yellow-800">
            <NuxtLink to="/auto-suggest-demo" class="hover:underline flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Демо автоподсказок
            </NuxtLink>
          </h2>
          <p class="text-gray-700 mb-2">
            Интерактивная демонстрация работы автоподсказок в полях формы.
          </p>
          <NuxtLink to="/auto-suggest-demo" class="text-yellow-600 hover:underline text-sm">Открыть демо &rarr;</NuxtLink>
        </div>
      </div>
      
      <h2 class="text-xl font-bold mb-4 mt-8 pt-6 border-t">История версий</h2>
      
      <div class="bg-amber-50 p-4 rounded-md shadow mb-4">
        <h3 class="text-lg font-semibold mb-2 text-amber-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Версия 1.1 (18.04.2025)
        </h3>
        <div class="text-gray-700 mb-2">
          <h4 class="font-semibold text-amber-700">Новые возможности:</h4>
          <ul class="list-disc list-inside ml-2 mb-2">
            <li>Добавлена автоматическая транслитерация полей формы</li>
            <li>Создан новый параметр <code>transliterateFrom</code> для текстовых полей</li>
            <li>Добавлена функция <code>transliterate</code> для преобразования кириллицы в латиницу</li>
            <li>Добавлено поле типа <code>hasmany</code> для работы со связанными записями (отношения "один ко многим")</li>
            <li>Добавлен фильтр по ID - при клике на кнопку выводится запись с указанным идентификатором</li>
            <li>Добавлены интерактивные подсказки к текстовым полям (кликабельные/некликабельные)</li>
          </ul>
          
          <h4 class="font-semibold text-amber-700">Улучшения:</h4>
          <ul class="list-disc list-inside ml-2 mb-2">
            <li>Улучшена обработка событий ввода в текстовых полях</li>
            <li>Добавлена поддержка транслитерации при выборе значений из автоподсказок</li>
            <li>Улучшена общая работа с формой и текстовыми полями в таблице</li>
            <li>Для полей типа <code>textarea</code> добавлена визуализация контента (ссылки, телефоны, email)</li>
            <li>Улучшена работа панели редактирования отдельных полей, добавлена кнопка сброса</li>
            <li>Исправлены ошибки инициализации полей при загрузке формы</li>
          </ul>
          
          <div class="bg-white p-3 rounded-md text-sm border border-amber-200 mb-2">
            <p class="font-semibold">Пример использования транслитерации:</p>
            <pre class="text-xs text-gray-800 overflow-x-auto mt-1"><code>options: {
  transliterateFrom: 'title' // Автоматическая транслитерация из поля title
}</code></pre>
          </div>
          
          <NuxtLink to="/docs/form-component#transliteration" class="text-blue-600 hover:underline text-sm">
            Подробнее о транслитерации &rarr;
          </NuxtLink>
        </div>
      </div>
      
      <div class="bg-emerald-50 p-4 rounded-md shadow mb-4">
        <h3 class="text-lg font-semibold mb-2 text-emerald-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          В разработке: Версия 1.2
        </h3>
        <div class="text-gray-700 mb-2">
          <p class="italic mb-2">Скоро выйдет новая версия с улучшениями и расширенным функционалом.</p>
          
          <div class="bg-white p-3 rounded-md text-sm border border-emerald-200 mb-2">
            <p class="font-semibold">Следите за обновлениями!</p>
          </div>
        </div>
      </div>
      
      <div class="bg-emerald-50 p-4 rounded-md shadow">
        <h3 class="text-lg font-semibold mb-2 text-emerald-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Версия 1.0 (Первоначальный релиз)
        </h3>
        <div class="text-gray-700 mb-2">
          <ul class="list-disc list-inside ml-2">
            <li>Базовый функционал компонентов KirhTable и KirhTableForm</li>
            <li>Поддержка различных типов полей: текст, select, toggle, datetime и др.</li>
            <li>Автоподсказки в текстовых полях</li>
            <li>Валидация данных форм</li>
            <li>Загрузка изображений</li>
            <li>Редактирование отдельных полей</li>
          </ul>
        </div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-md mt-8">
        <h2 class="text-lg font-semibold mb-2">Полезные ссылки</h2>
        <ul class="list-disc list-inside text-gray-700">
          <li><NuxtLink to="/" class="text-blue-600 hover:underline">Главная страница</NuxtLink></li>
          <li><NuxtLink to="#" class="text-blue-600 hover:underline">API документация</NuxtLink></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
// Здесь может быть код для интерактивной документации, если понадобится
</script>

<style scoped>
a.hover\:underline:hover {
  text-decoration: underline;
}
</style> 