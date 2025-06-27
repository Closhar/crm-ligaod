export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    // Здесь должна быть логика для получения галереи из базы данных
    // Пока возвращаем заглушку
    return {
      success: true,
      data: {
        id: parseInt(id),
        title: 'Sample Gallery',
        images: []
      }
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: error.message
    });
  }
}); 