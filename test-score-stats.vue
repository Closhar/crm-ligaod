<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Тест компонента статистики очков</h1>
    
    <EventScoreStats 
      :event-id="1" 
      :clubs="testClubs" 
      :action-types="testActionTypes"
    />
  </div>
</template>

<script setup>
import EventScoreStats from '~/components/events/EventScoreStats.vue'

// Тестовые данные
const testClubs = [
  {
    id: 1,
    title: 'Тестовая команда 1',
    city: { title: 'Москва' },
    club_image_path: '/placeholder-club.jpg'
  },
  {
    id: 2,
    title: 'Тестовая команда 2',
    city: { title: 'Санкт-Петербург' },
    club_image_path: '/placeholder-club.jpg'
  }
]

const testActionTypes = [
  {
    id: 1,
    name: 'Гол',
    icon: 'mdi:soccer',
    group: 1,
    short_name: 'Г'
  },
  {
    id: 2,
    name: 'Передача',
    icon: 'mdi:handshake',
    group: 1,
    short_name: 'П'
  },
  {
    id: 3,
    name: 'Желтая карточка',
    icon: 'mdi:card',
    group: 2,
    short_name: 'ЖК'
  }
]
</script> 