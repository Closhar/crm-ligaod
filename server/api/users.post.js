export default defineEventHandler(async (event) => {
  try {
    // Получаем данные формы из запроса
    const body = await readBody(event);
    
    // Имитация проверки данных
    const errors = {};
    
    if (!body.username || body.username.trim() === '') {
      errors.username = ['Имя пользователя обязательно для заполнения'];
    }
    
    if (!body.email || body.email.trim() === '') {
      errors.email = ['Email обязателен для заполнения'];
    } else if (!body.email.includes('@')) {
      errors.email = ['Неверный формат email'];
    }
    
    // Если есть ошибки, возвращаем их
    if (Object.keys(errors).length > 0) {
      setResponseStatus(event, 422);
      return {
        success: false,
        message: 'Ошибка валидации',
        errors
      };
    }
    
    // Имитация задержки сохранения
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Имитация успешного сохранения
    return {
      success: true,
      message: 'Пользователь успешно создан',
      data: {
        id: Math.floor(Math.random() * 1000) + 1,
        ...body,
        created_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    setResponseStatus(event, 500);
    return {
      success: false,
      message: 'Ошибка сервера',
      error: error.message
    };
  }
}); 