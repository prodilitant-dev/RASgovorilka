// src/services/backup/import.js
import JSZip from 'jszip';
import { EXPORT_COMPONENTS } from './registry';
import { saveImage } from '@storage/imageStorage';  // ← есть, правильно
import { toast } from '@utils/toast';
import { logger } from '@utils/logger';
import { getActiveProfile } from '@state/actions';
import { getState, setState } from '@state/store';
import { saveProfile, saveAppData } from '@storage/appStorage';
import { openImportDialog } from '@modes/general/components/ImportDialog';

export async function importFromZip(file) {
  try {
    const zip = await JSZip.loadAsync(file);

    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      toast('Неверный формат: отсутствует manifest.json', 'error');
      throw new Error('Неверный формат: отсутствует manifest.json');
    }
    const manifestText = await manifestFile.async('string');
    const manifest = JSON.parse(manifestText);

    if (manifest.version !== '2.0') {
      toast('Неизвестная версия файла', 'error');
      throw new Error('Неизвестная версия файла');
    }

    const importedData = {};
    for (const key of Object.keys(manifest.components)) {
      const fileObj = zip.file(`${key}.json`);
      if (fileObj) {
        const text = await fileObj.async('string');
        importedData[key] = JSON.parse(text);
      }
    }

    const imgFolder = zip.folder('images');
    if (imgFolder) {
      const promises = [];
      imgFolder.forEach((relativePath, file) => {
        promises.push(file.async('blob').then(blob => saveImage(relativePath, blob)));
      });
      await Promise.all(promises);
    }

    openImportDialog(importedData, manifest, (selectedKeys, strategy, selectedCategories) => {
      applyImport(importedData, selectedKeys, strategy, selectedCategories);
    });

  } catch (err) {
    toast('Ошибка импорта: ' + err.message, 'error');
    logger.error('Импорт не удался', err);
  }
}

async function applyImport(importedData, selectedKeys, strategy, selectedCategoryIds) {
  const profile = getActiveProfile();
  const state = getState();
  const globalData = state.globalSettings || {};

  for (const key of selectedKeys) {
    const comp = EXPORT_COMPONENTS[key];
    if (!comp) continue;
    const data = importedData[key];
    if (!data) {
      logger.warn(`Данные для компонента ${key} отсутствуют в архиве`);
      continue;
    }
    try {
      if (key === 'categories' && selectedCategoryIds) {
        const filteredCats = data.categories.filter(c => selectedCategoryIds.includes(c.id));
        const filteredCards = {};
        filteredCats.forEach(cat => {
          filteredCards[cat.id] = data.cards[cat.id] || [];
        });
        await comp.import(profile, { categories: filteredCats, cards: filteredCards }, strategy);
      } else {
        await comp.import(profile, data, strategy, globalData);
      }
    } catch (e) {
      toast(`Ошибка импорта ${comp.label}: ${e.message}`, 'error');
      logger.error(`Ошибка импорта ${key}`, e);
    }
  }

  await saveProfile(profile);
  await saveAppData({ ...state, globalSettings: globalData });
  setState({ profiles: state.profiles, globalSettings: globalData });
  toast('Импорт завершён', 'success');
  // Перерендерим приложение
  import('@app/render').then(({ renderApp }) => renderApp());
}