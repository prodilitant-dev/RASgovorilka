// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, readdirSync } from 'fs'; // <-- ДОБАВЛЕН readdirSync
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

// <-- НОВЫЙ ПЛАГИН: Автоматически собирает все иконки из папки
function iconsManifestPlugin() {
  const virtualModuleId = 'virtual:icons-manifest';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'icons-manifest',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const iconsDir = resolve(root, 'src/public/icons');
        let icons = [];
        try {
          icons = readdirSync(iconsDir)
            .filter((file) => file.endsWith('.webp'))
            .map((file) => file.replace('.webp', ''));
        } catch (e) {
          console.error('Error reading icons directory', e);
        }
        return `export default ${JSON.stringify(icons)};`;
      }
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
    iconsManifestPlugin(), // <-- ДОБАВЛЕН ПЛАГИН
    VitePWA({
      manifest: false,
      registerType: 'prompt',
      injectRegister: false,
      strategies: 'generateSW',
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,png,webp,jpeg,jpg,webmanifest,ico,woff,woff2,mp3,json}',
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ras-images',
              expiration: {
                maxEntries: 3000,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
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
