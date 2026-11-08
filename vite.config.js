// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { VitePWA } from 'vite-plugin-pwa';

const root = process.cwd();
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));

const rawBase = process.env.BASE_PATH || '/RASgovorilka/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

function seoPlugin(basePath) {
  const siteUrl = `https://prodilitant-dev.github.io${basePath.replace(/\/$/, '')}`;

  return {
    name: 'seo-files',

    transformIndexHtml(html) {
      return html.replace(/%%SITE_URL%%/g, siteUrl);
    },

    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n'),
      });

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          '  <url>',
          `    <loc>${siteUrl}/</loc>`,
          '    <changefreq>weekly</changefreq>',
          '    <priority>1.0</priority>',
          '  </url>',
          '</urlset>',
          '',
        ].join('\n'),
      });
    },
  };
}

export default defineConfig({
  base,
  root: resolve(root, 'src'),
  server: {
    port: 3000,
    open: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    seoPlugin(base),
    VitePWA({
      manifest: false,
      registerType: 'prompt',
      injectRegister: false,
      // Включаем полную стратегию кэширования
      strategies: 'generateSW',
      workbox: {
        // 1. Что кэшируем при установке (Precaching) — ВСЁ
        globPatterns: [
          '**/*.{js,css,html,svg,png,webp,jpeg,jpg,webmanifest,ico,woff,woff2,mp3,json}',
        ],
        // 2. Максимальный размер одного файла (увеличиваем до 10 МБ на всякий случай)
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        // 3. SPA-навигация: если интернет пропал и страница не найдена — отдаем index.html
        navigateFallback: `${base}index.html`,
        // 4. Чистим старый кэш при обновлении
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        // 5. Runtime-кэширование (страховка для картинок, если они не попали в precache)
        runtimeCaching: [
          {
            // Кэшируем все картинки карточек (webp) на лету
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ras-images',
              expiration: {
                maxEntries: 3000, // Хватит на все карточки
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 год
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Кэшируем шрифты
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ras-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
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
