<template>
  <button
    @click="showDatePicker = true"
    :disabled="isLoading"
    class="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
  >
    <span v-if="isLoading" class="flex items-center">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Загрузка...
    </span>
    <span v-else>Итоги дня</span>
  </button>

  <!-- Модальное окно выбора даты -->
  <div v-if="showDatePicker" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg w-full max-w-md mx-4">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">Выберите дату</h3>
      </div>
      <div class="p-4">
        <input
          type="date"
          v-model="selectedDate"
          class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div class="p-4 border-t flex justify-end space-x-3">
        <button
          @click="showDatePicker = false"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          @click="loadEventsByDate"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Загрузить
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

interface Props {
  region_title: string;
  hashtags: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:content']);

const showDatePicker = ref(false);
const isLoading = ref(false);
const selectedDate = ref('');

// Интерфейсы для событий
interface Stream {
  id: number;
  title: string;
  link: string;
  in_player: number;
  in_profile: number;
}

interface City {
  id: number;
  title: string;
}

interface Arena {
  id: number;
  title: string;
  address: string;
  city: City;
  phones: string;
  map?: string;
}

interface Sport {
  id: number;
  title: string;
  title_short: string;
  icon: string;
  event_name: string;
}

interface Gender {
  id: number;
  title: string;
  title_short: string;
  icon: string;
}

interface Competition {
  id: number;
  title: string;
  title_short: string;
  sport: Sport;
  gender: Gender;
}

interface Event {
  id: number;
  event_name: string;
  event_name_top: string;
  date_from: string;
  time: string;
  arena: {
    title: string;
    address: string;
    phones: string;
    map: string;
  } | null;
  club1: any;
  club2: any;
  competition: {
    title_short: string;
  };
  title: string;
  about: string;
  streams: Array<{
    title: string;
    link: string;
    in_player: number;
    in_profile: number;
  }>;
  series_count: number;
  series: {
    description: string;
  };
  free_tickets: boolean;
  tickets: string;
  report: string;
  target: any;
}

interface EventsResponse {
  data: Event[];
}

// Функция форматирования HTML в Markdown для телеграм
const formatForTelegram = (html: string): string => {
  // Заменяем HTML-теги на Markdown
  let markdown = html
    // Заголовки
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '*$1*\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '*$1*\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '*$1*\n\n')
    // Жирный текст
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '*$1*')
    // Курсив
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_')
    // Ссылки
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Параграфы
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Переносы строк
    .replace(/<br\s*\/?>/gi, '\n')
    // Удаляем оставшиеся HTML-теги
    .replace(/<[^>]*>/g, '')
    // Декодируем HTML-сущности
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Убираем лишние переносы строк, но сохраняем разделители
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')  // Заменяем 3 и более переноса на 2
    .replace(/([^\n])\n➖➖➖➖➖➖➖➖➖➖/g, '$1\n\n➖➖➖➖➖➖➖➖➖➖')  // Добавляем перенос перед разделителем
    .replace(/➖➖➖➖➖➖➖➖➖➖\n([^\n])/g, '➖➖➖➖➖➖➖➖➖➖\n\n$1')  // Добавляем перенос после разделителя
    .trim();

  return markdown;
};

// Функция загрузки событий по дате
const loadEventsByDate = async () => {
  if (!selectedDate.value) {
    alert('Пожалуйста, выберите дату');
    return;
  }

  try {
    isLoading.value = true;
    const response = await fetch(`https://p.sportrep.ru/api/events?per_page=100&is_active=1&region_id=1&show_native=1&sort=date_from_asc&date_from=${selectedDate.value}`);
    
    if (!response.ok) {
      throw new Error('Ошибка при загрузке событий');
    }

    const data: EventsResponse = await response.json();
    const events = data.data;

    if (events.length === 0) {
      alert('Нет событий за выбранную дату');
      return;
    }

    // Форматируем дату для заголовка
    const formatDateForTemplate = (date: Date): string => {
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    };

    // Форматируем события для отображения
    let formattedContent = `*ИТОГИ СПОРТИВНОГО ДНЯ ${formatDateForTemplate(new Date(selectedDate.value))}*\n*${props.region_title}*\n\n`;
    
    events.forEach((event, index) => {
      if (index > 0) {
        formattedContent += '➖➖➖➖➖➖➖➖➖➖\n\n';
      }
      if (event.club1 && event.club2) {
        formattedContent += `*${event.competition.title_short}*\n`;
        formattedContent += `*${event.event_name}*\n`;
      } else {
        formattedContent += `*${event.event_name}*\n`;
      }
      if (event.arena) {
        formattedContent += `📍 ${event.arena.title}\n`;
      }
      if (event.series_count) {
        formattedContent += `📊 Счет в серии: ${event.series_count}\n`;
        if (event.series?.description) {
          formattedContent += `${event.series.description}\n`;
        }
      }
      if (event.report) {
        const formattedReport = formatForTelegram(event.report)
          .split('\n')
          .filter(line => line.trim().length > 0)
          .join('\n');
        formattedContent += `${formattedReport}\n`;
      }
      formattedContent += '\n';
    });

    // Добавляем хэштеги в конец
    formattedContent += props.hashtags;

    // Отправляем отформатированный контент в родительский компонент
    emit('update:content', formattedContent);
    
    // Закрываем модальное окно
    showDatePicker.value = false;

  } catch (error) {
    console.error('Ошибка при загрузке событий:', error);
    alert(`Произошла ошибка при загрузке событий: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  } finally {
    isLoading.value = false;
  }
};
</script> 