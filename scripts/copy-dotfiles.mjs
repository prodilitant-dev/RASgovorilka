// scripts/copy-dotfiles.mjs
// Vite по умолчанию игнорирует файлы и папки, начинающиеся с точки,
// при копировании из src/public в dist. Этот скрипт копирует их вручную.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const src = path.join(root, 'src', 'public');
const dst = path.join(root, 'dist');

const dotfiles = ['.nojekyll', '.well-known'];

for (const name of dotfiles) {
  const from = path.join(src, name);
  const to = path.join(dst, name);

  if (!fs.existsSync(from)) {
    console.log(`[copy-dotfiles] skip: ${name} (не найден)`);
    continue;
  }

  fs.cpSync(from, to, { recursive: true });
  console.log(`[copy-dotfiles] copied: ${name}`);
}

console.log('[copy-dotfiles] done');