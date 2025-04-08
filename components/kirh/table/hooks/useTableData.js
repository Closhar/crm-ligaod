import {ref, computed} from 'vue';

export function useTableData(props) {
    const tableData = ref([]);
    const loading = ref(false);
    const formLoading = ref(false);
    const error = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const totalItems = ref(0);

    const fetchData = async () => {
        try {
            loading.value = true;
            error.value = null;

            const filterParams = {};
            if (searchQuery.value) {
                filterParams.q = searchQuery.value;
            }

            props.additionalFilters.forEach(filter => {
                if (selectedFilters.value[filter.field] !== undefined && selectedFilters.value[filter.field] !== '') {
                    filterParams[filter.field] = selectedFilters.value[filter.field];
                }
            });

            const params = new URLSearchParams({
                page: currentPage.value,
                per_page: props.tableOptions.pageSize,
                ...(sortField.value && {sort_field: sortField.value}),
                ...(sortDirection.value && {sort_direction: sortDirection.value}),
                ...props.additionalParams,
                ...filterParams
            });

            const response = await fetch(`${props.apiUrl}?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка загрузки данных');
            }

            tableData.value = data.data || data;
            totalPages.value = data.last_page || data.meta?.last_page || 1;
            totalItems.value = data.total || data.meta?.total || tableData.value.length;
        } catch (err) {
            error.value = err.message;
            console.error('Ошибка при загрузке данных:', err);
        } finally {
            loading.value = false;
        }
    };

    const submitForm = async () => {
        try {
            formLoading.value = true;
            error.value = null;

            const url = editingRow.value
                ? `${props.apiUrl}/${editingRow.value.id}`
                : props.apiUrl;

            const method = editingRow.value ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData.value)
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            await fetchData();
            cancelForm();
        } catch (err) {
            error.value = err.message;
            console.error('Ошибка при сохранении:', err);
        } finally {
            formLoading.value = false;
        }
    };

    const deleteRow = async (row) => {
        if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

        try {
            loading.value = true;
            const response = await fetch(`${props.apiUrl}/${row.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            await fetchData();
        } catch (err) {
            error.value = err.message;
            console.error('Ошибка при удалении:', err);
        } finally {
            loading.value = false;
        }
    };

    const updateValue = async (row, fieldName, value) => {
        if (!props.tableOptions.editable || !isFieldEditable(fieldName)) return;

        try {
            const actualValue = typeof value === 'object' && value !== null && 'target' in value
                ? value.target.value
                : value;

            const column = allFields.value.find(col => col.name === fieldName);

            if (column?.validate) {
                const validationResult = column.validate(actualValue);
                if (typeof validationResult === 'string') {
                    throw new Error(validationResult);
                }
                if (validationResult === false) {
                    throw new Error('Недопустимое значение');
                }
            }

            const response = await fetch(`${props.apiUrl}/${row.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({[fieldName]: actualValue})
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const updatedData = await response.json();
            Object.assign(row, updatedData);
        } catch (err) {
            error.value = err.message;
            console.error('Ошибка при обновлении:', err);
        }
    };

    return {
        tableData,
        loading,
        formLoading,
        error,
        currentPage,
        totalPages,
        totalItems,
        fetchData,
        submitForm,
        deleteRow,
        updateValue
    };
}