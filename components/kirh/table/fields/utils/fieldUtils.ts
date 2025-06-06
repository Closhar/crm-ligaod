interface Field {
  name: string
  label: string
  type: string
  options?: {
    inputClass?: string
    textareaClass?: string
    selectClass?: string
    toggleClass?: string
    toggleWrapperClass?: string
    toggleLabelClass?: string
    toggleLabel?: string
    defaultChecked?: boolean
    emptyable?: boolean
    keyField?: string
    labelField?: string
    options?: Array<{ [key: string]: any }>
    pasteFromClipboard?: boolean | { title?: string }
  }
}

interface Item {
  [key: string]: any
}

export const getSelectLabel = (item: Item, field: Field): string => {
  if (!field.options?.options) return item[field.name] || '—'
  
  const value = item[field.name]
  if (!value) return '—'
  
  const option = field.options.options.find(opt => 
    opt[field.options?.keyField || 'id'] === value
  )
  
  return option ? option[field.options?.labelField || 'name'] : value
}

export const hasValidId = (id?: string | number): boolean => {
  if (typeof id === 'number') return true
  return id !== undefined && id !== null && id !== ''
}

export const getFieldClass = (field: Field, type: 'input' | 'textarea' | 'select' | 'toggle', defaultClass: string): string => {
  switch (type) {
    case 'input':
      return field.options?.inputClass || defaultClass
    case 'textarea':
      return field.options?.textareaClass || defaultClass
    case 'select':
      return field.options?.selectClass || defaultClass
    case 'toggle':
      return field.options?.toggleClass || defaultClass
    default:
      return defaultClass
  }
}

export const getToggleWrapperClass = (field: Field, defaultClass: string): string => {
  return field.options?.toggleWrapperClass || defaultClass
}

export const getToggleLabelClass = (field: Field, defaultClass: string): string => {
  return field.options?.toggleLabelClass || defaultClass
} 