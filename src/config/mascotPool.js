// src/config/mascotPool.js

/**
 * Пул картинок для «маскота» в модалке «О приложении».
 * Случайная из списка показывается при каждом открытии.
 *
 * Пути — относительные, без базового URL и без .webp.
 * Пример: 'icons/say' → {BASE_URL}icons/say.webp
 */
export const MASCOT_POOL = [
  // === Иконки из icons/ ===
  'icons/say',
  'icons/write',
  'icons/learning',
  'icons/games',
  'icons/yesno',
  'icons/schedule',
  'icons/profiles',
  'icons/general',
  'icons/profile-default',

  // === Карточки из cards/ ===
  // Потребности
  'cards/drink',
  'cards/eat',
  'cards/sleep',
  'cards/toilet',
  'cards/pain',
  'cards/tired',
  'cards/hug',
  // Эмоции
  'cards/joy',
  'cards/sadness',
  'cards/anger',
  'cards/fear',
  'cards/calm',
  'cards/bored',
  // Просьбы
  'cards/give',
  'cards/help-request',
  'cards/show',
  // Еда
  'cards/bread',
  'cards/apple',
  'cards/banana',
  'cards/soup',
  'cards/porridge',
  'cards/cookie',
  'cards/cheese',
  // Напитки
  'cards/water',
  'cards/milk',
  'cards/juice',
  'cards/tea',
  // Игры
  'cards/ball',
  'cards/blocks',
  'cards/car',
  'cards/puzzle',
];

/**
 * Возвращает URL случайной картинки из пула.
 */
export function getRandomMascotUrl() {
  const name = MASCOT_POOL[Math.floor(Math.random() * MASCOT_POOL.length)];
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${name}.webp`;
}
