// src/modes/say/Say.controller.js
import { createElement } from '@utils/dom';
import { getState, setState } from '@state/store';
import { renderMainLayout } from '@components/common/Layout/MainLayout';
import { renderSentence } from '@modes/common/sentence';
import { setupSwipeNavigation } from './Say.swipe';
import { createCleanupCollector } from '@utils/lifecycle';
import { logger } from '@utils/logger';
import { createSayHandlers } from './Say.handlers';

export function renderSay(container, profile) {
  logger.debug('🔄 Rendering Say mode', { profileId: profile?.id });

  if (typeof container._modeCleanup === 'function') {
    container._modeCleanup();
    container._modeCleanup = null;
  }

  const content = createElement('div', { className: 'say-content' });

  const catWrap = createElement('div', { className: 'categories-wrap' });
  const categoriesContainer = createElement('div', { className: 'categories' });
  catWrap.appendChild(categoriesContainer);
  content.appendChild(catWrap);

  const cardsContainer = createElement('div', { className: 'grid-container' });
  content.appendChild(cardsContainer);

  const panel = createElement('div', {});
  const quickContainer = createElement('div', { className: 'quick-buttons' });
  const sentenceContainer = createElement('div', {});
  panel.appendChild(quickContainer);
  panel.appendChild(sentenceContainer);

  const state = getState();
  const position = state.globalSettings?.sentenceBarPosition || 'bottom';

  renderMainLayout(container, {
    content,
    topPanel: position === 'top' ? panel : null,
    bottomPanel: position === 'bottom' ? panel : null,
  });

  // Формируем контекст для хендлеров
  const ctx = {
    profile,
    containers: {
      categoriesContainer,
      cardsContainer,
      quickContainer,
      sentenceContainer,
    },
    render: {
      categories: (activeId) => handlers.renderCategories(activeId),
      cards: (activeId) => handlers.renderCards(activeId),
      sentence: () => {
        renderSentence(sentenceContainer, {
          onRemove: (index) => {
            handlers.removeWord(index);
            ctx.render.sentence();
          },
          onClear: () => {
            handlers.clearSentence();
            ctx.render.sentence();
          },
          onSpeak: () => handlers.speakSentence(),
        });
      },
    },
  };

  // Создаем хендлеры
  const handlers = createSayHandlers(ctx);

  const activeCategoryId = state.currentCategoryId || profile.categories[0]?.id || null;
  if (!state.currentCategoryId && activeCategoryId) {
    setState({ currentCategoryId: activeCategoryId });
  }

  // Первичный рендеринг
  handlers.renderCategories(activeCategoryId);
  handlers.renderCards(activeCategoryId);
  handlers.renderQuick();
  ctx.render.sentence();

  // Свайпы
  let swipeCleanup = null;
  if (!state.editingMode) {
    swipeCleanup = setupSwipeNavigation(cardsContainer, {
      onNext: () => handlers.navigateCategory(+1),
      onPrev: () => handlers.navigateCategory(-1),
    });
  }

  // Очистка при выходе
  const collector = createCleanupCollector();
  collector.add(categoriesContainer?._categoriesCleanup);
  collector.add(cardsContainer?._cardsCleanup);
  collector.add(quickContainer?._quickCleanup);
  collector.add(swipeCleanup);

  container._modeCleanup = () => {
    collector.run();
    logger.debug('Say mode cleanup done');
  };
}
