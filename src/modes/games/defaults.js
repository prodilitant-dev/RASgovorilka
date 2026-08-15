// src/modes/games/defaults.js

export function getDefaultMemorySettings(profile) {
  return {
    categoryIds: profile.categories.map(c => c.id),
    gridSize: 4,
  };
}

export function getDefaultFifteenSettings(profile) {
  return {
    size: 4,
    mode: 'numbers', // 'numbers' или 'images'
    categoryIds: [],
  };
}