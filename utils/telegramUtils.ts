// Функция для конвертации HTML в MarkdownV2 для Telegram
export const convertToTelegramText = (html: string): string => {
  console.log('=== НАЧАЛО КОНВЕРТАЦИИ ===');
  console.log('Исходный HTML:', html.substring(0, 500));
  
  let text = html;
  
  // Сначала обрабатываем ссылки - заменяем <a href="url">текст</a> на [текст](url)
  text = text.replace(/<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi, '[$2]($1)');
  console.log('После обработки ссылок:', text.substring(0, 300));
  
  // Обрабатываем жирный текст - заменяем <strong>, <b> на **текст**
  text = text.replace(/<(strong|b)>([^<]+)<\/(strong|b)>/gi, '**$2**');
  console.log('После обработки жирного текста:', text.substring(0, 300));
  
  // Обрабатываем заголовки - заменяем <h1>, <h2>, <h3>, <h4> на **текст**
  text = text.replace(/<h[1-6]>([^<]+)<\/h[1-6]>/gi, '**$1**');
  console.log('После обработки заголовков:', text.substring(0, 300));
  
  // Обрабатываем списки - заменяем <ul><li> на • 
  text = text.replace(/<ul>\s*<li>([^<]+)<\/li>\s*<\/ul>/gi, '• $1');
  text = text.replace(/<li>([^<]+)<\/li>/gi, '• $1');
  console.log('После обработки списков:', text.substring(0, 300));
  
  // Обрабатываем горизонтальные линии
  text = text.replace(/<hr[^>]*>/gi, '\n➖➖➖➖➖➖➖➖➖➖\n');
  
  // Обрабатываем переносы строк в параграфах
  text = text.replace(/<p[^>]*>([^<]*)<\/p>/gi, '$1\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Удаляем остальные HTML-теги
  text = text.replace(/<[^>]*>/g, '');
  console.log('После удаления HTML тегов:', text.substring(0, 300));
  
  // Декодируем HTML-сущности
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&hellip;/g, '...');
  
  // Убираем проблемные символы
  text = text
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[…]/g, '...');
  
  // Убираем лишние пробелы и переносы
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();

  console.log('Перед исправлением непарных символов:', text.substring(0, 300));
  console.log('Количество звездочек:', (text.match(/\*/g) || []).length);
  console.log('Количество квадратных скобок [:', (text.match(/\[/g) || []).length);
  console.log('Количество квадратных скобок ]:', (text.match(/\]/g) || []).length);
  console.log('Количество круглых скобок (:', (text.match(/\(/g) || []).length);
  console.log('Количество круглых скобок ):', (text.match(/\)/g) || []).length);

  // Исправляем непарные символы разметки
  text = fixUnpairedMarkdown(text);

  console.log('После исправления непарных символов:', text.substring(0, 300));
  console.log('=== КОНЕЦ КОНВЕРТАЦИИ ===');

  return text;
};

// Функция для разбивки длинного текста на части
export const splitLongMessage = (text: string, maxLength: number = 4000): string[] => {
  const parts: string[] = [];
  const eventSeparator = '➖➖➖➖➖➖➖➖➖➖';
  const awaySectionSeparator = 'НАШИ НА ВЫЕЗДЕ';
  
  // Проверяем, есть ли раздел "НАШИ НА ВЫЕЗДЕ"
  if (text.includes(awaySectionSeparator)) {
    // Разделяем текст на основную часть и "НАШИ НА ВЫЕЗДЕ"
    const mainPart = text.substring(0, text.indexOf(awaySectionSeparator)).trim();
    const awayPart = text.substring(text.indexOf(awaySectionSeparator)).trim();
    
    // Обрабатываем основную часть
    if (mainPart) {
      const mainEvents = mainPart.split(eventSeparator);
      let currentPart = '';
      
      for (let i = 0; i < mainEvents.length; i++) {
        const event = mainEvents[i];
        const eventWithSeparator = i < mainEvents.length - 1 ? event + '\n\n' + eventSeparator : event;
        
        if ((currentPart + eventWithSeparator).length > maxLength && currentPart.trim()) {
          parts.push(currentPart.trim());
          currentPart = eventWithSeparator;
        } else {
          currentPart += eventWithSeparator;
        }
      }
      
      if (currentPart.trim()) {
        parts.push(currentPart.trim());
      }
    }
    
    // Обрабатываем часть "НАШИ НА ВЫЕЗДЕ" как отдельное сообщение
    if (awayPart) {
      parts.push(awayPart);
    }
  } else {
    // Если нет раздела "НАШИ НА ВЫЕЗДЕ", разбиваем по событиям
    const events = text.split(eventSeparator);
    let currentPart = '';
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const eventWithSeparator = i < events.length - 1 ? event + '\n\n' + eventSeparator : event;
      
      if ((currentPart + eventWithSeparator).length > maxLength && currentPart.trim()) {
        parts.push(currentPart.trim());
        currentPart = eventWithSeparator;
      } else {
        currentPart += eventWithSeparator;
      }
    }
    
    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }
  }
  
  // Если текст не разбился на части, но превышает лимит, разбиваем принудительно
  if (parts.length === 0 && text.length > maxLength) {
    const lines = text.split('\n');
    let currentPart = '';
    
    for (const line of lines) {
      if ((currentPart + line + '\n').length > maxLength) {
        if (currentPart.trim()) {
          parts.push(currentPart.trim());
        }
        currentPart = line + '\n';
      } else {
        currentPart += line + '\n';
      }
    }
    
    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }
  }
  
  return parts.length > 0 ? parts : [text];
};

// Функция для исправления непарных символов разметки
const fixUnpairedMarkdown = (text: string): string => {
  let result = text;
  
  // Исправляем непарные звездочки - добавляем недостающую в конце
  const asteriskCount = (result.match(/\*/g) || []).length;
  if (asteriskCount % 2 !== 0) {
    result += '*';
    console.log('Добавлена недостающая звездочка в конце');
  }
  
  // Исправляем непарные подчеркивания - добавляем недостающее в конце
  const underscoreCount = (result.match(/_/g) || []).length;
  if (underscoreCount % 2 !== 0) {
    result += '_';
    console.log('Добавлено недостающее подчеркивание в конце');
  }
  
  // Исправляем непарные квадратные скобки
  const bracketCount = (result.match(/\[/g) || []).length - (result.match(/\]/g) || []).length;
  if (bracketCount > 0) {
    result += ']'.repeat(bracketCount);
    console.log(`Добавлено ${bracketCount} недостающих закрывающих скобок ]`);
  } else if (bracketCount < 0) {
    result = '['.repeat(-bracketCount) + result;
    console.log(`Добавлено ${-bracketCount} недостающих открывающих скобок [`);
  }
  
  // Исправляем непарные круглые скобки
  const parenCount = (result.match(/\(/g) || []).length - (result.match(/\)/g) || []).length;
  if (parenCount > 0) {
    result += ')'.repeat(parenCount);
    console.log(`Добавлено ${parenCount} недостающих закрывающих скобок )`);
  } else if (parenCount < 0) {
    result = '('.repeat(-parenCount) + result;
    console.log(`Добавлено ${-parenCount} недостающих открывающих скобок (`);
  }
  
  return result;
}; 