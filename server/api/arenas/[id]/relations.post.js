export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { relation_type, relation_ids } = body;
    
    // Здесь должна быть логика сохранения отношений на бэкенде
    // Пока что просто возвращаем успешный ответ для тестирования
    console.log('Saving relations for arena:', {
      id: getRouterParam(event, 'id'),
      relation_type,
      relation_ids
    });
    
    return {
      success: true,
      message: 'Relations saved successfully',
      relation_type,
      relation_ids
    };
  } catch (error) {
    console.error('Error saving relations:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    });
  }
}); 