// src/components/common/ImagePicker/ImagePicker.js
import { createElement, on, clear } from '@utils/dom';
import { showCardImage } from '@utils/image/showCardImage';
import { openImageSourcePopup } from '@components/common/VerticalEditor/preview/ImageSourcePopup';
import { openBankPicker } from '@components/common/VerticalEditor/BankPickerModal';
import { openImageCropper } from '@components/common/ImageCropper';
import { uploadImage } from '@services/image';
import '@styles/components/image-picker.css';

/**
 * Универсальный пикер картинок с поддержкой вариантов.
 * 
 * @param {Object} source - { imageId, imagePath, emoji, text, variants, category, filename }
 * @param {Object} options - { showVariants: boolean, className: string, size: number }
 * @param {Function} onChange - (updatedFields) => void. Вызывается при выборе новой картинки.
 * @param {Function} onRemove - () => void. Вызывается при удалении картинки.
 */
export function createImagePicker(source, options = {}, onChange, onRemove) {
  const wrapper = createElement('div', { className: `image-picker-wrap ${options.className || ''}` });
  
  // Клонируем source, чтобы не мутировать оригинал напрямую
  let localSource = { ...source };

  const render = () => {
    clear(wrapper);

    // 1. Основное превью
    const box = createElement('div', { className: 'image-picker-box' });
    showCardImage(box, localSource, { fontSize: '3em' });

    // Кнопка удаления (крестик)
    if (localSource.imageId || localSource.imagePath) {
      const removeBtn = createElement('button', { type: 'button', className: 'image-picker-remove' }, '✕');
      on(removeBtn, 'click', (e) => {
        e.stopPropagation();
        localSource.imageId = null;
        localSource.imagePath = null;
        localSource.emoji = '';
        localSource.variants = [];
        if (onChange) onChange(localSource);
        if (onRemove) onRemove();
        render();
      });
      box.appendChild(removeBtn);
    }

    // Клик по превью — открываем меню
    on(box, 'click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment';

      const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Вызываем кроппер (переиспользуем ваш)
        const croppedBlob = await openImageCropper(file, { size: options.size || 512 });
        if (croppedBlob) {
          const imageId = await uploadImage(croppedBlob, { size: options.size || 512, showToast: true });
          localSource.imageId = imageId;
          localSource.imagePath = null;
          localSource.emoji = '';
          if (onChange) onChange(localSource);
          render();
        }
      };

      on(fileInput, 'change', handleFile);
      on(cameraInput, 'change', handleFile);

      openImageSourcePopup(box, {
        fileInput,
        cameraInput,
        onSelectFromBank: () => {
          openBankPicker((item) => {
            localSource.imageId = null;
            localSource.imagePath = `cards/${item.category}/${item.filename || item.word + '.webp'}`;
            localSource.emoji = item.emoji || '';
            localSource.filename = item.filename;
            localSource.category = item.category;
            localSource.variants = item.variants || [];
            
            if (onChange) onChange(localSource);
            render();
          });
        }
      });
    });

    wrapper.appendChild(box);

    // 2. Ряд с вариантами (если есть)
    if (options.showVariants !== false && !localSource.imageId && localSource.variants && localSource.variants.length > 0 && localSource.category) {
      const allImages = [localSource.filename, ...(localSource.variants || []).slice(0, 3)].filter(Boolean);

      // Синхронизируем выбранную картинку с главной
      if (!localSource.imagePath || !allImages.some(f => localSource.imagePath.endsWith(f))) {
        localSource.imagePath = `cards/${localSource.category}/${allImages[0]}`;
      }

      const variantsRow = createElement('div', { className: 'image-picker-variants' });

      allImages.forEach(imgName => {
        const fullPath = `cards/${localSource.category}/${imgName}`;
        const base = import.meta.env.BASE_URL || '/';
        const url = base.endsWith('/') ? `${base}${fullPath}` : `${base}/${fullPath}`;

        const thumb = createElement('div', {
          className: `image-picker-thumb ${localSource.imagePath === fullPath ? 'active' : ''}`,
          style: `background-image: url(${url});`
        });

        on(thumb, 'click', (e) => {
          e.stopPropagation();
          localSource.imagePath = fullPath;
          if (onChange) onChange(localSource);
          render();
        });

        variantsRow.appendChild(thumb);
      });
      wrapper.appendChild(variantsRow);
    }
  };

  render();
  return wrapper;
}