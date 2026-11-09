// src/modes/say/Say.handlers.js
import { getState, setState } from '@state/store';
import { saveProfile } from '@storage/appStorage';
import { toast } from '@utils/toast';
import { uid } from '@utils/id';
import { renderCategories } from './Say.categories';
import { renderCards } from './Say.cards';
import { renderQuickButtons } from '@modes/common/quickButtons';
import { openCategoryEditor } from './Say.categoryEditor';
import { openCardEditor } from './Say.editor';
import { addWord, removeWord, clearSentence, speakSentence } from '@modes/common/sentence';

export function createSayHandlers(ctx) {
  const { profile, containers, render } = ctx;

  function renderCategoriesWrapper(activeId) {
    renderCategories(
      containers.categoriesContainer,
      profile,
      activeId,
      onCategorySelect,
      handleCategoryEdit,
      handleCategoryReorder,
      onCategoryCreated,
      handleCategoryLongPress // Передаем обработчик долгого тапа
    );
  }

  function renderCardsWrapper(activeId) {
    renderCards(containers.cardsContainer, profile, activeId, onCardClick, handleCardReorder);
  }

  function renderQuickWrapper() {
    renderQuickButtons(containers.quickContainer, profile, {
      onQuickClick: onQuickButtonClick,
      onReorder: handleQuickReorder,
    });
  }

  function navigateCategory(delta) {
    const state = getState();
    const cats = profile.categories.filter((c) => !c.hidden);
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
    renderCategoriesWrapper(categoryId);
    renderCardsWrapper(categoryId);

    const el = containers.categoriesContainer.querySelector(`[data-category-id="${categoryId}"]`);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function onCategoryCreated(newCategoryId) {
    onCategorySelect(newCategoryId);
  }

  function handleCategoryEdit(category) {
    openCategoryEditor(
      category,
      (updatedCategory, done) => {
        saveProfile(profile);
        const state = getState();
        renderCategoriesWrapper(state.currentCategoryId);
        renderCardsWrapper(state.currentCategoryId);
        toast('Категория обновлена');
        done();
      },
      (deletedCategory, done) => {
        profile.categories = profile.categories.filter((c) => c.id !== deletedCategory.id);
        delete profile.cards[deletedCategory.id];
        saveProfile(profile);

        const state = getState();
        let nextCategoryId = state.currentCategoryId;

        if (state.currentCategoryId === deletedCategory.id) {
          const remainingCats = profile.categories.filter((c) => !c.hidden);
          nextCategoryId = remainingCats.length > 0 ? remainingCats[0].id : null;
          setState({ currentCategoryId: nextCategoryId });
        }

        renderCategoriesWrapper(nextCategoryId);

        if (nextCategoryId) {
          renderCardsWrapper(nextCategoryId);
        } else {
          containers.cardsContainer.innerHTML = '';
        }

        toast('Категория удалена');
        done();
      }
    );
  }

  function handleCategoryReorder(newOrder) {
    const sorted = newOrder
      .map((id) => profile.categories.find((c) => c.id === id))
      .filter(Boolean);
    profile.categories = sorted;
    saveProfile(profile);
    const state = getState();
    renderCategoriesWrapper(state.currentCategoryId);
  }

  function handleCategoryLongPress(categoryId) {
    const state = getState();
    if (state.editingMode) return;

    if (state.currentCategoryId !== categoryId) {
      onCategorySelect(categoryId);
    }

    const newCard = { id: uid(), text: '', emoji: '', wordType: 'noun', forms: {} };

    openCardEditor(
      newCard,
      (savedCard, done) => {
        if (!savedCard.text.trim()) {
          toast('Введите текст', 'error');
          done();
          return;
        }
        profile.cards[categoryId].push(savedCard);
        saveProfile(profile);
        renderCardsWrapper(categoryId);
        toast('Карточка добавлена');
        done();
      },
      null,
      { targetCategoryId: categoryId, isNew: true }
    );
  }

  function onCardClick(cardId, categoryId) {
    const state = getState();
    if (state.editingMode) return;
    const card = profile.cards[categoryId]?.find((c) => c.id === cardId);
    if (card) {
      addWord(card.text, card);
      render.sentence();
    }
  }

  function handleCardReorder(newOrder, categoryId) {
    const cards = profile.cards[categoryId] || [];
    const sorted = newOrder.map((id) => cards.find((c) => c.id === id)).filter(Boolean);
    profile.cards[categoryId] = sorted;
    saveProfile(profile);
    renderCardsWrapper(categoryId);
  }

  function onQuickButtonClick(btn) {
    const state = getState();
    if (state.editingMode) return;
    addWord(btn.text, btn);
    render.sentence();
  }

  function handleQuickReorder() {
    // Порядок сохраняется внутри renderQuickButtons
  }

  return {
    renderCategories: renderCategoriesWrapper,
    renderCards: renderCardsWrapper,
    renderQuick: renderQuickWrapper,
    navigateCategory,
    removeWord: (index) => removeWord(index),
    clearSentence: () => clearSentence(),
    speakSentence: () => speakSentence(containers.sentenceContainer),
  };
}
