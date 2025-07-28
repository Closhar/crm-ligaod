<template>
  <div v-if="hasData" class="mb-6">
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Статистика для первой команды -->
      <div v-if="clubs[0] && clubStats[clubs[0].id] && clubStats[clubs[0].id].length > 0" class="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
        
        <div v-if="loading" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-sm text-gray-500 mt-2">Загрузка статистики...</p>
        </div>
        
        <div class="space-y-3">
          <div v-for="stat in clubStats[clubs[0].id]" :key="stat.action_type_id" class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div class="flex items-center gap-3">
              <Icon 
                v-if="getActionTypeIcon(stat.action_type_id)" 
                :icon="getActionTypeIcon(stat.action_type_id)" 
                class="w-6 h-6 text-blue-600" 
              />
              <div>
                <p class="font-semibold text-blue-800">{{ getActionTypeName(stat.action_type_id) }}</p>
                <p class="text-sm text-blue-600">игроков: {{ stat.player_count }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-blue-700">{{ stat.total_points }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика для второй команды -->
      <div v-if="clubs[1] && clubStats[clubs[1].id] && clubStats[clubs[1].id].length > 0" class="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
        
        <div v-if="loading" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p class="text-sm text-gray-500 mt-2">Загрузка статистики...</p>
        </div>
        
        <div class="space-y-3">
          <div v-for="stat in clubStats[clubs[1].id]" :key="stat.action_type_id" class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div class="flex items-center gap-3">
              <Icon 
                v-if="getActionTypeIcon(stat.action_type_id)" 
                :icon="getActionTypeIcon(stat.action_type_id)" 
                class="w-6 h-6 text-red-600" 
              />
              <div>
                <p class="font-semibold text-red-800">{{ getActionTypeName(stat.action_type_id) }}</p>
                <p class="text-sm text-red-600">игроков: {{ stat.player_count }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-red-700">{{ stat.total_points }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { computed, ref, watch } from 'vue'
import { useApi } from '~/composables/useApi'

const props = defineProps({
  eventId: {
    type: [String, Number],
    required: true
  },
  clubs: {
    type: Array,
    default: () => []
  },
  actionTypes: {
    type: Array,
    default: () => []
  }
})

const { apiRequest } = useApi()

const loading = ref(false)
const clubStats = ref({})

// Проверяем, есть ли данные для отображения
const hasData = computed(() => {
  if (!props.clubs || props.clubs.length === 0) return false
  
  return props.clubs.some(club => {
    const stats = clubStats.value[club.id]
    return stats && stats.length > 0
  })
})

// Загрузка статистики очков
const loadScoreStats = async () => {
  if (!props.eventId || props.clubs.length === 0) return
  
  loading.value = true
  try {
    // Получаем все события с типом "Очки" (group = 2)
    const actionsRes = await apiRequest(`/events/${props.eventId}/actions`)
    const actions = Array.isArray(actionsRes) ? actionsRes : (actionsRes?.data || [])
    
    // Фильтруем события с очками (group = 2) и ненулевыми значениями
    const scoreActions = actions.filter(action => {
      const actionType = props.actionTypes.find(type => type.id === action.action_type_id)
      const groupValue = parseInt(actionType?.group) || 0
      return groupValue === 2 && action.value && parseFloat(action.value) > 0
    })
    
    // Группируем по командам и типам событий
    const stats = {}
    
    props.clubs.forEach(club => {
      stats[club.id] = {}
      
      // Фильтруем события для текущей команды
      const clubActions = scoreActions.filter(action => action.club_id === club.id)
      
      // Группируем по типам событий
      clubActions.forEach(action => {
        const actionTypeId = action.action_type_id
        const points = parseFloat(action.value) || 0
        
        if (!stats[club.id][actionTypeId]) {
          stats[club.id][actionTypeId] = {
            action_type_id: actionTypeId,
            total_points: 0,
            player_count: 0,
            players: new Set()
          }
        }
        
        stats[club.id][actionTypeId].total_points += points
        
        // Добавляем игрока в Set для подсчета уникальных игроков
        // Используем person_id если есть, иначе player_name
        const playerKey = action.person_id ? action.person_id : action.player_name
        if (playerKey) {
          stats[club.id][actionTypeId].players.add(playerKey)
        }
      })
      
      // Преобразуем в массив и подсчитываем количество игроков
      stats[club.id] = Object.values(stats[club.id]).map(stat => ({
        ...stat,
        player_count: stat.players.size,
        players: undefined // Удаляем Set из результата
      }))
      
      // Сортируем по общему количеству очков
      stats[club.id].sort((a, b) => b.total_points - a.total_points)
    })
    
    clubStats.value = stats
  } catch (error) {
    console.error('Ошибка при загрузке статистики очков:', error)
  } finally {
    loading.value = false
  }
}

// Получение названия типа события
const getActionTypeName = (actionTypeId) => {
  const actionType = props.actionTypes.find(type => type.id === actionTypeId)
  return actionType?.name || 'Неизвестный тип'
}

// Получение иконки типа события
const getActionTypeIcon = (actionTypeId) => {
  const actionType = props.actionTypes.find(type => type.id === actionTypeId)
  return actionType?.icon || null
}

// Загружаем статистику при изменении props
watch(() => [props.eventId, props.clubs, props.actionTypes], () => {
  if (props.eventId && props.clubs.length > 0 && props.actionTypes.length > 0) {
    loadScoreStats()
  }
}, { immediate: true })

// Экспортируем функцию для обновления статистики
defineExpose({
  loadScoreStats
})
</script> 