<template>
  <div class="flex justify-center my-8 space-x-1">
    <!-- Кнопка "Назад" -->
    <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-2 rounded transition-colors"
        :class="{
        'text-gray-400 cursor-not-allowed': currentPage === 1,
        'text-gray-500 hover:text-gray-50': currentPage !== 1,
      }"
    >
      &lt;
    </button>

    <!-- Первая страница (всегда видна) -->
    <button
        @click="goToPage(1)"
        :class="{
        'bg-blue-700 rounded-3xl text-gray-50': currentPage === 1,
        'text-gray-500 hover:text-gray-50': currentPage !== 1,
      }"
        class="px-3 py-2 rounded transition-colors"
    >
      1
    </button>

    <!-- Многоточие после первой страницы -->
    <span
        v-if="showLeftEllipsis"
        class="px-3 py-2 text-gray-500"
    >
      ...
    </span>

    <!-- Основные страницы -->
    <button
        v-for="page in visiblePages"
        :key="page"
        @click="goToPage(page)"
        :class="{
        'bg-blue-700 rounded-3xl text-gray-50': currentPage === page,
        'text-gray-500 hover:text-gray-50': currentPage !== page,
      }"
        class="px-3 py-2 rounded transition-colors"
    >
      {{ page }}
    </button>

    <!-- Многоточие перед последней страницей -->
    <span
        v-if="showRightEllipsis"
        class="px-3 py-2 text-gray-500"
    >
      ...
    </span>

    <!-- Последняя страница (всегда видна, кроме случая когда totalPages = 1) -->
    <button
        v-if="totalPages > 1"
        @click="goToPage(totalPages)"
        :class="{
        'bg-blue-700 rounded-3xl text-gray-50': currentPage === totalPages,
        'text-gray-500 hover:text-gray-50': currentPage !== totalPages,
      }"
        class="px-3 py-2 rounded transition-colors"
    >
      {{ totalPages }}
    </button>

    <!-- Кнопка "Вперед" -->
    <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 rounded transition-colors"
        :class="{
        'text-gray-400 cursor-not-allowed': currentPage === totalPages,
        'text-gray-500 hover:text-gray-50': currentPage !== totalPages,
      }"
    >
      &gt;
    </button>
  </div>
</template>

<script setup>
import {computed, ref, onMounted, onBeforeUnmount} from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  scrollToTop: {
    type: Boolean,
    default: true
  },
  scrollTarget: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['page-changed']);

const screenSize = ref('desktop'); // 'mobile', 'small-mobile', 'desktop'

// Определяем размер экрана
const updateScreenSize = () => {
  const width = window.innerWidth;
  if (width <= 480) {
    screenSize.value = 'small-mobile';
  } else if (width <= 768) {
    screenSize.value = 'mobile';
  } else {
    screenSize.value = 'desktop';
  }
};

// Максимальное количество видимых страниц (без учета первой, последней и многоточий)
const maxVisiblePages = computed(() => {
  switch (screenSize.value) {
    case 'small-mobile':
      return 3;
    case 'mobile':
      return 5;
    default:
      return 5; // Уменьшил для более компактного отображения
  }
});

// Показываем левое многоточие, если есть скрытые страницы между первой и видимыми
const showLeftEllipsis = computed(() => {
  return props.currentPage > Math.ceil(maxVisiblePages.value / 2) + 1 &&
      props.totalPages > maxVisiblePages.value + 2;
});

// Показываем правое многоточие, если есть скрытые страницы между видимыми и последней
const showRightEllipsis = computed(() => {
  return props.currentPage < props.totalPages - Math.floor(maxVisiblePages.value / 2) &&
      props.totalPages > maxVisiblePages.value + 2;
});

// Видимые страницы (между первой и последней)
const visiblePages = computed(() => {
  if (props.totalPages <= 2) return []; // Показываем только первую и последнюю (если они разные)

  let startPage, endPage;

  // Если текущая страница близко к началу
  if (props.currentPage <= Math.ceil(maxVisiblePages.value / 2) + 1) {
    startPage = 2; // Начинаем со второй страницы
    endPage = Math.min(startPage + maxVisiblePages.value - 1, props.totalPages - 1);
  }
  // Если текущая страница близко к концу
  else if (props.currentPage >= props.totalPages - Math.floor(maxVisiblePages.value / 2)) {
    endPage = props.totalPages - 1; // Заканчиваем предпоследней
    startPage = Math.max(2, endPage - maxVisiblePages.value + 1);
  }
  // Если текущая страница в середине
  else {
    const half = Math.floor(maxVisiblePages.value / 2);
    startPage = props.currentPage - half;
    endPage = props.currentPage + half;

    // Корректируем границы
    startPage = Math.max(2, startPage);
    endPage = Math.min(props.totalPages - 1, endPage);
  }

  return range(startPage, endPage);
});

// Вспомогательная функция для создания диапазона чисел
const range = (start, end) => {
  const length = end - start + 1;
  return Array.from({length}, (_, i) => start + i);
};

// Обработчик изменения страницы
const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-changed', page);

    // Скролл к верху после изменения страницы
    if (props.scrollToTop) {
      scrollToTarget();
    }
  }
};

// Установка обработчика изменения размера
onMounted(() => {
  updateScreenSize();
  window.addEventListener('resize', updateScreenSize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenSize);
});

const scrollToTarget = () => {
  nextTick(() => {
    let targetElement;

    if (props.scrollTarget) {
      // Ищем элемент по переданному селектору
      targetElement = document.querySelector(props.scrollTarget);
    } else {
      // Ищем ближайший родительский контейнер с пагинацией
      targetElement = document.querySelector('[data-pagination-container]')?.parentElement;
    }

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
};

</script>