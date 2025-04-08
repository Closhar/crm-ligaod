<template>
  <div class="bg-gray-200 text-gray-900 p-4 text-center mt-1 pt-20 lg:pt-2 min-h-screen">
    <div
        class="mt-10 text-6xl mx-10 p-10 font-mytitle text-center border-4 rounded-xl flex flex-col"
        :class="{'border-green-600 text-green-600' : message,
                 'border-red-600 text-red-600': error
    }">
      <Icon name="simple-line-icons:like" size="3em" class="mx-auto" v-if="message"/>
      <Icon name="mdi:stop-pause-outline" size="3em" class="mx-auto" v-if="error"/>
      <p v-if="message" class="uppercase">{{ message }}</p>
      <p v-if="error" class="uppercase">{{ error }}</p>
      <p v-if="message" class="text-xl text-gray-800">Вы можете авторизоваться на
        <NuxtLink to="/account" class="text-blue-800 hover:text-blue-700">ЭТОЙ СТРАНИЦЕ</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();
const message = ref('');
const error = ref('');

onMounted(async () => {
  const {id, hash, expires, signature} = route.query;

  try {
    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.API_URL}/api/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        hash,
        expires,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Ошибка подтверждения email');
    }

    const data = await response.json();
    message.value = data.message;
  } catch (err) {
    error.value = err.message;
  }
});
</script>