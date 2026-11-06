// src/modes/stories/utils/StoryImagePicker.js
import { openImageSourcePopup } from '@components/common/VerticalEditor/preview/ImageSourcePopup';
import { openBankPicker } from '@components/common/VerticalEditor/BankPickerModal';
import { openImageCropper } from '@components/common/ImageCropper';
import { uploadImage } from '@services/image';
import { toast } from '@utils/toast';

export function openStoryImagePicker(anchorEl, currentSource, onUpdate) {
  // Создаем скрытые инпуты
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';

  const cameraInput = document.createElement('input');
  cameraInput.type = 'file';
  cameraInput.accept = 'image/*';
  cameraInput.capture = 'environment';
  cameraInput.style.display = 'none';

  document.body.appendChild(fileInput);
  document.body.appendChild(cameraInput);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const croppedBlob = await openImageCropper(file, { size: 512 });
      if (!croppedBlob) return;
      const imageId = await uploadImage(croppedBlob, { size: 512, showToast: true });
      onUpdate({ imageId, imagePath: null, emoji: '' });
    } catch {
      // <-- Убрали (err)
      toast('Ошибка загрузки фото', 'error');
    } finally {
      fileInput.value = '';
      cameraInput.value = '';
    }
  };

  fileInput.addEventListener('change', handleFile);
  cameraInput.addEventListener('change', handleFile);

  openImageSourcePopup(anchorEl, {
    fileInput,
    cameraInput,
    onSelectFromBank: () => {
      openBankPicker((bankItem) => {
        const imagePath = `cards/${bankItem.category}/${bankItem.filename || bankItem.word + '.webp'}`;
        onUpdate({ imageId: null, imagePath, emoji: '' }); // Берем из банка
      });
    },
  });
}
