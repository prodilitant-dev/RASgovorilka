// src/modes/say/Say.controller.js
import { renderMainLayout } from '@components/common/Layout/MainLayout';
import { createElement } from '@utils/dom';
import { getState, setState } from '@state/store';
import { renderCategories } from './Say.categories';
import { renderCards } from './Say.cards';
import { renderQuickButtons } from '@modes/common/quickButtons';
import { renderSentence, addWord, removeWord, clearSentence, speakSentence } from '@modes/common/sentence';
import { logger } from '@utils/logger';
import { saveProfile } from '@storage/appStorage';
import { toast } from '@utils';

let containerRef = null;
let currentProfile = null;
let categoriesContainer = null;
let cardsContainer = null;
let quickContainer = null;
let sentenceContainer = null;

export function renderSay(container, profile) {
  logger.debug('🔄 Rendering Say mode', { profileId: profile?.id });
  containerRef = container;
  currentProfile = profile;

  const content = createElement('div', { className: 'say-content' });

  // Категории
  const catWrap = createElement('div', { className: 'categories-wrap' });
  categoriesContainer = createElement('div', { className: 'categories' });
  catWrap.appendChild(categoriesContainer);
  content.appendChild(catWrap);

  // Сетка карточек
  cardsContainer = createElement('div', { className: 'grid-container' });
  content.appendChild(cardsContainer);

  // Нижняя панель
  const bottomPanel = createElement('div', {});
  quickContainer = createElement('div', { className: 'quick-buttons' });
  sentenceContainer = createElement('div', {});
  bottomPanel.appendChild(quickContainer);
  bottomPanel.appendChild(sentenceContainer);

  renderMainLayout(container, { content, bottomPanel });

  const state = getState();
  const activeCategoryId = state.currentCategoryId || currentProfile.categories[0]?.id || null;

  // Рендерим категории и карточки
  renderCategories(categoriesContainer, currentProfile, activeCategoryId, onCategorySelect, handleCategoryEdit, handleCategoryReorder);
  renderCards(cardsContainer, currentProfile, activeCategoryId, onCardClick, handleCardReorder);

  // Рендерим быстрые кнопки
  renderQuickButtons(quickContainer, currentProfile, {
    onQuickClick: onQuickButtonClick,
    onReorder: handleQuickReorder,
  });

  // Рендерим строку предложения с кастомными колбэками
  renderSentence(sentenceContainer, {
    onRemove: (index) => {
      removeWord(index);
      // Перерисовываем строку с теми же колбэками (они запомнены в renderSentence)
      renderSentence(sentenceContainer);
    },
    onClear: () => {
      clearSentence();
      renderSentence(sentenceContainer);
    },
    onSpeak: speakSentence,
  });

  if (!state.currentCategoryId && activeCategoryId) {
    setState({ currentCategoryId: activeCategoryId });
  }
}

// --- Обработчики ---

function onCategorySelect(categoryId) {
  setState({ currentCategoryId: categoryId });
  renderCategories(categoriesContainer, currentProfile, categoryId, onCategorySelect, handleCategoryEdit, handleCategoryReorder);
  renderCards(cardsContainer, currentProfile, categoryId, onCardClick, handleCardReorder);
}

function handleCategoryEdit(category) {
  const newName = prompt('Новое название категории:', category.name);
  if (newName !== null && newName.trim()) {
    category.name = newName.trim();
    saveProfile(currentProfile);
    const state = getState();
    renderCategories(categoriesContainer, currentProfile, state.currentCategoryId, onCategorySelect, handleCategoryEdit, handleCategoryReorder);
    renderCards(cardsContainer, currentProfile, state.currentCategoryId, onCardClick, handleCardReorder);
    toast('Категория обновлена');
  }
}

function handleCategoryReorder(newOrder) {
  const sorted = newOrder.map(id => currentProfile.categories.find(c => c.id === id)).filter(Boolean);
  currentProfile.categories = sorted;
  saveProfile(currentProfile);
  const state = getState();
  renderCategories(categoriesContainer, currentProfile, state.currentCategoryId, onCategorySelect, handleCategoryEdit, handleCategoryReorder);
}

function onCardClick(cardId, categoryId) {
  const state = getState();
  if (state.editingMode) return;
  const card = currentProfile.cards[categoryId]?.find(c => c.id === cardId);
  if (card) {
    addWord(card.text, card);
    // Перерисовываем строку (колбэки запомнены)
    renderSentence(sentenceContainer);
  }
}

function handleCardReorder(newOrder, categoryId) {
  const cards = currentProfile.cards[categoryId] || [];
  const sorted = newOrder.map(id => cards.find(c => c.id === id)).filter(Boolean);
  currentProfile.cards[categoryId] = sorted;
  saveProfile(currentProfile);
  renderCards(cardsContainer, currentProfile, categoryId, onCardClick, handleCardReorder);
}

function onQuickButtonClick(btn) {
  const state = getState();
  if (state.editingMode) return;
  addWord(btn.text, btn);
  renderSentence(sentenceContainer);
}

function handleQuickReorder() {
  // Порядок уже сохранён внутри renderQuickButtons
}