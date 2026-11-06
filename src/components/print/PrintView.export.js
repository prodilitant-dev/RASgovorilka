// src/components/print/PrintView.export.js
import { createElement } from '@utils/dom';
import { getImageUrl } from '@services/imageService';
import { toast } from '@utils/toast';
import { logger } from '@utils/logger';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { buildPageDOM } from './PrintPage';

export async function exportToZip({
  profile,
  activeCategoryIds,
  deletedCardIds,
  customCategoryNames,
  settings,
}) {
  toast('Готовим PNG...', 'info', 3000);

  const cardsToPrint = [];
  profile.categories.forEach((cat) => {
    if (!activeCategoryIds.has(cat.id)) return;
    const cards = (profile.cards[cat.id] || []).filter(
      (c) => (c.imageId || c.imagePath) && !deletedCardIds.has(c.id)
    );
    cards.forEach((c) => cardsToPrint.push({ ...c, categoryName: cat.name }));
  });

  if (cardsToPrint.length === 0) {
    toast('Нет карточек для печати', 'error');
    return;
  }

  const [cols, rows] = settings.grid.split('x').map(Number);
  const itemsPerPage = cols * rows;
  const groupedByCategory = {};
  cardsToPrint.forEach((card) => {
    if (!groupedByCategory[card.categoryName]) groupedByCategory[card.categoryName] = [];
    groupedByCategory[card.categoryName].push(card);
  });

  const hiddenContainer = createElement('div', {
    style:
      'position: fixed; top: 0; left: 0; width: 794px; z-index: -9999; opacity: 0; pointer-events: none;',
  });
  document.body.appendChild(hiddenContainer);

  const pages = [];
  for (const [catName, cards] of Object.entries(groupedByCategory)) {
    const finalName = customCategoryNames[catName] || catName;
    for (let i = 0; i < cards.length; i += itemsPerPage) {
      const pageCards = cards.slice(i, i + itemsPerPage);
      const pageEl = buildPageDOM({
        categoryName: catName,
        displayName: finalName,
        pageCards,
        cols,
        rows,
        isExport: true,
        settings,
        onDeleteCard: null,
        onRenameCategory: null,
      });
      hiddenContainer.appendChild(pageEl);
      pages.push({ el: pageEl, name: finalName });
    }
  }

  const dbImages = hiddenContainer.querySelectorAll('img[data-img-id]');
  await Promise.all(
    Array.from(dbImages).map(async (img) => {
      const url = await getImageUrl(img.getAttribute('data-img-id'));
      if (url) img.src = url;
      else img.style.display = 'none';
    })
  );

  const allImgs = hiddenContainer.querySelectorAll('img');
  await Promise.all(
    Array.from(allImgs).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    })
  );

  if (document.fonts) {
    await document.fonts.ready;
  }
  await new Promise((r) => setTimeout(r, 300));

  try {
    const zip = new JSZip();

    for (let i = 0; i < pages.length; i++) {
      const dataUrl = await toPng(pages[i].el, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          opacity: '1',
          transform: 'none',
          margin: '0',
        },
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const safeCatName = pages[i].name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_');
      zip.file(`${safeCatName}_лист_${i + 1}.png`, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RASgovorilka_печать_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();

    // Очищаем память только с задержкой, чтобы браузер успел скачать файл
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    toast('PNG сохранены в ZIP!', 'success');
  } catch (e) {
    logger.error('ZIP error:', e);
    toast('Ошибка при создании архива', 'error');
  } finally {
    document.body.removeChild(hiddenContainer);
  }
}
