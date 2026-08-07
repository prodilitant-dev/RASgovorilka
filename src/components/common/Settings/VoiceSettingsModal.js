// src/components/common/Settings/VoiceSettingsModal.js
import { Modal } from '../Modal/Modal';
import { createElement } from '@utils/dom';
import { speak, ensureVoicesLoaded } from '@utils/speech';
import { logger } from '@utils/logger';
import { createCustomSelect } from '../CustomSelect/CustomSelect';

export function openVoiceSettings(voiceSettings, onSave) {
  let rateInput, pitchInput;
  let voiceSelectInstance = null;

  const modal = new Modal({
    title: 'Настройки голоса',
    body: () => {
      const wrap = createElement('div', {});

      // --- Скорость ---
      const rateRow = createElement('div', { className: 'form-row' });
      const rateLabel = createElement('label', {}, 'Скорость');
      rateInput = createElement('input', {
        type: 'range',
        min: '0.5',
        max: '2.0',
        step: '0.1',
        value: voiceSettings.rate || 1,
      });
      const rateValue = createElement('span', {}, voiceSettings.rate || 1);
      rateInput.addEventListener('input', () => {
        rateValue.textContent = rateInput.value;
      });
      rateRow.appendChild(rateLabel);
      rateRow.appendChild(rateInput);
      rateRow.appendChild(rateValue);
      wrap.appendChild(rateRow);

      // --- Тональность ---
      const pitchRow = createElement('div', { className: 'form-row' });
      const pitchLabel = createElement('label', {}, 'Тональность');
      pitchInput = createElement('input', {
        type: 'range',
        min: '0.5',
        max: '2.0',
        step: '0.1',
        value: voiceSettings.pitch || 1,
      });
      const pitchValue = createElement('span', {}, voiceSettings.pitch || 1);
      pitchInput.addEventListener('input', () => {
        pitchValue.textContent = pitchInput.value;
      });
      pitchRow.appendChild(pitchLabel);
      pitchRow.appendChild(pitchInput);
      pitchRow.appendChild(pitchValue);
      wrap.appendChild(pitchRow);

      // --- Выбор голоса (кастомный) ---
      const voiceRow = createElement('div', { className: 'form-row' });
      const voiceLabel = createElement('label', {}, 'Голос');
      const voiceContainer = createElement('div', { style: 'flex:1;' });
      voiceRow.appendChild(voiceLabel);
      voiceRow.appendChild(voiceContainer);
      wrap.appendChild(voiceRow);

      // Загружаем голоса и создаём кастомный select
      ensureVoicesLoaded().then((loadedVoices) => {
        const options = [
          { value: '', label: 'Системный' },
          ...loadedVoices.map(v => ({ value: v.voiceURI, label: `${v.name} (${v.lang})` })),
        ];
        const currentVoice = voiceSettings.voiceURI || '';
        voiceSelectInstance = createCustomSelect({
          options,
          value: currentVoice,
          placeholder: 'Выберите голос...',
        });
        voiceContainer.appendChild(voiceSelectInstance.element);
      });

      // --- Кнопка проверки ---
      const testRow = createElement('div', { className: 'form-row', style: 'justify-content:center; margin-top: 8px;' });
      const testBtn = createElement('button', { className: 'btn-secondary' }, '🔊 Проверить');
      testBtn.addEventListener('click', () => {
        const currentRate = parseFloat(rateInput.value);
        const currentPitch = parseFloat(pitchInput.value);
        const currentVoice = voiceSelectInstance ? voiceSelectInstance.getValue() : '';
        speak(' Раз - два. раз - два. Проверка связи. Прием', currentRate, currentPitch, currentVoice);
        logger.debug('Test speech played');
      });
      testRow.appendChild(testBtn);
      wrap.appendChild(testRow);

      return wrap;
    },
    buttons: [
      { label: 'Отмена', action: () => modal.close() },
      {
        label: 'Сохранить',
        primary: true,
        action: () => {
          const rate = parseFloat(rateInput.value);
          const pitch = parseFloat(pitchInput.value);
          const voiceURI = voiceSelectInstance ? voiceSelectInstance.getValue() : '';
          onSave({ rate, pitch, voiceURI });
          modal.close();
        },
      },
    ],
    onClose: () => {
      if (voiceSelectInstance) {
        voiceSelectInstance.destroy();
        voiceSelectInstance = null;
      }
    },
  });

  modal.open();
}