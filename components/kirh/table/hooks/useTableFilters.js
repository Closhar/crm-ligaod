import {ref, watch} from 'vue';
import {debounce} from 'lodash-es';

export function useTableFilters(fetchData, props) {
    const searchQuery = ref('');
    const selectedFilters = ref({});

    // Инициализация фильтров
    const initFilters = () => {
        props.additionalFilters.forEach(filter => {
            selectedFilters.value[filter.field] = filter.defaultValue || '';
        });
    };

    // Дебаунс для поиска
    const debouncedSearch = debounce(() => {
        fetchData();
    }, 500);

    // Очистка поиска
    const clearSearch = () => {
        searchQuery.value = '';
        fetchData();
    };

    // Применение фильтров
    const applyFilters = () => {
        fetchData();
    };

    // Следим за изменением дополнительных фильтров
    watch(() => props.additionalFilters, () => {
        initFilters();
    }, {immediate: true});

    return {
        searchQuery,
        selectedFilters,
        debouncedSearch,
        clearSearch,
        applyFilters
    };
}