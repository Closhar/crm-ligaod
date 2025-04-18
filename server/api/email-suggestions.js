export default defineEventHandler(async (event) => {
  // Получаем параметры запроса
  const query = getQuery(event);
  const searchTerm = query.q?.toLowerCase() || '';
  const checkDuplicates = query.check_duplicates === 'true';
  
  // Демо-данные существующих email
  const existingEmails = [
    { email: 'ivanov@example.com', count: 1 },
    { email: 'petrov@example.com', count: 1 },
    { email: 'sidorov@example.com', count: 1 },
    { email: 'info@example.com', count: 5 },
    { email: 'support@example.com', count: 3 },
    { email: 'admin@example.com', count: 2 },
    { email: 'mail@example.com', count: 8 },
    { email: 'contact@example.com', count: 4 },
    { email: 'test@example.com', count: 12 },
    { email: 'user@example.com', count: 7 }
  ];
  
  // Если не проверяем дубликаты, возвращаем пустой массив
  if (!checkDuplicates) {
    return [];
  }
  
  // Фильтрация email по поисковому запросу
  let filteredEmails = existingEmails;
  if (searchTerm) {
    filteredEmails = existingEmails.filter(item => 
      item.email.toLowerCase().includes(searchTerm)
    );
  }
  
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Возвращаем результаты с пометкой о том, что это дубликаты
  return filteredEmails.map(item => ({
    name: item.email, 
    count: item.count,
    message: item.count > 1 
      ? `Этот email используется ${item.count} раз` 
      : 'Этот email уже используется'
  })).slice(0, 5);
}); 