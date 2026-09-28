// src/modes/schedule/ScheduleNav.js
import { createElement, clear, on } from '@utils/dom';
import { formatDate } from '@utils/string';

export function renderScheduleNav(container, selectedDate, onDaySelect, onManageTemplates, editingMode) {
  clear(container);
  const wrap = createElement('div', { className: 'categories-wrap' });
  const nav = createElement('div', { className: 'categories' });

  const offsets = [0, 1, 2];
  const labels = ['Сегодня', 'Завтра', 'Послезавтра'];
  offsets.forEach((offset, index) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const dateStr = date.toISOString().slice(0, 10);
    const isActive = dateStr === selectedDate.toISOString().slice(0, 10);
    const btn = createElement('div', {
      className: `category ${isActive ? 'active' : ''}`,
      'data-offset': offset,
    }, `${labels[index]} (${formatDate(date)})`);
    on(btn, 'click', () => onDaySelect(offset));
    nav.appendChild(btn);
  });

  if (editingMode) {
    const manageBtn = createElement('div', {
      className: 'category category-add',
    }, '📋 Шаблоны');
    on(manageBtn, 'click', onManageTemplates);
    nav.appendChild(manageBtn);
  }

  wrap.appendChild(nav);
  container.appendChild(wrap);
}