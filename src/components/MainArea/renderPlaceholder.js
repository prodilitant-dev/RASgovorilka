// src/components/MainArea/renderPlaceholder.js
import { renderMainLayout } from '@components/common/Layout/MainLayout';
import { createElement } from '@utils/dom';
import { logger } from '@utils/logger';

export function renderPlaceholder(container, modeId) {
  logger.debug(`🔄 Rendering Placeholder for "${modeId}"`);
  const content = createElement(
    'div',
    { style: 'padding: 20px; text-align: center; font-size: 24px;' },
    `Режим: ${modeId} (заглушка)`
  );
  renderMainLayout(container, { content, bottomPanel: null });
  logger.debug(`✅ Placeholder for "${modeId}" rendered`);
}