import { defineStore } from 'pinia'

interface GlobalsState {
  params: Record<string, any>
  images: Record<string, any>
  isLoading: boolean
  error: string | null
  lastFetchTime: number | null
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
        const apiBase = String(config.public.API_URL || '').replace(/\/+$/, '')
        const response = await fetch(`${apiBase}/api/params`)
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных')
        }
        
        const data = await response.json()

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
