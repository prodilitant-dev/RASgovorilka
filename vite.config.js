import { defineConfig } from 'vite';
import { resolve } from 'path';

const root = process.cwd();

export default defineConfig({
  root: resolve(root, 'src'),
  server: {
    port: 3000,
    open: true,
  },
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