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
      let homeTemplate = `*${props.region_title}\nСПОРТИВНЫЕ СОБЫТИЯ ${formatDateForTemplate(today)}*\n\n`;
      homeEvents.forEach((event: any, index: number) => {
        if (index > 0) {
          homeTemplate += '➖➖➖➖➖➖➖➖➖➖\n\n';
        }
        if (event.club1 && event.club2) {
          homeTemplate += `*${event.competition.title_short}*\n`;
          homeTemplate += `*${event.event_name_top}*\n`;
          if (event.title && event.title !== event.competition.title_short) {
            homeTemplate += `*${event.title}*\n\n`;
          } else {
            homeTemplate += '\n';
          }
          if (event.series_count) {
            homeTemplate += `Счет в серии: ${event.series_count}\n`;
            if (event.series?.description) {
              homeTemplate += `${event.series.description}\n`;
            }
          }
        } else {
          homeTemplate += `*${event.event_name}*\n\n`;
        }
        if (event.arena) {
          homeTemplate += `📍 ${event.arena.title}\n`;
          if (event.arena.map && typeof event.arena.map === 'string') {
            const mapUrl = event.arena.map.match(/src="([^"]+)"/)?.[1];
            if (mapUrl) {
              homeTemplate += `🗺 [Открыть на карте](${mapUrl})\n`;
            }
          }
          if (event.arena.address) {
            let address = event.arena.address.replace(/<br\s*\/?>/g, '').trimEnd();
            homeTemplate += `🏟 ${address}`;
          }
          if (event.arena.phones) {
            const phones = event.arena.phones.split(',')
              .map((phone: string) => phone.split('|')[0].trim())
              .map(formatPhone)
              .join(', ');
            homeTemplate += `\n📞 ${phones}`;
          }
          homeTemplate += '\n\n';
          
          // Добавляем информацию о билетах только для домашних матчей
          if (event.free_tickets) {
            homeTemplate += `🆓 Вход свободный\n\n`;
          } else if (event.tickets && typeof event.tickets === 'string') {
            const cleanTickets = event.tickets
              .replace(/<[^>]*>/g, '')
              .replace(/\n\s*\n/g, '\n')
              .trim();
            homeTemplate += `💳 ${cleanTickets}\n\n`;
          }
        }
        
        homeTemplate += `📅 ${formatEventDate(event.date_from)}\n⏰ Время начала: *${event.time}*\n\n`;
        if (event.about && typeof event.about === 'string') {
          const cleanAbout = formatForTelegram(event.about);
          homeTemplate += `${cleanAbout}\n\n`;
        }
        if (event.streams && event.streams.length > 0) {
          const filteredStreams = event.streams.filter((stream: any) => stream.in_player === 0 && stream.in_profile === 0);
          if (filteredStreams.length > 0) {
            homeTemplate += '*📺 Трансляции события:*\n';
            filteredStreams.forEach((stream: any) => {
              homeTemplate += `• [${stream.title}](${stream.link})\n`;
            });
            homeTemplate += '\n';
          } else {
            homeTemplate += '*📺 Ссылок на трансляцию пока нет*\n\n';
          }
        } else {
          homeTemplate += '*📺 Ссылок на трансляцию пока нет*\n\n';
        }
        homeTemplate += `🔗 [Подробнее](${`${props.site}/events/${event.id}`})\n`;
      });
      homeTemplate += '\n' + props.hashtags;
      finalTemplate += homeTemplate;
    }

    // Добавляем выездные события только если они есть
    if (awayEvents.length > 0) {
      let awayTemplate = '';
      // Добавляем разделитель только если есть домашние события
      if (homeEvents.length > 0) {
        awayTemplate = '\n\n';
      }
      awayTemplate += `*НАШИ НА ВЫЕЗДЕ ${formatDateForTemplate(today)}*\n\n`;
      awayEvents.forEach((event: any, index: number) => {
        if (index > 0) {
          awayTemplate += '\n\n➖➖➖➖➖➖➖➖➖➖\n\n';
        }
        if (event.club1 && event.club2) {
          awayTemplate += `*${event.competition.title_short}*\n`;
          awayTemplate += `*${event.event_name_top}*\n`;
          if (event.title && event.title !== event.competition.title_short) {
            awayTemplate += `*${event.title}*\n\n`;
          } else {
            awayTemplate += '\n';
          }
          if (event.series_count) {
            awayTemplate += `Счет в серии: ${event.series_count}\n`;
            if (event.series?.description) {
              awayTemplate += `${event.series.description}\n`;
            }
          }
        } else {
          awayTemplate += `*${event.event_name}*\n`;
        }
        awayTemplate += `\n\n📅 ${formatEventDate(event.date_from)}\n⏰ Время начала: *${event.time}*\n\n`;
        if (event.about && typeof event.about === 'string') {
          const cleanAbout = formatForTelegram(event.about);
          awayTemplate += `${cleanAbout}\n\n`;
        }
        if (event.streams && event.streams.length > 0) {
          const filteredStreams = event.streams.filter((stream: any) => stream.in_player === 0 && stream.in_profile === 0);
          if (filteredStreams.length > 0) {
            awayTemplate += '*📺 Трансляции события:*\n';
            filteredStreams.forEach((stream: any) => {
              awayTemplate += `• [${stream.title}](${stream.link})\n`;
            });
            awayTemplate += '\n';
          } else {
            awayTemplate += '*📺 Ссылок на трансляцию пока нет*\n\n';
          }
        } else {
          awayTemplate += '*📺 Ссылок на трансляцию пока нет*\n\n';
        }
        awayTemplate += `🔗 [Подробнее](${`${props.site}/events/${event.id}`})\n`;
      });
      awayTemplate += '\n' + props.hashtags;
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