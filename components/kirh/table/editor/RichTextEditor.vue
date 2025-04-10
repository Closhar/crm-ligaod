<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div
        ref="editorContainer"
        :class="{
        'max-w-4xl w-full': !isFullscreen,
        'fixed inset-0 h-screen w-screen': isFullscreen,
        'h-[90vh] border rounded-lg': !isFullscreen
      }"
        class="bg-white shadow-xl flex flex-col transition-all"
    >
      <!-- Заголовок -->
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="text-lg font-semibold">
          {{ title }}
        </h3>
        <div class="flex items-center space-x-2">
          <button
              v-if="editorEnabled"
              class="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              @click="toggleSource"
          >
            {{ showSource ? 'Визуальный' : 'Исходник' }}
          </button>
          <button
              class="text-gray-500 hover:text-gray-700"
              @click="handleClose"
          >
            <Icon name="ph:x" size="20"/>
          </button>
        </div>
      </div>

      <!-- Тулбар -->
      <div v-if="editorEnabled && !showSource" class="border-b">
        <EditorToolbar
            :editor="editor"
            :is-fullscreen="isFullscreen"
            :upload-enabled="true"
            @add-image="showImageModal = true"
            @add-iframe="showIframeModal = true"
            @toggle-fullscreen="toggleFullscreen"
            @show-link-modal="openLinkModal"
        />
      </div>

      <!-- Основной контент -->
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
            @paste="handleSourcePaste"
            @keydown.enter="handleSourceEnter"
        ></textarea>
        <textarea
            v-else
            v-model="simpleTextContent"
            :placeholder="placeholder"
            class="w-full h-full min-h-[200px] p-2 border rounded outline-none resize-none text-left whitespace-pre-wrap"
        ></textarea>
      </div>

      <!-- Футер -->
      <div class="p-4 border-t flex justify-end space-x-2">
        <button
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            @click="handleClose"
        >
          Отмена
        </button>
        <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="handleSave"
        >
          Сохранить
        </button>
      </div>
    </div>

    <!-- Модальные окна -->
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
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, nextTick} from 'vue'
import {Editor, EditorContent} from '@tiptap/vue-3'
import {Node} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import EditorToolbar from './EditorToolbar.vue'
import ImageUploadModal from './ImageUploadModal.vue'
import IframeModal from './IframeModal.vue'
import LinkModal from './LinkModal.vue'

// Определяем IframeExtension до использования
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
  title: {type: String, default: 'Редактор текста'},
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

const emit = defineEmits(['update:modelValue', 'close', 'save'])

const editor = ref(null)
const editorContainer = ref(null)
const showImageModal = ref(false)
const showIframeModal = ref(false)
const showLinkModal = ref(false)
const sourceContent = ref(props.modelValue)
const simpleTextContent = ref(props.modelValue)
const showSource = ref(false)
const isFullscreen = ref(false)
const sourceTextarea = ref(null)
const linkModalInitialValues = ref({
  href: '',
  text: '',
  openInNewTab: false
})

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
}

const toggleSource = () => {
  showSource.value = !showSource.value
  if (showSource.value) {
    sourceContent.value = editor.value?.getHTML() || ''
    nextTick(() => sourceTextarea.value?.focus())
  } else {
    editor.value?.commands.setContent(sourceContent.value)
  }
}

const openLinkModal = (initialValues) => {
  linkModalInitialValues.value = initialValues
  showLinkModal.value = true
}

const handleInsertImage = (imageData) => {
  if (editor.value) {
    editor.value.chain().focus()
        .setImage({src: imageData.src})
        .run()
  }
  showImageModal.value = false
}

const handleInsertIframe = (iframeData) => {
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

  // Для email и tel отключаем открытие в новой вкладке
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
}

const handleClose = () => {
  if (isFullscreen.value) {
    toggleFullscreen()
  }
  emit('close')
}

const handleSave = () => {
  let content
  if (props.editorEnabled) {
    content = showSource.value ? sourceContent.value : editor.value?.getHTML() || ''
  } else {
    content = simpleTextContent.value
  }

  emit('save', content)
  emit('update:modelValue', content)
  handleClose()
}

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
          }
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
        Placeholder.configure({
          placeholder: props.placeholder,
          emptyEditorClass: 'is-editor-empty'
        }),
        IframeExtension // Используем определенное расширение
      ],
      editorProps: {
        attributes: {class: 'prose focus:outline-none min-h-[200px] text-left'}
      },
      onUpdate: () => {
        sourceContent.value = editor.value.getHTML()
      }
    })
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
  document.body.classList.remove('overflow-hidden')
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

.tiptap p.is-editor-empty:first-child::before {
  @apply float-left text-gray-400 pointer-events-none h-0;
  content: attr(data-placeholder);
}
</style>