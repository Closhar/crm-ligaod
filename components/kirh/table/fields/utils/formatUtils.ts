export const formatDate = (date: string | Date | null | undefined, format?: string): string => {
  if (!date) return '—'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(format ? JSON.parse(format) : {})
  })
}

export const formatDateTime = (date: string | Date | null | undefined, format?: string): string => {
  if (!date) return '—'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(format ? JSON.parse(format) : {})
  })
}

export const formatTime = (time: string | Date | null | undefined, format?: string): string => {
  if (!time) return '—'
  
  const d = new Date(time)
  if (isNaN(d.getTime())) return '—'
  
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    ...(format ? JSON.parse(format) : {})
  })
}

export const pasteFromClipboard = async (fieldName: string, item: any): Promise<void> => {
  try {
    const text = await navigator.clipboard.readText()
    item[fieldName] = text
  } catch (err) {
    console.error('Ошибка при чтении из буфера обмена:', err)
  }
} 