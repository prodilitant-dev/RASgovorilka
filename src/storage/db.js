import { openDB } from 'idb';

let dbPromise = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('RASGovorilkaDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('appData')) {
          db.createObjectStore('appData', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}