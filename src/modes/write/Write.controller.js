// src/modes/write/Write.controller.js
import { renderMainLayout } from '@components/common/Layout/MainLayout';
import { createElement } from '@utils/dom';
import { getState, setState } from '@state/store';
import { renderQuickButtons } from '@modes/common/quickButtons';
import { renderSentence, addWord, removeWord, clearSentence, speakSentence, getWords } from '@modes/common/sentence';
import { saveProfile } from '@storage/appStorage';
import { uid, toast, debounce } from '@utils';
import { logger } from '@utils/logger';

let currentProfile = null;
let textarea = null;
let quickContainer = null;
let sentenceContainer = null;

export function renderWrite(container, profile) {
  logger.debug('🔄 Rendering Write mode', { profileId: profile?.id });
  currentProfile = profile;

  if (typeof container._modeCleanup === 'function') {
    container._modeCleanup();
    container._modeCleanup = null;
  }

  const content = createElement('div', { className: 'grid-container write-mode' });
  textarea = createElement('textarea', {
    placeholder: 'Введите текст здесь...',
    spellcheck: true,
    autofocus: true,
  });
  content.appendChild(textarea);

  const bottomPanel = createElement('div', {});
  quickContainer = createElement('div', { className: 'quick-buttons' });
  sentenceContainer = createElement('div', {});
  bottomPanel.appendChild(quickContainer);
  bottomPanel.appendChild(sentenceContainer);

  renderMainLayout(container, { content, bottomPanel });

  const state = getState();
  const words = getWords();

  renderQuickButtons(quickContainer, currentProfile, {
    onQuickClick: (btn) => {
      addWord(btn.text, btn);
      updateTextareaFromWords();
      renderSentence(sentenceContainer);
    },
    onReorder: () => {},
  });

  renderSentence(sentenceContainer, {
    onRemove: (index) => {
      removeWord(index);
      updateTextareaFromWords();
      renderSentence(sentenceContainer);
    },
    onClear: () => {
      clearSentence();
      updateTextareaFromWords();
      renderSentence(sentenceContainer);
    },
    onSpeak: speakSentence,
  });

  if (words.length) {
    const text = words.map(w => w.original || w.text).join(' ');
    textarea.value = text;
  }

  const debouncedHandle = debounce(handleTextInput, 300);

  function handleTextInput() {
    const raw = textarea.value;
    const words = raw.split(/\s+/).filter(w => w.length > 0);

    if (words.length === 0) {
      setState({ sentenceWords: [] });
      renderSentence(sentenceContainer);
      return;
    }

    const wordObjects = words.map(w => ({
      text: w,
      display: w,
      original: w,
      type: 'noun',
      forms: {},
    }));

    setState({ sentenceWords: wordObjects });
    renderSentence(sentenceContainer);
  }

  function updateTextareaFromWords() {
    const words = getWords();
    const text = words.map(w => w.original || w.text).join(' ');
    if (textarea.value !== text) {
      textarea.value = text;
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      speakSentence();
    }
  }

  textarea.addEventListener('input', debouncedHandle);
  textarea.addEventListener('keydown', onKeyDown);
  textarea.focus();

  container._modeCleanup = () => {
    if (textarea) {
      textarea.removeEventListener('input', debouncedHandle);
      textarea.removeEventListener('keydown', onKeyDown);
    }
    if (quickContainer?._quickCleanup) {
      quickContainer._quickCleanup();
      quickContainer._quickCleanup = null;
    }
    currentProfile = null;
    textarea = null;
    quickContainer = null;
    sentenceContainer = null;
    logger.debug('Write mode cleanup done');
  };
}