// src/services/image/deleteUnusedImages.js
import { getAllImageIds } from '@storage/imageStorage';
import { deleteImage } from './deleteImage';
import { getState } from '@state/store'; // <-- ДОБАВЛЕНО
import { logger } from '@utils/logger';

function collectUsedImageIdsFromProfile(profile, usedSet) {
  if (profile.imageId) usedSet.add(profile.imageId);

  for (const categoryId in profile.cards) {
    (profile.cards[categoryId] || []).forEach((card) => {
      if (card.imageId) usedSet.add(card.imageId);
    });
  }

  (profile.quickButtons || []).forEach((btn) => {
    if (btn.imageId) usedSet.add(btn.imageId);
  });

  (profile.yesnoButtons || []).forEach((btn) => {
    if (btn.imageId) usedSet.add(btn.imageId);
  });

  (profile.scheduleTemplates || []).forEach((template) => {
    (template.events || []).forEach((event) => {
      if (event.imageId) usedSet.add(event.imageId);
    });
  });

  (profile.stories || []).forEach((story) => {
    if (story.coverImageId) usedSet.add(story.coverImageId);
    (story.slides || []).forEach((slide) => {
      if (slide.imageId) usedSet.add(slide.imageId);
      (slide.cards || []).forEach((card) => {
        if (card.imageId) usedSet.add(card.imageId);
      });
    });
  });
}

export async function deleteUnusedImages() {
  // Получаем ВСЕ профили из состояния
  const state = getState();
  const profiles = state.profiles || [];

  const allIds = await getAllImageIds();
  if (allIds.length === 0) return 0;

  const usedIds = new Set();
  // Собираем ID из всех профилей
  profiles.forEach((profile) => collectUsedImageIdsFromProfile(profile, usedIds));

  const unused = allIds.filter((id) => !usedIds.has(id));

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
