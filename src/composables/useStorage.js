import { invoke } from '@tauri-apps/api/core';

export function useStorage() {
  const isTauri = '__TAURI__' in window;

  async function load() {
    if (isTauri) {
      const data = await invoke('load_data');
      return JSON.parse(data);
    } else {
      const raw = localStorage.getItem('govorilka_data_v9');
      return raw ? JSON.parse(raw) : {};
    }
  }

  async function save(data) {
    if (isTauri) {
      await invoke('save_data', { data: JSON.stringify(data) });
    } else {
      localStorage.setItem('govorilka_data_v9', JSON.stringify(data));
    }
  }

  return { load, save };
}
