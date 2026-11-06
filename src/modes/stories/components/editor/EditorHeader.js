// src/modes/stories/components/editor/EditorHeader.js
import { createElement, on } from '@utils/dom';
import { createImagePicker } from '@components/common/ImagePicker/ImagePicker';

export function createEditorHeader(workingStory, onUpdate) {
  const header = createElement('div', { className: 'story-editor-header' });

  // Обложка
  const coverWrap = createElement('div', { className: 'story-cover-wrap' });
  const coverPicker = createImagePicker(
    { imageId: workingStory.coverImageId, imagePath: workingStory.coverImagePath, text: 'Обложка' },
    { showVariants: false, size: 512, className: 'story-cover-picker' },
    (updatedSource) => {
      workingStory.coverImageId = updatedSource.imageId;
      workingStory.coverImagePath = updatedSource.imagePath;
      onUpdate();
    }
  );
  coverWrap.appendChild(coverPicker);
  header.appendChild(coverWrap);

  // Поле ввода названия
  const titleWrap = createElement('div', { className: 'story-title-wrap' });
  const titleInput = createElement('input', {
    type: 'text',
    className: 'story-title-input',
    placeholder: 'Название истории...',
    value: workingStory.title || '',
  });
  on(titleInput, 'input', (e) => (workingStory.title = e.target.value));
  titleWrap.appendChild(titleInput);
  header.appendChild(titleWrap);

  return header;
}
