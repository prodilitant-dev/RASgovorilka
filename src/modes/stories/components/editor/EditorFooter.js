// src/modes/stories/components/editor/EditorFooter.js
import { createElement, on } from '@utils/dom';
import { toast } from '@utils/toast';

export function createEditorFooter(workingStory, onCancel, onPreview, onSave) {
  const footer = createElement('div', { className: 'story-editor-footer' });
  
  const btnCancel = createElement('button', { className: 'btn btn-secondary', type: 'button' }, 'Отмена');
  on(btnCancel, 'click', onCancel);

  const btnPreview = createElement('button', { className: 'btn btn-secondary', type: 'button' }, 'Просмотр');
  on(btnPreview, 'click', () => {
    if (workingStory.slides.length === 0) {
      toast('Сначала добавьте слайды', 'error');
      return;
    }
    onPreview();
  });

  const btnSave = createElement('button', { className: 'btn btn-primary', type: 'button' }, 'Сохранить');
  on(btnSave, 'click', () => {
    if (!workingStory.title.trim()) { toast('Введите название', 'error'); return; }
    if (workingStory.slides.length === 0) { toast('Добавьте слайд', 'error'); return; }
    onSave();
  });

  footer.appendChild(btnCancel);
  footer.appendChild(btnPreview);
  footer.appendChild(btnSave);
  
  return footer;
}