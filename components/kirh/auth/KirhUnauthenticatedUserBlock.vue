<template>
  <div class="auth-page">
    <div class="auth-shell">
      <section class="auth-brand">
        <div v-if="showLogo" class="auth-logo-wrap">
          <img :src="logo" alt="Logo" class="auth-logo">
        </div>

        <p class="auth-eyebrow">Административная панель</p>
        <h1>{{ title }}</h1>
        <p class="auth-subtitle">
          Управление контентом, участниками, событиями и настройками спортивного портала.
        </p>

        <div class="auth-metrics">
          <div>
            <span>CRM</span>
            <strong>SPORTREP</strong>
          </div>
          <div>
            <span>Доступ</span>
            <strong>secure</strong>
          </div>
        </div>
      </section>

      <section class="auth-panel">
        <div class="auth-tabs">
          <button
              :class="{ 'is-active': activeTab === 'login' }"
              type="button"
              @click="activeTab = 'login'"
          >
            {{ enter }}
          </button>
          <button
              v-if="registration"
              :class="{ 'is-active': activeTab === 'register' }"
              type="button"
              @click="activeTab = 'register'"
          >
            {{ reg }}
          </button>
          <button
              :class="{ 'is-active': activeTab === 'forgot' }"
              type="button"
              @click="activeTab = 'forgot'"
          >
            {{ restorePass }}
          </button>
        </div>

        <div class="auth-panel__body">
          <Transition name="auth-fade" mode="out-in">
            <div v-if="activeTab === 'login'" key="login">
              <h2>Вход в систему</h2>
              <p>Введите учетные данные администратора.</p>
              <KirhAuth :google-auth-enable="googleAuthEnable"/>
            </div>

            <div v-else-if="activeTab === 'register' && registration" key="register">
              <h2>Регистрация</h2>
              <p>Создайте учетную запись администратора.</p>
              <KirhRegistration/>
            </div>

            <div v-else key="forgot">
              <h2>Восстановление доступа</h2>
              <p>Укажите email, и мы отправим ссылку для сброса пароля.</p>
              <KirhForgotPass/>
            </div>
          </Transition>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import KirhForgotPass from "~/components/kirh/auth/KirhForgotPass.vue";
import KirhRegistration from "~/components/kirh/auth/KirhRegistration.vue";
import KirhAuth from "~/components/kirh/auth/KirhAuth.vue";

const props = defineProps({
  registration: {
    type: Boolean,
    default: true,
  },
  googleAuthEnable: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'Аутентификация/Регистрация'
  },
  enter: {
    type: String,
    default: 'Вход'
  },
  reg: {
    type: String,
    default: 'Регистрация'
  },
  restorePass: {
    type: String,
    default: 'Восстановить'
  },
  showLogo: {
    type: Boolean,
    default: false
  },
  logo: {
    type: String,
    default: '/images/logo.png'
  }
})

const config = useRuntimeConfig(); // Используем useRuntimeConfig()
const api = config.public.API_URL;

const activeTab = ref('login');

</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background:
    radial-gradient(circle at 14% 10%, rgba(246, 113, 12, .18), transparent 30%),
    radial-gradient(circle at 88% 16%, rgba(68, 138, 255, .16), transparent 28%),
    linear-gradient(135deg, #061225 0%, #0a1e45 52%, #061225 100%);
  color: #fff;
}

.auth-shell {
  width: min(1180px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, .95fr);
  gap: 28px;
  align-items: stretch;
}

.auth-brand,
.auth-panel {
  border: 1px solid rgba(255, 255, 255, .14);
  background: linear-gradient(145deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .05));
  box-shadow: 0 28px 80px rgba(0, 0, 0, .28);
  backdrop-filter: blur(16px);
}

.auth-brand {
  min-height: 560px;
  padding: 54px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.auth-brand::after {
  content: '';
  position: absolute;
  right: -90px;
  bottom: -120px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  border: 48px solid rgba(246, 113, 12, .16);
}

.auth-logo-wrap {
  width: 132px;
  height: 132px;
  border-radius: 50%;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 34px;
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 18px 44px rgba(0, 0, 0, .24);
}

.auth-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.auth-eyebrow {
  color: #f6710c;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
  margin-bottom: 12px;
}

.auth-brand h1 {
  font-size: 52px;
  line-height: 1;
  font-weight: 900;
  margin: 0 0 20px;
  color: #fff;
}

.auth-subtitle {
  max-width: 520px;
  color: rgba(255, 255, 255, .76);
  font-size: 18px;
  line-height: 1.65;
  margin: 0;
}

.auth-metrics {
  display: flex;
  gap: 14px;
  margin-top: 38px;
}

.auth-metrics div {
  min-width: 132px;
  border: 1px solid rgba(255, 255, 255, .18);
  background: rgba(4, 15, 35, .48);
  padding: 14px 16px;
}

.auth-metrics span {
  display: block;
  color: rgba(255, 255, 255, .56);
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.auth-metrics strong {
  color: #fff;
  font-size: 18px;
}

.auth-panel {
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.auth-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.auth-tabs button {
  min-height: 44px;
  border: 1px solid rgba(246, 113, 12, .34);
  background: rgba(6, 18, 37, .66);
  color: #f6710c;
  font-weight: 800;
  cursor: pointer;
  transition: background .2s ease, color .2s ease, border-color .2s ease;
}

.auth-tabs button.is-active,
.auth-tabs button:hover {
  border-color: #f6710c;
  background: #f6710c;
  color: #061225;
}

.auth-panel__body {
  flex: 1;
  padding: 32px;
  background: rgba(255, 255, 255, .96);
  color: #122033;
}

.auth-panel__body h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 900;
  color: #061225;
}

.auth-panel__body p {
  margin: 0 0 24px;
  color: #5f6b7a;
}

.auth-panel__body :deep(label) {
  color: #122033;
  font-weight: 700;
}

.auth-panel__body :deep(input) {
  border-color: #cfd7e3;
  background: #f8fafc;
}

.auth-panel__body :deep(button[type='submit']) {
  background: #0a1e45;
  border-radius: 0;
  font-weight: 800;
}

.auth-panel__body :deep(button[type='submit']:hover) {
  background: #f6710c;
  color: #061225;
}

.auth-fade-enter-active,
.auth-fade-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}

.auth-fade-enter-from,
.auth-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-brand {
    min-height: auto;
    padding: 36px;
  }

  .auth-brand h1 {
    font-size: 38px;
  }

  .auth-panel__body {
    padding: 24px;
  }
}
</style>
