// src/components/common/ImageCropper/ImageCropper.js
import { Modal } from '@components/common/Modal/Modal';
import { logger } from '@utils/logger';
import { toast } from '@utils/toast';
import { renderCropperView } from './ImageCropper.view';
import {
  createInitialState,
  rotate as rotateState,
  setZoom as setZoomState,
  setOffset as setOffsetState,
  getRenderInfo,
} from './ImageCropper.state';

async function loadImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (err) {
      logger.warn('createImageBitmap failed, fallback to Image:', err);
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url); // <-- ОСВОБОЖДАЕМ ПАМЯТЬ
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение'));
    };
    img.src = url;
  });
}

function drawPreview(canvas, bitmap, imgW, imgH, state) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const info = getRenderInfo(state, imgW, imgH, size);

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.translate(info.cx, info.cy);
  ctx.rotate((info.rotation * Math.PI) / 180);
  ctx.scale(info.scale, info.scale);
  ctx.drawImage(bitmap, -imgW / 2, -imgH / 2, imgW, imgH);
  ctx.restore();
}

function exportCroppedBlob(bitmap, imgW, imgH, state, previewSize, outputSize, quality) {
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');

  const info = getRenderInfo(state, imgW, imgH, previewSize);
  const k = outputSize / previewSize;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputSize, outputSize);

  ctx.save();
  ctx.translate(info.cx * k, info.cy * k);
  ctx.rotate((info.rotation * Math.PI) / 180);
  ctx.scale(info.scale * k, info.scale * k);
  ctx.drawImage(bitmap, -imgW / 2, -imgH / 2, imgW, imgH);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Не удалось создать изображение'));
      },
      'image/webp',
      quality
    );
  });
}

export async function openImageCropper(file, options = {}) {
  const {
    size: outputSize = 512,
    quality = 0.5,
    title = 'Настройка изображения',
    frameSize = 320,
  } = options;

  let bitmap;
  try {
    bitmap = await loadImage(file);
  } catch (err) {
    logger.error('openImageCropper: load failed', err);
    toast('Не удалось открыть изображение', 'error');
    return null;
  }

  const imgW = bitmap.width;
  const imgH = bitmap.height;

  const view = renderCropperView({ frameSize });
  let state = createInitialState();

  const redraw = () => drawPreview(view.canvas, bitmap, imgW, imgH, state);

  view.rotateLeftBtn.addEventListener('click', () => {
    state = rotateState(state, -90, imgW, imgH, frameSize);
    redraw();
  });
  view.rotateRightBtn.addEventListener('click', () => {
    state = rotateState(state, 90, imgW, imgH, frameSize);
    redraw();
  });

  view.resetBtn.addEventListener('click', () => {
    state = createInitialState();
    view.zoomSlider.value = '1';
    redraw();
  });

  view.zoomSlider.addEventListener('input', () => {
    state = setZoomState(state, parseFloat(view.zoomSlider.value), imgW, imgH, frameSize);
    redraw();
  });

  view.canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      state = setZoomState(state, state.zoom * factor, imgW, imgH, frameSize);
      view.zoomSlider.value = String(state.zoom);
      redraw();
    },
    { passive: false }
  );

  const pointers = new Map();
  let startDistance = 0;
  let startZoom = 1;
  let startOffset = { x: 0, y: 0 };
  let startPointer = { x: 0, y: 0 };

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  view.canvas.addEventListener('pointerdown', (e) => {
    view.canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      startPointer = { x: e.clientX, y: e.clientY };
      startOffset = { x: state.offsetX, y: state.offsetY };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      startDistance = dist(a, b);
      startZoom = state.zoom;
    }
  });

  view.canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      const dx = e.clientX - startPointer.x;
      const dy = e.clientY - startPointer.y;
      state = setOffsetState(state, startOffset.x + dx, startOffset.y + dy, imgW, imgH, frameSize);
      redraw();
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const currentDistance = dist(a, b);
      const factor = currentDistance / Math.max(1, startDistance);
      state = setZoomState(state, startZoom * factor, imgW, imgH, frameSize);
      view.zoomSlider.value = String(state.zoom);
      redraw();
    }
  });

  const releasePointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 1) {
      const only = [...pointers.values()][0];
      startPointer = { x: only.x, y: only.y };
      startOffset = { x: state.offsetX, y: state.offsetY };
    }
  };
  view.canvas.addEventListener('pointerup', releasePointer);
  view.canvas.addEventListener('pointercancel', releasePointer);

  redraw();

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (value) => {
      if (resolved) return;
      resolved = true;
      
      // ФИКС: ОСВОБОЖДАЕМ ПАМЯТЬ ПРИ ЗАКРЫТИИ
      if (bitmap && typeof bitmap.close === 'function') {
        bitmap.close();
      }
      
      resolve(value);
    };

    const modal = new Modal({
      title,
      showCloseButton: false,
      body: () => view.root,
      buttons: [
        {
          label: 'Отмена',
          action: () => {
            modal.close();
            finish(null);
          },
        },
        {
          label: 'Сохранить',
          primary: true,
          action: async () => {
            try {
              const blob = await exportCroppedBlob(
                bitmap,
                imgW,
                imgH,
                state,
                frameSize,
                outputSize,
                quality
              );
              modal.close();
              finish(blob);
            } catch (err) {
              logger.error('openImageCropper: export failed', err);
              toast('Не удалось сохранить изображение', 'error');
            }
          },
        },
      ],
      onClose: () => finish(null),
    });

    modal.open();
  });
}