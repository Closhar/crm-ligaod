import { ref, computed } from 'vue'
import { formatDate, formatDateTime, formatTime, pasteFromClipboard } from '../utils/formatUtils'
import { getSelectLabel, hasValidId, getFieldClass, getToggleWrapperClass, getToggleLabelClass } from '../utils/fieldUtils'

export const useHasManyField = (props: any, emit: any) => {
  // Состояние
  const showModal = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const relatedItems = ref<any[]>([])
  const isEditingItem = ref<string | number | null>(null)
  const debugMode = ref(false)
  const newItem = ref<any>({})

  // Вычисляемые свойства
  const count = computed(() => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.length
    }
    return Object.keys(props.modelValue || {}).length
  })

  const effectiveOptions = computed(() => ({
    ...props.options,
    defaultInputClass: 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    defaultTextareaClass: 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    defaultSelectClass: 'w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    defaultToggleClass: 'h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500',
    defaultToggleWrapperClass: 'flex items-center',
    defaultToggleLabelClass: 'ml-2 text-sm text-gray-700',
    noDataClass: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    hasDataClass: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    noDataIconClass: 'text-gray-600',
    hasDataIconClass: 'text-blue-600',
    iconSize: '1.2em',
    tooltipText: 'Связанные записи'
  }))

  const modalTitle = computed(() => {
    return effectiveOptions.value.modalTitle || 'Связанные записи'
  })

  // Методы
  const openModal = async () => {
    if (props.readonly) return
    showModal.value = true
    await fetchRelatedItems()
  }

  const closeModal = () => {
    showModal.value = false
    error.value = null
    isEditingItem.value = null
    newItem.value = {}
  }

  const fetchRelatedItems = async () => {
    if (!hasValidId(props.id)) {
      error.value = 'ID записи не определен'
      return
    }

    loading.value = true
    error.value = null

    try {
      // Здесь должна быть логика загрузки данных
      // relatedItems.value = await loadData()
    } catch (err: any) {
      error.value = err.message || 'Ошибка при загрузке данных'
    } finally {
      loading.value = false
    }
  }

  const toggleDebugMode = () => {
    debugMode.value = !debugMode.value
  }

  const startEditing = (item: any) => {
    if (props.readonly) return
    isEditingItem.value = item.id
  }

  const cancelEditing = () => {
    isEditingItem.value = null
  }

  const saveItem = async (item: any) => {
    if (props.readonly) return

    item._updating = true
    try {
      // Здесь должна быть логика сохранения данных
      // await saveData(item)
      emit('change', { type: 'update', item })
    } catch (err: any) {
      error.value = err.message || 'Ошибка при сохранении данных'
    } finally {
      item._updating = false
      isEditingItem.value = null
    }
  }

  const deleteItem = async (item: any) => {
    if (props.readonly) return

    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return

    item._updating = true
    try {
      // Здесь должна быть логика удаления данных
      // await deleteData(item)
      emit('change', { type: 'delete', item })
    } catch (err: any) {
      error.value = err.message || 'Ошибка при удалении данных'
    } finally {
      item._updating = false
    }
  }

  const addItem = async () => {
    if (props.readonly) return

    try {
      // Здесь должна быть логика добавления данных
      // await addData(newItem.value)
      emit('change', { type: 'add', item: newItem.value })
      newItem.value = {}
    } catch (err: any) {
      error.value = err.message || 'Ошибка при добавлении данных'
    }
  }

  return {
    // Состояние
    showModal,
    loading,
    error,
    relatedItems,
    isEditingItem,
    debugMode,
    newItem,

    // Вычисляемые свойства
    count,
    effectiveOptions,
    modalTitle,

    // Методы
    openModal,
    closeModal,
    fetchRelatedItems,
    toggleDebugMode,
    startEditing,
    cancelEditing,
    saveItem,
    deleteItem,
    addItem,

    // Утилиты
    formatDate,
    formatDateTime,
    formatTime,
    pasteFromClipboard,
    getSelectLabel,
    hasValidId,
    getFieldClass,
    getToggleWrapperClass,
    getToggleLabelClass
  }
}
