// src/components/common/ImageCropper/ImageCropper.state.js

/** Максимальный зум относительно «вписанного в рамку» состояния. */
export const MAX_ZOOM = 5;

/** Эффективные размеры изображения после поворота (без масштаба). */
function getEffectiveSize(imgW, imgH, rotation) {
  return rotation % 180 === 0 ? { w: imgW, h: imgH } : { w: imgH, h: imgW };
}

/** Базовый масштаб: изображение полностью покрывает квадрат frameSize. */
function getBaseScale(imgW, imgH, rotation, frameSize) {
  const { w, h } = getEffectiveSize(imgW, imgH, rotation);
  return Math.max(frameSize / w, frameSize / h);
}

/**
 * Начальное состояние: без поворота, зум 1, без сдвига.
 * @returns {{rotation:number, zoom:number, offsetX:number, offsetY:number}}
 */
export function createInitialState() {
  return { rotation: 0, zoom: 1, offsetX: 0, offsetY: 0 };
}

/**
 * Ограничивает offset так, чтобы изображение всегда покрывало рамку.
 * Вызывать после любого изменения rotation/zoom/offset.
 */
export function clampState(state, imgW, imgH, frameSize) {
  const { rotation, zoom } = state;
  const base = getBaseScale(imgW, imgH, rotation, frameSize);
  const scale = base * zoom;
  const { w: effW, h: effH } = getEffectiveSize(imgW, imgH, rotation);
  const renderW = effW * scale;
  const renderH = effH * scale;
  const maxOffX = Math.max(0, (renderW - frameSize) / 2);
  const maxOffY = Math.max(0, (renderH - frameSize) / 2);
  return {
    ...state,
    offsetX: Math.min(maxOffX, Math.max(-maxOffX, state.offsetX)),
    offsetY: Math.min(maxOffY, Math.max(-maxOffY, state.offsetY)),
  };
}

/** Поворот на delta градусов (обычно ±90). */
export function rotate(state, delta, imgW, imgH, frameSize) {
  const next = { ...state, rotation: (state.rotation + delta + 360) % 360 };
  return clampState(next, imgW, imgH, frameSize);
}

/** Установить зум (с ограничением MIN/MAX). */
export function setZoom(state, zoom, imgW, imgH, frameSize) {
  const clamped = Math.min(MAX_ZOOM, Math.max(1, zoom));
  return clampState({ ...state, zoom: clamped }, imgW, imgH, frameSize);
}

/** Установить смещение с автоматическим клэмпом. */
export function setOffset(state, offsetX, offsetY, imgW, imgH, frameSize) {
  return clampState({ ...state, offsetX, offsetY }, imgW, imgH, frameSize);
}

/**
 * Параметры для отрисовки на canvas размера frameSize.
 * Возвращает scale, rotation, и позицию центра изображения в системе canvas.
 */
export function getRenderInfo(state, imgW, imgH, frameSize) {
  const base = getBaseScale(imgW, imgH, state.rotation, frameSize);
  return {
    scale: base * state.zoom,
    rotation: state.rotation,
    cx: frameSize / 2 + state.offsetX,
    cy: frameSize / 2 + state.offsetY,
  };
}
