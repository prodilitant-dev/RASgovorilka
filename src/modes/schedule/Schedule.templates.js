// src/modes/schedule/Schedule.templates.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';
import { toast } from '@utils/toast';
import { uid } from '@utils/id';
import { confirm } from '@utils/dialog';
import { openEventEditor } from './Schedule.editor';
import { saveProfile } from '@storage/appStorage';

export function openTemplateManager(profile, onUpdate) {
  const modal = new Modal({
    title: 'Управление шаблонами',
    body: () => {
      const wrap = createElement('div', {});

      const list = createElement('div', { className: 'template-list' });
      profile.scheduleTemplates.forEach(tmpl => {
        const row = createElement('div', {
          className: 'template-row',
          style: 'display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border);',
        });
        const nameSpan = createElement('span', {
          className: 'cursor-pointer',
          style: 'flex:1; cursor:pointer; font-weight:500;',
        }, `${tmpl.icon || '📋'} ${tmpl.name || 'Без названия'}`);
        on(nameSpan, 'click', () => {
          modal.close();
          openTemplateEventsEditor(profile, tmpl.id, onUpdate);
        });

        const actions = createElement('div', { style: 'display:flex; gap:6px;' });
        // ✏️ Теперь кнопка "Редактировать" тоже открывает редактор событий
        const editBtn = createElement('div', { className: 'category' }, '✏️');
        on(editBtn, 'click', (e) => {
          e.stopPropagation();
          modal.close();
          openTemplateEventsEditor(profile, tmpl.id, onUpdate);
        });
        const delBtn = createElement('div', { className: 'category category-danger' }, '🗑️');
        on(delBtn, 'click', (e) => {
          e.stopPropagation();
          deleteTemplate(profile, tmpl.id, onUpdate, modal);
        }); 
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        row.appendChild(nameSpan);
        row.appendChild(actions);
        list.appendChild(row);
      });
      wrap.appendChild(list);

      // Привязка дней
      const mappingTitle = createElement('h4', { className: 'mt-4', style: 'margin-top:16px;' }, 'Привязка к дням недели');
      wrap.appendChild(mappingTitle);
      const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      days.forEach((dayName, index) => {
        const row = createElement('div', {
          className: 'd-flex align-items-center gap-3 py-1',
          style: 'display:flex; align-items:center; gap:12px; padding:4px 0;',
        });
        const label = createElement('span', { style: 'min-width:100px;' }, dayName);
        const select = createElement('select', { style: 'flex:1; padding:4px;' });
        const noneOpt = createElement('option', { value: '' }, '—');
        select.appendChild(noneOpt);
        profile.scheduleTemplates.forEach(tmpl => {
          const opt = createElement('option', { value: tmpl.id }, tmpl.name);
          if (profile.scheduleDayMapping?.[index] === tmpl.id) opt.selected = true;
          select.appendChild(opt);
        });
        on(select, 'change', () => {
          const val = select.value;
          if (val) {
            profile.scheduleDayMapping[index] = val;
          } else {
            delete profile.scheduleDayMapping[index];
          }
          saveProfile(profile);
          toast('Привязка сохранена');
        });
        row.appendChild(label);
        row.appendChild(select);
        wrap.appendChild(row);
      });

      return wrap;
    },
    buttons: [
      { label: 'Закрыть', action: () => { modal.close(); if (onUpdate) onUpdate(); } }
    ]
  });
  modal.open();
}

function openTemplateEventsEditor(profile, templateId, onUpdate) {
  const template = profile.scheduleTemplates.find(t => t.id === templateId);
  if (!template) { toast('Шаблон не найден', 'error'); return; }

  const modal = new Modal({
    title: `События шаблона: ${template.name}`,
    body: () => {
      const wrap = createElement('div', {});

      const list = createElement('div', { className: 'event-list' });
      if (template.events.length === 0) {
        const empty = createElement('div', { className: 'text-muted text-center p-4' }, 'Нет событий');
        list.appendChild(empty);
      } else {
        template.events.forEach(event => {
          const row = createElement('div', {
            className: 'event-row',
            style: 'display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid var(--border);',
          });
          const info = createElement('span', {}, `${event.time || ''} ${event.icon || '📌'} ${event.text || ''}`);
          const actions = createElement('div', { style: 'display:flex; gap:6px;' });
          const editBtn = createElement('div', { className: 'category' }, '✏️');
          on(editBtn, 'click', () => {
            modal.close();
            openEventEditor(event, (updatedData) => {
              Object.assign(event, updatedData);
              saveProfile(profile);
              toast('Событие обновлено');
              openTemplateEventsEditor(profile, templateId, onUpdate);
            }, (id) => {
              template.events = template.events.filter(e => e.id !== id);
              saveProfile(profile);
              toast('Событие удалено');
              openTemplateEventsEditor(profile, templateId, onUpdate);
            });
          });
          const delBtn = createElement('button', { className: 'btn-danger btn-sm' }, '🗑️');
          on(delBtn, 'click', () => {
            if (confirm('Удалить событие?')) {
              template.events = template.events.filter(e => e.id !== event.id);
              saveProfile(profile);
              toast('Событие удалено');
              openTemplateEventsEditor(profile, templateId, onUpdate);
            }
          });
          actions.appendChild(editBtn);
          actions.appendChild(delBtn);
          row.appendChild(info);
          row.appendChild(actions);
          list.appendChild(row);
        });
      }
      wrap.appendChild(list);

      const addBtn = createElement('div', { className: 'category active' }, '➕ Добавить событие');
      on(addBtn, 'click', () => {
        modal.close();
        openEventEditor(null, (newData) => {
          const newEvent = { id: uid(), ...newData };
          template.events.push(newEvent);
          saveProfile(profile);
          toast('Событие добавлено');
          openTemplateEventsEditor(profile, templateId, onUpdate);
        });
      });
      wrap.appendChild(addBtn);

      return wrap;
    },
    buttons: [
      { label: 'Назад', action: () => { modal.close(); openTemplateManager(profile, onUpdate); } }
    ]
  });
  modal.open();
}

async function deleteTemplate(profile, templateId, onUpdate, modal) {
  const tmpl = profile.scheduleTemplates.find(t => t.id === templateId);
  if (!tmpl) return;
  const ok = await confirm(`Удалить шаблон "${tmpl.name}"?`);
  if (!ok) return;
  profile.scheduleTemplates = profile.scheduleTemplates.filter(t => t.id !== templateId);
  for (const day in profile.scheduleDayMapping) {
    if (profile.scheduleDayMapping[day] === templateId) delete profile.scheduleDayMapping[day];
  }
  await saveProfile(profile);
  toast('Шаблон удалён');
  modal.close();
  openTemplateManager(profile, onUpdate);
}