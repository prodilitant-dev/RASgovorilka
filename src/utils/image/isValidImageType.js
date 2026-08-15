const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
];

/**
 * Проверяет, является ли MIME-тип файла разрешённым.
 * @param {File|Blob} file - файл или blob
 * @returns {boolean}
 */
export function isValidImageType(file) {
  return ALLOWED_TYPES.includes(file.type);
}