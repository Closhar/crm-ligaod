<script lang="ts" setup>
interface MenuItem {
  title: string
  icon: string
  slug?: string
  submenu?: MenuItem[]
}

interface Props {
  isMenuCollapsed: boolean
  userName?: string
  avatarUrl?: string
}

import {useBreakpoints} from '@vueuse/core'
// Используем хранилище Pinia
const globalsStore = useGlobalsStore();
const {params, images} = storeToRefs(globalsStore);// Загружаем данные на сервере при каждой загрузке страницы
const {data} = await useAsyncData('globals', async () => {
  await globalsStore.fetchData(); // Вызываем метод fetchData из хранилища
  return {params: globalsStore.params, images: globalsStore.images};
});

const props = defineProps<Props>()

const {isAuthenticated, user, logout} = useAuth();
const config = useRuntimeConfig() // Используем useRuntimeConfig()
const api = config.public.API_URL
const {data: menuData} = await useFetch(api + `/api/v1/amenu`);
const menu = (menuData.value || []) as any[];

const isSubMenuOpen = ref<Record<string, boolean>>({})
const hoveredItem = ref<string | null>(null)
const tooltipPosition = ref({top: 0, left: 0})

const emit = defineEmits(['toggle-menu'])

const breakpoints = useBreakpoints({
  mobile: 640, // например, до 640px - мобильные устройства
})

const isMobile = breakpoints.smaller('mobile') // true если экран меньше 640px

const emitToggleMenu = () => {
  if (isMobile.value) { // вызываем только на мобильных
    emit('toggle-menu')
  }
}
const toggleSubMenu = (itemName: string) => {
  isSubMenuOpen.value[itemName] = !isSubMenuOpen.value[itemName]
}

const handleHover = (event: MouseEvent, itemName: string) => {
  hoveredItem.value = itemName
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  tooltipPosition.value = {
    top: rect.top + rect.height / 2 - 20,
    left: rect.right + 8
  }
}

const handleLeave = () => {
  hoveredItem.value = null
}

</script>

<template>
  <div :class="{'is-collapsed': isMenuCollapsed}" class="menu-container">
    <!-- Область меню -->
    <div class="menu-scroll-area">
      <nav class="menu-content">
        <ul class="menu-list">

          <li
              v-for="item in menu"
              :key="item.title"
              class="menu-item"
              @mouseenter="(e) => handleHover(e, item.title)"
              @mouseleave="handleLeave"
          >
            <!-- Пункты без подменю -->
            <NuxtLink
                v-if="!item.submenu"
                :class="{'justify-center': isMenuCollapsed}"
                :to="item.slug ? '/'+item.slug : '/'"
                active-class="border border-gray-600 bg-blue-950"
                class="menu-link"
                @click="emitToggleMenu"
            >
              <Icon :name="item.icon" class="menu-icon"/>
              <span v-if="!isMenuCollapsed" class="menu-text">{{ item.title }}</span>
            </NuxtLink>

            <!-- Пункты с подменю -->
            <button
                v-else
                :class="{'justify-center': isMenuCollapsed}"
                class="menu-link justify-between"
                @click="toggleSubMenu(item.title)"
            >
              <Icon :name="item.icon" class="menu-icon"/>
              <span v-if="!isMenuCollapsed" class="menu-text">{{ item.title }}</span>
              <Icon
                  v-if="!isMenuCollapsed"
                  :class="{'rotate-180': isSubMenuOpen[item.title]}"
                  class="chevron-icon"
                  name="heroicons:chevron-down"
              />
            </button>

            <!-- Подменю -->
            <div
                v-if="!isMenuCollapsed && item.submenu && isSubMenuOpen[item.title]"
                class="submenu bg-gray-900 p-1"
            >
              <NuxtLink
                  v-for="subItem in item.submenu"
                  :key="subItem.title"
                  :to="subItem.link"
                  active-class="border border-gray-600 bg-blue-950"
                  class="submenu-link text-sm"
                  @click="emitToggleMenu"
              >
                <Icon :name="subItem.icon" class="submenu-icon"/>
                <span>{{ subItem.title }}</span>
              </NuxtLink>
            </div>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Блок кредитов с пользовательской информацией -->
    <div class="credits-block">
      <NuxtLink class="user-avatar" to="/account">
        <img :src="(user as any)?.avatar_path || (images as any)?.default_user" alt="User avatar" class="avatar-img mr-2">
      </NuxtLink>
      <div v-if="!isMenuCollapsed" class="user-info">

        <div v-if="isAuthenticated" class="user-details">
          <NuxtLink class="user-name" to="/account">{{ (user as any)?.name }}</NuxtLink>
          <button class="logout-btn" @click="logout">
            <span>Выход</span>
            <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <NuxtLink v-else class="login-link" to="/account">Вход/Регистрация</NuxtLink>

      </div>
    </div>

    <!-- Подсказки для компактного режима -->
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div
            v-if="isMenuCollapsed && hoveredItem"
            :style="{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`
          }"
            class="menu-tooltip"
        >
          {{ hoveredItem }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

/* Область меню */
.menu-scroll-area {
  position: absolute;
  top: 0;
  bottom: 60px;
  left: 0;
  right: 0;
  overflow-y: auto;
}

.menu-content {
  padding: 4px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin-bottom: 4px;
}

.menu-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 5px 12px;
  border-radius: 6px;
  color: #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-link:hover {
  background-color: #374151;
}

.menu-link.justify-center {
  justify-content: center;
}

.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-text {
  margin-left: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  margin-left: 8px;
  transition: transform 0.2s;
}

.chevron-icon.rotate-180 {
  transform: rotate(180deg);
}

.submenu {
  padding-left: 20px;
}

.submenu-link {
  display: flex;
  align-items: center;
  padding: 8px 5px;
  border-radius: 6px;
  font-size: 14px;
  color: #e5e7eb;
  text-decoration: none;
  transition: background-color 0.2s;
}

.submenu-link:hover {
  background-color: #374151;
}

.submenu-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

/* Блок кредитов */
.credits-block {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 0 12px;
  background-color: #1f2937;
  border-top: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  flex: 1;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  color: #e5e7eb;
  text-decoration: none;
  transition: color 0.2s;
}

.user-name:hover {
  color: #3b82f6;
}

.logout-btn {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-top: 2px;
  transition: color 0.2s;
}

.logout-btn:hover {
  color: #e5e7eb;
}

.logout-icon {
  width: 14px;
  height: 14px;
  margin-left: 4px;
}

.login-link {
  font-size: 14px;
  color: #e5e7eb;
  text-decoration: none;
  transition: color 0.2s;
}

.login-link:hover {
  color: #3b82f6;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

/* Подсказки */
.menu-tooltip {
  position: fixed;
  background-color: #111827;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  z-index: 50;
  font-size: 14px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* Мобильная адаптация */
@media (max-width: 767px) {
  .menu-container {
    height: 100vh;
  }

  .menu-scroll-area {
    position: relative;
    flex: 1;
    overflow-y: auto;
    padding-bottom: 60px;
    bottom: auto;
  }

  .credits-block {
    position: sticky;
    bottom: 0;
    z-index: 10;
  }
}

/* Компактный режим */
.menu-container.is-collapsed .user-info {
  display: none;
}

.menu-container.is-collapsed .user-avatar {
  margin: 0 auto;
}

.menu-container.is-collapsed .avatar-img {
  width: 32px;
  height: 32px;
}
</style>