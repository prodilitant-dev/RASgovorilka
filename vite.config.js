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
      manifest: false,
      registerType: 'prompt',
      injectRegister: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,webmanifest,ico,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/RASgovorilka/index.html',
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