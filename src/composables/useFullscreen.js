import { invoke } from '@tauri-apps/api/core';

export function useFullscreen() {
  const isTauri = '__TAURI__' in window;

  async function setFullscreen(enable) {
    if (isTauri) {
      await invoke('set_fullscreen', { fullscreen: enable });
    } else {
      if (enable) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.fullscreenElement) document.exitFullscreen();
      }
    }
  }

  return { setFullscreen };
}
