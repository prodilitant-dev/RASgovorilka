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
export function createIcon(name, { fallback = '', size, className = '', alt = '' } = {}) {
  const sizeStyle = size ? `width:${size}px;height:${size}px;object-fit:contain;` : '';
  const img = createElement('img', {
    src: iconUrl(name),
    alt,
    className: ['ui-icon', className].filter(Boolean).join(' '),
    style: sizeStyle,
    draggable: 'false',
  });

  if (fallback) {
    const showFallback = () => {
      const span = createElement(
        'span',
        {
          className: ['ui-icon', 'ui-icon--fallback', className].filter(Boolean).join(' '),
          style: size ? `font-size:${Math.round(size * 0.85)}px;line-height:1;` : '',
        },
        fallback
      );
      img.replaceWith(span);
    };

    img.addEventListener('error', showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  }

  return img;
}

/**
 * Проверяет, является ли значение именем иконки (для iconUrl).
 * Имена — только латиница, цифры, дефис. Эмодзи и слова с пробелами — нет.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isIconName(value) {
  if (typeof value !== 'string') return false;
  return /^[a-z0-9-]+$/.test(value) && value.length > 0;
}
