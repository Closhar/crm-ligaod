export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');
    
    // Здесь должна быть логика получения данных с бэкенда
    // Пока что возвращаем тестовые данные
    console.log('Getting arena data for ID:', id);
    
    return {
      id: parseInt(id),
      title: 'Тестовое спортсооружение',
      sports: [
        {
          id: 1,
          title: 'Футбол'
        },
        {
          id: 2,
          title: 'Баскетбол'
        }
      ],
      sports_count: 2
    };
  } catch (error) {
    console.error('Error getting arena data:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    });
  }
}); 