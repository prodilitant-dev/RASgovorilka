// src/modes/schedule/Schedule.controller.js
import { renderScheduleView } from './Schedule.view';
import { openEventEditor } from './Schedule.editor';
import { openTemplateManager } from './Schedule.templates';
import { openSaveTemplateModal } from './Schedule.saveTemplate'; // ✅ новый импорт
import { getDateByOffset, getEventsForDate, getTemplateForDay, formatDateKey } from './Schedule.utils';
import { getState } from '@state/store';
import { toast } from '@utils/toast';
import { saveProfile } from '@storage/appStorage';
import { speak } from '@utils/speech';
import { uid } from '@utils/id';

let container = null;
let currentProfile = null;
let selectedOffset = 0;

export function renderSchedule(containerEl, profile) {
  container = containerEl;
  currentProfile = profile;
  selectedOffset = 0;
  render();
}

function render() {
  const state = getState();
  const editingMode = state.editingMode || false;
  const selectedDate = getDateByOffset(selectedOffset);
  const events = getEventsForDate(currentProfile, selectedDate);

  renderScheduleView(container, {
    selectedDate,
    events,
    editingMode,
    onDaySelect: handleDaySelect,
    onEventClick: handleEventClick,
    onManageTemplates: handleManageTemplates,
    onAddEvent: handleAddEvent,
    onReorderEvents: handleReorderEvents,
    onSaveTemplate: handleSaveTemplate, // ✅ передаём
  });
}

function handleDaySelect(offset) {
  selectedOffset = offset;
  render();
}

function handleEventClick(eventId) {
  const state = getState();
  if (state.editingMode) {
    openEventEditorForId(eventId);
    return;
  }

  const selectedDate = getDateByOffset(selectedOffset);
  const dateKey = formatDateKey(selectedDate);
  const events = getEventsForDate(currentProfile, selectedDate);
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  if (!currentProfile.scheduleDailyState) currentProfile.scheduleDailyState = {};
  if (!currentProfile.scheduleDailyState[dateKey]) {
    currentProfile.scheduleDailyState[dateKey] = { completed: [] };
  }
  const completed = currentProfile.scheduleDailyState[dateKey].completed;
  const index = completed.indexOf(eventId);
  const wasCompleted = index !== -1;

  if (!wasCompleted) {
    completed.push(eventId);
    const voiceSettings = state.voiceSettings || { rate: 1, voiceURI: '' };
    speak('Выполнено', voiceSettings.rate, voiceSettings.pitch, voiceSettings.voiceURI);
  } else {
    completed.splice(index, 1);
  }
  saveProfile(currentProfile);
  toast(wasCompleted ? 'Статус снят' : 'Выполнено');
  render();
}

function handleAddEvent() {
  const state = getState();
  if (!state.editingMode) {
    toast('Включите режим редактирования (долгий тап по профилю)', 'info');
    return;
  }
  const selectedDate = getDateByOffset(selectedOffset);
  const dayOfWeek = selectedDate.getDay();
  const template = getTemplateForDay(currentProfile, dayOfWeek);
  if (!template) {
    toast('Для этого дня не назначен шаблон. Сначала настройте шаблон.', 'error');
    return;
  }
  openEventEditor(null, (data) => {
    const newEvent = { id: uid(), ...data };
    template.events.push(newEvent);
    saveProfile(currentProfile);
    toast('Событие добавлено');
    render();
  });
}

function openEventEditorForId(eventId) {
  const selectedDate = getDateByOffset(selectedOffset);
  const dayOfWeek = selectedDate.getDay();
  const template = getTemplateForDay(currentProfile, dayOfWeek);
  if (!template) {
    toast('Шаблон не найден', 'error');
    return;
  }
  const event = template.events.find(e => e.id === eventId);
  if (!event) return;
  openEventEditor(event, (updatedData) => {
    Object.assign(event, updatedData);
    saveProfile(currentProfile);
    toast('Событие обновлено');
    render();
  }, (id) => {
    template.events = template.events.filter(e => e.id !== id);
    saveProfile(currentProfile);
    toast('Событие удалено');
    render();
  });
}

function handleManageTemplates() {
  openTemplateManager(currentProfile, () => render());
}

function handleReorderEvents(newOrder) {
  const selectedDate = getDateByOffset(selectedOffset);
  const dayOfWeek = selectedDate.getDay();
  const template = getTemplateForDay(currentProfile, dayOfWeek);
  if (!template) return;
  const sortedEvents = newOrder.map(id => template.events.find(e => e.id === id)).filter(Boolean);
  template.events = sortedEvents;
  saveProfile(currentProfile);
  toast('Порядок событий обновлён');
  render();
}

// ✅ НОВАЯ ФУНКЦИЯ: сохранение текущих событий как шаблон
function handleSaveTemplate() {
  const selectedDate = getDateByOffset(selectedOffset);
  // Получаем сырые события (без done)
  const events = getEventsForDate(currentProfile, selectedDate);
  if (events.length === 0) {
    toast('Нет событий для сохранения', 'error');
    return;
  }
  // Удаляем поле done, чтобы сохранить чистые данные
  const rawEvents = events.map(({ done, ...rest }) => rest);
  openSaveTemplateModal(currentProfile, rawEvents, () => render());
}