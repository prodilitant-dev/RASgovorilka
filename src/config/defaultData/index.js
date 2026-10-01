// src/config/defaultData/index.js
import { uid } from '@utils/id';
import { autoDetectCard } from '@utils/inflect';
import { CATEGORIES } from './categories';
import { CARDS_BY_CATEGORY } from './cards';
import { QUICK_BUTTONS } from './quickButtons';
import { YESNO_BUTTONS } from './yesnoButtons';
import { SCHEDULE_TEMPLATES } from './scheduleTemplates';
import { SCHEDULE_DAY_MAPPING } from './scheduleDayMapping';
import { DEFAULT_LEARNING_SETTINGS, DEFAULT_GAMES_SETTINGS } from './defaultSettings';

/**
 * Создаёт профиль по умолчанию с актуальными стоковыми данными
 * @param {string} name - имя профиля
 * @param {string} icon - эмодзи иконки
 * @returns {Object} объект профиля
 */
export function createDefaultProfile(name = 'Мой профиль', icon = '🧑') {
  // 1. Создаём категории с новыми id
  const categories = CATEGORIES.map(cat => ({ ...cat }));

  // 2. Создаём карточки для каждой категории
  const cards = {};
  categories.forEach(cat => {
    const rawCards = CARDS_BY_CATEGORY[cat.id] || [];
    // Если категория не найдена в CARDS_BY_CATEGORY, используем пустой массив
    cards[cat.id] = rawCards.map(raw => {
      const card = {
        id: uid(),
        text: raw.text,
        emoji: raw.emoji,
        wordType: raw.wordType || cat.wordType,
        animate: raw.animate || false,
        imageId: null,
        forms: null,
        formsEdited: false,
      };
      // Если слово является существительным или прилагательным, автоопределение форм
      if (card.wordType === 'noun' || card.wordType === 'pronoun' || card.wordType === 'adjective') {
        autoDetectCard(card);
      }
      return card;
    });
  });

  // 3. Быстрые кнопки
  const quickButtons = QUICK_BUTTONS.map(btn => ({
    ...btn,
    id: uid(),
    imageId: null,
    forms: null,
  }));

  // 4. Кнопки Да/Нет
  const yesnoButtons = YESNO_BUTTONS.map(btn => ({
    ...btn,
    id: uid(),
    imageId: null,
    forms: null,
  }));

  // 5. Шаблоны расписания
  const scheduleTemplates = SCHEDULE_TEMPLATES.map(template => ({
    ...template,
    id: uid(),
    events: template.events.map(event => ({
      ...event,
      id: uid(),
      imageId: null,
    })),
  }));

  // 6. Привязка дней: заменяем имена шаблонов на реальные id
  const scheduleDayMapping = {};
  // Находим id для 'wd' (будни) и 'we' (выходные)
  const weekdayTemplate = scheduleTemplates.find(t => t.name === 'Будний день');
  const weekendTemplate = scheduleTemplates.find(t => t.name === 'Выходной день');
  if (weekdayTemplate && weekendTemplate) {
    for (const day in SCHEDULE_DAY_MAPPING) {
      const templateName = SCHEDULE_DAY_MAPPING[day];
      if (templateName === 'wd' && weekdayTemplate) {
        scheduleDayMapping[day] = weekdayTemplate.id;
      } else if (templateName === 'we' && weekendTemplate) {
        scheduleDayMapping[day] = weekendTemplate.id;
      }
    }
  }

  // 7. Настройки по умолчанию (копируем, чтобы не мутировать)
  const learningSettings = JSON.parse(JSON.stringify(DEFAULT_LEARNING_SETTINGS));
  // Заполняем категории в настройках (все id категорий)
  const categoryIds = categories.map(c => c.id);
  learningSettings.quiz.categoryIds = [...categoryIds];
  learningSettings.guess.categoryIds = [...categoryIds];
  learningSettings.sorting.categoryIds = [...categoryIds];

  const gamesSettings = JSON.parse(JSON.stringify(DEFAULT_GAMES_SETTINGS));
  gamesSettings.memory.categoryIds = [...categoryIds];

  // 8. Собираем профиль
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
    learningSettings,
    gamesSettings,
  };
}