// stores/globals.js
import {defineStore} from 'pinia';
import {ref} from 'vue';

export const useGlobalsStore = defineStore('globals', () => {
    const params = ref({});
    const images = ref({});
    const isLoading = ref(false);
    const error = ref(null);
    const lastFetchTime = ref(null);
    const CACHE_TTL = 5 * 60 * 1000; // 5 минут

    async function fetchData() {
        if (Object.keys(params.value).length > 0 || Object.keys(images.value).length > 0) {
            if (lastFetchTime.value && Date.now() - lastFetchTime.value < CACHE_TTL) return;
        }

        isLoading.value = true;
        error.value = null;

        try {
            const config = useRuntimeConfig();
            const response = await fetch(config.public.API_URL + `/api/v1/params`);
            if (!response.ok) throw new Error('Ошибка при загрузке данных');
            const data = await response.json();

            // Очищаем предыдущие данные
            params.value = {};
            images.value = {};

            // Заполняем параметры - новый формат: объект вместо массива
            if (data.params && typeof data.params === 'object') {
                params.value = data.params;
            }

            // Заполняем изображения - новый формат: объект вместо массива
            if (data.images && typeof data.images === 'object') {
                images.value = data.images;
            }

            lastFetchTime.value = Date.now();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Неизвестная ошибка';
            console.error('Ошибка при загрузке данных:', error.value);
            
            // Устанавливаем значения по умолчанию при ошибке
            params.value = {
                adminka_name: 'Админка',
                site_name: 'Спортивный портал',
                site_description: 'Информационный портал о спортивных событиях',
                admin_reg: 'false',
                adminka_google_auth: 'false',
                adminka_menu_collapsed: 'false',
                adminka_copyrights: '© 2024 Все права защищены',
                adminka_copy_link: '#'
            };
            
            images.value = {
                default_user: '/images/default-avatar.png',
                site_logo: '/images/logo.png'
            };
        } finally {
            isLoading.value = false;
        }
    }

    function clearCache() {
        params.value = {};
        images.value = {};
        lastFetchTime.value = null;
    }

    return {
        params,
        images,
        isLoading,
        error,
        fetchData,
        clearCache,
    };
});