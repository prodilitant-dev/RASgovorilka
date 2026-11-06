// src/components/print/PrintView.js
import { createElement, clear, on } from '@utils/dom';
import { getActiveProfile } from '@state/actions';
import { getImageUrl } from '@services/imageService';
import { logger } from '@utils/logger';
import { createEmptyState } from '@components/common/EmptyState/EmptyState'; // <-- ДОБАВЛЕН ИМПОРТ
import '@styles/components/print.css';

// Импорт вынесенных модулей
import { buildPageDOM } from './PrintPage';
import { openPrintSettings } from './PrintView.settings';
import { exportToZip } from './PrintView.export';

const SETTINGS_KEY = 'ras_print_settings';

const DEFAULT_SETTINGS = {
  grid: '3x3',
  cutLines: false,
  showLabels: true,
  font: 'system-ui',
  frame: 'black',
};

export function openPrintView(onClose) {
  const profile = getActiveProfile();
  if (!profile) return;

  const activeCategoryIds = new Set([profile.categories[0]?.id]);
  const deletedCardIds = new Set();
  const customCategoryNames = {};
  let settings = { ...DEFAULT_SETTINGS };
  let resizeObserver = null;

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) settings = { ...settings, ...JSON.parse(saved) };
  } catch (e) {
    logger.warn('Ошибка загрузки настроек', e);
  }

  const printView = createElement('div', { className: 'print-view-fullscreen' });
  document.body.appendChild(printView);
  document.body.style.overflow = 'hidden';

  const topBar = createElement('div', { className: 'categories-wrap' });
  const categoriesEl = createElement('div', { className: 'categories' });
  topBar.appendChild(categoriesEl);

  const scrollArea = createElement('div', { className: 'print-scroll-area' });
  const bottomBar = createElement('div', { className: 'print-bottom-bar' });

  printView.appendChild(topBar);
  printView.appendChild(scrollArea);
  printView.appendChild(bottomBar);

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      logger.warn('Не удалось сохранить настройки печати', e);
    }
  }

  function closeView() {
    if (resizeObserver) resizeObserver.disconnect();
    document.body.style.overflow = '';
    if (printView.parentNode) printView.parentNode.removeChild(printView);
    if (onClose) onClose();
  }

  function render() {
    renderTopBar();
    renderPages();
    renderBottomBar();
  }

  function renderTopBar() {
    clear(categoriesEl);

    profile.categories.forEach((cat) => {
      const isActive = activeCategoryIds.has(cat.id);
      const el = createElement('div', { className: `category ${isActive ? 'active' : ''}` });

      el.appendChild(createElement('span', { className: 'cat-name' }, cat.name));

      const toggle = createElement('label', {
        className: 'toggle-switch',
        style: 'margin-left: 8px; transform: scale(0.8); transform-origin: right center;',
      });
      const input = createElement('input', { type: 'checkbox', checked: isActive });
      toggle.appendChild(input);
      toggle.appendChild(createElement('span', { className: 'slider' }));

      on(input, 'change', (e) => {
        if (e.target.checked) {
          activeCategoryIds.add(cat.id);
          profile.cards[cat.id]?.forEach((c) => deletedCardIds.delete(c.id));
        } else {
          activeCategoryIds.delete(cat.id);
        }
        renderPages();
        renderTopBar();
      });

      el.appendChild(toggle);

      on(el, 'click', (e) => {
        if (e.target.closest('.toggle-switch')) return;
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change'));
      });

      categoriesEl.appendChild(el);
    });
  }

  async function renderPages() {
    clear(scrollArea);

    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    const cardsToPrint = [];
    profile.categories.forEach((cat) => {
      if (!activeCategoryIds.has(cat.id)) return;
      const cards = (profile.cards[cat.id] || []).filter(
        (c) => (c.imageId || c.imagePath) && !deletedCardIds.has(c.id)
      );
      cards.forEach((c) => cardsToPrint.push({ ...c, categoryName: cat.name }));
    });

    if (cardsToPrint.length === 0) {
      // <-- ЗАМЕНА ЗДЕСЬ
      scrollArea.appendChild(createEmptyState('Нет карточек с картинками для печати', '🖨️'));
      return;
    }

    const [cols, rows] = settings.grid.split('x').map(Number);
    const itemsPerPage = cols * rows;

    const groupedByCategory = {};
    cardsToPrint.forEach((card) => {
      if (!groupedByCategory[card.categoryName]) groupedByCategory[card.categoryName] = [];
      groupedByCategory[card.categoryName].push(card);
    });

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const scale = width / 794;
        const pageEl = entry.target.querySelector('.print-page');
        if (pageEl) {
          pageEl.style.transform = `scale(${scale})`;
        }
      }
    });

    for (const [catName, cards] of Object.entries(groupedByCategory)) {
      for (let i = 0; i < cards.length; i += itemsPerPage) {
        const pageCards = cards.slice(i, i + itemsPerPage);
        const displayName = customCategoryNames[catName] || catName;

        const pageEl = buildPageDOM({
          categoryName: catName,
          displayName,
          pageCards,
          cols,
          rows,
          isExport: false,
          settings,
          onDeleteCard: (id) => {
            deletedCardIds.add(id);
            renderPages();
          },
          onRenameCategory: (newName) => {
            customCategoryNames[catName] = newName;
          },
        });

        const wrapper = createElement('div', { className: 'print-page-wrapper' });
        wrapper.appendChild(pageEl);
        scrollArea.appendChild(wrapper);

        resizeObserver.observe(wrapper);
      }
    }

    const dbImages = scrollArea.querySelectorAll('img[data-img-id]');
    await Promise.all(
      Array.from(dbImages).map(async (img) => {
        const url = await getImageUrl(img.getAttribute('data-img-id'));
        if (url) img.src = url;
        else img.style.display = 'none';
      })
    );
  }

  function renderBottomBar() {
    clear(bottomBar);
    const btnBack = createElement('div', { className: 'btn btn-secondary' }, 'Вернуться');
    on(btnBack, 'click', closeView);

    const btnSettings = createElement('div', { className: 'btn btn-secondary' }, 'Настройки');
    on(btnSettings, 'click', () => {
      openPrintSettings({
        settings,
        onSave: saveSettings,
        onUpdate: renderPages,
      });
    });

    const btnExport = createElement('div', { className: 'btn btn-primary' }, 'Сохранить листы');
    on(btnExport, 'click', () => {
      exportToZip({ profile, activeCategoryIds, deletedCardIds, customCategoryNames, settings });
    });

    bottomBar.appendChild(btnBack);
    bottomBar.appendChild(btnSettings);
    bottomBar.appendChild(btnExport);
  }

  render();
}
