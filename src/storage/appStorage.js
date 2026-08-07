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

export async function saveProfile(profile) {
  logger.debug(`Saving profile: ${profile.id} (${profile.name})`);
  const data = await loadAppData();
  if (!data) {
    logger.error('saveProfile: no app data');
    return false;
  }
  const idx = data.profiles.findIndex(p => p.id === profile.id);
  if (idx >= 0) {
    data.profiles[idx] = profile;
  } else {
    data.profiles.push(profile);
  }
  logger.debug(`Profile ${profile.id} saved (${idx >= 0 ? 'updated' : 'added'})`);
  return saveAppData(data);
}

export async function deleteProfile(id) {
  logger.debug(`Deleting profile: ${id}`);
  const data = await loadAppData();
  if (!data) {
    logger.error('deleteProfile: no app data');
    return false;
  }
  data.profiles = data.profiles.filter(p => p.id !== id);
  logger.debug(`Profile ${id} deleted`);
  return saveAppData(data);
}