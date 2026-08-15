// src/components/common/ProgressBar/ProgressBar.view.js
import { createElement } from '@utils/dom';

export function renderProgressBar(container, current, total) {
  const wrap = createElement('div', { className: 'progress-bar' });
  const fill = createElement('div', {
    className: 'progress-fill',
    style: { width: `${(current / total) * 100}%` }
  });
  const label = createElement('span', { className: 'progress-label' }, `${current}/${total}`);
  wrap.appendChild(fill);
  wrap.appendChild(label);
  container.appendChild(wrap);
}