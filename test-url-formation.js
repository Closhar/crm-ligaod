/**
 * Тест логики формирования URL для асинхронных селектов
 */

// Функция формирования URL (как в исправленном KirhSelectField)
function formApiUrl(apiUrl, endpoint) {
    let finalUrl;
    
    if (endpoint.startsWith('/')) {
        // Если API_URL уже содержит /api, не добавляем его
        if (apiUrl.endsWith('/api')) {
            finalUrl = `${apiUrl}${endpoint}`;
        } else {
            finalUrl = `${apiUrl}/api${endpoint}`;
        }
    } else {
        // Если API_URL уже содержит /api, не добавляем его
        if (apiUrl.endsWith('/api')) {
            finalUrl = `${apiUrl}/${endpoint}`;
        } else {
            finalUrl = `${apiUrl}/api/${endpoint}`;
        }
    }
    
    return finalUrl;
}

// Тестируем разные варианты
console.log('🔧 Тестируем исправление API endpoints\n');

console.log('1. API_URL с /api, endpoint с /:');
console.log('API_URL:', 'https://p.sportrep.ru/api');
console.log('Endpoint:', '/people/clubs');
console.log('Result:', formApiUrl('https://p.sportrep.ru/api', '/people/clubs'));
console.log('Expected:', 'https://p.sportrep.ru/api/people/clubs');
console.log('---');

console.log('2. API_URL без /api, endpoint с /:');
console.log('API_URL:', 'https://p.sportrep.ru');
console.log('Endpoint:', '/people/clubs');
console.log('Result:', formApiUrl('https://p.sportrep.ru', '/people/clubs'));
console.log('Expected:', 'https://p.sportrep.ru/api/people/clubs');
console.log('---');

console.log('3. API_URL с /api, endpoint без /:');
console.log('API_URL:', 'https://p.sportrep.ru/api');
console.log('Endpoint:', 'people/clubs');
console.log('Result:', formApiUrl('https://p.sportrep.ru/api', 'people/clubs'));
console.log('Expected:', 'https://p.sportrep.ru/api/people/clubs');
console.log('---');

console.log('4. API_URL без /api, endpoint без /:');
console.log('API_URL:', 'https://p.sportrep.ru');
console.log('Endpoint:', 'people/clubs');
console.log('Result:', formApiUrl('https://p.sportrep.ru', 'people/clubs'));
console.log('Expected:', 'https://p.sportrep.ru/api/people/clubs');
console.log('---');

console.log('✅ Тест завершен'); 