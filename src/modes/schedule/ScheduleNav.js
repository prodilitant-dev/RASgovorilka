// src/modes/schedule/ScheduleNav.js
import { createElement, clear, on } from '@utils/dom';

// Простая функция форматирования даты (можно вынести в utils/string, но пока здесь)
function formatDate(date) {
  const options = { day: 'numeric', month: 'short' };
  return date.toLocaleDateString('ru-RU', options);
}

export function renderScheduleNav(container, selectedDate, onDaySelect, onManageTemplates, editingMode) {
  clear(container);
  const wrap = createElement('div', { className: 'schedule-day-nav' });

  const offsets = [0, 1, 2];
  const labels = ['Сегодня', 'Завтра', 'Послезавтра'];
  offsets.forEach((offset, index) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const dateStr = date.toISOString().slice(0, 10);
    const isActive = dateStr === selectedDate.toISOString().slice(0, 10);
    const btn = createElement('button', {
      className: `day-btn ${isActive ? 'active' : ''}`,
    }, `${labels[index]} (${formatDate(date)})`);
    on(btn, 'click', () => onDaySelect(offset));
    wrap.appendChild(btn);
  });

  if (editingMode) {
    const manageBtn = createElement('button', { className: 'day-btn manage-btn' }, '📋 Шаблоны');
    on(manageBtn, 'click', onManageTemplates);
    wrap.appendChild(manageBtn);
  }

  container.appendChild(wrap);
}