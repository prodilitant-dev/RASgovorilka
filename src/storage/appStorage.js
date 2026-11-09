// src/storage/appStorage.js
import { getDB } from './db';
import { logger } from '@utils/logger';

export async function loadAppData() {
  try {
    logger.debug('Loading app data from IndexedDB');
    const db = await getDB();
    const data = await db.get('appData', 'main');
    logger.debug(`App data loaded: ${data ? 'found' : 'not found'}`);
    return data?.value || null;
  } catch (e) {
    logger.error('loadAppData error:', e);
    return null;
  }
}

export async function saveAppData(value) {
  try {
    logger.debug('Saving app data to IndexedDB');
    const db = await getDB();
    await db.put('appData', { key: 'main', value });
    logger.debug('App data saved successfully');
    return true;
  } catch (e) {
    logger.error('saveAppData error:', e);
    return false;
  }
}

/**
 * Атомарная read-modify-write операция над 'appData/main'.
 * IDB сериализует readwrite-транзакции на одном store —
 * параллельные вызовы не перетирают друг друга.
 *
 * @param {(data: Object) => void} mutator - мутирует data in-place
 * @returns {Promise<boolean>} true при успехе
 */
export async function mutateAppData(mutator) {
  try {
    const db = await getDB();
    const tx = db.transaction('appData', 'readwrite');
    const store = tx.objectStore('appData');
    const record = await store.get('main');
    const data = record?.value;
    if (!data) {
      await tx.done;
      return false;
    }
    mutator(data);
    await store.put({ key: 'main', value: data });
    await tx.done;
    return true;
  } catch (e) {
    logger.error('mutateAppData error:', e);
    return false;
  }
}

export async function saveProfile(profile) {
  logger.debug(`Saving profile: ${profile.id} (${profile.name})`);
  const ok = await mutateAppData((data) => {
    if (!Array.isArray(data.profiles)) data.profiles = [];
    const idx = data.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      data.profiles[idx] = profile;
    } else {
      data.profiles.push(profile);
    }
  });
  if (!ok) {
    logger.error('saveProfile: no app data');
  } else {
    logger.debug(`Profile ${profile.id} saved`);
  }
  return ok;
}

export async function deleteProfile(id) {
  logger.debug(`Deleting profile: ${id}`);
  const ok = await mutateAppData((data) => {
    if (Array.isArray(data.profiles)) {
      data.profiles = data.profiles.filter((p) => p.id !== id);
    }
  });
  if (!ok) {
    logger.error('deleteProfile: no app data');
  } else {
    logger.debug(`Profile ${id} deleted`);
  }
  return ok;
}
