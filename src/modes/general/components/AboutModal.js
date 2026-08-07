import { Modal } from '@components/common/Modal/Modal';

export function openAboutModal() {
  const modal = new Modal({
    title: 'Об авторе',
    body: `
      <div style="padding: 10px 0;">
        <p><strong>РАСговорилка</strong></p>
        <p>Версия: 1.0.0</p>
        <p>Приложение разработано для помощи в коммуникации при РАС.</p>
        <p>Автор: [Имя автора]</p>
        <p>Контакты: [email]</p>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 16px;">Текст об авторе будет добавлен позже.</p>
      </div>
    `,
    buttons: [
      { label: 'Закрыть', primary: true, action: () => modal.close() }
    ]
  });
  modal.open();
}