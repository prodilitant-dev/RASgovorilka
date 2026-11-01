// src/modes/schedule/Schedule.editor.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';
import { findBankItem } from '@utils/cardBank'; // <-- ДОБАВИЛИ ИМПОРТ

export function openEventEditor(eventData, onSave, onDelete) {
  const isNew = !eventData || !eventData.id;
  // Убрали дефолтный '📌', чтобы он не перекрывал картинку из банка
  const entity = isNew
    ? { time: '12:00', text: '', icon: '', imageId: null, imagePath: null }
    : { ...eventData };

  openVerticalEditor({
    title: isNew ? 'Новое событие' : 'Редактировать событие',
    entity,
    onSave: (updated, close) => {
      if (!updated.time) {
        toast('Введите время', 'error');
        return close(new Error('Validation'));
      }
      if (!updated.text || !updated.text.trim()) {
        toast('Введите описание', 'error');
        return close(new Error('Validation'));
      }
      onSave({ ...updated, imageId: updated.imageId || null });
      close();
    },
    onDelete: isNew
      ? null
      : (entity, close) => {
          if (confirm('Удалить событие?')) {
            onDelete(entity.id);
            close();
          }
        },
    fields: [
      {
        id: 'time',
        label: 'Время',
        type: 'time',
        required: true,
      },
      {
        id: 'text',
        label: 'Описание',
        type: 'text',
        required: true,
        placeholder: 'Например: Завтрак',
        // ДОБАВИЛИ АВТОПОИСК
        onChange: (value, ent) => {
          if (!ent.imageId) {
            const bankItem = findBankItem(value);
            if (bankItem) {
              ent.imagePath = `cards/${bankItem.category}/${bankItem.filename}`;
              ent.filename = bankItem.filename;
              ent.category = bankItem.category;
              ent.icon = ''; // Очищаем эмодзи, чтобы не было конфликта
            } else {
              ent.imagePath = null; // Если нет совпадения, сбрасываем
            }
          }
        },
      },
      {
        id: 'icon',
        label: 'Иконка (эмодзи)',
        type: 'text',
        // Прячем поле, если найдена картинка в банке или загружено фото
        visible: (entity) => !entity.imageId && !entity.imagePath,
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
