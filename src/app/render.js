// src/app/render.js
// Точка входа, экспортирует основные функции для других частей приложения

export { renderApp } from './renderers/appRenderer';
export { renderContent } from './renderers/contentRenderer';

// Если нужны обработчики для тестирования или для других модулей
export { createProfileClickHandler, createProfileLongPressHandler } from './handlers/profileHandlers';
export { getProfileIcon, ensureActiveProfile, getActiveProfileSafe } from './helpers/profileHelpers';