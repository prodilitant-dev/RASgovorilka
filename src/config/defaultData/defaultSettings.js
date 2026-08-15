// src/config/defaultData/defaultSettings.js

export const DEFAULT_LEARNING_SETTINGS = {
  quiz: {
    visible: true,
    categories: [], // будут заполнены позже
    questions: 10,
    choices: 4,
    mode: 'image_to_word',
  },
  guess: {
    visible: true,
    categories: [],
    questions: 10,
  },
  sorting: {
    visible: true,
    categories: [],
    cardCount: 8,
  },
  math: {
    visible: true,
    operations: { add: true, subtract: true, multiply: false, divide: false },
    maxNumber: 10,
    questions: 10,
    choices: 4,
    inputMethod: 'drag',
  },
};

export const DEFAULT_GAMES_SETTINGS = {
  memory: {
    visible: true,
    gridSize: 4,
    categories: [],
  },
  fifteen: {
    visible: true,
    gridSize: 4,
    categories: [],
    mode: 'numbers',
  },
};