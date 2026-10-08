import '@styles/main.css';
import { initApp } from './app';
import { initLogger } from '@utils/logger';
import { getState, subscribe } from '@state/store';
import { registerSW } from 'virtual:pwa-register';

initLogger({ subscribe });

// Регистрируем service worker (только в production-сборке)
if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // Новая версия доступна. Можно показать тост,
      // но с autoUpdate — обновляем молча.
      console.log('[SW] New version available, updating...');
    },
    onOfflineReady() {
      console.log('[SW] App is ready to work offline');
    },
    onRegistered(registration) {
      console.log('[SW] Registered:', registration);
    },
    onRegisterError(error) {
      console.error('[SW] Registration failed:', error);
    },
  });
}

initApp();