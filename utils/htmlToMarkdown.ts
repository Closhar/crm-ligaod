/**
 * Утилита для конвертации HTML в Markdown
 * Поддерживает: жирный, курсив, пустые строки, эмодзи, ссылки, списки
 */

export function htmlToMarkdown(html: string): string {
  let text = html;
  
  // Обрабатываем ссылки
  text = text.replace(/<a\s+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, url, linkText) => {
    // Очищаем linkText от HTML тегов
    const cleanLinkText = linkText.replace(/<[^>]*>/g, '').trim();
    return `[${cleanLinkText}](${url})`;
  });
  
  // Обрабатываем жирный текст - используем одну звездочку
  text = text.replace(/<(strong|b)>([\s\S]*?)<\/(strong|b)>/gi, '*$2*');
  
  // Обрабатываем курсив - используем подчеркивание
  text = text.replace(/<(em|i)>([\s\S]*?)<\/(em|i)>/gi, '_$2_');
  
  // Обрабатываем заголовки - делаем жирными с одной звездочкой
  text = text.replace(/<h1>([\s\S]*?)<\/h1>/gi, '*$1*\n');
  text = text.replace(/<h2>([\s\S]*?)<\/h2>/gi, '*$1*\n');
  text = text.replace(/<h3>([\s\S]*?)<\/h3>/gi, '*$1*\n');
  text = text.replace(/<h4>([\s\S]*?)<\/h4>/gi, '*$1*\n');
  text = text.replace(/<h5>([\s\S]*?)<\/h5>/gi, '*$1*\n');
  text = text.replace(/<h6>([\s\S]*?)<\/h6>/gi, '*$1*\n');
  
  // Обрабатываем списки
  text = text.replace(/<ul>\s*<li>([^<]+)<\/li>\s*<\/ul>/gi, '• $1\n');
  text = text.replace(/<li>([^<]+)<\/li>/gi, '• $1\n');
  
  // Обрабатываем нумерованные списки
  text = text.replace(/<ol>\s*<li>([^<]+)<\/li>\s*<\/ol>/gi, '1. $1\n');
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    const items = content.match(/<li>([^<]+)<\/li>/gi) || [];
    return items.map((item: string, index: number) => {
      const text = item.replace(/<li>([^<]+)<\/li>/i, '$1');
      return `${index + 1}. ${text}`;
    }).join('\n') + '\n';
  });
  
  // Обрабатываем горизонтальные линии
  text = text.replace(/<hr[^>]*>/gi, '\n➖➖➖➖➖➖➖➖➖➖\n');
  
  // Обрабатываем параграфы
  text = text.replace(/<p[^>]*>([^<]*)<\/p>/gi, '$1\n\n');
  
  // Обрабатываем переносы строк
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Обрабатываем блоки кода
  text = text.replace(/<code>([^<]+)<\/code>/gi, '`$1`');
  text = text.replace(/<pre>([^<]+)<\/pre>/gi, '```\n$1\n```');
  
  // Обрабатываем цитаты
  text = text.replace(/<blockquote>([^<]+)<\/blockquote>/gi, '> $1\n');
  
  // Удаляем остальные HTML-теги
  text = text.replace(/<[^>]*>/g, '');
  
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
  
  // Обрабатываем эмодзи - заменяем проблемные на безопасные
  text = text
    .replace(/\*️⃣/g, '⭐')  // Заменяем эмодзи со звездочкой
    .replace(/📣/g, '📢')
    .replace(/🥇/g, '🏆')
    .replace(/🎊/g, '🎉')
    .replace(/🎵/g, '🎶')
    .replace(/✨/g, '⭐')
    .replace(/🙌/g, '👍');
  
  // Убираем лишние пробелы и переносы
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();

  return text;
}

/**
 * Конвертация в MarkdownV2 для Telegram
 */
export function htmlToTelegramMarkdown(html: string): string {
  let text = htmlToMarkdown(html);
  
  // Экранируем специальные символы для MarkdownV2
  const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
  
  specialChars.forEach(char => {
    const regex = new RegExp(`\\${char}`, 'g');
    text = text.replace(regex, `\\${char}`);
  });
  
  return text;
}

/**
 * Проверка на критические проблемы с Markdown
 */
export function hasCriticalMarkdownIssues(text: string): boolean {
  const criticalIssues = 
    (text.includes('*') && !text.includes('*')) ||
    (text.includes('[') && !text.includes(']')) ||
    (text.includes('(') && !text.includes(')'));
  
  return criticalIssues;
}

/**
 * Очистка текста от Markdown разметки
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*([^*]+)\*/g, '$1')      // Убираем жирный и заголовки
    .replace(/_([^_]+)_/g, '$1')        // Убираем курсив
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Убираем ссылки
    .replace(/`([^`]+)`/g, '$1')        // Убираем код
    .replace(/^[>\s]+/gm, '')           // Убираем цитаты
    .replace(/^[-*+]\s+/gm, '')         // Убираем списки
    .replace(/^\d+\.\s+/gm, '')         // Убираем нумерованные списки
    .trim();
} 