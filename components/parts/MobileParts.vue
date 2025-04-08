<script lang="ts" setup>
const props = defineProps({
  site_name: {
    type: String,
    default: 'KirhAdm'
  }
});
const {isAuthenticated, user, logout} = useAuth();
</script>

<template>
  <!-- Mobile header -->
  <div class="flex items-center">
    <img
        alt="Logo"
        class="w-10 h-10 object-contain flex-shrink-0"
        src="/ldr.png"
    />
    <span class="ml-3 text-xl font-bold truncate">{{ site_name }}</span>
  </div>


  <!-- Mobile footer with buttons -->
  <div
      class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-800 text-white p-3 flex justify-around border-t border-gray-700">
    <NuxtLink class="p-2 rounded-full hover:bg-gray-700" to="/">
      <Icon class="w-6 h-6" name="heroicons:home"/>
    </NuxtLink>
    <button class="p-2 rounded-full hover:bg-gray-700">
      <Icon class="w-6 h-6" name="heroicons:magnifying-glass"/>
    </button>
    <NuxtLink class="p-2 rounded-full hover:bg-gray-700" to="/account">
      <img :src="user.avatar_path || images.default_user" alt="User avatar" class="w-8 h-8">
    </NuxtLink>
  </div>

</template>

<style scoped>

</style>