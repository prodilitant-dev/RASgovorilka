// src/modes/say/Say.editor.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';
import { autoDetectCard } from '@utils/inflect';
import { openDeclensionModal } from '@components/common/DeclensionModal/DeclensionModal';
import { getState } from '@state/store';
import { getActiveProfile } from '@state/actions';

export function openCardEditor(cardData, onSave, onDelete) {
  const isNew = !cardData.id;
  if (isNew) {
    autoDetectCard(cardData);
  }

  const entity = cardData;
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
      const isDuplicate = existingCards.some(card =>
        card.id !== updated.id &&
        card.text.trim().toLowerCase() === trimmedText.toLowerCase()
      );

      if (isDuplicate) {
        toast('Карточка с таким названием уже есть в этой категории', 'error');
        done();
        return;
      }

      if (!updated.formsEdited && updated.text !== cardData.text) {
        autoDetectCard(updated);
      }
      onSave(updated, done);
    },
    onDelete: (entity, close) => {
      if (onDelete) {
        onDelete(entity.id, close);
      }
    },
    fields: [
      {
        id: 'text',
        label: 'Текст',
        type: 'text',
        required: true,
        placeholder: 'Например: Молоко',
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
        // placeholder убран — серый «😊» путал пользователя
        visible: (entity) => !entity.imageId,
      },
    ],
    extraActions: [
      {
        id: 'declensions',
        label: '📖 Падежи (исключения)',
        visible: (entity) => {
          const type = entity.wordType || 'noun';
          return type === 'noun' || type === 'pronoun' || type === 'adjective';
        },
        onClick: (entity, closeModal) => {
          openDeclensionModal(entity, (updatedEntity) => {
            updatedEntity.formsEdited = true;
            Object.assign(entity, updatedEntity);
            toast('Падежи обновлены');
          });
        },
      },
    ],
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