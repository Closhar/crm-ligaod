import { ref, computed, readonly } from 'vue';

// Глобальное состояние для уведомлений
const notifications = ref([]);
let notificationIdCounter = 0;

// Аудио элемент для звуковых уведомлений
let audioElement = null;
// Web Audio API контекст
let audioContext = null;
let audioBuffer = null;

// Состояние активации звука
const isAudioActivated = ref(false);
// Флаг для отслеживания первого взаимодействия пользователя
const hasUserInteracted = ref(false);
// Флаг для использования браузерных уведомлений
const useBrowserNotifications = ref(false);

// Загружаем состояние звука из localStorage при инициализации
const loadAudioState = () => {
  // Проверяем, что мы на клиентской стороне
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    const savedState = localStorage.getItem('audioActivated');
    if (savedState !== null) {
      isAudioActivated.value = JSON.parse(savedState);
    }
    
    const browserNotificationsState = localStorage.getItem('useBrowserNotifications');
    if (browserNotificationsState !== null) {
      useBrowserNotifications.value = JSON.parse(browserNotificationsState);
    }
  } catch (error) {
    console.warn('Не удалось загрузить состояние звука из localStorage:', error);
  }
};

// Сохраняем состояние звука в localStorage
const saveAudioState = () => {
  // Проверяем, что мы на клиентской стороне
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('audioActivated', JSON.stringify(isAudioActivated.value));
    localStorage.setItem('useBrowserNotifications', JSON.stringify(useBrowserNotifications.value));
  } catch (error) {
    console.warn('Не удалось сохранить состояние звука в localStorage:', error);
  }
};

export const useNotifications = () => {
  // Проверяем, находимся ли мы в админке (по URL)
  const isAdminPanel = typeof window !== 'undefined' && 
    (window.location.hostname === 'crm.sporterp.ru' || 
     window.location.hostname.includes('crm.'));
  
  // Загружаем состояние при инициализации composable на клиенте
  // В админке звук отключен по умолчанию
  if (typeof window !== 'undefined') {
    if (isAdminPanel) {
      // В админке принудительно отключаем звук
      isAudioActivated.value = false;
      useBrowserNotifications.value = false;
    } else {
      loadAudioState();
    }
  }
  
  // Инициализация аудио
  const initAudio = () => {
    // Не инициализируем аудио в админке
    if (isAdminPanel) return;
    
    try {
      // Создаем Web Audio API контекст
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Также инициализируем HTML5 Audio для совместимости
      audioElement = new Audio('/sounds/match-complete.mp3');
      audioElement.volume = 0.5; // 50% громкость
      audioElement.preload = 'auto';
      
      // Добавляем обработчики событий для лучшей отладки
      audioElement.addEventListener('canplaythrough', () => {
        // Аудио файл готов к воспроизведению
      });
      
      audioElement.addEventListener('error', (e) => {
        console.warn('Ошибка загрузки аудио файла:', e);
      });
      
      audioElement.addEventListener('loadstart', () => {
        // Начало загрузки аудио файла
      });
      
      audioElement.addEventListener('loadeddata', () => {
        // Аудио данные загружены
      });
    } catch (error) {
      console.warn('Не удалось инициализировать аудио:', error);
    }
  };

  // Переключение аудио через взаимодействие пользователя
  const toggleAudio = async () => {
    try {
      if (!audioElement) {
        initAudio();
      }
      
      // Загружаем аудио через Web Audio API при первом взаимодействии
      if (!audioBuffer) {
        await loadAudioBuffer();
      }
      
      if (audioElement) {
        if (!isAudioActivated.value) {
          // Активируем звук - воспроизводим короткий звук для активации
          audioElement.currentTime = 0;
          audioElement.volume = 0.1; // Тише для активации
          await audioElement.play();
          audioElement.pause();
          audioElement.currentTime = 0;
          isAudioActivated.value = true;
          hasUserInteracted.value = true; // Отмечаем, что пользователь взаимодействовал
        } else {
          // Отключаем звук
          isAudioActivated.value = false;
        }
        
        // Сохраняем состояние в localStorage
        saveAudioState();
      }
    } catch (error) {
      console.warn('Не удалось переключить аудио:', error);
      isAudioActivated.value = false;
      saveAudioState();
    }
  };

  // Переключение браузерных уведомлений
  const toggleBrowserNotifications = async () => {
    console.log('Переключение браузерных уведомлений, текущее состояние:', useBrowserNotifications.value);
    
    if (!useBrowserNotifications.value) {
      // Запрашиваем разрешение на уведомления
      console.log('Запрашиваем разрешение на уведомления');
      const granted = await requestNotificationPermission();
      console.log('Разрешение получено:', granted);
      if (granted) {
        useBrowserNotifications.value = true;
        saveAudioState();
        console.log('Браузерные уведомления включены');
      }
    } else {
      useBrowserNotifications.value = false;
      saveAudioState();
      console.log('Браузерные уведомления отключены');
    }
  };

  // Активация аудио через взаимодействие пользователя (для обратной совместимости)
  const activateAudio = async () => {
    if (!isAudioActivated.value) {
      await toggleAudio();
    }
    // Отмечаем, что пользователь взаимодействовал с аудио
    hasUserInteracted.value = true;
  };

  // Загрузка аудио файла через Web Audio API
  const loadAudioBuffer = async () => {
    if (!audioContext || audioBuffer) return;
    
    try {
      const response = await fetch('/sounds/match-complete.mp3');
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn('Не удалось загрузить аудио через Web Audio API:', error);
    }
  };

  // Воспроизведение звука через Web Audio API
  const playWebAudio = () => {
    if (!audioContext || !audioBuffer) return;
    
    try {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = 0.5; // 50% громкость
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.warn('Не удалось воспроизвести звук через Web Audio API:', error);
    }
  };

  // Воспроизведение звука
  const playNotificationSound = async () => {
    // Не воспроизводим звук в админке
    if (isAdminPanel) return;
    
    // Проверяем, включен ли звук
    if (!isAudioActivated.value) {
      return;
    }
    
    // Проверяем, было ли взаимодействие пользователя
    if (!hasUserInteracted.value) {
      return;
    }
    
    try {
      if (!audioElement) {
        initAudio();
      }
      
      // Сначала пробуем Web Audio API
      if (audioContext && audioBuffer) {
        playWebAudio();
        return;
      }
      
      // Если Web Audio API недоступен, используем HTML5 Audio
      if (audioElement) {
        // Убеждаемся, что аудио элемент готов к воспроизведению
        audioElement.currentTime = 0; // Сброс к началу
        audioElement.volume = 0.5; // Устанавливаем громкость
        
        // Проверяем, можем ли мы воспроизвести звук
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error) {
      // Игнорируем ошибку автовоспроизведения - это нормально
      if (error.name === 'NotAllowedError') {
        // Звук заблокирован браузером (требуется взаимодействие пользователя)
      } else {
        console.warn('Не удалось воспроизвести звук:', error);
      }
    }
  };

  // Функция для добавления уведомления
  const addNotification = (type, title, message, duration = 5000) => {
    const id = ++notificationIdCounter;
    const notification = {
      id,
      type,
      title,
      message,
      progress: 100,
      createdAt: Date.now()
    };

    notifications.value.push(notification);

    // Автоскрытие уведомления
    const startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = duration - elapsed;
      
      if (remaining <= 0) {
        removeNotification(id);
        return;
      }
      
      notification.progress = (remaining / duration) * 100;
      requestAnimationFrame(updateProgress);
    };

    requestAnimationFrame(updateProgress);

    // Воспроизводим звук для успешных уведомлений
    if (type === 'success') {
      // Добавляем небольшую задержку для стабильности
      setTimeout(() => {
        playNotificationSound();
      }, 100);
    }

    return id;
  };

  // Функция для показа уведомления
  const showNotification = (type, title, message, duration) => {
    return addNotification(type, title, message, duration);
  };

  // Функция для удаления уведомления
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  // Запрос разрешения на браузерные уведомления
  const requestNotificationPermission = async () => {
    console.log('Проверка поддержки уведомлений:', 'Notification' in window);
    
    if (!('Notification' in window)) {
      console.log('Браузер не поддерживает уведомления');
      return false;
    }
    
    console.log('Текущее разрешение на уведомления:', Notification.permission);
    
    if (Notification.permission === 'granted') {
      console.log('Разрешение уже предоставлено');
      return true;
    }
    
    if (Notification.permission === 'denied') {
      console.log('Разрешение отклонено пользователем');
      return false;
    }
    
    console.log('Запрашиваем разрешение у пользователя');
    const permission = await Notification.requestPermission();
    console.log('Полученное разрешение:', permission);
    return permission === 'granted';
  };

  // Показ браузерного уведомления
  const showBrowserNotification = (title, message) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
    
    const notification = new Notification(title, {
      body: message,
      icon: '/ldr.png',
      badge: '/ldr.png',
      tag: 'match-result',
      requireInteraction: false,
      silent: false // Это позволит браузеру воспроизвести звук
    });
    
    // Автоматически закрываем уведомление через 5 секунд
    setTimeout(() => {
      notification.close();
    }, 5000);
  };

  // Уведомление о результате матча
  const showMatchResultNotification = (event) => {
    const homeTeam = event.club1?.title || event.home_team?.title || 'Команда 1';
    const awayTeam = event.club2?.title || event.away_team?.title || 'Команда 2';
    const result = event.result || 'Результат не указан';
    
    const title = 'Новый результат!';
    const message = `${homeTeam} - ${awayTeam}: ${result}`;
    
    // Показываем только браузерное уведомление если включено
    if (useBrowserNotifications.value) {
      showBrowserNotification(title, message);
    }
  };

  // Очистка всех уведомлений
  const clearAllNotifications = () => {
    notifications.value = [];
  };

  const result = {
    notifications: computed(() => notifications.value),
    addNotification,
    showNotification,
    removeNotification,
    showMatchResultNotification,
    clearAllNotifications,
    playNotificationSound,
    activateAudio,
    toggleAudio,
    toggleBrowserNotifications,
    requestNotificationPermission,
    showBrowserNotification,
    isAudioActivated: computed(() => isAudioActivated.value),
    hasUserInteracted: computed(() => hasUserInteracted.value),
    useBrowserNotifications: computed(() => useBrowserNotifications.value)
  };
  
  console.log('Экспортируемые функции из useNotifications:', Object.keys(result));
  
  return result;
}; 