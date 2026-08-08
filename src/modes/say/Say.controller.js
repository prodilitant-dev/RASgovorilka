// src/modes/say/Say.controller.js
import { renderMainLayout } from '@components/common/Layout/MainLayout';
import { createElement } from '@utils/dom';
import { getState, setState } from '@state/store';
import { renderCategories } from './Say.categories';
import { renderCards } from './Say.cards';
import { renderQuickButtons } from './Say.quick';
import { renderSentence } from './Say.sentence';
import { logger } from '@utils/logger';
import { saveProfile } from '@storage/appStorage';
import { uid, toast } from '@utils';
import { openCardEditor } from './Say.editor';

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

  // Создаём основной контент (без нижней панели — её добавим через renderMainLayout)
  const content = createElement('div', { className: 'say-content' });

  // Категории
  const catWrap = createElement('div', { className: 'categories-wrap' });
  categoriesContainer = createElement('div', { className: 'categories' });
  catWrap.appendChild(categoriesContainer);
  content.appendChild(catWrap);

  // Сетка карточек
  cardsContainer = createElement('div', { className: 'grid-container' });
  content.appendChild(cardsContainer);

  // Создаём нижнюю панель
  const bottomPanel = createElement('div', {});
  quickContainer = createElement('div', { className: 'quick-buttons' });
  sentenceContainer = createElement('div', {});
  bottomPanel.appendChild(quickContainer);
  bottomPanel.appendChild(sentenceContainer);

  // Оборачиваем всё в main-layout
  renderMainLayout(container, { content, bottomPanel });

  // Получаем текущее состояние
  const state = getState();
  const activeCategoryId = state.currentCategoryId || currentProfile.categories[0]?.id || null;

  // Рендерим содержимое
  renderCategories(categoriesContainer, currentProfile, activeCategoryId, onCategorySelect, handleCategoryEdit, handleCategoryReorder);
  renderCards(cardsContainer, currentProfile, activeCategoryId, onCardClick, handleCardReorder);
  renderQuickButtons(quickContainer, currentProfile, onQuickButtonClick, handleQuickReorder);
  renderSentence(sentenceContainer, state.sentenceWords || [], onSentenceRemove, onSpeak, onClear);

  // Устанавливаем состояние, если активная категория ещё не задана
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
  const editing = state.editingMode || false;

  if (editing) {
    // Редактирование карточки (обрабатывается внутри renderCards через onLongPress)
    // Здесь ничего не делаем, т.к. редактирование уже обработано в renderCards
    return;
  }

  // Обычный режим – добавляем слово в предложение
  if (!cardId) return;
  const card = currentProfile.cards[categoryId]?.find(c => c.id === cardId);
  if (!card) return;

  addWordToSentence(card.text, card);
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
  if (state.editingMode) {
    // Редактирование обрабатывается внутри renderQuickButtons
    // Здесь ничего не делаем
    return;
  }
  addWordToSentence(btn.text, btn);
}

function handleQuickReorder(newOrder) {
  // newOrder — массив id кнопок (передаётся из renderQuickButtons)
  // Сохранять порядок будем там, здесь только обновляем UI при необходимости
  // Но renderQuickButtons сам перерисовывается, так что ничего не делаем
}

// --- Работа с предложением ---

function addWordToSentence(text, sourceItem) {
  const state = getState();
  const words = state.sentenceWords || [];
  const newWord = {
    text: text,
    display: text,
    original: text,
    type: sourceItem.wordType || 'noun',
    forms: sourceItem.forms || {},
  };
  const newWords = [...words, newWord];
  setState({ sentenceWords: newWords });
  renderSentence(sentenceContainer, newWords, onSentenceRemove, onSpeak, onClear);
}

function onSentenceRemove(index) {
  const state = getState();
  const words = state.sentenceWords || [];
  words.splice(index, 1);
  setState({ sentenceWords: words });
  renderSentence(sentenceContainer, words, onSentenceRemove, onSpeak, onClear);
}

function onClear() {
  setState({ sentenceWords: [] });
  renderSentence(sentenceContainer, [], onSentenceRemove, onSpeak, onClear);
}

async function onSpeak() {
  const state = getState();
  const words = state.sentenceWords || [];
  if (words.length === 0) {
    toast('Нет слов для озвучивания', 'info');
    return;
  }
  const text = words.map(w => w.text).join(' ');
  const voiceSettings = state.voiceSettings || { rate: 1, pitch: 1, voiceURI: '' };
  const { speak } = await import('@utils/speech');
  speak(text, voiceSettings.rate, voiceSettings.pitch, voiceSettings.voiceURI);
}