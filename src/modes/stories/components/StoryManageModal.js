// src/modes/stories/components/StoryManageModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement } from '@utils/dom';
import { confirm } from '@utils/dialog';
import { showCardImage } from '@utils/image/showCardImage';

export function openStoryManageModal(story, onEdit, onDelete) {
  const modal = new Modal({
    title: story.title || 'История', // <-- Имя истории в заголовке
    showCloseButton: true,
    body: () => {
      const wrap = createElement('div', { className: 'story-manage-wrap', style: 'display:flex; flex-direction:column; gap:16px; align-items:center;' });
      
      // Превью первого слайда
      const preview = createElement('div', { className: 'story-manage-preview', style: 'width:150px; height:150px; border-radius:var(--radius); border: 2px dashed var(--border); background-size:contain; background-position:center; background-repeat:no-repeat; display:flex; align-items:center; justify-content:center;' });
      const firstSlide = story.slides && story.slides[0];
      if (firstSlide) {
        showCardImage(preview, firstSlide, { fontSize: '3em' });
      } else {
        preview.textContent = '📖';
      }
      
      wrap.appendChild(preview);
      return wrap;
    },
    buttons: [
      {
        label: 'Удалить',
        danger: true,
        action: () => {
          confirm('Удалить эту историю?', 'Подтверждение').then((ok) => {
            if (ok) {
              modal.close();
              onDelete();
            }
          });
        }
      },
      {
        label: 'Редактировать',
        primary: true,
        action: () => {
          modal.close();
          onEdit();
        }
      }
    ]
  });
  modal.open();
}