// src/services/image/deleteUnusedImages.js

import { getAllImageIds } from '@storage/imageStorage';
import { deleteImage } from './deleteImage';
import { logger } from '@utils/logger';

/**
 * Собирает все используемые imageId из профиля.
 * @param {Object} profile - профиль пользователя
 * @returns {Set<string>}
 */
function collectUsedImageIds(profile) {
  const used = new Set();

  // 1. Карточки во всех категориях
  for (const categoryId in profile.cards) {
    const cards = profile.cards[categoryId] || [];
    cards.forEach(card => {
      if (card.imageId) used.add(card.imageId);
    });
  }

  // 2. Быстрые кнопки
  (profile.quickButtons || []).forEach(btn => {
    if (btn.imageId) used.add(btn.imageId);
  });

  // 3. Кнопки Да/Нет
  (profile.yesnoButtons || []).forEach(btn => {
    if (btn.imageId) used.add(btn.imageId);
  });

  // 4. События расписания
  (profile.scheduleTemplates || []).forEach(template => {
    (template.events || []).forEach(event => {
      if (event.imageId) used.add(event.imageId);
    });
  });

  return used;
}

/**
 * Удаляет все изображения, которые не используются в профиле.
 * @param {Object} profile - профиль пользователя
 * @returns {Promise<number>} - количество удалённых изображений
 */
export async function deleteUnusedImages(profile) {
  if (!profile || !profile.id) {
    throw new Error('Не передан валидный профиль');
  }

  // Получаем все id из хранилища
  const allIds = await getAllImageIds();
  if (allIds.length === 0) return 0;

  // Собираем используемые id
  const usedIds = collectUsedImageIds(profile);

  // Находим неиспользуемые
  const unused = allIds.filter(id => !usedIds.has(id));

  if (unused.length === 0) {
    logger.debug('Нет неиспользуемых изображений');
    return 0;
  }

  logger.debug(`Найдено ${unused.length} неиспользуемых изображений, удаляем...`);

  let deletedCount = 0;
  for (const id of unused) {
    try {
      const success = await deleteImage(id);
      if (success) deletedCount++;
    } catch (err) {
      logger.error(`Ошибка удаления изображения ${id}:`, err);
    }
  }

  logger.debug(`Удалено ${deletedCount} изображений`);
  return deletedCount;
}