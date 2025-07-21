# Админка CRM (Nuxt.js)

Административная панель для управления спортивным порталом.

## API Конфигурация

**ВАЖНО**: Все API запросы должны использовать правильную конфигурацию:

```typescript
// ✅ ПРАВИЛЬНО
const config = useRuntimeConfig();
const api = config.public.API_URL;

// ❌ НЕПРАВИЛЬНО
const api = config.public.API_URL || "http://127.0.0.1:8000";
```

### Использование composable

```typescript
// Рекомендуется использовать composable useApi
const { api, apiRequest } = useApi();

// Примеры
const response = await apiRequest("/people");
const createResponse = await apiRequest("/people", {
  method: "POST",
  body: data,
});

// Composable автоматически добавляет префикс /api
// Запрос /people автоматически станет /api/people
```

### Переменные окружения

Создайте файл `.env` в корне проекта:

```bash
NUXT_PUBLIC_API_URL=https://p.sportrep.ru
NUXT_SITE_URL=https://crm.sporterp.ru
```

## Setup

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
