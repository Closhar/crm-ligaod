export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiBase = String(config.public.API_URL || '').replace(/\/+$/, '')
  const body = await readBody(event)

  try {
    return await $fetch(`${apiBase}/api/adminlogin`, {
      method: 'POST',
      body,
      headers: {
        accept: 'application/json',
      },
    })
  } catch (error: any) {
    const statusCode = error?.response?.status || error?.statusCode || 500
    setResponseStatus(event, statusCode)

    return error?.data || {
      message: 'Ошибка авторизации',
    }
  }
})
