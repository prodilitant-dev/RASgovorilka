// src/modes/general/components/AboutModal.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement } from '@utils/dom';
import { getRandomMascotUrl } from '@config/mascotPool';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

export function openAboutModal() {
  const modal = new Modal({
    title: 'О приложении',
    body: () => {
      const wrap = createElement('div', { className: 'about-wrap' });

      // ===== Маскот по центру =====
      const logoRow = createElement('div', { className: 'about-logo' });
      const mascotImg = createElement('img', {
        src: getRandomMascotUrl(),
        alt: '',
        className: 'about-logo__mascot',
        draggable: 'false',
      });
      mascotImg.addEventListener('error', () => mascotImg.remove());
      logoRow.appendChild(mascotImg);
      wrap.appendChild(logoRow);

      // ===== Версия =====
      wrap.appendChild(
        createElement('div', { className: 'about-version' }, `версия ${APP_VERSION}`)
      );

      // ===== Суть =====
      wrap.appendChild(
        createElement(
          'p',
          { className: 'about-lead' },
          'РАСговорилка — бесплатный коммуникатор для детей с РАС. Помогает собирать фразы из карточек и озвучивать их. Работает офлайн, без рекламы, без сбора данных.'
        )
      );

      // ===== Свободное ПО =====
      const license = createElement('div', { className: 'about-block' });
      license.appendChild(
        createElement('div', { className: 'about-block__title' }, 'Свободное ПО')
      );
      license.appendChild(
        createElement(
          'p',
          { className: 'about-block__text' },
          'Приложение распространяется по лицензии GNU GPL v3. Исходный код открыт — можно изучать, изменять и распространять.'
        )
      );
      wrap.appendChild(license);

      // ===== Ссылки =====
      const links = createElement('div', { className: 'about-block' });
      links.appendChild(createElement('div', { className: 'about-block__title' }, 'Ссылки'));

      const linkList = createElement('div', { className: 'about-links' });
      const addLink = (href, text) => {
        linkList.appendChild(
          createElement(
            'a',
            {
              href,
              target: '_blank',
              rel: 'noopener',
              className: 'about-link',
            },
            text
          )
        );
      };

      addLink('https://github.com/prodilitant-dev/RASgovorilka', '🐙 GitHub — исходный код');
      addLink('https://t.me/RASgovorilka', '📢 Канал в Telegram');
      addLink('https://max.ru/channel_RASgovorilka', '📢 Канал в MAX');
      addLink('mailto:prodilitant@gmail.com', '📧 prodilitant@gmail.com');

      links.appendChild(linkList);
      wrap.appendChild(links);

      // ===== Автор (спойлер) =====
      const author = createElement('details', { className: 'about-details' });
      author.appendChild(
        createElement('summary', { className: 'about-details__summary' }, 'Об авторе')
      );
      const authorBody = createElement('div', { className: 'about-details__body' });
      authorBody.appendChild(
        createElement('p', {}, 'Привет! Я — Виталий, разработчик «РАСговорилки».')
      );
      authorBody.appendChild(
        createElement(
          'p',
          {},
          'Это приложение я создал с помощью ИИ и своей упёртости. Я не программист, но я знаю, что значит особенный ребёнок.'
        )
      );
      authorBody.appendChild(
        createElement(
          'p',
          {},
          '«РАСговорилка» задумана как инструмент, который помогает детям с РАС общаться, а родителям — лучше понимать своего ребёнка.'
        )
      );
      authorBody.appendChild(
        createElement('p', {}, 'Здесь нет рекламы, нет нужды в интернете — только желание помочь.')
      );
      authorBody.appendChild(
        createElement('p', { className: 'about-signature' }, 'Ваш ПроДилИтант')
      );
      author.appendChild(authorBody);
      wrap.appendChild(author);

      // ===== Особая благодарность (спойлер) =====
      const thanks = createElement('details', { className: 'about-details' });
      thanks.appendChild(
        createElement('summary', { className: 'about-details__summary' }, 'Особая благодарность')
      );
      const thanksBody = createElement('div', { className: 'about-details__body' });
      thanksBody.appendChild(
        createElement(
          'p',
          { className: 'about-placeholder' },
          'Список будет дополнен. Здесь появятся люди, которые помогли проекту — советами, тестированием, поддержкой.'
        )
      );
      thanks.appendChild(thanksBody);
      wrap.appendChild(thanks);

      return wrap;
    },
    buttons: [],
  });

  modal.open();
}
