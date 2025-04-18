export default defineEventHandler(async (event) => {
  // Получаем параметры запроса
  const query = getQuery(event);
  const searchTerm = query.q?.toLowerCase() || '';
  
  // Демо-данные пользователей
  const users = [
    { id: 1, name: 'Иванов Иван', email: 'ivanov@example.com', count: 42 },
    { id: 2, name: 'Петров Петр', email: 'petrov@example.com', count: 28 },
    { id: 3, name: 'Сидоров Сидор', email: 'sidorov@example.com', count: 15 },
    { id: 4, name: 'Иванова Мария', email: 'ivanova@example.com', count: 37 },
    { id: 5, name: 'Петрова Анна', email: 'petrova@example.com', count: 19 },
    { id: 6, name: 'Сидорова Елена', email: 'sidorova@example.com', count: 23 },
    { id: 7, name: 'Иванов Алексей', email: 'ivanov.a@example.com', count: 8 },
    { id: 8, name: 'Петров Александр', email: 'petrov.a@example.com', count: 12 },
    { id: 9, name: 'Сидоров Николай', email: 'sidorov.n@example.com', count: 5 },
    { id: 10, name: 'Иванова Ольга', email: 'ivanova.o@example.com', count: 31 }
  ];
  
  // Фильтрация пользователей по поисковому запросу
  let filteredUsers = users;
  if (searchTerm) {
    filteredUsers = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) || 
      user.email.toLowerCase().includes(searchTerm)
    );
  }
  
  // Имитация задержки сети
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Возвращаем результаты
  return filteredUsers.slice(0, 5); // Ограничиваем до 5 результатов
}); 