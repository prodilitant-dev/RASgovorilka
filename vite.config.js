// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { VitePWA } from 'vite-plugin-pwa';

const root = process.cwd();
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));

// Базовый путь для GitHub Pages. Позволяет собирать одно и то же
// приложение под разные репозитории (RASgovorilka / RASgovorilka-TEST).
// Переопределяется переменной окружения BASE_PATH при сборке в CI.
const rawBase = process.env.BASE_PATH || '/RASgovorilka/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

/**
 * Плагин: генерирует robots.txt и sitemap.xml с правильным URL,
 * а также подставляет %%SITE_URL%% в index.html.
 * Работает и в TEST-репо, и в main — автоматически на основе base.
 */
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
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,webmanifest,ico,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
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
