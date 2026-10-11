// src/components/common/Settings/VoiceSettingsModal.js
import { Modal } from '../Modal/Modal';
import { createElement } from '@utils/dom';
import { speak } from '@utils/speech';
import { iconUrl } from '@utils/icon';
import { logger } from '@utils/logger';

export function openVoiceSettings(voiceSettings, onSave) {
  let rateInput = null;
  let pitchInput = null;
  let volumeInput = null;

  const modal = new Modal({
    title: 'Настройки голоса',
    body: () => {
      const wrap = createElement('div', { className: 'voice-settings' });

      const createSliderRow = ({ id, label, min, max, step, value }) => {
        const row = createElement('div', { className: 'voice-slider-row' });
        const labelEl = createElement('label', {
          for: id,
          className: 'voice-slider-label',
        }, label);
        const input = createElement('input', {
          type: 'range',
          id,
          name: id,
          min: String(min),
          max: String(max),
          step: String(step),
          value: String(value),
        });
        const valueEl = createElement('span', {
          className: 'voice-slider-value',
        }, String(value));
        input.addEventListener('input', () => {
          valueEl.textContent = input.value;
        });
        row.appendChild(labelEl);
        row.appendChild(input);
        row.appendChild(valueEl);
        return { row, input, valueEl };
      };

      // Скорость
      const rate = createSliderRow({
        id: 'voice-rate',
        label: 'Скорость',
        min: 0.5, max: 2.0, step: 0.1,
        value: voiceSettings.rate ?? 1,
      });
      rateInput = rate.input;
      wrap.appendChild(rate.row);

      // Тональность
      const pitch = createSliderRow({
        id: 'voice-pitch',
        label: 'Тональность',
        min: 0.5, max: 2.0, step: 0.1,
        value: voiceSettings.pitch ?? 1,
      });
      pitchInput = pitch.input;
      wrap.appendChild(pitch.row);

      // Громкость + кнопка Проверить
      const volume = createSliderRow({
        id: 'voice-volume',
        label: 'Громкость',
        min: 0, max: 1, step: 0.05,
        value: voiceSettings.volume ?? 1,
      });
      volumeInput = volume.input;
      wrap.appendChild(volume.row);

      // Кнопка Проверить — отдельной строкой
      const testRow = createElement('div', { className: 'voice-test-row' });
      const testBtn = createElement('button', {
        type: 'button',
        className: 'voice-test-btn',
        'aria-label': 'Проверить',
      });
      const testImg = createElement('img', {
        src: iconUrl('say-small'),
        alt: '',
        className: 'voice-test-btn__icon',
        draggable: 'false',
      });
      testImg.addEventListener('error', () => {
        testImg.replaceWith(document.createTextNode('🔊'));
      });
      testBtn.appendChild(testImg);
      const testLabel = createElement('span', {}, 'Проверить');
      testBtn.appendChild(testLabel);
      testBtn.addEventListener('click', () => {
        speak(
          'Раз — два. Проверка связи.',
          parseFloat(rateInput.value),
          parseFloat(pitchInput.value),
          parseFloat(volumeInput.value),
          ''
        );
        logger.debug('Test speech played');
      });
      testRow.appendChild(testBtn);
      wrap.appendChild(testRow);

      return wrap;
    },
    buttons: [
      {
        label: 'Сохранить',
        primary: true,
        action: () => {
          onSave({
            rate: parseFloat(rateInput.value),
            pitch: parseFloat(pitchInput.value),
            volume: parseFloat(volumeInput.value),
            voiceURI: '',
          });
          modal.close();
        },
      },
    ],
    onClose: () => {},
  });

  modal.open();
}