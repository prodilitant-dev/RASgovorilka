// src/utils/string.js

/**
 * Форматирует дату в строку вида "DD.MM.YYYY"
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}