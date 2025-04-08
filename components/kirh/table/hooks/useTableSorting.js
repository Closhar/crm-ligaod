import {ref, computed} from 'vue';

export function useTableSorting(tableData) {
    const sortField = ref(null);
    const sortDirection = ref('asc');

    // Сортировка данных
    const sortBy = (field) => {
        if (sortField.value === field) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortField.value = field;
            sortDirection.value = 'asc';
        }
    };

    // Отсортированные данные
    const displayedData = computed(() => {
        if (!sortField.value) {
            return tableData.value;
        }

        return [...tableData.value].sort((a, b) => {
            const valA = a[sortField.value];
            const valB = b[sortField.value];

            if (valA === valB) return 0;
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            return sortDirection.value === 'asc'
                ? valA > valB ? 1 : -1
                : valA < valB ? 1 : -1;
        });
    });

    return {
        sortField,
        sortDirection,
        sortBy,
        displayedData
    };
}