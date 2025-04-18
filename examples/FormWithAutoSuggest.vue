<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Пример формы с автоподсказками</h1>
    
    <KirhTableForm
      api-url="/api/users"
      :form-options="formOptions"
      :show-form="true"
      :force-local-api="true"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import KirhTableForm from '@/components/kirh/table/components/KirhTableForm.vue';

const formOptions = ref({
  autoOpen: true,
  formTitle: 'Форма с автоподсказками',
  columns: [
    {
      name: 'username',
      label: 'Имя пользователя',
      type: 'text',
      width: '33%',
      required: true,
      options: {
        placeholder: 'Введите имя пользователя',
        // Настройка автоподсказок
        autoSuggest: {
          apiUrl: '/api/user-suggestions', // URL для локального запроса
          minLength: 3, // Активировать после ввода 3 символов
          debounce: 300, // Задержка между запросами
          clickable: true, // Можно выбрать значение кликом
          labelField: 'name', // Поле для отображения в подсказках
          valueField: 'name', // Поле для значения
          showCount: true, // Показывать счетчик использований
          forceLocalApi: true, // Использовать локальные запросы
          // Дополнительные поля для заполнения при выборе
          fillFields: {
            email: 'email', // user_email = suggestion.email
            user_id: 'id' // user_id = suggestion.id
          }
        }
      }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      width: '33%',
      required: true,
      options: {
        placeholder: 'Введите email',
        // Только информативные подсказки, без возможности выбора
        autoSuggest: {
          apiUrl: '/api/email-suggestions',
          minLength: 2,
          clickable: false, // Нельзя выбрать - только для информации
          forceLocalApi: true, // Использовать локальные запросы
          apiParams: {
            check_duplicates: true // Дополнительные параметры
          }
        }
      }
    },
    {
      name: 'user_id',
      label: 'ID пользователя',
      type: 'text',
      width: '33%',
      options: {
        readonly: true // Это поле будет заполняться автоматически при выборе имени
      }
    },
    {
      name: 'comment',
      label: 'Комментарий',
      type: 'textarea',
      width: '100%',
      options: {
        rows: 3,
        placeholder: 'Введите комментарий'
      }
    }
  ]
});
</script>

<style scoped>
/* Дополнительные стили при необходимости */
</style> 