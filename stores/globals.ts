import { defineStore } from 'pinia'

interface GlobalsState {
  params: Record<string, any>
  images: Record<string, any>
  isLoading: boolean
  error: string | null
  lastFetchTime: number | null
}

function parseJsonResponse(text: string): any {
  try {
    return JSON.parse(text)
  } catch (error) {
    const jsonStart = text.indexOf('{')

    if (jsonStart >= 0) {
      try {
        return JSON.parse(text.slice(jsonStart))
      } catch {
        // Ниже пробрасываем исходную ошибку, чтобы не скрывать реальную проблему ответа.
      }
    }

    throw error
  }
}

export const useGlobalsStore = defineStore('globals', {
  state: (): GlobalsState => ({
    params: {},
    images: {},
    isLoading: false,
    error: null,
    lastFetchTime: null
  }),

  actions: {
    async fetchData() {
      this.isLoading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const apiBase = String(config.public.API_URL || '')
          .replace(/\/+$/, '')
          .replace(/\/api$/, '')
        const response = await fetch(`${apiBase}/api/v1/params`)
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных')
        }
        
        const responseText = await response.text()
        const data = parseJsonResponse(responseText)

        this.params = data.params || {}
        this.images = data.images || {}
        this.lastFetchTime = Date.now()
        
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Неизвестная ошибка'
        console.error('Ошибка при загрузке данных:', this.error)
      } finally {
        this.isLoading = false
      }
    }
  }
}) 
