// src/config/defaultData/index.js
import { uid } from '@utils/id';
import { autoDetectCard } from '@utils/inflect';
import { CATEGORIES } from './categories';
import { CARD_BANK } from '@config/cardBank';
import { QUICK_BUTTONS } from './quickButtons';
import { YESNO_BUTTONS } from './yesnoButtons';
import { SCHEDULE_TEMPLATES } from './scheduleTemplates';
import { SCHEDULE_DAY_MAPPING } from './scheduleDayMapping';
import { DEFAULT_LEARNING_SETTINGS, DEFAULT_GAMES_SETTINGS } from './defaultSettings';

export { DEFAULT_GLOBAL_SETTINGS } from './defaultSettings';

export function createDefaultProfile(name = 'дом', icon = 'profile-default') {
  const categories = CATEGORIES.map((cat) => ({ ...cat }));

  const cards = {};
  categories.forEach((cat) => {
    // Если это "Банк карточек" — берем ВСЕ слова. Иначе — только этой категории.
    const sourceCards =
      cat.id === 'dictionary' ? CARD_BANK : CARD_BANK.filter((item) => item.category === cat.id);

    cards[cat.id] = sourceCards.map((raw) => {
      const card = {
        id: uid(),
        text: raw.word.charAt(0).toUpperCase() + raw.word.slice(1),
        emoji: raw.emoji || '🖼️',
        wordType: raw.wordType || cat.wordType,
        gender: raw.gender || null,
        animate: false,
        imageId: null,
        // Используем filename из базы (например, "спортивные_штаны.webp")
        imagePath: `cards/${raw.category}/${raw.filename || raw.word + '.webp'}`,
        forms: null,
        variants: raw.variants || [],
      };

      if (['noun', 'pronoun', 'adjective'].includes(card.wordType)) {
        autoDetectCard(card);
      }
      return card;
    });
  });

  const quickButtons = QUICK_BUTTONS.map((btn) => {
    // Ищем слово в банке (без учета регистра)
    const bankItem = CARD_BANK.find((item) => item.word.toLowerCase() === btn.text.toLowerCase());

    return {
      ...btn,
      id: uid(),
      imageId: null,
      imagePath: bankItem ? `cards/${bankItem.category}/${bankItem.filename}` : null,
      forms: null,
    };
  });

  const yesnoButtons = YESNO_BUTTONS.map((btn) => ({
    ...btn,
    id: uid(),
    imageId: null,
    forms: null,
  }));

  const scheduleTemplates = SCHEDULE_TEMPLATES.map((template) => ({
    ...template,
    id: uid(),
    events: template.events.map((event) => ({
      ...event,
      id: uid(),
      imageId: null,
    })),
  }));

  const scheduleDayMapping = {};
  const weekdayTemplate = scheduleTemplates.find((t) => t.name === 'Будний день');
  const weekendTemplate = scheduleTemplates.find((t) => t.name === 'Выходной день');
  if (weekdayTemplate && weekendTemplate) {
    for (const day in SCHEDULE_DAY_MAPPING) {
      const templateName = SCHEDULE_DAY_MAPPING[day];
      if (templateName === 'wd' && weekdayTemplate) scheduleDayMapping[day] = weekdayTemplate.id;
      else if (templateName === 'we' && weekendTemplate)
        scheduleDayMapping[day] = weekendTemplate.id;
    }
  }

  const learningSettings = JSON.parse(JSON.stringify(DEFAULT_LEARNING_SETTINGS));
  const categoryIds = categories.map((c) => c.id);
  learningSettings.quiz.categoryIds = [...categoryIds];
  learningSettings.guess.categoryIds = [...categoryIds];
  learningSettings.sorting.categoryIds = [...categoryIds];

  const gamesSettings = JSON.parse(JSON.stringify(DEFAULT_GAMES_SETTINGS));
  gamesSettings.memory.categoryIds = [...categoryIds];

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
