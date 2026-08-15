// src/storage/imageStorage.js
import { getDB } from './db';
import { logger } from '@utils/logger';

export async function saveImage(id, blob) {
  try {
    const db = await getDB();
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    await store.put({ id, blob });
    await tx.done;
    return true;
  } catch (e) {
    logger.error('saveImage error', e);
    return false;
  }
}

export async function loadImage(id) {
  try {
    const db = await getDB();
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const record = await store.get(id);
    return record?.blob || null;
  } catch (e) {
    logger.error('loadImage error', e);
    return null;
  }
}

export async function deleteImage(id) {
  try {
    const db = await getDB();
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    await store.delete(id);
    await tx.done;
    return true;
  } catch (e) {
    logger.error('deleteImage error', e);
    return false;
  }
}

// ✅ Добавляем функцию для получения всех id изображений
export async function getAllImageIds() {
  try {
    const db = await getDB();
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const keys = await store.getAllKeys();
    return keys; // массив строк
  } catch (e) {
    logger.error('getAllImageIds error', e);
    return [];
  }
}