<template>
  <button
    @click="loadTodayEvents"
    :disabled="isLoadingEvents"
    class="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
  >
    <span v-if="isLoadingEvents" class="flex items-center">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Загрузка...
    </span>
    <span v-else>События сегодня</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  region_title: string;
  site: string;
  hashtags: string;
}>();

const emit = defineEmits<{
  (e: 'update:content', content: string): void;
}>();

const isLoadingEvents = ref(false);

// Функция форматирования даты для шаблона
const formatDateForTemplate = (date: Date): string => {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

// Функция форматирования даты события
const formatEventDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

// Функция форматирования телефона
const formatPhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '').replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
};

// Функция очистки текста от проблемных символов
const cleanText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\0/g, '') // Удаляем нулевые байты
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Удаляем управляющие символы
    .replace(/[ ]{2,}/g, ' ') // Удаляем множественные пробелы
    // Заменяем только самые проблемные символы
    .replace(/[""]/g, '"') // Заменяем кавычки на обычные
    .replace(/['']/g, "'") // Заменяем кавычки на обычные
    .replace(/[–—]/g, '-') // Заменяем тире на обычный дефис
    .replace(/[…]/g, '...') // Заменяем многоточие на обычное
    .trim();
};

// Функция форматирования текста для Telegram
const formatForTelegram = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    // Заменяем только самые проблемные символы
    .replace(/[""]/g, '"') // Заменяем кавычки на обычные
    .replace(/['']/g, "'") // Заменяем кавычки на обычные
    .replace(/[–—]/g, '-') // Заменяем тире на обычный дефис
    .replace(/[…]/g, '...') // Заменяем многоточие на обычное
    .trim();
};

// Функция загрузки событий на сегодня
const loadTodayEvents = async () => {
  try {
    isLoadingEvents.value = true;
    const response = await fetch('https://p.sportrep.ru/api/events?page=1&per_page=15&sort_field=date_from&sort_direction=asc&show=3');
    if (!response.ok) {
      throw new Error('Ошибка при загрузке событий');
    }

    const data = await response.json();

    // Разделяем события на домашние и выездные
    const homeEvents = data.data.filter((event: any) => event.arena !== null);
    const awayEvents = data.data.filter((event: any) => event.arena === null);

    // Формируем шаблон для домашних событий
    const today = new Date();
    let finalTemplate = '';

    // Добавляем домашние события только если они есть
    if (homeEvents.length > 0) {
      let homeTemplate = `<h1>${props.region_title}<br>СПОРТИВНЫЕ СОБЫТИЯ ${formatDateForTemplate(today)}</h1><p></p>`;
      homeEvents.forEach((event: any, index: number) => {
        if (index > 0) {
          homeTemplate += '<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">\n\n';
        }
        if (event.club1 && event.club2) {
          homeTemplate += `<h2>${cleanText(event.competition.title_short)}`;
          if (event.title && event.title !== event.competition.title_short) {
            homeTemplate += ` (${cleanText(event.title)})`;
          }
          homeTemplate += `</h2>\n`;
          homeTemplate += `<h3>${cleanText(event.event_name_top)}</h3>\n\n`;
          if (event.series_count) {
            homeTemplate += `<p><strong>Счет в серии:</strong> ${cleanText(event.series_count)}</p>\n`;
            if (event.series?.description) {
              homeTemplate += `<p>${cleanText(event.series.description)}</p>\n`;
            }
          }
        } else {
          homeTemplate += `<h2>${cleanText(event.event_name)}</h2>\n\n`;
        }
        if (event.arena) {
          // Форматируем время начала события
          const eventTime = event.date_from ? new Date(event.date_from).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '';
          
          // Формируем ссылку на карту
          let mapLink = '';
          if (event.arena.latitude && event.arena.longitude) {
            mapLink = `https://yandex.ru/maps/?pt=${event.arena.longitude},${event.arena.latitude}&z=16&l=map`;
          }
          
          // Отображаем название арены с ссылкой на карту и временем отдельно
          if (mapLink) {
            homeTemplate += `<p>📍 <a href="${mapLink}" target="_blank">${cleanText(event.arena.title)} (на карте)</a>`;
            if (eventTime) {
              homeTemplate += ` - <strong>${eventTime}</strong>`;
            }
            homeTemplate += `</p>\n`;
          } else {
            homeTemplate += `<p>📍 ${cleanText(event.arena.title)}`;
            if (eventTime) {
              homeTemplate += ` - <strong>${eventTime}</strong>`;
            }
            homeTemplate += `</p>\n`;
          }
          homeTemplate += '\n';
          
          // Добавляем информацию о билетах только для домашних матчей
          if (event.free_tickets) {
            homeTemplate += `<p>🆓 Вход свободный</p>\n\n`;
          } else if (event.tickets && typeof event.tickets === 'string') {
            const cleanTickets = cleanText(event.tickets)
              .replace(/<[^>]*>/g, '')
              .replace(/\n\s*\n/g, '\n')
              .trim();
            homeTemplate += `<p>💳 ${cleanTickets}</p>\n\n`;
          }
        }
        
        if (event.streams && event.streams.length > 0) {
          const filteredStreams = event.streams.filter((stream: any) => stream.in_main === 1);
          if (filteredStreams.length > 0) {
            homeTemplate += `<p>📺 Трансляции события:</p>\n<ul>\n`;
            filteredStreams.forEach((stream: any) => {
              homeTemplate += `<li><a href="${stream.link}" target="_blank">${cleanText(stream.title)}</a></li>\n`;
            });
            homeTemplate += `</ul>\n\n`;
          } else {
            homeTemplate += `<p>📺 Ссылок на трансляцию пока нет</p>\n\n`;
          }
        } else {
          homeTemplate += `<p>📺 Ссылок на трансляцию пока нет</p>\n\n`;
        }
        homeTemplate += `<p>🔗 <a href="${props.site}/events/${event.id}" target="_blank">Подробнее</a></p>\n`;
      });
      homeTemplate += `<p><br>${props.hashtags}</p>`;
      finalTemplate += homeTemplate;
    }

    // Добавляем выездные события только если они есть
    if (awayEvents.length > 0) {
      let awayTemplate = '';
      // Добавляем разделитель только если есть домашние события
      if (homeEvents.length > 0) {
        awayTemplate = '<hr style="border: 2px solid #e5e7eb; margin: 30px 0;">\n\n';
      }
      awayTemplate += `<h1>НАШИ НА ВЫЕЗДЕ ${formatDateForTemplate(today)}</h1><p></p>`;
      awayEvents.forEach((event: any, index: number) => {
        if (index > 0) {
          awayTemplate += '<hr style="border: 1px solid #e5e7eb; margin: 20px 0;">\n\n';
        }
        if (event.club1 && event.club2) {
          awayTemplate += `<h2>${cleanText(event.competition.title_short)}`;
          if (event.title && event.title !== event.competition.title_short) {
            awayTemplate += ` (${cleanText(event.title)})`;
          }
          awayTemplate += `</h2>\n`;
          awayTemplate += `<h3>${cleanText(event.event_name_top)}</h3>\n\n`;
          if (event.series_count) {
            awayTemplate += `<p><strong>Счет в серии:</strong> ${cleanText(event.series_count)}</p>\n`;
            if (event.series?.description) {
              awayTemplate += `<p>${cleanText(event.series.description)}</p>\n`;
            }
          }
        } else {
          awayTemplate += `<h2>${cleanText(event.event_name)}</h2>\n\n`;
        }
        
        // Форматируем время начала события
        const eventTime = event.date_from ? new Date(event.date_from).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        }) : '';
        
        // Добавляем информацию об арене для выездных событий, если есть
        if (event.arena && event.arena.title) {
          // Формируем ссылку на карту
          let mapLink = '';
          if (event.arena.latitude && event.arena.longitude) {
            mapLink = `https://yandex.ru/maps/?pt=${event.arena.longitude},${event.arena.latitude}&z=16&l=map`;
          }
          
          // Отображаем название арены с ссылкой на карту и временем отдельно
          if (mapLink) {
            awayTemplate += `<p>📍 <a href="${mapLink}" target="_blank">${cleanText(event.arena.title)} (на карте)</a>`;
            if (eventTime) {
              awayTemplate += ` - <strong>${eventTime}</strong>`;
            }
            awayTemplate += `</p>\n`;
          } else {
            awayTemplate += `<p>📍 ${cleanText(event.arena.title)}`;
            if (eventTime) {
              awayTemplate += ` - <strong>${eventTime}</strong>`;
            }
            awayTemplate += `</p>\n`;
          }
          awayTemplate += '\n';
        } else if (eventTime) {
          // Если нет арены, но есть время, показываем только время
          awayTemplate += `<p>🕐 <strong>${eventTime}</strong></p>\n\n`;
        }
        
        if (event.streams && event.streams.length > 0) {
          const filteredStreams = event.streams.filter((stream: any) => stream.in_main === 1);
          if (filteredStreams.length > 0) {
            awayTemplate += `<p>📺 Трансляции события:</p>\n<ul>\n`;
            filteredStreams.forEach((stream: any) => {
              awayTemplate += `<li><a href="${stream.link}" target="_blank">${cleanText(stream.title)}</a></li>\n`;
            });
            awayTemplate += `</ul>\n\n`;
          } else {
            awayTemplate += `<p>📺 Ссылок на трансляцию пока нет</p>\n\n`;
          }
        } else {
          awayTemplate += `<p>📺 Ссылок на трансляцию пока нет</p>\n\n`;
        }
        awayTemplate += `<p>🔗 <a href="${props.site}/events/${event.id}" target="_blank">Подробнее</a></p>\n`;
      });
      awayTemplate += `<p><br>${props.hashtags}</p>`;
      finalTemplate += awayTemplate;
    }

    // Отправляем сформированный шаблон в родительский компонент
    emit('update:content', finalTemplate);

  } catch (error) {
    console.error('Ошибка при загрузке событий:', error);
    alert('Не удалось загрузить события');
  } finally {
    isLoadingEvents.value = false;
  }
};
</script>