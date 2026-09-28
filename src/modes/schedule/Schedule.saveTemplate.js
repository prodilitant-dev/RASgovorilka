// src/modes/schedule/Schedule.saveTemplate.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';
import { toast } from '@utils/toast';
import { uid } from '@utils/id';
import { saveProfile } from '@storage/appStorage';

export function openSaveTemplateModal(profile, events, onUpdate) {
  if (!events || events.length === 0) {
    toast('Нет событий для сохранения', 'error');
    return;
  }

  const modal = new Modal({
    title: 'Сохранить как шаблон',
    body: () => {
      const wrap = createElement('div', { style: 'padding: 8px 0;' });

      // Поле для нового имени
      const newNameRow = createElement('div', { className: 'form-row' });
      const newNameLabel = createElement('label', {}, 'Новый шаблон');
      const newNameInput = createElement('input', {
        type: 'text',
        placeholder: 'Введите имя нового шаблона...',
      });
      newNameRow.appendChild(newNameLabel);
      newNameRow.appendChild(newNameInput);
      wrap.appendChild(newNameRow);

      // Разделитель
      const sep = createElement('hr', { style: 'margin: 12px 0; border: none; border-top: 1px solid var(--border);' });
      wrap.appendChild(sep);

      // Выбор существующего шаблона для замены
      const replaceRow = createElement('div', { className: 'form-row' });
      const replaceLabel = createElement('label', {}, 'Заменить шаблон');
      const replaceSelect = createElement('select', {});
      const defaultOpt = createElement('option', { value: '' }, '— выбрать —');
      replaceSelect.appendChild(defaultOpt);
      profile.scheduleTemplates.forEach(tmpl => {
        const opt = createElement('option', { value: tmpl.id }, tmpl.name);
        replaceSelect.appendChild(opt);
      });
      replaceRow.appendChild(replaceLabel);
      replaceRow.appendChild(replaceSelect);
      wrap.appendChild(replaceRow);

      // Кнопки
      const btnRow = createElement('div', {
        className: 'btn-row',
        style: 'display:flex; gap:8px; margin-top:16px; justify-content:flex-end; flex-wrap:wrap;',
      });
      const cancelBtn = createElement('div', { className: 'category' }, 'Отмена');
      const createBtn = createElement('div', { className: 'category active' }, 'Создать новый');
      const replaceBtn = createElement('div', { className: 'category active' }, 'Заменить');
      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(createBtn);
      btnRow.appendChild(replaceBtn);
      wrap.appendChild(btnRow);

      // Обработчики
      on(cancelBtn, 'click', () => modal.close());

      on(createBtn, 'click', () => {
        const name = newNameInput.value.trim();
        if (!name) {
          toast('Введите имя нового шаблона', 'error');
          return;
        }
        if (profile.scheduleTemplates.some(t => t.name === name)) {
          toast('Шаблон с таким именем уже существует', 'error');
          return;
        }
        const newTemplate = {
          id: uid(),
          name: name,
          events: events.map(ev => ({
            id: uid(),
            time: ev.time || '',
            text: ev.text || '',
            icon: ev.icon || '📌',
            imageId: ev.imageId || null,
          })),
        };
        profile.scheduleTemplates.push(newTemplate);
        saveProfile(profile).then(() => {
          toast('Шаблон создан');
          modal.close();
          if (onUpdate) onUpdate();
        });
      });

      on(replaceBtn, 'click', () => {
        const selectedId = replaceSelect.value;
        if (!selectedId) {
          toast('Выберите шаблон для замены', 'error');
          return;
        }
        const target = profile.scheduleTemplates.find(t => t.id === selectedId);
        if (!target) {
          toast('Шаблон не найден', 'error');
          return;
        }
        target.events = events.map(ev => ({
          id: uid(),
          time: ev.time || '',
          text: ev.text || '',
          icon: ev.icon || '📌',
          imageId: ev.imageId || null,
        }));
        saveProfile(profile).then(() => {
          toast('Шаблон обновлён');
          modal.close();
          if (onUpdate) onUpdate();
        });
      });

      return wrap;
    },
    buttons: [],
  });

  modal.open();
}