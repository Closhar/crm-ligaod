<template>
  <div class="kirh-image-field">
    <!-- Миниатюра изображения -->
    <div class="kirh-image-thumbnail" @click="openModal">
      <img
          v-if="imageSource"
          :alt="options.alt || 'Image'"
          :src="imageSource"
          :style="thumbnailStyle"
          class="kirh-image-thumbnail-img"
      />
      <div v-else :style="thumbnailStyle"
           class="kirh-image-placeholder">
        <svg
            class="kirh-image-placeholder-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
          <path
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Модальное окно -->
    <div v-if="modalVisible" class="kirh-image-modal">
      <div class="kirh-image-modal-overlay" @click="closeModal"></div>
      <div class="kirh-image-modal-content">
        <div class="kirh-image-modal-header">
          <h3>{{ fullModalTitle }}</h3>
          <button class="kirh-image-modal-close" @click="closeModal">
            &times;
          </button>
        </div>

        <div class="kirh-image-modal-body">
          <!-- Блок ошибок -->
          <div v-if="currentError" class="kirh-image-modal-error">
            <div class="error-icon">
              <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      fill-rule="evenodd"/>
              </svg>
            </div>
            <div class="error-content">
              <div class="error-title">Ошибка загрузки изображения</div>
              <div class="error-message">{{ currentError }}</div>
            </div>
          </div>

          <!-- Превью изображения -->
          <div v-if="isImageLoading" class="kirh-image-preview-loader">
            <svg class="kirh-spinner" width="40" height="40" viewBox="0 0 40 40">
              <circle class="path" cx="20" cy="20" r="16" fill="none" stroke-width="4"/>
            </svg>
          </div>
          <div v-else-if="imageSource" class="kirh-image-preview-wrapper">
            <img
                :alt="options.alt || 'Image preview'"
                :src="imageSource"
                :style="previewStyle"
                class="kirh-image-preview"
            />
          </div>
          <div v-else class="kirh-image-preview-placeholder">
            <svg
                class="kirh-image-preview-placeholder-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
              ></path>
            </svg>
          </div>

          <!-- Поле загрузки -->
          <div class="kirh-image-upload">
            <label class="kirh-image-upload-label">
              <input
                  ref="fileInput"
                  accept="image/*"
                  class="kirh-image-upload-input"
                  type="file"
                  @change="handleFileUpload"
              />
              <span class="kirh-image-upload-button">
                {{ imageSource ? 'Заменить изображение' : 'Загрузить изображение' }}
              </span>
            </label>

            <button
                class="kirh-image-url-button"
                @click="showUrlInput = true"
            >
              Вставить URL
            </button>

            <button
                v-if="imageSource"
                class="kirh-image-delete-button"
                @click="deleteImage"
            >
              Удалить
            </button>
          </div>

          <!-- URL Input Modal -->
          <div v-if="showUrlInput" class="kirh-image-url-modal">
            <div class="kirh-image-url-modal-content">
              <h4>Вставьте URL изображения или видео</h4>
              <input
                  v-model="urlInput"
                  type="text"
                  placeholder="https://..."
                  class="kirh-image-url-input"
                  @keyup.enter="handleUrlSubmit"
              />
              <div class="kirh-image-url-buttons">
                <button
                    class="kirh-image-url-submit"
                    @click="handleUrlSubmit"
                >
                  Вставить
                </button>
                <button
                    class="kirh-image-url-cancel"
                    @click="showUrlInput = false"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>

          <!-- Информация -->
          <div
              v-if="options.info"
              class="kirh-image-info"
              v-html="options.info"
          ></div>

          <!-- Справка о возможностях загрузки -->
          <div class="kirh-image-info kirh-image-info-hint text-left" style="margin-top: 12px;">
            <b>Возможности загрузки:</b><br>
            • <b>Загрузка с компьютера</b> — выберите файл изображения.<br>
            • <b>Вставка по URL</b> — поддерживаются:<br>
            &nbsp;&nbsp;- <b>Изображения</b> (jpg, png, webp и др.)<br>
            &nbsp;&nbsp;- <b>Видео-превью</b> с <b>YouTube</b>, <b>ВКонтакте</b>, <b>Rutube</b> (вставьте ссылку на видео, превью загрузится автоматически).<br>
            <br>
            <i>Если возникли проблемы с загрузкой — проверьте ссылку или обратитесь к администратору.</i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, watch, onUnmounted} from 'vue';
// Для Nuxt: импортируем useRuntimeConfig
let config;
try {
  // Если Nuxt 3, useRuntimeConfig доступен глобально
  config = useRuntimeConfig();
} catch (e) {
  config = null;
}

export default {
  name: 'KirhImageField',
  props: {
    value: {
      type: String,
      default: ''
    },
    error: {
      type: [String, Array, Object, null],
      default: null
    },
    options: {
      type: Object,
      default: () => ({
        image_path: '',
        thumbnailWidth: 40,
        thumbnailHeight: 40,
        previewWidth: '100%',
        previewMaxHeight: '400px',
        modalTitle: 'Изображение',
        modalTitleAddField: '',
        info: '',
        alt: '',
        // Новые параметры для обработки изображений
        resize: {
          enabled: false,       // Включить обработку изображений
          width: null,          // Ширина (px)
          height: null,         // Высота (px)
          crop: false,          // Обрезать до точных размеров
          quality: 0.8,         // Качество (0-1)
          maxSizeMB: 1,         // Максимальный размер (MB)
          mimeType: 'image/jpeg' // Тип выходного файла
        },
        vkToken: 'vk1.a.3qXnXX7-m2hYJK8dOlBgk2l7KL5cHnYAzeegCCzJ6gG6ektrq5agi3Sj37eB3lfOnh3S6Gz0yWnwury17_Pum1lN5qjnZlS-3qFXsfMAgwr69fqvThzKXowNjuYMJuWsuKIOn9RVfwJOzTGFZj0f05Ntk0gietfXtUIoC3lnpOHugrJAGScI9yXBm9xCF-55lmgb3QXP65-ki7mq5w1psQ'
      })
    },
    rowData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'change', 'clear-error'],
  setup(props, {emit}) {
    const modalVisible = ref(false);
    const fileInput = ref(null);
    const currentError = ref('');
    const showUrlInput = ref(false);
    const urlInput = ref('');
    let errorTimeout = null;
    const isImageLoading = ref(false);

    // Получаем путь к изображению из данных строки
    const imageSource = computed(() => {
      if (props.options.image_path && props.rowData[props.options.image_path]) {
        return props.rowData[props.options.image_path];
      }
      return props.value || '';
    });

    // Стили для миниатюры
    const thumbnailStyle = computed(() => ({
      width: `${props.options.thumbnailWidth || 46}px`,
      height: `${props.options.thumbnailHeight || 31}px`,
      'object-fit': 'cover'
    }));

    // Стили для превью
    const previewStyle = computed(() => ({
      width: props.options.previewWidth || '100%',
      'max-height': props.options.previewMaxHeight || '400px',
      'object-fit': 'contain'
    }));

    // Обработчик изменений ошибки
    watch(() => props.error, (newError) => {
      if (newError) {
        currentError.value = formatError(newError);
        modalVisible.value = true;

        // Автоматическое скрытие ошибки через 5 секунд
        clearTimeout(errorTimeout);
        errorTimeout = setTimeout(() => {
          currentError.value = '';
          emit('clear-error');
        }, 5000);
      } else {
        currentError.value = '';
      }
    }, {immediate: true});

    // Очистка таймера при уничтожении компонента
    onUnmounted(() => {
      clearTimeout(errorTimeout);
    });

    // Форматирование ошибки
    const formatError = (error) => {
      if (!error) return '';

      // Игнорируем ошибку "Файл изображения обязателен" при удалении
      if (typeof error === 'string' && error.includes('Файл изображения обязателен') && !imageSource.value) {
        return '';
      }

      // Laravel validation errors
      if (typeof error === 'object' && error.errors) {
        if (error.errors.image) {
          return error.errors.image.join(', ');
        }
        // Попробуем найти первую ошибку
        const firstErrorKey = Object.keys(error.errors)[0];
        if (firstErrorKey) {
          return Array.isArray(error.errors[firstErrorKey])
              ? error.errors[firstErrorKey].join(', ')
              : error.errors[firstErrorKey];
        }
      }

      // Объект с сообщением
      if (typeof error === 'object' && error.message) {
        return error.message;
      }

      // Массив ошибок
      if (Array.isArray(error)) {
        return error.join(', ');
      }

      // Простая строка
      if (typeof error === 'string') {
        return error;
      }

      // Для других случаев
      return JSON.stringify(error);
    };

    // Открытие модального окна
    const openModal = () => {
      modalVisible.value = true;
    };

    // Закрытие модального окна
    const closeModal = () => {
      modalVisible.value = false;
      emit('clear-error');
    };

    // Обработка загрузки файла
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Проверка типа файла
      if (!file.type.match('image.*')) {
        setError('Пожалуйста, выберите файл изображения');
        return;
      }

      // Проверка размера файла (например, не более 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Размер файла не должен превышать 10MB');
        return;
      }

      try {
        let processedFile = file;

        // Если включена обработка изображений
        if (props.options.resize?.enabled) {
          processedFile = await processImage(file);
        }

        // Чтение файла
        const reader = new FileReader();
        reader.onload = (e) => {
          clearError();
          emit('update:modelValue', processedFile);
          emit('change', processedFile);
        };
        reader.onerror = () => {
          setError('Ошибка при чтении файла');
        };
        reader.readAsDataURL(processedFile);

      } catch (err) {
        setError(err.message || 'Ошибка обработки изображения');
      }
    };

    // Установка ошибки с автоочисткой
    const setError = (message) => {
      currentError.value = message;
      clearTimeout(errorTimeout);
      errorTimeout = setTimeout(() => {
        currentError.value = '';
        emit('clear-error');
      }, 5000);
    };

    // Очистка ошибки
    const clearError = () => {
      currentError.value = '';
      emit('clear-error');
    };

    // Удаление изображения
    const deleteImage = () => {
      clearError();
      emit('update:modelValue', '');
      emit('change', null);
      emit('clear-error');
    };

    // Обработка изображения
    const processImage = (file) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
          img.src = e.target.result;
        };

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;
            const options = props.options.resize;

            // Если заданы размеры для изменения
            if (options.width || options.height) {
              const aspectRatio = width / height;

              if (options.crop) {
                // Обрезка до точных размеров
                width = options.width || width;
                height = options.height || height;
              } else {
                // Масштабирование с сохранением пропорций
                if (options.width && options.height) {
                  // Подгон под максимальные размеры
                  const targetAspect = options.width / options.height;

                  if (aspectRatio > targetAspect) {
                    width = options.width;
                    height = width / aspectRatio;
                  } else {
                    height = options.height;
                    width = height * aspectRatio;
                  }
                } else if (options.width) {
                  height = options.width / aspectRatio;
                  width = options.width;
                } else if (options.height) {
                  width = options.height * aspectRatio;
                  height = options.height;
                }
              }
            }

            canvas.width = width;
            canvas.height = height;

            // Рисуем изображение с учетом обрезки
            if (options.crop && (options.width || options.height)) {
              const sourceAspect = img.width / img.height;
              const targetAspect = width / height;

              let sourceX = 0;
              let sourceY = 0;
              let sourceWidth = img.width;
              let sourceHeight = img.height;

              if (sourceAspect > targetAspect) {
                // Обрезаем по ширине
                sourceWidth = img.height * targetAspect;
                sourceX = (img.width - sourceWidth) / 2;
              } else {
                // Обрезаем по высоте
                sourceHeight = img.width / targetAspect;
                sourceY = (img.height - sourceHeight) / 2;
              }

              ctx.drawImage(
                  img,
                  sourceX, sourceY, sourceWidth, sourceHeight,
                  0, 0, width, height
              );
            } else {
              ctx.drawImage(img, 0, 0, width, height);
            }

            // Конвертируем в blob с заданным качеством
            canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('Ошибка создания изображения'));
                    return;
                  }

                  // Проверяем размер файла
                  if (options.maxSizeMB && (blob.size / (1024 * 1024)) > options.maxSizeMB) {
                    // Если размер превышает максимальный, уменьшаем качество
                    reduceQuality(canvas, options.maxSizeMB, options.mimeType, options.quality || 0.8)
                        .then(resolve)
                        .catch(reject);
                  } else {
                    resolve(new File([blob], file.name, {
                      type: options.mimeType || file.type,
                      lastModified: Date.now()
                    }));
                  }
                },
                options.mimeType || file.type,
                options.quality || 0.8
            );
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = () => {
          reject(new Error('Ошибка загрузки изображения'));
        };

        reader.readAsDataURL(file);
      });
    };

    // Рекурсивное уменьшение качества для достижения нужного размера
    const reduceQuality = (canvas, maxSizeMB, mimeType, initialQuality) => {
      return new Promise((resolve, reject) => {
        let quality = initialQuality;
        let attempts = 0;
        const maxAttempts = 5;

        const tryCompress = () => {
          canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Ошибка создания изображения'));
                  return;
                }

                const sizeMB = blob.size / (1024 * 1024);

                if (sizeMB <= maxSizeMB || attempts >= maxAttempts) {
                  resolve(new File([blob], 'compressed.jpg', {
                    type: mimeType,
                    lastModified: Date.now()
                  }));
                } else {
                  // Уменьшаем качество на 10% каждый раз
                  quality = Math.max(0.1, quality - 0.1);
                  attempts++;
                  setTimeout(tryCompress, 0);
                }
              },
              mimeType,
              quality
          );
        };

        tryCompress();
      });
    };

    // Обработка URL
    const handleUrlSubmit = async () => {
      if (!urlInput.value) {
        setError('Введите URL');
        return;
      }

      try {
        isImageLoading.value = true;
        let imageUrl = urlInput.value;

        // Обработка URL видео
        if (
          urlInput.value.includes('vk.com') ||
          urlInput.value.includes('vk.ru') ||
          urlInput.value.includes('vkvideo.ru')
        ) {
          imageUrl = await getVkVideoPreview(urlInput.value);
        } else if (urlInput.value.includes('rutube.ru')) {
          imageUrl = await getRutubeVideoPreview(urlInput.value);
        } else if (urlInput.value.includes('youtube.com') || urlInput.value.includes('youtu.be')) {
          imageUrl = await getYoutubeVideoPreview(urlInput.value);
        }

        // Если это обычная картинка, используем прокси для обхода CORS
        if (
          !urlInput.value.includes('vk.com') &&
          !urlInput.value.includes('vk.ru') &&
          !urlInput.value.includes('vkvideo.ru') &&
          !urlInput.value.includes('rutube.ru') &&
          !urlInput.value.includes('youtube.com') &&
          !urlInput.value.includes('youtu.be')
        ) {
          imageUrl = urlInput.value;
        }

        // Скачивание изображения
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error('Ошибка загрузки изображения');
          }
          const blob = await response.blob();
          const file = new File([blob], 'downloaded-image.jpg', {
            type: blob.type,
            lastModified: Date.now()
          });

          // Обработка изображения если включена
          let processedFile = file;
          if (props.options.resize?.enabled) {
            processedFile = await processImage(file);
          }

          clearError();
          emit('update:modelValue', processedFile);
          emit('change', processedFile);
          showUrlInput.value = false;
          urlInput.value = '';
          isImageLoading.value = false;

        } catch (err) {
          setError(err.message || 'Ошибка загрузки изображения');
          isImageLoading.value = false;
        }

      } catch (err) {
        setError(err.message || 'Ошибка загрузки изображения');
        isImageLoading.value = false;
      }
    };

    const config = useRuntimeConfig(); // Используем useRuntimeConfig()
    const vkTokenEnv = config.public.VK_TOKEN;

    // Получение превью видео VK
    const getVkVideoPreview = async (url) => {
      try {
        let vkToken = null;
        if (vkTokenEnv) {
          vkToken = vkTokenEnv;
        } else if (props.options && props.options.vkToken) {
          vkToken = props.options.vkToken;
        }
        if (!vkToken) {
          throw new Error(
            'Для работы с видео ВКонтакте необходим токен API. ' +
            'Добавьте VK_TOKEN в .env или vkToken в options компонента. ' +
            'Инструкция по получению токена: ' +
            '1. Создайте Standalone-приложение на https://vk.com/dev ' +
            '2. Получите Standalone-токен с правами на доступ к видео ' +
            '3. Добавьте токен в .env: VK_TOKEN=ваш_токен'
          );
        }

        let ownerId, videoId;
        const videoMatch = url.match(/video(-?\d+)_(\d+)/);
        if (videoMatch) {
          ownerId = videoMatch[1];
          videoId = videoMatch[2];
        } else {
          const urlMatch = url.match(/vk\.com\/video(-?\d+)_(\d+)/);
          if (urlMatch) {
            ownerId = urlMatch[1];
            videoId = urlMatch[2];
          } else {
            throw new Error('Неверный формат URL VK видео. Поддерживаемые форматы:\n' +
                          '1. https://vk.com/video-123456_789\n' +
                          '2. video-123456_789');
          }
        }

        const apiUrl = `https://api.vk.com/method/video.get?videos=${ownerId}_${videoId}&access_token=${vkToken}&v=5.131`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`Ошибка получения данных от VK API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
          switch (data.error.error_code) {
            case 5:
              throw new Error('Недействительный токен VK API. Пожалуйста, проверьте токен и его права доступа');
            case 15:
              throw new Error('Доступ к видео запрещен. Проверьте настройки приватности видео');
            case 203:
              throw new Error('Доступ к видео запрещен настройками приватности');
            case 27:
              throw new Error('Токен не имеет прав на доступ к видео. Добавьте права video в настройках приложения');
            default:
              throw new Error(`Ошибка VK API: ${data.error.error_msg || 'Неизвестная ошибка'}`);
          }
        }

        if (!data.response?.items?.[0]) {
          throw new Error('Видео не найдено. Проверьте правильность URL и доступность видео');
        }

        const video = data.response.items[0];
        if (!video.image) {
          throw new Error('Превью видео не найдено. Возможно, видео недоступно или удалено');
        }
        const imageUrl = video.image;
        let previewUrl;
        if (Array.isArray(imageUrl)) {
          previewUrl = imageUrl[imageUrl.length - 1].url || imageUrl[imageUrl.length - 1];
        } else if (typeof imageUrl === 'object' && imageUrl.url) {
          previewUrl = imageUrl.url;
        } else {
          previewUrl = imageUrl;
        }
        return previewUrl;
      } catch (err) {
        throw new Error(`Ошибка получения превью VK видео: ${err.message}`);
      }
    };

    // Получение превью видео Rutube
    const getRutubeVideoPreview = async (url) => {
      try {
        // Извлекаем ID видео из URL
        const videoIdMatch = url.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/);
        if (!videoIdMatch) {
          throw new Error('Неверный формат URL Rutube видео');
        }

        const videoId = videoIdMatch[1];

        // Используем прокси-сервер для обхода CORS
        const response = await fetch(`https://rutube.ru/api/video/${videoId}/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`Ошибка получения данных от Rutube API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Проверяем наличие превью в объекте root
        if (data.root && data.root.thumbnail_url) {
          return data.root.thumbnail_url;
        }

        // Если не нашли в root, проверяем другие возможные места
        const thumbnailUrl = data.thumbnail_url || 
                           data.thumbnail || 
                           data.preview_url || 
                           data.preview ||
                           (data.video && data.video.thumbnail_url) ||
                           (data.video && data.video.thumbnail);

        if (!thumbnailUrl) {
          throw new Error('Превью видео не найдено');
        }

        return thumbnailUrl;
      } catch (err) {
        throw new Error(`Ошибка получения превью Rutube видео: ${err.message}`);
      }
    };

    // Получение превью видео YouTube
    const getYoutubeVideoPreview = async (url) => {
      // Извлекаем ID видео
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
      if (!videoId) throw new Error('Неверный формат URL YouTube');
      
      // Возвращаем URL превью максимального качества
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    };

    const fullModalTitle = computed(() => {
      let title = props.options.modalTitle || 'Изображение';

      // Если задано поле для добавления к заголовку и есть данные строки
      if (props.options.modalTitleAddField && props.rowData) {
        const additionalValue = props.rowData[props.options.modalTitleAddField];
        if (additionalValue) {
          title += ` ${additionalValue}`;
        }
      }

      return title;
    });

    // Справочная информация по возможностям загрузки
    const defaultInfo = `
      <b>Возможности загрузки:</b><br>
      • <b>Загрузка с компьютера</b> — выберите файл изображения.<br>
      • <b>Вставка по URL</b> — поддерживаются:<br>
      &nbsp;&nbsp;— <b>Изображения</b> (jpg, png, webp и др.)<br>
      &nbsp;&nbsp;— <b>Видео-превью</b> с <b>YouTube</b>, <b>ВКонтакте</b>, <b>Rutube</b> (вставьте ссылку на видео, превью загрузится автоматически).<br>
      <br>
      <b>VK:</b> Для загрузки превью приватных видео требуется рабочий VK API токен.<br>
      <b>Rutube:</b> Превью берётся из официального API Rutube.<br>
      <b>YouTube:</b> Используется стандартное превью ролика.<br>
      <br>
      <i>Если возникли проблемы с загрузкой — проверьте ссылку или обратитесь к администратору.</i>
    `;
    // Если info не задано — используем справку по умолчанию
    if (!props.options.info) {
      props.options.info = defaultInfo;
    }

    return {
      modalVisible,
      fileInput,
      currentError,
      imageSource,
      thumbnailStyle,
      previewStyle,
      openModal,
      closeModal,
      handleFileUpload,
      deleteImage,
      fullModalTitle,
      showUrlInput,
      urlInput,
      handleUrlSubmit,
      isImageLoading
    };
  }
};
</script>

<style scoped>
.kirh-image-field {
  display: inline-block;
  width: 100%;
}

.kirh-image-thumbnail {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kirh-image-thumbnail-img {
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.kirh-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  border-radius: 4px;
  border: 1px dashed #cbd5e1;
}

.kirh-image-placeholder-icon {
  width: 20px;
  height: 20px;
  color: #94a3b8;
}

/* Модальное окно */
.kirh-image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kirh-image-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.kirh-image-modal-content {
  position: relative;
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.kirh-image-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.kirh-image-modal-close {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
}

.kirh-image-modal-close:hover {
  color: #334155;
}

.kirh-image-modal-body {
  padding: 16px;
}

/* Стили для блока ошибок */
.kirh-image-modal-error {
  display: flex;
  align-items: flex-start;
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 6px;
  color: #b91c1c;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-5px);
  }
  40%, 80% {
    transform: translateX(5px);
  }
}

.error-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
}

.error-icon svg {
  width: 20px;
  height: 20px;
  color: #dc2626;
}

.error-content {
  flex: 1;
}

.error-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.error-message {
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: pre-wrap;
}

/* Превью изображения */
.kirh-image-preview-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.kirh-spinner {
  animation: spin 1s linear infinite;
  stroke: #3b82f6;
}

.kirh-spinner .path {
  stroke: #3b82f6;
  stroke-linecap: round;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.kirh-image-preview-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.kirh-image-preview {
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.kirh-image-preview-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border-radius: 4px;
  border: 1px dashed #cbd5e1;
  margin-bottom: 16px;
}

.kirh-image-preview-placeholder-icon {
  width: 48px;
  height: 48px;
  color: #94a3b8;
}

/* Загрузка изображения */
.kirh-image-upload {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.kirh-image-upload-label {
  display: inline-block;
}

.kirh-image-upload-input {
  display: none;
}

.kirh-image-upload-button {
  display: inline-block;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.kirh-image-upload-button:hover {
  background-color: #2563eb;
}

.kirh-image-delete-button {
  padding: 8px 16px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.kirh-image-delete-button:hover {
  background-color: #dc2626;
}

/* Информация */
.kirh-image-info {
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 4px;
  font-size: 14px;
  color: #475569;
  border-left: 3px solid #94a3b8;
}

/* URL Input Modal */
.kirh-image-url-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.kirh-image-url-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.kirh-image-url-modal-content h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
}

.kirh-image-url-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.kirh-image-url-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.kirh-image-url-submit,
.kirh-image-url-cancel {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.kirh-image-url-submit {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.kirh-image-url-submit:hover {
  background-color: #2563eb;
}

.kirh-image-url-cancel {
  background-color: #e2e8f0;
  color: #475569;
  border: none;
}

.kirh-image-url-cancel:hover {
  background-color: #cbd5e1;
}

.kirh-image-url-button {
  padding: 8px 16px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.kirh-image-url-button:hover {
  background-color: #059669;
}
</style>