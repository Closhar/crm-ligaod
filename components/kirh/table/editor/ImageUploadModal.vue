<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="text-lg font-semibold">Загрузка изображения</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="$emit('close')">
          <Icon name="ph:x"/>
        </button>
      </div>

      <div class="p-4">
        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium text-gray-700">
            Выберите изображение
          </label>
          <input
              ref="fileInput"
              accept="image/*"
              class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              type="file"
              @change="handleFileSelect"
          >
        </div>

        <div v-if="imagePreview" class="mt-4">
          <img :src="imagePreview" alt="Предпросмотр" class="max-h-40 mx-auto border rounded">
        </div>
      </div>

      <div class="p-4 border-t flex justify-end space-x-2">
        <button
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            @click="$emit('close')"
        >
          Отмена
        </button>
        <button
            :disabled="isLoading"
            @click="uploadAndInsert"
        >
          <span v-if="!isLoading">Загрузить</span>
          <span v-else>Загрузка...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
button {
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>

<script setup>
import {ref} from 'vue';
import Compressor from 'compressorjs';

const props = defineProps({
  uploadOptions: {
    type: Object,
    default: () => ({
      url: '/api/upload-image',
      maxWidth: 1200,
      quality: 0.8
    })
  }
});

const emit = defineEmits(['close', 'insert']);

const fileInput = ref(null);
const selectedFile = ref(null);
const imagePreview = ref(null);
const isLoading = ref(false);

const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    // Оптимизация изображения перед отправкой
    const compressedFile = await new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: props.uploadOptions.quality,
        maxWidth: props.uploadOptions.maxWidth,
        success(result) {
          resolve(result);
        },
        error(err) {
          reject(err);
        }
      });
    });

    selectedFile.value = compressedFile;

    // Создание превью
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(compressedFile);
  } catch (error) {
    console.error('Image compression error:', error);
  }
};

const uploadAndInsert = async () => {
  if (!selectedFile.value) return;

  isLoading.value = true;

  try {
    const formData = new FormData();
    formData.append('image', selectedFile.value);

    const response = await fetch(props.uploadOptions.url, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();

    // Вставляем изображение в редактор
    if (data.success && data.file?.url) {
      emit('insert', {
        src: data.file.url,
        alt: selectedFile.value.name || 'Uploaded image'
      });
    }

    emit('close');
  } catch (error) {
    console.error('Upload error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>