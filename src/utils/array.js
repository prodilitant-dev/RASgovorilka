// src/utils/array.js

export function getElementIds(container, selector) {
  const elements = container.querySelectorAll(selector);
  return Array.from(elements).map(el => el.dataset.id);
}

export function reorderArray(array, fromIndex, toIndex) {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

// ✅ Добавляем shuffle
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}