<template>
    <div class="h-full flex flex-col">
      <div v-if="editorEnabled" class="border-b">
        <EditorToolbar
            v-if="!showSource"
            :editor="editor"
            :is-fullscreen="isFullscreen"
            :upload-enabled="true"
            @add-image="showImageModal = true"
            @add-iframe="showIframeModal = true"
            @toggle-fullscreen="toggleFullscreen"
            @show-link-modal="openLinkModal"
            @toggle-source="toggleSource"
            @show-ai-modal="showAIModal = true"
            @clear-content="clearContent"
            @insert-emoji="handleInsertEmoji"
        />
        <div v-else class="p-2 bg-gray-50 flex justify-between items-center">
          <span class="text-sm font-medium">Режим исходного кода</span>
          <button
              class="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 flex items-center"
              @click="toggleSource"
          >
            <Icon name="ph:eye" size="16" class="mr-1"/> Визуальный редактор
          </button>
        </div>
      </div>
  
      <div class="flex-1 overflow-auto p-4">
        <editor-content
            v-if="editorEnabled && !showSource"
            :editor="editor"
            :placeholder="placeholder"
            class="min-h-[200px] outline-none text-left"
        />
        <textarea
            v-else-if="editorEnabled && showSource"
            ref="sourceTextarea"
            v-model="sourceContent"
            :placeholder="placeholder"
            class="w-full h-full min-h-[200px] p-2 border rounded font-mono text-sm outline-none resize-none text-left whitespace-pre-wrap leading-normal"
            @blur="updateEditorFromSource"
        ></textarea>
      </div>
  
      <ImageUploadModal
          v-if="showImageModal"
          :upload-options="uploadOptions"
          @close="showImageModal = false"
          @insert="handleInsertImage"
      />
  
      <IframeModal
          v-if="showIframeModal"
          @close="showIframeModal = false"
          @insert="handleInsertIframe"
      />
  
      <LinkModal
          v-if="showLinkModal"
          :initial-values="linkModalInitialValues"
          @close="showLinkModal = false"
          @insert="handleInsertLink"
      />
  
      <!-- Модальное окно AI генерации -->
      <div v-if="showAIModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg w-full max-w-2xl mx-4">
          <div class="p-4 border-b flex justify-between items-center">
            <h3 class="text-lg font-semibold">AI Генерация контента</h3>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Модель:</span>
              <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                {{ selectedModel === 'gpt-3.5-turbo' ? 'GPT-3.5 Turbo' : 'GPT-4 Turbo' }}
              </span>
            </div>
          </div>
          <div class="p-4">
            <!-- Выбор модели -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Модель AI
              </label>
              <select
                v-model="selectedModel"
                class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (быстрее, дешевле)</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo (качественнее)</option>
              </select>
              <p class="mt-1 text-sm text-gray-500">
                {{ selectedModel === 'gpt-3.5-turbo' ? 'Оптимально для коротких текстов и анонсов' : 'Оптимально для длинных статей и аналитики' }}
              </p>
            </div>
  
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Запрос для генерации
                <span class="text-sm text-gray-500 ml-2">
                  {{ aiPrompt.length }}/4000 символов
                </span>
              </label>
              <textarea
                v-model="aiPrompt"
                rows="4"
                class="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                :class="{'border-red-500': aiPrompt.length > 4000}"
                placeholder="Опишите, какой контент нужно сгенерировать..."
              ></textarea>
              <p v-if="aiPrompt.length > 4000" class="mt-1 text-sm text-red-600">
                Превышен лимит символов (4000)
              </p>
              <p class="mt-1 text-sm text-gray-500">
                Максимальная длина ответа: {{ selectedModel === 'gpt-3.5-turbo' ? '2000' : '4000' }} токенов
              </p>
            </div>
  
            <!-- Настройки кэширования -->
            <div class="mb-4">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="useCache"
                  class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-600">Использовать кэширование (результаты сохраняются на 1 час)</span>
              </label>
            </div>
  
            <!-- Информация о последней генерации -->
            <div v-if="lastGenerationInfo && lastGenerationInfo.usage" class="mb-4 p-3 bg-gray-50 rounded-md">
              <div class="text-sm text-gray-600">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium">Результат генерации</span>
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-700': lastGenerationInfo.source === 'api',
                      'bg-blue-100 text-blue-700': lastGenerationInfo.source === 'cache'
                    }"
                  >
                    {{ lastGenerationInfo.source === 'api' ? 'Новая генерация' : 'Из кэша' }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="mb-1">
                      <span class="font-medium">Использовано токенов:</span>
                    </p>
                    <div class="text-xs text-gray-500">
                      <p>Входные: {{ lastGenerationInfo.usage?.input_tokens || 0 }}</p>
                      <p>Выходные: {{ lastGenerationInfo.usage?.output_tokens || 0 }}</p>
                    </div>
                  </div>
                  <div>
                    <p class="mb-1">
                      <span class="font-medium">Стоимость:</span>
                    </p>
                    <div class="text-xs text-gray-500">
                      <p>Общая: ${{ lastGenerationInfo.usage?.estimated_cost?.toFixed(4) || '0.0000' }}</p>
                      <p>Вход: ${{ lastGenerationInfo.usage?.cost_breakdown?.input_cost?.toFixed(6) || '0.000000' }}</p>
                      <p>Выход: ${{ lastGenerationInfo.usage?.cost_breakdown?.output_cost?.toFixed(6) || '0.000000' }}</p>
                    </div>
                  </div>
                </div>
                <div class="mt-2 pt-2 border-t border-gray-200">
                  <p class="text-xs text-gray-500">
                    <span class="font-medium">Параметры:</span>
                    Модель: {{ lastGenerationInfo.limits?.model }}, 
                    Температура: {{ lastGenerationInfo.limits?.temperature }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 border-t flex justify-end space-x-3">
            <button
              @click="showAIModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              @click="generateContent"
              :disabled="isGenerating || !aiPrompt.trim()"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <span v-if="isGenerating" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Генерация...
              </span>
              <span v-else>Сгенерировать</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { Node } from '@tiptap/core'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { nextTick, watch } from 'vue'
import EditorToolbar from './EditorToolbar.vue'
import IframeModal from './IframeModal.vue'
import ImageUploadModal from './ImageUploadModal.vue'
import LinkModal from './LinkModal.vue'
  
  const IframeExtension = Node.create({
    name: 'iframe',
    group: 'block',
    atom: true,
    addAttributes() {
      return {
        src: {default: null},
        width: {default: '100%'},
        height: {default: '400'},
        frameborder: {default: '0'},
        allowfullscreen: {default: true}
      }
    },
    parseHTML() {
      return [{tag: 'iframe'}]
    },
    renderHTML({HTMLAttributes}) {
      return ['iframe', HTMLAttributes]
    },
    addCommands() {
      return {
        setIframe: options => ({commands}) => {
          return commands.insertContent({
            type: this.name,
            attrs: options
          })
        }
      }
    }
  })
  
  const props = defineProps({
    modelValue: String,
    placeholder: {type: String, default: 'Введите текст...'},
    editorEnabled: {type: Boolean, default: true},
    uploadOptions: {
      type: Object,
      default: () => ({
        url: '/api/upload-image',
        maxWidth: 1200,
        quality: 0.8
      })
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'toggle-fullscreen'])
  
  const editor = ref(null)
  const showImageModal = ref(false)
  const showIframeModal = ref(false)
  const showLinkModal = ref(false)
  const linkModalInitialValues = ref({
    href: '',
    text: '',
    openInNewTab: false
  })
  const showSource = ref(false)
  const sourceContent = ref(props.modelValue)
  const isFullscreen = ref(false)
  const sourceTextarea = ref(null)
  
  // Добавляем новые состояния для AI генерации
  const showAIModal = ref(false);
  const aiPrompt = ref('');
  const isGenerating = ref(false);
  const selectedModel = ref('gpt-3.5-turbo');
  const useCache = ref(true);
  
  // Добавляем интерфейс для информации о генерации
  interface GenerationInfo {
    source: 'api' | 'cache';
    usage: {
      input_tokens: number;
      output_tokens: number;
      estimated_cost: number;
      cost_breakdown: {
        input_cost: number;
        output_cost: number;
      };
    };
    limits: {
      max_prompt_length: number;
      max_tokens: number;
      model: string;
      temperature: number;
    };
  }
  
  // В секции script обновляем тип для lastGenerationInfo
  const lastGenerationInfo = ref<GenerationInfo | null>(null);
  
  interface IframeData {
    src: string;
    width?: string;
    height?: string;
    frameborder?: string;
    allowfullscreen?: boolean;
  }
  
  interface ImageData {
    src: string;
  }
  
  interface LinkData {
    href: string;
    text?: string;
    openInNewTab?: boolean;
  }
  
  interface InitialValues {
    href?: string;
    text?: string;
    openInNewTab?: boolean;
  }
  
  const toggleSource = async () => {
    showSource.value = !showSource.value
    if (showSource.value) {
      sourceContent.value = editor.value?.getHTML() || ''
      await nextTick()
      sourceTextarea.value?.focus()
    } else {
      updateEditorFromSource()
    }
  }
  
  const updateEditorFromSource = () => {
    if (editor.value) {
      editor.value.commands.setContent(sourceContent.value)
      emit('update:modelValue', sourceContent.value)
    }
  }
  
  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
    emit('toggle-fullscreen', isFullscreen.value)
  }
  
  const openLinkModal = (initialValues: InitialValues) => {
    linkModalInitialValues.value = initialValues
    showLinkModal.value = true
  }
  
  const handleInsertImage = (imageData: ImageData) => {
    if (editor.value) {
      editor.value.chain().focus()
          .setImage({src: imageData.src})
          .run()
    }
    showImageModal.value = false
  }
  
  const handleInsertIframe = (iframeData: IframeData) => {
    if (editor.value) {
      editor.value.chain().focus()
          .setIframe({
            src: iframeData.src,
            width: iframeData.width || '100%',
            height: iframeData.height || '400',
            frameborder: iframeData.frameborder || '0',
            allowfullscreen: iframeData.allowfullscreen !== false,
          })
          .run()
    }
    showIframeModal.value = false
  }
  
  const handleInsertLink = (link) => {
    if (!editor.value) return
  
    if (!link.href) {
      editor.value.chain().focus().unsetLink().run()
      return
    }
  
    const isSpecialLink = link.href.startsWith('mailto:') || link.href.startsWith('tel:')
    const target = !isSpecialLink && link.openInNewTab ? '_blank' : null
    const rel = !isSpecialLink && link.openInNewTab ? 'noopener noreferrer' : null
  
    editor.value.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({href: link.href, target, rel})
        .run()
  
    if (link.text) {
      const {from, to} = editor.value.state.selection
      editor.value.commands.insertContentAt(
          {from, to},
          {type: 'text', text: link.text}
      )
    }
  
    showLinkModal.value = false
  }
  
  // Добавляем метод очистки контента
  const clearContent = () => {
    if (confirm('Вы уверены, что хотите очистить весь контент? Это действие нельзя отменить.')) {
      if (editor.value) {
        editor.value.commands.clearContent()
        emit('update:modelValue', '')
      }
    }
  }

  const handleInsertEmoji = (emoji) => {
    if (editor.value) {
      editor.value.chain().focus().insertContent(emoji).run()
    }
  }
  
  // Добавляем watch для modelValue
  watch(() => props.modelValue, (newContent) => {
    if (editor.value && newContent !== editor.value.getHTML()) {
      editor.value.commands.setContent(newContent)
    }
  }, { immediate: true })
  
  // Функция генерации контента
  const generateContent = async () => {
    if (!aiPrompt.value.trim()) {
      alert('Пожалуйста, введите запрос для генерации');
      return;
    }
  
    if (aiPrompt.value.length > 4000) {
      alert('Превышен лимит длины промпта (4000 символов)');
      return;
    }
  
    try {
      isGenerating.value = true;
  
      const config = useRuntimeConfig();
      const api = config.public.API_URL;
  
      // Отправляем запрос на генерацию
      const response = await fetch(`${api}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt: aiPrompt.value,
          model: selectedModel.value,
          use_cache: useCache.value
        })
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        if (result.limits) {
          throw new Error(`${result.message}\nТекущая длина: ${result.limits.current_prompt_length} символов`);
        }
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Ошибка при генерации контента');
      }
  
      // Сохраняем информацию о генерации
      lastGenerationInfo.value = {
        source: result.source,
        usage: result.usage,
        limits: result.limits
      };
  
      // Вставляем сгенерированный контент в редактор
      if (editor.value) {
        editor.value.commands.setContent(result.data);
        emit('update:modelValue', result.data);
      }
      
      // Закрываем модальное окно и очищаем состояние
      showAIModal.value = false;
      aiPrompt.value = '';
  
    } catch (error) {
      console.error('Ошибка при генерации контента:', error);
      alert(`Произошла ошибка при генерации контента: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      isGenerating.value = false;
    }
  };
  
  onMounted(() => {
    if (props.editorEnabled) {
      editor.value = new Editor({
        content: props.modelValue,
        extensions: [
          StarterKit.configure({
            paragraph: {HTMLAttributes: {class: 'text-left mb-4'}},
            heading: {
              levels: [1, 2, 3],
              HTMLAttributes: {
                class: 'text-left font-bold mb-4'
              }
            },
            blockquote: {
              HTMLAttributes: {
                class: 'border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4'
              }
            },
            // Отключаем автоматическое форматирование
            hardBreak: false,
            horizontalRule: false,
            codeBlock: false,
            bulletList: false,
            orderedList: false,
            listItem: false,
            taskList: false,
            taskItem: false
          }),
          Image.configure({inline: true, allowBase64: true}),
          TextAlign.configure({types: ['heading', 'paragraph'], defaultAlignment: 'left'}),
          TextStyle,
          Color,
          Underline,
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              target: '_blank',
              rel: 'noopener noreferrer',
              class: 'text-blue-500 hover:underline'
            }
          }),
          IframeExtension
        ],
        editorProps: {
          attributes: {class: 'prose focus:outline-none min-h-[200px] text-left'}
        },
        onUpdate: () => {
          emit('update:modelValue', editor.value.getHTML())
        }
      })
    }
  })
  
  onBeforeUnmount(() => {
    editor.value?.destroy()
  })
  </script>
  
  <style>
  .tiptap h1 {
    @apply text-3xl font-bold mb-4;
  }
  
  .tiptap h2 {
    @apply text-2xl font-bold mb-3;
  }
  
  .tiptap h3 {
    @apply text-xl font-bold mb-2;
  }
  
  .tiptap blockquote {
    @apply border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4;
  }
  
  .tiptap ul {
    @apply list-disc pl-6 mb-4;
  }
  
  .tiptap ol {
    @apply list-decimal pl-6 mb-4;
  }
  
  .tiptap iframe {
    @apply w-full h-[400px] border rounded my-4;
  }
  </style>