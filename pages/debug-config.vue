<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Отладка конфигурации API</h1>
    
    <div class="bg-gray-100 p-4 rounded-lg mb-4">
      <h2 class="text-lg font-semibold mb-2">Конфигурация Nuxt:</h2>
      <pre class="bg-white p-2 rounded text-sm">{{ configInfo }}</pre>
    </div>
    
    <div class="bg-gray-100 p-4 rounded-lg mb-4">
      <h2 class="text-lg font-semibold mb-2">Тест URL формирования:</h2>
      <div class="space-y-2">
        <div v-for="test in urlTests" :key="test.name" class="bg-white p-2 rounded">
          <strong>{{ test.name }}:</strong>
          <div class="text-sm text-gray-600">{{ test.result }}</div>
        </div>
      </div>
    </div>
    
    <div class="bg-gray-100 p-4 rounded-lg">
      <h2 class="text-lg font-semibold mb-2">Тест API запросов:</h2>
      <button 
        @click="testApiRequests" 
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        :disabled="testing"
      >
        {{ testing ? 'Тестируем...' : 'Запустить тест' }}
      </button>
      <div v-if="apiResults.length > 0" class="mt-4 space-y-2">
        <div v-for="result in apiResults" :key="result.url" class="bg-white p-2 rounded">
          <strong>{{ result.url }}:</strong>
          <div class="text-sm" :class="result.success ? 'text-green-600' : 'text-red-600'">
            {{ result.success ? '✅ Успех' : '❌ Ошибка' }} - {{ result.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const testing = ref(false)
const apiResults = ref([])

// Получаем конфигурацию
const config = useRuntimeConfig()

const configInfo = computed(() => {
  return {
    'API_URL': config.public.API_URL,
    'apiBase': config.public.apiBase,
    'SITE_URL': config.public.SITE_URL,
    'NODE_ENV': process.env.NODE_ENV,
    'NUXT_ENV': process.env.NUXT_ENV
  }
})

// Функция формирования URL (как в исправленном коде)
function formApiUrl(apiUrl, endpoint) {
  let finalUrl;
  
  if (endpoint.startsWith('/')) {
    if (apiUrl.endsWith('/api')) {
      finalUrl = `${apiUrl}${endpoint}`;
    } else {
      finalUrl = `${apiUrl}/api${endpoint}`;
    }
  } else {
    if (apiUrl.endsWith('/api')) {
      finalUrl = `${apiUrl}/${endpoint}`;
    } else {
      finalUrl = `${apiUrl}/api/${endpoint}`;
    }
  }
  
  return finalUrl;
}

const urlTests = computed(() => {
  const api = config.public.API_URL
  return [
    {
      name: 'API_URL с /api, endpoint с /',
      result: `API_URL: ${api}\nEndpoint: /people/clubs\nResult: ${formApiUrl(api, '/people/clubs')}`
    },
    {
      name: 'API_URL без /api, endpoint с /',
      result: `API_URL: ${api}\nEndpoint: /people/clubs\nResult: ${formApiUrl(api, '/people/clubs')}`
    },
    {
      name: 'API_URL с /api, endpoint без /',
      result: `API_URL: ${api}\nEndpoint: people/clubs\nResult: ${formApiUrl(api, 'people/clubs')}`
    },
    {
      name: 'API_URL без /api, endpoint без /',
      result: `API_URL: ${api}\nEndpoint: people/clubs\nResult: ${formApiUrl(api, 'people/clubs')}`
    }
  ]
})

async function testApiRequests() {
  testing.value = true
  apiResults.value = []
  
  const endpoints = [
    '/people/clubs',
    '/people/sports', 
    '/people/positions',
    '/people/ampluas'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const api = config.public.API_URL
      const url = formApiUrl(api, endpoint)
      
      console.log(`Тестируем: ${url}`)
      
      const response = await $fetch(url, {
        method: 'GET',
        params: { type: 'async', limit: 5 }
      })
      
      apiResults.value.push({
        url,
        success: true,
        message: `Получено ${Array.isArray(response) ? response.length : 'неизвестно'} элементов`
      })
    } catch (error) {
      apiResults.value.push({
        url: formApiUrl(config.public.API_URL, endpoint),
        success: false,
        message: error.message
      })
    }
  }
  
  testing.value = false
}
</script> 