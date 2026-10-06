// src/modes/general/components/AboutModal.js
import { Modal } from '@components/common/Modal/Modal';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const ICON_URL = `${import.meta.env.BASE_URL}icon-192.png`;

export function openAboutModal() {
  const body = `
    <div style="padding: 4px 0; line-height: 1.5;">
      <div style="text-align: center; margin-bottom: 16px;">
        <img src="${ICON_URL}" alt="РАСговорилка" style="width: 80px; height: 80px; border-radius: 18px; box-shadow: var(--shadow);">
        <h2 style="margin: 12px 0 4px; font-size: 22px;">РАСговорилка</h2>
        <div style="font-size: 13px; color: var(--text-muted);">версия ${APP_VERSION}</div>
      </div>

      <p style="margin: 0 0 12px;">Привет! Я — Виталий, разработчик «РАСговорилки».</p>

      <p style="margin: 0 0 12px;">
        Это приложение я создал с помощью ИИ и своей упёртости.
        Я не программист, но я знаю, что значит особенный ребёнок.
      </p>

      <p style="margin: 0 0 12px;">
        «РАСговорилка» задумана как инструмент, который помогает детям с РАС
        общаться, а родителям — лучше понимать своего ребёнка.
      </p>

      <p style="margin: 0 0 12px;">
        Здесь нет рекламы, нет нужды в интернете — только желание помочь.
      </p>

      <p style="margin: 0 0 12px;">
        Приложение будет всегда бесплатным и открытым.
        Оно распространяется по лицензии
        <strong>GNU GPL v3.0 или более поздней</strong> —
        исходный код можно посмотреть, изучить и изменить.
      </p>

      <p style="margin: 0 0 12px;">
        Это уже третья попытка, и я продолжаю его развивать.
        Надеюсь, он станет полезным помощником для вашей семьи.
      </p>

      <p style="margin: 0 0 12px;">
        Если приложение оказалось полезным — расскажите о нём другим.
      </p>

      <p style="margin: 0 0 12px; font-style: italic;">Ваш ПроДилИтант</p>

      <hr style="border: none; border-top: 1px solid var(--border); margin: 16px 0;">

      <div style="font-size: 14px;">
        <div style="margin-bottom: 6px;">
          <span style="opacity: 0.7;">Автор:</span> <strong>Виталий (ProdilItant)</strong>
        </div>
        <div style="margin-bottom: 6px;">
          📢 <a href="https://t.me/RASgovorilka" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none;">Канал проекта — @RASgovorilka</a>
        </div>
        <div style="margin-bottom: 6px;">
          📧 <a href="mailto:prodilitant@gmail.com" style="color: var(--primary); text-decoration: none;">prodilitant@gmail.com</a>
        </div>
        <div style="margin-bottom: 6px;">
          💬 <a href="https://t.me/akvariumist2gr" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none;">@akvariumist2gr</a>
        </div>
        <div>
          🐙 <a href="https://github.com/prodilitant-dev/RASgovorilka" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none;">github.com/prodilitant-dev/RASgovorilka</a>
        </div>
      </div>
  `;

  const modal = new Modal({
    title: 'Об авторе',
    body,
    buttons: [
      { label: 'Закрыть', primary: true, action: () => modal.close() },
    ],
  });
  modal.open();
}