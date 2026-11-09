// src/components/common/ImageCropper/ImageCropper.view.js
import { createIcon } from '@utils/icon';

/** DOM-хелпер. */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

function createIconButton({ iconName, emojiFallback, ariaLabel }) {
  const btn = h('button', {
    type: 'button',
    className: 'image-cropper__icon-btn',
    'aria-label': ariaLabel,
    title: ariaLabel,
  });
  btn.appendChild(
    createIcon(iconName, {
      fallback: emojiFallback,
      fallbackFontSize: 26,
      className: 'image-cropper__icon',
    })
  );
  return btn;
}

function createIconSpan({ iconName, emojiFallback }) {
  const span = h('span', { className: 'image-cropper__icon-wrap' });
  span.appendChild(
    createIcon(iconName, {
      fallback: emojiFallback,
      fallbackFontSize: 20,
      className: 'image-cropper__icon',
    })
  );
  return span;
}

export function renderCropperView({ frameSize }) {
  const canvas = h('canvas', {
    className: 'image-cropper__canvas',
    width: frameSize,
    height: frameSize,
  });

  const frame = h('div', { className: 'image-cropper__frame' }, canvas);

  const rotateLeftBtn = createIconButton({
    iconName: 'rotate-left',
    emojiFallback: '↺',
    ariaLabel: 'Повернуть влево',
  });
  const rotateRightBtn = createIconButton({
    iconName: 'rotate-right',
    emojiFallback: '↻',
    ariaLabel: 'Повернуть вправо',
  });
  const resetBtn = createIconButton({
    iconName: 'refresh',
    emojiFallback: '⟲',
    ariaLabel: 'Сбросить',
  });

  const zoomSlider = h('input', {
    type: 'range',
    className: 'image-cropper__slider',
    min: '1',
    max: '5',
    step: '0.01',
    value: '1',
    'aria-label': 'Масштаб',
  });

  const zoomIcon = createIconSpan({ iconName: 'zoom', emojiFallback: '🔍' });

  const controls = h(
    'div',
    { className: 'image-cropper__controls' },
    h('div', { className: 'image-cropper__buttons' }, rotateLeftBtn, rotateRightBtn, resetBtn),
    h('div', { className: 'image-cropper__zoom' }, zoomIcon, zoomSlider)
  );

  const root = h('div', { className: 'image-cropper' }, frame, controls);

  return { root, canvas, zoomSlider, rotateLeftBtn, rotateRightBtn, resetBtn };
}
