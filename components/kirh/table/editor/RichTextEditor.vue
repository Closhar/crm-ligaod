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
  </div>
</template>

<script setup>
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
import {nextTick} from 'vue'

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

.tiptap p.is-editor-empty:first-child::before {
  @apply float-left text-gray-400 pointer-events-none h-0;
  content: attr(data-placeholder);
}
</style>