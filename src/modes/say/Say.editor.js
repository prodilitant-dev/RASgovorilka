// src/modes/say/Say.editor.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';
import { autoDetectCard } from '@utils/inflect';
import { openDeclensionModal } from '@components/common/DeclensionModal/DeclensionModal';
import { getState } from '@state/store';
import { getActiveProfile } from '@state/actions';
import { findBankItem } from '@utils/cardBank';
import { createElement } from '@utils/dom';

export function openCardEditor(cardData, onSave, onDelete) {
  const isNew = !cardData.id;
  if (isNew) {
    autoDetectCard(cardData);
  }

  // Делаем копию, чтобы не менять оригинальный объект до сохранения
  const entity = { ...cardData };

  // ОБОГАЩЕНИЕ ДАННЫМИ ИЗ БАНКА (чтобы сразу показать варианты картинок)
  if (entity.text) {
    const bankItem = findBankItem(entity.text);
    if (bankItem) {
      // Подтягиваем варианты, категорию и имя файла, если их еще нет в карточке
      if (!entity.variants || entity.variants.length === 0) {
        entity.variants = bankItem.variants || [];
      }
      if (!entity.filename) entity.filename = bankItem.filename;
      if (!entity.category) entity.category = bankItem.category;

      // Если у карточки вообще нет картинки, но она есть в банке — подставим
      if (!entity.imagePath && !entity.imageId) {
        entity.imagePath = `cards/${entity.category}/${entity.filename}`;
      }
    }
  }

  const state = getState();
  const profile = getActiveProfile();
  const categoryId = state.currentCategoryId;
  const existingCards = profile?.cards?.[categoryId] || [];

  openVerticalEditor({
    title: isNew ? 'Новая карточка' : 'Редактировать карточку',
    entity,
    onSave: (updated, done) => {
      if (!updated.text || !updated.text.trim()) {
        toast('Введите текст', 'error');
        done();
        return;
      }

      const trimmedText = updated.text.trim();
      const isDuplicate = existingCards.some(
        (card) =>
          card.id !== updated.id && card.text.trim().toLowerCase() === trimmedText.toLowerCase()
      );

      if (isDuplicate) {
        toast('Карточка с таким названием уже есть в этой категории', 'error');
        done();
        return;
      }

      // Если текст изменился — пересчитываем формы молча
      if (updated.text !== cardData.text) {
        autoDetectCard(updated);
      }
      onSave(updated, done);
    },
    onDelete: (ent, close) => {
      if (onDelete) {
        onDelete(ent.id, close);
      }
    },
    fields: [
      {
        id: 'text',
        label: 'Текст',
        type: 'text',
        required: true,
        placeholder: 'Например: Молоко',
        autocomplete: true,
      },
      {
        id: 'wordType',
        label: 'Тип слова',
        type: 'select',
        options: [
          { value: 'noun', label: 'Существительное' },
          { value: 'verb', label: 'Глагол' },
          { value: 'adjective', label: 'Прилагательное' },
          { value: 'pronoun', label: 'Местоимение' },
          { value: 'preposition', label: 'Предлог' },
          { value: 'other', label: 'Другое' },
        ],
      },
      {
        id: 'emoji',
        label: 'Эмодзи',
        type: 'text',
        visible: (ent) => !ent.imageId && !ent.imagePath,
        onChange: (value, ent) => {
          if (!ent.imageId && !ent.imagePath) {
            const bankItem = findBankItem(value);
            if (bankItem) {
              ent.imagePath = `cards/${bankItem.category}/${bankItem.filename}`;
              ent.filename = bankItem.filename;
              ent.category = bankItem.category;
              ent.variants = bankItem.variants || [];
              ent.emoji = '';
            }
          }
        },
      },
    ],
    extraActions: [
      {
        id: 'declensions',
        label: '📖 Склонения',
        visible: (ent) => {
          const type = ent.wordType || 'noun';
          return type === 'noun' || type === 'pronoun' || type === 'adjective';
        },
        onClick: (ent, _closeModal) => {
          openDeclensionModal(ent, (updatedEntity) => {
            Object.assign(ent, updatedEntity);
            toast('Падежи обновлены');
          });
        },
      },
    ],
    extraContent: (ent, callbacks) => {
      const wrap = createElement('div', { className: 've-color-palette-wrap' });
      const label = createElement('span', { className: 've-color-label' }, 'Оформление:');
      const palette = createElement('div', { className: 've-color-palette' });

      const colors = [
        { value: null, name: 'Без цвета', bg: 'transparent', border: '2px dashed var(--border)' },
        { value: '#4caf50', name: 'Зелёный', bg: '#4caf50' },
        { value: '#c62828', name: 'Красный', bg: '#c62828' },
        { value: '#f9a825', name: 'Жёлтый', bg: '#f9a825' },
        { value: '#0054a6', name: 'Синий', bg: '#0054a6' },
        { value: '#333333', name: 'Чёрный', bg: '#333333' },
      ];

      colors.forEach((c) => {
        const btn = createElement('button', {
          type: 'button',
          className: `ve-color-btn ${ent.styleColor === c.value ? 'active' : ''}`,
          title: c.name,
          'aria-label': c.name,
        });
        btn.style.backgroundColor = c.bg;
        if (c.border) btn.style.border = c.border;

        btn.addEventListener('click', () => {
          callbacks.onFieldChange('styleColor', c.value);
        });
        palette.appendChild(btn);
      });

      wrap.appendChild(label);
      wrap.appendChild(palette);
      return wrap;
    },
    buttons: [
      {
        id: 'delete',
        label: '🗑 Удалить',
        variant: 'danger',
        visible: () => !isNew,
      },
      {
        id: 'save',
        label: '💾 Сохранить',
        variant: 'primary',
      },
    ],
  });
}