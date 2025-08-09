<template>
  <div v-if="pageLoading" class="fixed top-0 left-0 w-full h-full bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-3">
    <div class="xl:col-span-1">
             <!-- Дни рождения команды -->
       <div class="bg-white rounded-lg shadow-md p-6 mb-6">
         <div class="flex items-center gap-3 mb-4">
           <Icon name="material-symbols:cake" class="w-6 h-6 text-pink-600" />
           <h3 class="text-xl font-bold text-gray-800">Дни рождения команды</h3>
         </div>
         
         <div class="text-center py-8">
           <Icon name="material-symbols:cake" size="3em" class="mx-auto mb-4 text-gray-300" />
           <p class="text-gray-500">Список дней рождений в разработке</p>
           <p class="text-sm text-gray-400 mt-2">BirthdaysToday компонент будет добавлен позже</p>
         </div>
       </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <Icon name="healthicons:info" class="w-6 h-6 text-blue-600" />
          <h3 class="text-xl font-bold text-gray-800">Информация о команде</h3>
        </div>
        
        <div v-if="club?.about" class="mb-4">
          <p class="text-gray-700 leading-relaxed">{{ club.about }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="club?.address" class="flex items-start gap-2">
            <Icon name="material-symbols:location-on" class="w-5 h-5 text-gray-500 mt-0.5" />
            <span class="text-gray-600">{{ club.address }}</span>
          </div>
          
          <div v-if="club?.phones" class="flex items-start gap-2">
            <Icon name="material-symbols:phone" class="w-5 h-5 text-gray-500 mt-0.5" />
            <span class="text-gray-600">{{ club.phones }}</span>
          </div>
          
          <div v-if="club?.emails" class="flex items-start gap-2">
            <Icon name="material-symbols:email" class="w-5 h-5 text-gray-500 mt-0.5" />
            <span class="text-gray-600">{{ club.emails }}</span>
          </div>
          
          <div v-if="club?.sites" class="flex items-start gap-2">
            <Icon name="material-symbols:language" class="w-5 h-5 text-gray-500 mt-0.5" />
            <span class="text-gray-600">{{ club.sites }}</span>
          </div>
        </div>
        
        <div v-if="club?.arenas && Array.isArray(club.arenas) && club.arenas.length > 0" class="mt-4">
          <h4 class="font-semibold text-gray-700 mb-2">Арены:</h4>
          <div class="flex flex-wrap gap-2">
            <span v-for="arena in club.arenas" :key="arena" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {{ arena }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="xl:col-span-2 space-y-6">
      <div class="right-column-block mx-2 mb-6">
        <div class="rounded-t-xl p-2 text-center shadow-lg mx-4">
          <div class="flex items-center justify-left gap-3">
            <Icon name="material-symbols:article" class="w-6 h-6 text-gray-600" />
            <h3 class="text-lg md:text-lg font-bold text-gray-600 tracking-wider">
              Последние новости команды
            </h3>
          </div>
        </div>
        
        <div class="border-2 border-gray-300 rounded-b-xl shadow-lg relative overflow-hidden mx-4">
          <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" 
               style="background-image: url('/bg-sostav.jpg');">
          </div>
          
          <div class="relative z-10 p-2">
                         <div class="text-center py-8">
               <Icon name="material-symbols:article" size="3em" class="mx-auto mb-4 text-gray-300" />
               <p class="text-gray-500">Список новостей в разработке</p>
               <p class="text-sm text-gray-400 mt-2">ArticleList2 компонент будет добавлен позже</p>
             </div>
          </div>
        </div>
      </div>

      <div class="right-column-block mx-2 mb-6">
        <div class="rounded-t-xl p-2 text-center shadow-lg mx-4">
          <div class="flex items-center justify-left gap-3">
            <Icon name="material-symbols:schedule" class="w-6 h-6 text-gray-600" />
            <h3 class="text-lg md:text-lg font-bold text-gray-600 tracking-wider">
              Ближайшие матчи
            </h3>
          </div>
        </div>
        
        <div class="border-2 border-gray-300 rounded-b-xl shadow-lg relative overflow-hidden mx-4">
          <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" 
               style="background-image: url('/bg-sostav.jpg');">
          </div>
          
          <div class="relative z-10 p-2">
            <div v-if="upcomingMatchesLoading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Загрузка предстоящих матчей...</p>
            </div>
            <div v-else-if="upcomingMatches && upcomingMatches.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="match in upcomingMatches"
                :key="match.id"
                class="bg-white rounded-lg shadow-md p-4 border"
              >
                <h4 class="font-semibold text-lg mb-2">{{ match.title || 'Матч' }}</h4>
                <p class="text-gray-600">{{ match.date_from }}</p>
                <p class="text-sm text-gray-500">EventCard2 в разработке</p>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <Icon name="material-symbols:schedule" size="3em" class="mx-auto mb-4 text-gray-300" />
              <p>Предстоящих матчей пока нет</p>
            </div>
          </div>
        </div>
      </div>

      <div class="right-column-block mx-2">
        <div class="rounded-t-xl p-2 text-center shadow-lg mx-4">
          <div class="flex items-center justify-left gap-3">
            <Icon name="material-symbols:history" class="w-6 h-6 text-gray-600" />
            <h3 class="text-lg md:text-lg font-bold text-gray-600 tracking-wider">
              Последние матчи
            </h3>
          </div>
        </div>
        
        <div class="border-2 border-gray-300 rounded-b-xl shadow-lg relative overflow-hidden mx-4">
          <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" 
               style="background-image: url('/bg-sostav.jpg');">
          </div>
          
          <div class="relative z-10 p-2">
            <div v-if="pastMatchesLoading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p class="text-gray-600">Загрузка прошедших матчей...</p>
            </div>
            <div v-else-if="pastMatches && pastMatches.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="match in pastMatches"
                :key="match.id"
                class="bg-white rounded-lg shadow-md p-4 border"
              >
                <h4 class="font-semibold text-lg mb-2">{{ match.title || 'Матч' }}</h4>
                <p class="text-gray-600">{{ match.date_from }}</p>
                <p class="text-sm text-gray-500">EventCard2 в разработке</p>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <Icon name="material-symbols:history" size="3em" class="mx-auto mb-4 text-gray-300" />
              <p>Прошедших матчей пока нет</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, defineAsyncComponent } from 'vue';

const props = defineProps({
  club: {
    type: Object,
    required: true
  }
});

const config = useRuntimeConfig();
const api = config.public.API_URL;
const homeRegionId = config.public.region || 1;

const pageLoading = ref(true);
const upcomingMatchesLoading = ref(false);
const pastMatchesLoading = ref(false);
const upcomingMatches = ref([]);
const pastMatches = ref([]);

const loadUpcomingMatches = async () => {
  if (!props.club?.slug) return;
  
  upcomingMatchesLoading.value = true;
  try {
    const response = await $fetch(`${api}/api/v1/events`, {
      params: {
        club: props.club.slug,
        per_page: 3,
        show: 1,
        show_native: 1,
      }
    });
    
    if (response && response.data && response.data.data) {
      upcomingMatches.value = response.data.data;
    }
  } catch (error) {
    console.error('Ошибка загрузки предстоящих матчей:', error);
  } finally {
    upcomingMatchesLoading.value = false;
  }
};

const loadPastMatches = async () => {
  if (!props.club?.slug) return;
  
  pastMatchesLoading.value = true;
  try {
    const response = await $fetch(`${api}/api/v1/events`, {
      params: {
        club: props.club.slug,
        per_page: 3,
        show: 2,
        show_native: 1,
      }
    });
    
    if (response && response.data && response.data.data) {
      pastMatches.value = response.data.data;
    }
  } catch (error) {
    console.error('Ошибка загрузки прошедших матчей:', error);
  } finally {
    pastMatchesLoading.value = false;
  }
};

const loadPageData = async () => {
  if (!props.club?.slug) return;
  
  pageLoading.value = true;
  
  try {
    await Promise.all([
      loadUpcomingMatches(),
      loadPastMatches()
    ]);
  } catch (error) {
    console.error('Ошибка загрузки данных страницы:', error);
  } finally {
    pageLoading.value = false;
  }
};

watch(() => props.club?.slug, (newSlug) => {
  if (newSlug) {
    loadPageData();
  }
}, { immediate: true });

onMounted(() => {
  if (props.club?.slug) {
    loadPageData();
  }
});
</script>

<style scoped>
.right-column-block {
  @apply w-full;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1.5rem;
}

@media (max-width: 480px) {
  .right-column-block {
    @apply mx-1;
  }
}
</style> 