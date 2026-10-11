// src/config/modes.js
export const MODES = [
  { id: 'say',       label: 'Сказать',     icon: 'say',       emoji: '🗣' },
  { id: 'write',     label: 'Написать',    icon: 'write',     emoji: '📝' },
  { id: 'learning',  label: 'Обучение',    icon: 'learning',  emoji: '📚' },
  { id: 'games',     label: 'Игры',        icon: 'games',     emoji: '🎮' },
  { id: 'yesno',     label: 'Да/Нет',      icon: 'yesno',     emoji: '👍' },
  { id: 'schedule',  label: 'Расписание',  icon: 'schedule',  emoji: '📅' },
];

export const MODE_IDS = MODES.map(m => m.id);