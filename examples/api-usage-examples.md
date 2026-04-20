# Примеры использования API в проекте

## Правильный способ получения API URL

```typescript
// ✅ ПРАВИЛЬНО - используем useRuntimeConfig()
const config = useRuntimeConfig();
const api = config.public.API_URL;

// ❌ НЕПРАВИЛЬНО - не используем fallback значения
const config = useRuntimeConfig();
const appConfig = useAppConfig();
const api =
  config.public.API_URL || appConfig.apiUrl || "http://127.0.0.1:8000";
```

## Использование composable useApi

```typescript
// ✅ ПРАВИЛЬНО - используем composable
const { api, apiRequest } = useApi();

// Примеры использования
const response = await apiRequest("/people", { params: { page: 1 } });
const createResponse = await apiRequest("/people", {
  method: "POST",
  body: personData,
});
```

## Структура API запросов

```typescript
// Все API запросы должны использовать:
// 1. useRuntimeConfig() для получения API URL
// 2. Автоматическое добавление токена авторизации
// 3. Правильные заголовки Content-Type

const apiRequest = async (url: string, options: any = {}) => {
  const token = localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return await $fetch(`${api}${url}`, {
    ...options,
    headers,
  });
};
```

## Конфигурация в nuxt.config.ts

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL,
      // другие публичные переменные
    },
  },
});
```

## Переменные окружения

```bash
# .env файл
NUXT_PUBLIC_API_URL=https://api.ligaod.ru
```

## Важные моменты

1. **Всегда используйте `useRuntimeConfig()`** для получения API URL
2. **Не используйте fallback значения** - переменные окружения должны быть настроены правильно
3. **Используйте composable `useApi()`** для централизованной работы с API
4. **Токен авторизации** добавляется автоматически в composable
5. **Все API эндпоинты** должны начинаться с `/` (например, `/people`, а не `people`)
