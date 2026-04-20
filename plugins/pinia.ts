import { createPinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia()

  nuxtApp.vueApp.use(pinia)
  nuxtApp.provide('pinia', pinia)

  if (process.dev) {
    console.info('[FIX] Pinia plugin registered for Nuxt 4 compatibility')
  }
})
