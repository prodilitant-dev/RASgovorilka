// src/modes/say/Say.editor.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';
import { autoDetectCard } from '@utils/inflect';
import { openDeclensionModal } from '@components/common/DeclensionModal/DeclensionModal';

export function openCardEditor(cardData, onSave, onDelete) {
  const isNew = !cardData.id;
  if (isNew) {
    autoDetectCard(cardData);
  }

  const entity = cardData;

  openVerticalEditor({
    title: isNew ? 'Новая карточка' : 'Редактировать карточку',
    entity,
    onSave: (updated) => {
      if (!updated.text || !updated.text.trim()) {
        toast('Введите текст', 'error');
        return;
      }
      if (!updated.formsEdited && updated.text !== cardData.text) {
        autoDetectCard(updated);
      }
      onSave(updated);
    },
    onDelete: onDelete || null,
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
        placeholder: '😊',
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
            // closeModal закрывает модалку падежей
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