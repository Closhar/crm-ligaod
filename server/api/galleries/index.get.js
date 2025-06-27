export default defineEventHandler(async (event) => {
  try {
    // Здесь должна быть логика для получения галерей из базы данных
    // Пока возвращаем заглушку
    return {
      success: true,
      data: []
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: error.message
    });
  }
}); 