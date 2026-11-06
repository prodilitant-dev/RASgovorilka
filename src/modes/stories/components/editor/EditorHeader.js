// src/modes/stories/components/editor/EditorHeader.js
import { createElement, on } from '@utils/dom';

export function createEditorHeader(workingStory) {
  const header = createElement('div', { className: 'story-editor-header' });

  const titleWrap = createElement('div', { className: 'story-title-wrap' });
  const titleInput = createElement('input', {
    type: 'text',
    className: 'story-title-input',
    placeholder: 'Название истории...',
    value: workingStory.title || ''
  });
  on(titleInput, 'input', (e) => workingStory.title = e.target.value);
  titleWrap.appendChild(titleInput);
  header.appendChild(titleWrap);

  return header;
}