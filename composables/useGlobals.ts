import { useGlobalsStore } from '~/stores/globals'

export const useGlobals = () => {
  const globalsStore = useGlobalsStore()

  const loadGlobals = async () => {
    await globalsStore.fetchData()
    return {
      params: globalsStore.params,
      images: globalsStore.images
    }
  }

  return {
    loadGlobals,
    params: globalsStore.params,
    images: globalsStore.images
  }
} 