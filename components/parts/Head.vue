<script lang="ts" setup>
interface HeadProps {
  title?: string | null;
  icon?: string | null;
  breadcrumbs?: any[] | null;
  show_breadcrumbs?: string | boolean;
}

const props = defineProps<HeadProps>();

const showBreadcrumbs = props.show_breadcrumbs === 'true' || props.show_breadcrumbs === true;
</script>

<template>
  <div class="flex-1">

    <!-- Breadcrumbs -->
    <nav v-if="showBreadcrumbs" class="flex bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
      <ol class="flex items-center space-x-2 text-sm">
        <li class="flex items-center">
          <NuxtLink class="text-gray-500 hover:text-blue-600 flex items-center" to="/">
            <svg aria-hidden="true" class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"
                 xmlns="http://www.w3.org/2000/svg">
              <path
                  d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
            </svg>
            <span class="align-top">Главная</span>
          </NuxtLink>
        </li>

        <li v-for="b in props.breadcrumbs" v-if="props.breadcrumbs && props.breadcrumbs.length" :key="b.id" class="flex items-center">
          <Icon class="text-gray-500 " name="weui:arrow-outlined" size="1.3em"/>
          <Icon :name="b.icon" class="text-gray-500 mx-1" size="1.3em"/>
          <NuxtLink :to="'/' + b.slug" class="text-gray-500 hover:text-blue-600">{{ b.title }}</NuxtLink>
        </li>

      </ol>
    </nav>

    <!-- Блок с заголовком -->
    <div v-if="props.title" class="flex justify-between p-2">
      <h1 class="text-2xl font-semibold text-gray-800">
        <Icon v-if="props.icon" :name="props.icon" class="mr-2" size="1em"/>
        <span class="align-top">{{ props.title }}</span>
      </h1>
    </div>

  </div>
</template>

<style scoped>
/* Дополнительные стили при необходимости */
</style>