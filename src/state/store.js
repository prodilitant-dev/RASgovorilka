// src/state/store.js

const state = {
  currentProfileId: null,
  currentMode: 'say',
  previousMode: null,
  editingMode: false,
  currentCategoryId: null,
  sentenceWords: [],
  profiles: [],
  globalSettings: {
    autoInflect: false,
    voiceSettings: { rate: 1, pitch: 1, volume: 1, voiceURI: '' },
    fullscreen: false,
    sentenceBarPosition: 'bottom',
    categoriesShowImages: true,
    uiSize: 'small',
  },
  activityState: null,
};

const subscribers = [];

export function getState() {
  return state;
}

export function setState(updates) {
  const changed = {};
  for (const key in updates) {
    const next = updates[key];
    const prev = state[key];
    if (import.meta.env.DEV && prev === next && next !== null && typeof next === 'object') {
      console.warn(
        `[store] setState("${key}"): передана та же ссылка — мутация на месте не вызовет подписчиков`,
        next
      );
    }
    if (prev !== next) {
      state[key] = next;
      changed[key] = next;
    }
  }
  if (Object.keys(changed).length) {
    subscribers.forEach((cb) => cb(changed, state));
  }
  return changed;
}

export function subscribe(callback) {
  subscribers.push(callback);
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}
