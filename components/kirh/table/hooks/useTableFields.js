import {ref, computed} from 'vue';

export function useTableFields(props) {
    const showFieldSelector = ref(false);
    const selectedFields = ref([]);

    // Все доступные поля
    const allFields = computed(() => {
        const tableFields = props.tableOptions.columns.map(col => ({
            name: col.name,
            label: col.label || col.name,
            type: col.type || 'text',
            options: col.options || {}
        }));

        const extraFields = props.extraEditableFields.map(field => ({
            name: field.name,
            label: field.label || field.name,
            type: field.type || 'text',
            options: field.options || {}
        }));

        return [...tableFields, ...extraFields].reduce((acc, field) => {
            if (!acc.some(f => f.name === field.name)) {
                acc.push(field);
            }
            return acc;
        }, []);
    });

    // Видимые колонки
    const visibleColumns = computed(() => {
        if (!showFieldSelector.value) {
            return props.tableOptions.columns;
        }

        const fixedField = props.fixedReadonlyField
            ? allFields.value.find(f => f.name === props.fixedReadonlyField)
            : null;

        const selected = selectedFields.value.map(fieldName => {
            return allFields.value.find(f => f.name === fieldName) || {
                name: fieldName,
                label: fieldName,
                type: 'text',
                options: {}
            };
        }).filter(Boolean);

        const result = fixedField ? [fixedField, ...selected] : [...selected];
        return result.filter((item, index, self) =>
            index === self.findIndex(t => t.name === item.name)
        );
    });

    // Переключение панели выбора полей
    const toggleFieldSelector = () => {
        showFieldSelector.value = !showFieldSelector.value;
        if (showFieldSelector.value && selectedFields.value.length === 0) {
            selectedFields.value = props.tableOptions.columns
                .filter(c => c.name !== props.fixedReadonlyField)
                .map(c => c.name);
        }
    };

    // Переключение выбора поля
    const toggleFieldSelection = (fieldName) => {
        if (fieldName === props.fixedReadonlyField) return;

        if (selectedFields.value.includes(fieldName)) {
            selectedFields.value = selectedFields.value.filter(f => f !== fieldName);
        } else {
            selectedFields.value = [...selectedFields.value, fieldName];
        }
    };

    // Проверка, доступно ли поле для редактирования
    const isFieldEditable = (fieldName) => {
        if (!showFieldSelector.value) return props.tableOptions.editable;
        if (fieldName === props.fixedReadonlyField) return false;
        return selectedFields.value.includes(fieldName);
    };

    return {
        showFieldSelector,
        selectedFields,
        allFields,
        visibleColumns,
        toggleFieldSelector,
        toggleFieldSelection,
        isFieldEditable
    };
}