// src/main.js
import '@styles/main.css';
import { initApp } from './app';
import { initLogger } from '@utils/logger';
import { getState, subscribe } from '@state/store';
import { initSW } from '@services/pwa/updateService';

initLogger({ subscribe });

initSW();

initApp();