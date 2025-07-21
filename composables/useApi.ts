// composables/useApi.ts
export const useApi = () => {
    // Конфигурация API
    const config = useRuntimeConfig();
    const api = config.public.API_URL;

    // Функция для API запросов
    const apiRequest = async (url: string, options: any = {}) => {
        const token = localStorage.getItem('auth_token');
        // Не добавлять Content-Type для FormData
        let headers: any = {};
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        if (options.headers) {
            headers = { ...headers, ...options.headers };
        }
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // Формируем URL, избегая дублирования /api/
        let apiUrl;
        if (url.startsWith('/')) {
          // Если API_URL уже содержит /api, не добавляем его
          if (api.endsWith('/api')) {
            apiUrl = `${api}${url}`;
          } else {
            apiUrl = `${api}/api${url}`;
          }
        } else {
          // Если API_URL уже содержит /api, не добавляем его
          if (api.endsWith('/api')) {
            apiUrl = `${api}/${url}`;
          } else {
            apiUrl = `${api}/api/${url}`;
          }
        }

        try {
            return await $fetch(apiUrl, {
                ...options,
                headers
            });
        } catch (error: any) {
            // Теперь выбрасываем ошибку, чтобы catch в компоненте сработал!
            throw error;
        }
    };

    return {
        api,
        apiRequest
    };
}; 