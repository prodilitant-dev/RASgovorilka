// src/modes/say/Say.controller.js
import { renderMainLayout } from '@components/common/Layout/MainLayout';
import { createElement } from '@utils/dom';
import { getState, setState } from '@state/store';
import { renderCategories } from './Say.categories';
import { renderCards } from './Say.cards';
import { renderQuickButtons } from '@modes/common/quickButtons';
import {
  renderSentence,
  addWord,
  removeWord,
  clearSentence,
  speakSentence,
} from '@modes/common/sentence';
import { setupSwipeNavigation } from './Say.swipe';
import { createCleanupCollector } from '@utils/lifecycle';
import { logger } from '@utils/logger';
import { saveProfile } from '@storage/appStorage';
import { toast } from '@utils';
import { openCategoryEditor } from './Say.categoryEditor';

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

  // Снимаем предыдущий общий cleanup, если режим рендерится повторно
  if (typeof container._modeCleanup === 'function') {
    container._modeCleanup();
    container._modeCleanup = null;
  }

  const content = createElement('div', { className: 'say-content' });

  const catWrap = createElement('div', { className: 'categories-wrap' });
  categoriesContainer = createElement('div', { className: 'categories' });
  catWrap.appendChild(categoriesContainer);
  content.appendChild(catWrap);

  cardsContainer = createElement('div', { className: 'grid-container' });
  content.appendChild(cardsContainer);

  const bottomPanel = createElement('div', {});
  quickContainer = createElement('div', { className: 'quick-buttons' });
  sentenceContainer = createElement('div', {});
  bottomPanel.appendChild(quickContainer);
  bottomPanel.appendChild(sentenceContainer);

  renderMainLayout(container, { content, bottomPanel });

  const state = getState();
  const activeCategoryId =
    state.currentCategoryId || currentProfile.categories[0]?.id || null;

  renderCategories(
    categoriesContainer,
    currentProfile,
    activeCategoryId,
    onCategorySelect,
    handleCategoryEdit,
    handleCategoryReorder,
    onCategoryCreated
  );
  renderCards(
    cardsContainer,
    currentProfile,
    activeCategoryId,
    onCardClick,
    handleCardReorder
  );

  renderQuickButtons(quickContainer, currentProfile, {
    onQuickClick: onQuickButtonClick,
    onReorder: handleQuickReorder,
  });

  renderSentence(sentenceContainer, {
    onRemove: (index) => {
      removeWord(index);
      renderSentence(sentenceContainer);
    },
    onClear: () => {
      clearSentence();
      renderSentence(sentenceContainer);
    },
    onSpeak: speakSentence,
  });

  // Свайп — только вне режима редактирования
  let swipeCleanup = null;
  if (!state.editingMode) {
    swipeCleanup = setupSwipeNavigation(cardsContainer, {
      onNext: () => navigateCategory(+1),
      onPrev: () => navigateCategory(-1),
    });
  }

  if (!state.currentCategoryId && activeCategoryId) {
    setState({ currentCategoryId: activeCategoryId });
  }

  // === Единый cleanup режима ===
  // Собираем все под-cleanups с их контейнеров
  const collector = createCleanupCollector();
  collector.add(categoriesContainer?._categoriesCleanup);
  collector.add(cardsContainer?._cardsCleanup);
  collector.add(quickContainer?._quickCleanup);
  collector.add(swipeCleanup);

  container._modeCleanup = () => {
    collector.run();
    // Сброс ссылок модуля
    containerRef = null;
    currentProfile = null;
    categoriesContainer = null;
    cardsContainer = null;
    quickContainer = null;
    sentenceContainer = null;
    logger.debug('Say mode cleanup done');
  };
}

function navigateCategory(delta) {
  if (!currentProfile) return;
  const state = getState();
  const cats = currentProfile.categories.filter((c) => !c.hidden);
  if (cats.length === 0) return;

  const currentId = state.currentCategoryId || cats[0].id;
  const currentIdx = cats.findIndex((c) => c.id === currentId);
  if (currentIdx === -1) return;

  const nextIdx = currentIdx + delta;
  if (nextIdx < 0 || nextIdx >= cats.length) return;

  onCategorySelect(cats[nextIdx].id);
}

function onCategorySelect(categoryId) {
  setState({ currentCategoryId: categoryId });
  renderCategories(
    categoriesContainer,
    currentProfile,
    categoryId,
    onCategorySelect,
    handleCategoryEdit,
    handleCategoryReorder,
    onCategoryCreated
  );
  renderCards(
    cardsContainer,
    currentProfile,
    categoryId,
    onCardClick,
    handleCardReorder
  );

  const el = categoriesContainer.querySelector(
    `[data-category-id="${categoryId}"]`
  );
  if (el && el.scrollIntoView) {
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

function onCategoryCreated(newCategoryId) {
  onCategorySelect(newCategoryId);
}

function handleCategoryEdit(category) {
  openCategoryEditor(category, (updatedCategory, done) => {
    saveProfile(currentProfile);
    const state = getState();
    renderCategories(
      categoriesContainer,
      currentProfile,
      state.currentCategoryId,
      onCategorySelect,
      handleCategoryEdit,
      handleCategoryReorder,
      onCategoryCreated
    );
    renderCards(
      cardsContainer,
      currentProfile,
      state.currentCategoryId,
      onCardClick,
      handleCardReorder
    );
    toast('Категория обновлена');
    done();
  });
}

function handleCategoryReorder(newOrder) {
  const sorted = newOrder
    .map((id) => currentProfile.categories.find((c) => c.id === id))
    .filter(Boolean);
  currentProfile.categories = sorted;
  saveProfile(currentProfile);
  const state = getState();
  renderCategories(
    categoriesContainer,
    currentProfile,
    state.currentCategoryId,
    onCategorySelect,
    handleCategoryEdit,
    handleCategoryReorder,
    onCategoryCreated
  );
}

function onCardClick(cardId, categoryId) {
  const state = getState();
  if (state.editingMode) return;
  const card = currentProfile.cards[categoryId]?.find((c) => c.id === cardId);
  if (card) {
    addWord(card.text, card);
    renderSentence(sentenceContainer);
  }
}

function handleCardReorder(newOrder, categoryId) {
  const cards = currentProfile.cards[categoryId] || [];
  const sorted = newOrder.map((id) => cards.find((c) => c.id === id)).filter(Boolean);
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
  // Порядок сохраняется внутри renderQuickButtons
}