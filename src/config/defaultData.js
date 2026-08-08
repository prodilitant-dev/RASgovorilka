// src/config/defaultData.js
import { uid } from '@utils/id';

// Начальные категории
const defaultCategories = [
  { id: '', name: 'Еда', hidden: false, wordType: 'noun' },
  { id: '', name: 'Напитки', hidden: false, wordType: 'noun' },
  { id: '', name: 'Действия', hidden: false, wordType: 'verb' },
  { id: '', name: 'Эмоции', hidden: false, wordType: 'adjective' },
  { id: '', name: 'Одежда', hidden: false, wordType: 'noun' },
];

// Начальные карточки по категориям
const defaultCardsByCategory = {
  'Еда': [
    { text: 'Хлеб', emoji: '🍞', wordType: 'noun' },
    { text: 'Молоко', emoji: '🥛', wordType: 'noun' },
    { text: 'Сыр', emoji: '🧀', wordType: 'noun' },
  ],
  'Напитки': [
    { text: 'Вода', emoji: '💧', wordType: 'noun' },
    { text: 'Сок', emoji: '🧃', wordType: 'noun' },
  ],
  'Действия': [
    { text: 'Пить', emoji: '🥤', wordType: 'verb' },
    { text: 'Есть', emoji: '🍽️', wordType: 'verb' },
    { text: 'Спать', emoji: '😴', wordType: 'verb' },
  ],
  'Эмоции': [
    { text: 'Радость', emoji: '😊', wordType: 'noun' },
    { text: 'Грусть', emoji: '😢', wordType: 'noun' },
  ],
  'Одежда': [
    { text: 'Шапка', emoji: '🧢', wordType: 'noun' },
    { text: 'Куртка', emoji: '🧥', wordType: 'noun' },
  ],
};

// Начальные быстрые кнопки
const defaultQuickButtons = [
  { id: '', text: 'Привет', emoji: '👋' },
  { id: '', text: 'Спасибо', emoji: '🙏' },
  { id: '', text: 'Помоги', emoji: '🆘' },
];

// Начальные кнопки "Да/Нет"
const defaultYesNoButtons = [
  { id: '', text: 'Да', emoji: '✅' },
  { id: '', text: 'Нет', emoji: '❌' },
  { id: '', text: 'Хочу', emoji: '😊' },
  { id: '', text: 'Не хочу', emoji: '😞' },
];

// Начальные шаблоны расписания
const defaultScheduleTemplates = [
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

export function createDefaultProfile(name = 'Новый профиль', icon = '🧑') {
  // Генерируем ID для категорий
  const categories = defaultCategories.map(cat => ({
    ...cat,
    id: uid(),
  }));

  // Генерируем карточки для каждой категории
  const cards = {};
  categories.forEach(cat => {
    const cardList = defaultCardsByCategory[cat.name] || [];
    cards[cat.id] = cardList.map(card => ({
      id: uid(),
      ...card,
    }));
  });

  // Генерируем ID для быстрых кнопок
  const quickButtons = defaultQuickButtons.map(btn => ({
    ...btn,
    id: uid(),
  }));

  // Генерируем ID для кнопок "Да/Нет"
  const yesnoButtons = defaultYesNoButtons.map(btn => ({
    ...btn,
    id: uid(),
  }));

  // Генерируем ID для шаблонов и их событий
  const scheduleTemplates = defaultScheduleTemplates.map(template => ({
    ...template,
    id: uid(),
    events: template.events.map(event => ({
      ...event,
      id: uid(),
    })),
  }));

  // Привязка дней: пн-пт (1-5) -> будний, сб-вс (6,0) -> выходной
  const scheduleDayMapping = {};
  if (scheduleTemplates.length >= 2) {
    const weekdayTemplateId = scheduleTemplates[0].id;
    const weekendTemplateId = scheduleTemplates[1].id;
    scheduleDayMapping['0'] = weekendTemplateId;   // Воскресенье
    scheduleDayMapping['1'] = weekdayTemplateId;   // Понедельник
    scheduleDayMapping['2'] = weekdayTemplateId;
    scheduleDayMapping['3'] = weekdayTemplateId;
    scheduleDayMapping['4'] = weekdayTemplateId;
    scheduleDayMapping['5'] = weekdayTemplateId;
    scheduleDayMapping['6'] = weekendTemplateId;   // Суббота
  }

  return {
    id: uid(),
    name,
    icon,
    categories,
    cards,
    quickButtons,
    yesnoButtons,
    scheduleTemplates,
    scheduleDayMapping,
    scheduleDailyState: {},
    modeOrder: ['say', 'write', 'learning', 'games', 'yesno', 'schedule'],
    hiddenModes: [],
    learningSettings: {},
    gamesSettings: {},
  };
}