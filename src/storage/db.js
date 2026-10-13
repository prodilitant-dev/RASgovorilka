// src/storage/db.js
import { openDB } from 'idb';
import { logger } from '@utils/logger';

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

/**
 * Закрывает открытое соединение (если есть).
 */
export function closeDB() {
  if (dbPromise) {
    dbPromise.then((db) => db.close()).catch(() => {});
    dbPromise = null;
  }
}

const RESET_FLAG = 'RAS_reset_pending';
const DB_NAME = 'RASGovorilkaDB';

/**
 * Помечает базу как «подлежащую удалению при следующем запуске».
 */
export function markForReset() {
  localStorage.setItem(RESET_FLAG, '1');
}

/**
 * Проверяет флаг и, если он есть, удаляет базу.
 * Вызывается ОДИН РАЗ в начале initApp() — до первого getDB().
 *
 * @returns {Promise<boolean>} true, если база была сброшена
 */
export function resetDatabaseIfPending() {
  return new Promise((resolve) => {
    if (localStorage.getItem(RESET_FLAG) !== '1') {
      resolve(false);
      return;
    }

    if (dbPromise) {
      dbPromise.then((db) => db.close()).catch(() => {});
      dbPromise = null;
    }

    const req = indexedDB.deleteDatabase(DB_NAME);

    req.onsuccess = () => {
      localStorage.removeItem(RESET_FLAG);
      logger.info('[DB] Database reset completed');
      resolve(true);
    };

    req.onerror = () => {
      localStorage.removeItem(RESET_FLAG);
      logger.error('[DB] Database reset error:', req.error);
      resolve(false);
    };

    req.onblocked = () => {
      // НЕ resolve — ждём, пока пользователь закроет другие вкладки.
      // Как только закроет, браузер сам вызовет onsuccess выше,
      // и приложение продолжит загрузку автоматически.
      console.warn('[DB] Database reset blocked — ждём закрытия других вкладок');
      showBlockedScreen();
    };
  });
}

function showBlockedScreen() {
  const app = document.getElementById('app') || document.body;
  const base = import.meta.env.BASE_URL || '/';
  const iconUrl = base.endsWith('/') ? `${base}icons/blocked.svg` : `${base}/icons/blocked.svg`;

  app.innerHTML = `
    <div style="
      height: 100dvh;
      display: flex;
      flex-direction: column;
      padding: 24px;
      box-sizing: border-box;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
      color: #1a1a1a;
    ">
      <h1 style="
        font-size: 24px;
        font-weight: 700;
        margin: 0;
        line-height: 1.3;
      ">
        Закрой другие вкладки
      </h1>

      <div style="
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 16px 0;
      ">
        <img
          src="${iconUrl}"
          alt=""
          style="
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          "
          onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
        />
        <div style="
          display: none;
          font-size: 30vh;
          line-height: 1;
        ">🚧</div>
      </div>

      <p style="
        font-size: 18px;
        line-height: 1.5;
        margin: 0;
        color: #495057;
      ">
        Закрой все остальные вкладки и окна с «РАСговорилкой»
      </p>
    </div>
  `;
}
