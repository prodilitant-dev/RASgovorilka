// src/utils/icon.js
import { createElement } from './dom';

/**
 * URL иконки из /public/icons/.
 * @param {string} name - имя без расширения, например 'quiz'
 */
export function iconUrl(name) {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}icons/${name}.webp`;
}

/**
 * Создаёт <img> с иконкой и fallback на эмодзи.
 * @param {string} name - имя иконки, например 'quiz'
 * @param {Object} [opts]
 * @param {string} [opts.fallback=''] - эмодзи для fallback
 * @param {number} [opts.size=24] - размер в px
 * @param {string} [opts.className=''] - доп. класс
 * @param {string} [opts.alt=''] - alt для a11y
 */
export function createIcon(name, { fallback = '', size = 24, className = '', alt = '' } = {}) {
  const img = createElement('img', {
    src: iconUrl(name),
    alt,
    className: ['ui-icon', className].filter(Boolean).join(' '),
    style: `width:${size}px;height:${size}px;object-fit:contain;`,
    draggable: 'false',
  });

  if (fallback) {
    img.addEventListener('error', () => {
      // Если WebP не найден — показываем эмодзи текстом
      const span = createElement('span', {
        className: ['ui-icon', 'ui-icon--fallback', className].filter(Boolean).join(' '),
        style: `font-size:${Math.round(size * 0.85)}px;line-height:1;`,
      }, fallback);
      img.replaceWith(span);
    });
  }

  return img;
}