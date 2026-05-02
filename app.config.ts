const normalizeApiOrigin = (value?: string) => {
  let origin = String(value || '').trim()

  if (!origin) {
    return ''
  }

  origin = origin
    .replace(/^https?:\/(?!\/)/i, (match) => `${match}/`)
    .replace(/\/+$/, '')
    .replace(/\/api$/, '')

  if (!/^https?:\/\//i.test(origin) && !origin.startsWith('/')) {
    origin = `http://${origin}`
  }

  return origin
}

export default defineAppConfig({
  layout: 'default',
  pages: true,
  apiUrl: normalizeApiOrigin(process.env.NUXT_PUBLIC_API_URL || process.env.API_URL)
})
