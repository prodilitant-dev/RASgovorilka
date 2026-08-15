
import { resizeToSquare } from './resizeToSquare';

/**
 * Создаёт уменьшенную копию изображения (квадрат, центрированная обрезка).
 * @param {Blob} blob
 * @param {number} size - размер стороны (по умолчанию 128)
 * @param {string} format - 'image/png' или 'image/webp' (по умолчанию 'image/png')
 * @param {number} quality - качество для WebP
 * @returns {Promise<Blob>}
 */
export function createThumbnail(blob, size = 128, format = 'image/png', quality = 0.8) {
  return resizeToSquare(blob, size, format, quality);
}