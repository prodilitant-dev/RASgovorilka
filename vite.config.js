import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { VitePWA } from 'vite-plugin-pwa';

const root = process.cwd();
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));

export default defineConfig({
  base: '/RASgovorilka/',
  root: resolve(root, 'src'),
  server: {
    port: 3000,
    open: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    VitePWA({
      // Не генерировать манифест — у нас свой manifest.webmanifest
      manifest: false,
      // Стратегия обновления: сервис-воркер сам обновляется, когда
      // обнаруживает новую версию при следующем визите
      registerType: 'autoUpdate',
      injectRegister: false, // регистрируем SW вручную (см. main.js)
      workbox: {
        // Что кешировать
        globPatterns: ['**/*.{js,css,html,svg,png,webp,webmanifest,ico,woff,woff2}'],
        // Максимальный размер кешируемого файла — 5 МБ
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Fallback для навигации (SPA)
        navigateFallback: '/RASgovorilka/index.html',
        // Не кешировать запросы к API и внешним ресурсам
        navigateFallbackDenylist: [/^\/api\//],
        // Очистка старых кешей
        cleanupOutdatedCaches: true,
        // Не ждать, пока пользователь закроет вкладку, для активации нового SW
        skipWaiting: true,
        clientsClaim: true,
      },
      // В dev-режиме SW отключён (чтобы не мешал разработке)
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    outDir: resolve(root, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
      '@app': resolve(root, 'src/app'),
      '@components': resolve(root, 'src/components'),
      '@config': resolve(root, 'src/config'),
      '@modes': resolve(root, 'src/modes'),
      '@state': resolve(root, 'src/state'),
      '@storage': resolve(root, 'src/storage'),
      '@utils': resolve(root, 'src/utils'),
      '@styles': resolve(root, 'src/styles'),
      '@services': resolve(root, 'src/services'),
      '@image-utils': resolve(root, 'src/utils/image'),
    },
  },
});