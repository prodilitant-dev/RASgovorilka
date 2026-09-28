// src/modes/say/Say.categoryEditor.js
import { openVerticalEditor } from '@components/common/VerticalEditor';
import { toast } from '@utils/toast';

export function openCategoryEditor(category, onSave) {
  const entity = { ...category };

  openVerticalEditor({
    title: 'Редактировать категорию',
    entity,
    preview: false, // <-- отключаем превью
    onSave: (updated, done) => {
      if (!updated.name || !updated.name.trim()) {
        toast('Введите название', 'error');
        done();
        return;
      }
      // Применяем изменения к исходной категории
      Object.assign(category, updated);
      onSave(category, done);
    },
    fields: [
      {
        id: 'name',
        label: 'Название',
        type: 'text',
        required: true,
        placeholder: 'Например: Еда',
      },
      {
        id: 'hidden',
        label: 'Скрыть в основном режиме',
        type: 'toggle',
      }
    ],
    buttons: [
      {
        id: 'save',
        label: '💾 Сохранить',
        variant: 'primary',
      }
    ],
  });
}