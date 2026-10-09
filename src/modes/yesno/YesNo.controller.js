// src/modes/yesno/YesNo.controller.js
import { createElement, clear } from '@utils/dom';
import { renderGrid, attachGridEvents } from '@components/common/Grid';
import { openSimpleEditor } from '@modes/common/editorHelpers';
import { getState } from '@state/store';
import { speak } from '@utils/speech';
import { toast } from '@utils/toast';
import { saveProfile } from '@storage/appStorage';
import { uid } from '@utils/id';
import { logger } from '@utils/logger';

let container = null;
let currentProfile = null;
let gridContainer = null;
let gridCleanup = null;

export function renderYesNo(containerEl, profile) {
  container = containerEl;
  currentProfile = profile;

  if (typeof container._modeCleanup === 'function') {
    container._modeCleanup();
    container._modeCleanup = null;
  }

  clear(container);
  gridContainer = createElement('div', { className: 'grid-container full-height' });
  container.appendChild(gridContainer);
  renderTiles();

  container._modeCleanup = () => {
    if (typeof gridCleanup === 'function') {
      gridCleanup();
      gridCleanup = null;
    }
    container = null;
    currentProfile = null;
    gridContainer = null;
    logger.debug('YesNo mode cleanup done');
  };
}

function renderTiles() {
  const state = getState();
  const editing = state.editingMode || false;
  let items = currentProfile.yesnoButtons.map(btn => ({ ...btn }));
  if (editing) {
    items.push({ id: 'add', text: 'Добавить', emoji: '➕', isAdd: true });
  }

  if (gridCleanup) {
    gridCleanup();
    gridCleanup = null;
  }

  const grid = renderGrid(gridContainer, items, {
    draggable: editing,
    onReorder: editing ? handleReorder : null,
  });

  gridCleanup = attachGridEvents(grid, {
    onClick: (id) => handleButtonClick(id),
  });
}

function handleReorder(newOrder) {
  const sorted = newOrder.map(id => currentProfile.yesnoButtons.find(b => b.id === id)).filter(Boolean);
  currentProfile.yesnoButtons = sorted;
  saveProfile(currentProfile);
  renderTiles();
}

function handleButtonClick(id) {
  if (id === 'add') {
    const newBtn = { id: uid(), text: '', emoji: '' };
    openSimpleEditor({
      entity: newBtn,
      title: 'Новая кнопка',
      onSave: (updated, done) => {
        if (!updated.text.trim()) {
          toast('Введите текст', 'error');
          done();
          return;
        }
        currentProfile.yesnoButtons.push(updated);
        saveProfile(currentProfile);
        renderTiles();
        done();
      },
    });
    return;
  }

  const btn = currentProfile.yesnoButtons.find(b => b.id === id);
  if (!btn) return;

  const state = getState();
  if (state.editingMode) {
    openSimpleEditor({
      entity: btn,
      title: 'Редактировать кнопку',
      onSave: (updated, done) => {
        Object.assign(btn, updated);
        saveProfile(currentProfile);
        renderTiles();
        done();
      },
      onDelete: (btnId, close) => {
        currentProfile.yesnoButtons = currentProfile.yesnoButtons.filter(b => b.id !== btnId);
        saveProfile(currentProfile);
        renderTiles();
        close();
      },
    });
    return;
  }

  if (btn.text.trim()) {
    const voiceSettings = state.voiceSettings || { rate: 1, voiceURI: '' };
    speak(btn.text, voiceSettings.rate, voiceSettings.pitch, voiceSettings.voiceURI);
  } else {
    toast('Пустая кнопка', 'info');
  }
}