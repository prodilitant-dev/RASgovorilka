import { buildUniversalForm } from '../common/Universal/UniversalForm';
import { confirm } from '@utils/dialog';

export function openProfileEditor(profile, { onSave, onDelete, onCopy, onCancel }) {
  const fields = [
    {
      key: 'name',
      label: 'Имя',
      type: 'text',
      value: profile?.name || '',
    },
    {
      key: 'icon',
      label: 'Иконка (эмодзи)',
      type: 'text',
      value: profile?.icon || '🧑',
    }
  ];

  const customButtons = [];

  if (profile?.id) {
    if (onCopy) {
      customButtons.push({
        label: 'Копировать',
        action: (close) => {
          onCopy(profile);
          close(); // закрываем модалку после копирования
        }
      });
    }
    if (onDelete) {
      customButtons.push({
        label: 'Удалить',
        action: async (close) => {
          const ok = await confirm('Удалить профиль?', 'Подтверждение');
          if (ok) {
            onDelete(profile.id);
            close();
          }
        }
      });
    }
  }

  const form = buildUniversalForm({
    fields,
    title: profile?.id ? 'Редактировать профиль' : 'Новый профиль',
    onSubmit: (data) => onSave(data),
    onCancel,
    customButtons,
  });

  form.open();
}