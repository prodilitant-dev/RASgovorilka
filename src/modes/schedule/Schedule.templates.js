// src/modes/schedule/Schedule.templates.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';
import { toast } from '@utils/toast';
import { confirm } from '@utils/dialog';
import { openEventEditor } from './Schedule.editor';
import { saveProfile } from '@storage/appStorage';
import { iconUrl } from '@utils/icon';

const DAY_ORDER = [
  { name: 'Понедельник', dow: 1 },
  { name: 'Вторник', dow: 2 },
  { name: 'Среда', dow: 3 },
  { name: 'Четверг', dow: 4 },
  { name: 'Пятница', dow: 5 },
  { name: 'Суббота', dow: 6 },
  { name: 'Воскресенье', dow: 0 },
];

/** Хелпер: создаёт кнопку-иконку с fallback на эмодзи. */
function createIconButton({ iconName, fallbackEmoji, className, onClick, title, ariaLabel }) {
  const btn = createElement('div', { className, title, 'aria-label': ariaLabel });
  const img = createElement('img', {
    src: iconUrl(iconName),
    alt: '',
    className: 'cat-action-btn__icon',
    draggable: 'false',
  });
  img.addEventListener('error', () => {
    img.replaceWith(document.createTextNode(fallbackEmoji));
  });
  btn.appendChild(img);
  on(btn, 'click', onClick);
  return btn;
}

export function openTemplateManager(profile, onUpdate) {
  const modal = new Modal({
    title: 'Управление шаблонами',
    body: () => {
      const wrap = createElement('div', {});

      // === СПИСОК ШАБЛОНОВ ===
      const list = createElement('div', { className: 'schedule-tmpl-list' });
      profile.scheduleTemplates.forEach((tmpl) => {
        const row = createElement('div', { className: 'schedule-tmpl-row' });

        const nameSpan = createElement(
          'span',
          { className: 'schedule-tmpl-name' },
          tmpl.name || 'Без названия'
        );

        on(nameSpan, 'click', () => {
          modal.close();
          openTemplateEventsEditor(profile, tmpl.id, onUpdate);
        });

        const actions = createElement('div', { className: 'schedule-tmpl-actions' });

        const editBtn = createIconButton({
          iconName: 'edit',
          fallbackEmoji: '✏️',
          className: 'category',
          ariaLabel: 'Редактировать',
          onClick: (e) => {
            e.stopPropagation();
            modal.close();
            openTemplateEventsEditor(profile, tmpl.id, onUpdate);
          },
        });

        const delBtn = createIconButton({
          iconName: 'delete',
          fallbackEmoji: '🗑️',
          className: 'category category-danger',
          ariaLabel: 'Удалить',
          onClick: (e) => {
            e.stopPropagation();
            deleteTemplate(profile, tmpl.id, onUpdate, modal);
          },
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        row.appendChild(nameSpan);
        row.appendChild(actions);
        list.appendChild(row);
      });
      wrap.appendChild(list);

      // === ПРИВЯЗКА К ДНЯМ ===
      const mappingTitle = createElement(
        'h4',
        { className: 'schedule-mapping-title' },
        'Привязка к дням недели'
      );
      wrap.appendChild(mappingTitle);

      DAY_ORDER.forEach(({ name: dayName, dow }) => {
        const row = createElement('div', { className: 'schedule-map-row' });

        const label = createElement('span', { className: 'schedule-map-label' }, dayName);
        const select = createElement('select', { className: 'schedule-map-select' });

        const noneOpt = createElement('option', { value: '' }, '—');
        select.appendChild(noneOpt);

        profile.scheduleTemplates.forEach((tmpl) => {
          const opt = createElement('option', { value: tmpl.id }, tmpl.name);
          if (profile.scheduleDayMapping?.[dow] === tmpl.id) opt.selected = true;
          select.appendChild(opt);
        });

        on(select, 'change', () => {
          const val = select.value;
          if (val) {
            profile.scheduleDayMapping[dow] = val;
          } else {
            delete profile.scheduleDayMapping[dow];
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
    buttons: [],
    onClose: () => {
      if (onUpdate) onUpdate();
    },
  });
  modal.open();
}

function openTemplateEventsEditor(profile, templateId, onUpdate) {
  const template = profile.scheduleTemplates.find((t) => t.id === templateId);
  if (!template) {
    toast('Шаблон не найден', 'error');
    return;
  }

  const modal = new Modal({
    title: `События шаблона: ${template.name}`,
    body: () => {
      const wrap = createElement('div', {});

      const list = createElement('div', { className: 'schedule-event-list' });
      if (template.events.length === 0) {
        const empty = createElement(
          'div',
          { className: 'text-muted text-center p-4' },
          'Нет событий'
        );
        list.appendChild(empty);
      } else {
        template.events.forEach((event) => {
          const row = createElement('div', { className: 'schedule-event-row' });

          // Если есть картинка, показываем её маленькую копию (или эмодзи)
          let previewText = `${event.time || ''} `;
          if (event.imagePath) {
            // Показываем текст, а картинка идет в фоне или рядом (можно добавить <img>)
            previewText += `[img] ${event.text || ''}`;
          } else {
            previewText += `${event.icon || '📌'} ${event.text || ''}`;
          }

          const info = createElement('span', {}, previewText);
          const actions = createElement('div', { className: 'schedule-tmpl-actions' });

          const editBtn = createIconButton({
            iconName: 'edit',
            fallbackEmoji: '✏️',
            className: 'category',
            ariaLabel: 'Редактировать событие',
            onClick: () => {
              modal.close();
              openEventEditor(
                event,
                (updatedData) => {
                  Object.assign(event, updatedData);
                  saveProfile(profile);
                  toast('Событие обновлено');
                  openTemplateEventsEditor(profile, templateId, onUpdate);
                },
                (id) => {
                  template.events = template.events.filter((e) => e.id !== id);
                  saveProfile(profile);
                  toast('Событие удалено');
                  openTemplateEventsEditor(profile, templateId, onUpdate);
                }
              );
            },
          });

          const delBtn = createIconButton({
            iconName: 'delete',
            fallbackEmoji: '🗑️',
            className: 'category category-danger',
            ariaLabel: 'Удалить событие',
            onClick: () => {
              template.events = template.events.filter((e) => e.id !== event.id);
              saveProfile(profile);
              toast('Событие удалено');
              openTemplateEventsEditor(profile, templateId, onUpdate);
            },
          });

          actions.appendChild(editBtn);
          actions.appendChild(delBtn);
          row.appendChild(info);
          row.appendChild(actions);
          list.appendChild(row);
        });
      }
      wrap.appendChild(list);
      return wrap;
    },
    buttons: [],
  });
  modal.open();
}

async function deleteTemplate(profile, templateId, onUpdate, modal) {
  const tmpl = profile.scheduleTemplates.find((t) => t.id === templateId);
  if (!tmpl) return;
  const ok = await confirm(`Удалить шаблон "${tmpl.name}"?`);
  if (!ok) return;
  profile.scheduleTemplates = profile.scheduleTemplates.filter((t) => t.id !== templateId);
  for (const day in profile.scheduleDayMapping) {
    if (profile.scheduleDayMapping[day] === templateId) delete profile.scheduleDayMapping[day];
  }
  await saveProfile(profile);
  toast('Шаблон удалён');
  modal.close();
  openTemplateManager(profile, onUpdate);
}
