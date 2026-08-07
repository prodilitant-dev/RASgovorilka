// src/modes/say/Say.quick.js
import { renderQuickButtons } from '@components/common/QuickButtons/QuickButtons.view';
import { getState } from '@state/store';
import { saveProfile } from '@storage/appStorage';

export function renderQuickButtons(container, profile, onQuickClick, onReorder) {
  const state = getState();
  const editing = state.editingMode || false;

  // Рендерим быстрые кнопки (с возможностью перетаскивания в режиме редактирования)
  renderQuickButtons(
    container,
    profile.quickButtons || [],
    (btn) => {
      if (editing) {
        // В режиме редактирования можно редактировать кнопку (пока заглушка)
        // Можно вызвать модалку редактирования
        return;
      }
      if (onQuickClick) onQuickClick(btn);
    },
    editing,
    editing ? (newOrder) => {
      // newOrder — массив индексов (из renderQuickButtons)
      // Преобразуем в массив id
      const btns = profile.quickButtons || [];
      const orderedBtns = newOrder.map(idx => btns[idx]).filter(Boolean);
      profile.quickButtons = orderedBtns;
      saveProfile(profile);
      if (onReorder) onReorder(orderedBtns.map(b => b.id));
    } : null
  );

  // В режиме редактирования добавляем кнопку добавления
  if (editing) {
    // Добавляем кнопку "+" (вручную, так как renderQuickButtons не поддерживает add)
    // Для простоты просто создадим её вручную
    const addBtn = document.createElement('div');
    addBtn.className = 'quick-btn';
    addBtn.textContent = '➕';
    addBtn.addEventListener('click', () => {
      const newBtn = { id: uid(), text: '', emoji: '' };
      // Открываем редактор кнопки (можно использовать UniversalForm)
      toast('Редактор быстрых кнопок в разработке', 'info');
    });
    container.appendChild(addBtn);
  }
}