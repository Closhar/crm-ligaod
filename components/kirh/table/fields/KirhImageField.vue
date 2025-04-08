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
          <div v-if="imageSource" class="kirh-image-preview-wrapper">
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
                v-if="imageSource"
                class="kirh-image-delete-button"
                @click="deleteImage"
            >
              Удалить
            </button>
          </div>

          <!-- Информация -->
          <div
              v-if="options.info"
              class="kirh-image-info"
              v-html="options.info"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, watch, onUnmounted} from 'vue';

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
        }
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
    let errorTimeout = null;

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
      fullModalTitle
    };
  }
};
</script>

<style scoped>
.kirh-image-field {
  display: inline-block;
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
</style>