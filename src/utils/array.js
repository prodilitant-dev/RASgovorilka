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