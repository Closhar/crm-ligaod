// composables/useDateUtils.ts
export const useDateUtils = () => {
  // Функция для получения локальной даты в формате YYYY-MM-DD
  const getLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Функция для получения UTC даты в формате YYYY-MM-DD
  const getUTCDate = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Функция для форматирования даты для отображения
  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Функция для получения названия месяца
  const getMonthName = (month: number): string => {
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return months[month];
  };

  // Функция для получения дня недели
  const getDayOfWeek = (date: Date): string => {
    const days = [
      'воскресенье', 'понедельник', 'вторник', 'среда',
      'четверг', 'пятница', 'суббота'
    ];
    return days[date.getDay()];
  };

  return {
    getLocalDate,
    getUTCDate,
    formatDisplayDate,
    getMonthName,
    getDayOfWeek
  };
}; 