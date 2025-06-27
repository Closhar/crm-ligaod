export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Валидация
    if (!body.title || typeof body.title !== 'string') {
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: 'Title is required and must be a string'
      });
    }
    
    // Здесь должна быть логика для создания галереи в базе данных
    // Пока возвращаем заглушку
    return {
      success: true,
      message: 'Gallery created successfully',
      data: {
        id: Date.now(),
        title: body.title,
        created_at: new Date().toISOString()
      }
    };
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      data: error.data || error.message
    });
  }
}); 