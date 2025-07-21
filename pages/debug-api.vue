<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Отладка API конфигурации</h1>
    
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">Конфигурация:</h2>
      <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ configInfo }}</pre>
    </div>

    <div class="bg-white rounded-lg shadow p-6 mt-6">
      <h2 class="text-lg font-semibold mb-4">Тест API запроса:</h2>
      <button @click="testApi" class="bg-blue-600 text-white px-4 py-2 rounded">
        Тестировать API
      </button>
      <div v-if="apiResult" class="mt-4">
        <h3 class="font-semibold">Результат:</h3>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ apiResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const { apiRequest } = useApi()

const configInfo = ref(JSON.stringify({
  API_URL: config.public.API_URL,
  apiBase: config.public.apiBase,
  SITE_URL: config.public.SITE_URL,
  VK_TOKEN: config.public.VK_TOKEN,
}, null, 2))

const apiResult = ref(null)

const testApi = async () => {
  try {
    const result = await apiRequest('/v1/achievements/club')
    apiResult.value = JSON.stringify(result, null, 2)
  } catch (error) {
    apiResult.value = JSON.stringify({
      error: error.message,
      stack: error.stack
    }, null, 2)
  }
}
</script> 