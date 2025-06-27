export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { q, type } = query;
    
    // Тестовые данные спортов
    const sports = [
      { id: 1, title: 'Футбол' },
      { id: 2, title: 'Баскетбол' },
      { id: 3, title: 'Волейбол' },
      { id: 4, title: 'Хоккей' },
      { id: 5, title: 'Теннис' },
      { id: 6, title: 'Плавание' },
      { id: 7, title: 'Легкая атлетика' },
      { id: 8, title: 'Бокс' },
      { id: 9, title: 'Борьба' },
      { id: 10, title: 'Гимнастика' }
    ];
    
    // Если есть поисковый запрос, фильтруем результаты
    if (q) {
      const filteredSports = sports.filter(sport => 
        sport.title.toLowerCase().includes(q.toLowerCase())
      );
      return filteredSports;
    }
    
    // Если запрошен async тип, возвращаем все
    if (type === 'async') {
      return sports;
    }
    
    // По умолчанию возвращаем первые 10
    return sports.slice(0, 10);
  } catch (error) {
    console.error('Error getting sports:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    });
  }
}); 