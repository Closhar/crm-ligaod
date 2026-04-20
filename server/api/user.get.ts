export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiBase = String(config.public.API_URL || '').replace(/\/+$/, '')
  const authHeader = getHeader(event, 'authorization')

  try {
    return await $fetch(`${apiBase}/api/user`, {
      headers: {
        accept: 'application/json',
        ...(authHeader ? { authorization: authHeader } : {}),
      },
    })
  } catch (error: any) {
    const statusCode = error?.response?.status || error?.statusCode || 500
    setResponseStatus(event, statusCode)

    return error?.data || {
      message: 'Ошибка получения пользователя',
    }
  }
})
