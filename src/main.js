// src/main.js
import '@styles/main.css';
import { initApp } from './app';
import { initLogger } from '@utils/logger';
import { getState, subscribe } from '@state/store';

// Инициализируем логгер, передавая store для автоматической подписки
initLogger({ subscribe }); // или передать объект store, если есть

initApp();