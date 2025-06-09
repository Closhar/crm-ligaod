<template>
  <div class="flex flex-wrap items-center gap-2 p-2 bg-gray-50">
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('bold') }"
        class="p-2 rounded hover:bg-gray-200"
        title="Жирный"
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
    >
      <Icon name="ph:text-b" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('italic') }"
        class="p-2 rounded hover:bg-gray-200"
        title="Курсив"
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
    >
      <Icon name="ph:text-italic" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('underline') }"
        class="p-2 rounded hover:bg-gray-200"
        title="Подчеркивание"
        type="button"
        @click="editor.chain().focus().toggleUnderline().run()"
    >
      <Icon name="ph:text-underline" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('strike') }"
        class="p-2 rounded hover:bg-gray-200"
        title="Зачеркнутый"
        type="button"
        @click="editor.chain().focus().toggleStrike().run()"
    >
      <Icon name="ph:text-strikethrough" size="20"/>
    </button>

    <div class="relative">
      <button
          class="p-2 rounded hover:bg-gray-200"
          title="Цвет текста"
          type="button"
          @click="showColorPicker = !showColorPicker"
      >
        <Icon name="ph:paint-bucket" size="20"/>
      </button>
      <div
          v-if="showColorPicker"
          class="absolute z-50 grid grid-cols-5 gap-2 p-2 mt-1 bg-white border rounded-lg shadow-lg"
          style="width: 160px;"
      >
        <button
            v-for="color in colors"
            :key="color.value"
            :style="{ backgroundColor: color.value }"
            :title="color.name"
            type="button"
            class="w-5 h-5 rounded-full hover:ring-2 hover:ring-blue-300 transition-all"
            @click="setTextColor(color.value)"
        />
      </div>
    </div>
    <button
        title="Сбросить цвет"
        type="button"
        @click="editor.chain().focus().unsetColor().run()"
    >
      <Icon name="ph:eraser" size="20"/>
    </button>

    <div class="border-l border-gray-300 mx-2 h-6 self-center"></div>

    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('heading', { level: 1 }) }"
        class="p-2 rounded hover:bg-gray-200"
        title="Заголовок 1"
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
    >
      <Icon name="ph:text-h-one" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('heading', { level: 2 }) }"
        class="p-2 rounded hover:bg-gray-200"
        title="Заголовок 2"
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
    >
      <Icon name="ph:text-h-two" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('heading', { level: 3 }) }"
        class="p-2 rounded hover:bg-gray-200"
        title="Заголовок 3"
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
    >
      <Icon name="ph:text-h-three" size="20"/>
    </button>

    <div class="border-l border-gray-300 mx-2 h-6 self-center"></div>

    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('bulletList') }"
        class="p-2 rounded hover:bg-gray-200"
        title="Маркированный список"
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
    >
      <Icon name="ph:list-bullets" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('orderedList') }"
        class="p-2 rounded hover:bg-gray-200"
        title="Нумерованный список"
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
    >
      <Icon name="ph:list-numbers" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive('blockquote') }"
        class="p-2 rounded hover:bg-gray-200"
        title="Цитата"
        type="button"
        @click="editor.chain().focus().toggleBlockquote().run()"
    >
      <Icon name="ph:quotes" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive({ textAlign: 'left' }) }"
        class="p-2 rounded hover:bg-gray-200"
        title="Выровнять по левому краю"
        type="button"
        @click="editor.chain().focus().setTextAlign('left').run()"
    >
      <Icon name="ph:text-align-left" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive({ textAlign: 'center' }) }"
        class="p-2 rounded hover:bg-gray-200"
        title="Выровнять по центру"
        type="button"
        @click="editor.chain().focus().setTextAlign('center').run()"
    >
      <Icon name="ph:text-align-center" size="20"/>
    </button>
    <button
        v-if="editor"
        :class="{ 'bg-gray-200': editor.isActive({ textAlign: 'right' }) }"
        class="p-2 rounded hover:bg-gray-200"
        title="Выровнять по правому краю"
        type="button"
        @click="editor.chain().focus().setTextAlign('right').run()"
    >
      <Icon name="ph:text-align-right" size="20"/>
    </button>

    <div class="border-l border-gray-300 mx-2 h-6 self-center"></div>

    <button
        v-if="uploadEnabled"
        class="p-2 rounded hover:bg-gray-200"
        title="Добавить изображение"
        type="button"
        @click="$emit('add-image')"
    >
      <Icon name="ph:image" size="20"/>
    </button>
    <button
        class="p-2 rounded hover:bg-gray-200"
        title="Добавить iframe"
        type="button"
        @click="$emit('add-iframe')"
    >
      <Icon name="ph:frame-corners" size="20"/>
    </button>
    <button
        :class="{ 'bg-gray-200': editor?.isActive('link') }"
        class="p-2 rounded hover:bg-gray-200"
        title="Добавить ссылку"
        type="button"
        @click="setLink"
    >
      <Icon name="ph:link" size="20"/>
    </button>
    <button
        v-if="editor"
        class="p-2 rounded hover:bg-gray-200"
        title="Горизонтальная линия"
        type="button"
        @click="editor.chain().focus().setHorizontalRule().run()"
    >
      <Icon name="ph:line-segments" size="20"/>
    </button>

    <div class="border-l border-gray-300 mx-2 h-6 self-center"></div>

    <button
        class="p-2 rounded hover:bg-gray-200"
        title="AI Генерация"
        type="button"
        @click="$emit('show-ai-modal')"
    >
      <Icon name="ph:robot" size="20"/>
    </button>

    <button
        class="p-2 rounded hover:bg-gray-200"
        title="Исходный код"
        type="button"
        @click="$emit('toggle-source')"
    >
      <Icon name="ph:code" size="20"/>
    </button>

    <button
        :title="isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'"
        class="p-2 rounded hover:bg-gray-200"
        type="button"
        @click="$emit('toggle-fullscreen')"
    >
      <Icon :name="isFullscreen ? 'ph:arrows-in' : 'ph:arrows-out'" size="20"/>
    </button>
    <button
        v-if="editor"
        :disabled="!editor.can().undo()"
        class="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Отменить"
        type="button"
        @click="editor.chain().focus().undo().run()"
    >
      <Icon name="ph:arrow-counter-clockwise" size="20"/>
    </button>
    <button
        v-if="editor"
        :disabled="!editor.can().redo()"
        class="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Повторить"
        type="button"
        @click="editor.chain().focus().redo().run()"
    >
      <Icon name="ph:arrow-clockwise" size="20"/>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  editor: Object,
  isFullscreen: Boolean,
  uploadEnabled: Boolean
})

const emit = defineEmits([
  'add-image',
  'add-iframe',
  'toggle-fullscreen',
  'toggle-source',
  'show-link-modal',
  'show-ai-modal'
])

const showColorPicker = ref(false)
const colors = [
  {name: 'Чёрный', value: '#000000'},
  {name: 'Красный', value: '#ff0000'},
  {name: 'Синий', value: '#0000ff'},
  {name: 'Зелёный', value: '#008000'},
  {name: 'Жёлтый', value: '#ffff00'},
  {name: 'Оранжевый', value: '#ffa500'},
  {name: 'Фиолетовый', value: '#800080'},
  {name: 'Розовый', value: '#ffc0cb'},
  {name: 'Коричневый', value: '#a52a2a'},
  {name: 'Серый', value: '#808080'},
  {name: 'Белый', value: '#ffffff'}
]

const setTextColor = (color) => {
  props.editor.chain().focus().setColor(color).run()
  showColorPicker.value = false
}

const setLink = () => {
  if (!props.editor) return

  const isLinkActive = props.editor.isActive('link')
  const {from, to} = props.editor.state.selection
  const text = props.editor.state.doc.textBetween(from, to, ' ')

  emit('show-link-modal', {
    href: isLinkActive ? props.editor.getAttributes('link').href : '',
    text: text,
    openInNewTab: isLinkActive ? props.editor.getAttributes('link').target === '_blank' : false
  })
}
</script>

<style scoped>
button {
  @apply transition-colors duration-200;
}
</style>