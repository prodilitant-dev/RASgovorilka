// src/config/defaultData/scheduleTemplates.js

export const SCHEDULE_TEMPLATES = [
  {
    name: 'Будний день',
    events: [
      {
        time: '08:00',
        text: 'Просыпаемся',
        icon: '🌅',
        imagePath: 'cards/potrebnosti/просыпаться.webp',
      },
      { time: '08:30', text: 'Завтрак', icon: '🥣', imagePath: 'cards/potrebnosti/завтрак.webp' },
      {
        time: '09:00',
        text: 'Чистим зубы',
        icon: '🪥',
        imagePath: 'cards/rezhim/чистить_зубы.webp',
      },
      { time: '10:00', text: 'Занятия', icon: '📚', imagePath: 'cards/rezhim/учиться.webp' },
      { time: '12:00', text: 'Обед', icon: '🍲', imagePath: 'cards/potrebnosti/обед.webp' },
      { time: '13:00', text: 'Прогулка', icon: '🚶', imagePath: 'cards/potrebnosti/гулять.webp' },
      {
        time: '15:00',
        text: 'Свободное время',
        icon: '🎮',
        imagePath: 'cards/potrebnosti/играть.webp',
      },
      { time: '18:00', text: 'Ужин', icon: '🍽️', imagePath: 'cards/potrebnosti/ужин.webp' },
      { time: '20:00', text: 'Душ', icon: '🚿', imagePath: 'cards/rezhim/умываться.webp' },
      { time: '21:00', text: 'Сказка на ночь', icon: '📖', imagePath: 'cards/rezhim/читать.webp' },
      { time: '22:00', text: 'Сон', icon: '😴', imagePath: 'cards/potrebnosti/спать.webp' },
    ],
  },
  {
    name: 'Выходной день',
    events: [
      {
        time: '09:00',
        text: 'Просыпаемся',
        icon: '🌅',
        imagePath: 'cards/potrebnosti/просыпаться.webp',
      },
      { time: '09:30', text: 'Завтрак', icon: '🥞', imagePath: 'cards/potrebnosti/завтрак.webp' },
      { time: '10:30', text: 'Прогулка', icon: '🚶', imagePath: 'cards/potrebnosti/гулять.webp' },
      { time: '13:00', text: 'Обед', icon: '🍲', imagePath: 'cards/potrebnosti/обед.webp' },
      { time: '15:00', text: 'Игры', icon: '🎲', imagePath: 'cards/potrebnosti/играть.webp' },
      { time: '18:00', text: 'Ужин', icon: '🍽️', imagePath: 'cards/potrebnosti/ужин.webp' },
      { time: '20:00', text: 'Мультфильм', icon: '📺', imagePath: 'cards/rezhim/мультики.webp' },
      { time: '22:00', text: 'Сон', icon: '😴', imagePath: 'cards/potrebnosti/спать.webp' },
    ],
  },
];
