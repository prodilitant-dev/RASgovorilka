// src/config/defaultData/scheduleTemplates.js

export const SCHEDULE_TEMPLATES = [
  {
    name: 'Будний день',
    events: [
      { time: '08:00', text: 'Просыпаемся', icon: '🌅' },
      { time: '08:30', text: 'Завтрак', icon: '🥣' },
      { time: '09:00', text: 'Чистим зубы', icon: '🪥' },
      { time: '10:00', text: 'Занятия', icon: '📚' },
      { time: '12:00', text: 'Обед', icon: '🍲' },
      { time: '13:00', text: 'Прогулка', icon: '🚶' },
      { time: '15:00', text: 'Свободное время', icon: '🎮' },
      { time: '18:00', text: 'Ужин', icon: '🍽️' },
      { time: '20:00', text: 'Душ', icon: '🚿' },
      { time: '21:00', text: 'Сказка на ночь', icon: '📖' },
      { time: '22:00', text: 'Сон', icon: '😴' },
    ],
  },
  {
    name: 'Выходной день',
    events: [
      { time: '09:00', text: 'Просыпаемся', icon: '🌅' },
      { time: '09:30', text: 'Завтрак', icon: '🥞' },
      { time: '10:30', text: 'Прогулка', icon: '🚶' },
      { time: '13:00', text: 'Обед', icon: '🍲' },
      { time: '15:00', text: 'Игры', icon: '🎲' },
      { time: '18:00', text: 'Ужин', icon: '🍽️' },
      { time: '20:00', text: 'Фильм', icon: '📺' },
      { time: '22:00', text: 'Сон', icon: '😴' },
    ],
  },
];