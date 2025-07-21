<template>
  <PersonImagesModal
    :is-visible="isVisible"
    :person="entityType === 'person' ? entity : null"
    @close="$emit('close')"
    @saved="$emit('saved')"
  />
</template>

<script setup>
import PersonImagesModal from '~/components/people/PersonImagesModal.vue'

const props = defineProps({
  isVisible: Boolean,
  entity: Object,
  entityType: {
    type: String,
    default: 'person'
  }
})
</script> 