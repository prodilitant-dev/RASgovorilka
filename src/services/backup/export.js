// src/services/backup/export.js
import JSZip from 'jszip';
import { EXPORT_COMPONENTS } from './registry';
import { loadImage } from '@storage/imageStorage';  // ← было getImage, исправлено на loadImage
import { toast } from '@utils/toast';
import { logger } from '@utils/logger';
import { getActiveProfile } from '@state/actions';
import { getState } from '@state/store';

export async function exportToZip(selectedKeys, selectedCategoryIds = null) {
  const profile = getActiveProfile();
  const state = getState();
  const globalData = state.globalSettings || {};

  if (!profile) {
    toast('Нет активного профиля', 'error');
    return;
  }

  const zip = new JSZip();
  const manifest = {
    version: '2.0',
    date: new Date().toISOString(),
    components: {}
  };
  const allImageIds = new Set();
  const exportData = {};

  for (const key of selectedKeys) {
    const comp = EXPORT_COMPONENTS[key];
    if (!comp) continue;
    try {
      const result = await comp.export(profile, globalData);

      if (key === 'categories' && selectedCategoryIds && selectedCategoryIds.length > 0) {
        const filteredCats = result.data.categories.filter(c => selectedCategoryIds.includes(c.id));
        const filteredCards = {};
        filteredCats.forEach(cat => {
          filteredCards[cat.id] = (result.data.cards[cat.id] || []).slice();
        });
        result.data = { categories: filteredCats, cards: filteredCards };
        const ids = new Set();
        Object.values(filteredCards).forEach(arr => arr.forEach(c => c.imageId && ids.add(c.imageId)));
        result.imageIds = ids;
      }

      exportData[key] = result.data;
      result.imageIds.forEach(id => allImageIds.add(id));
      manifest.components[key] = true;
    } catch (e) {
      logger.error(`Ошибка экспорта компонента ${key}:`, e);
      toast(`Ошибка экспорта ${comp.label}`, 'error');
    }
  }

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  for (const key in exportData) {
    zip.file(`${key}.json`, JSON.stringify(exportData[key], null, 2));
  }

  const imgFolder = zip.folder('images');
  for (const id of allImageIds) {
    try {
      const blob = await loadImage(id);  // ← здесь была getImage, исправлено
      if (blob) imgFolder.file(id, blob);
    } catch (e) {
      logger.warn(`Не удалось загрузить изображение ${id} для экспорта`, e);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `RAS_backup_${new Date().toISOString().slice(0,10)}.rasbackup`;
  a.click();
  toast('Экспорт завершён', 'success');
}