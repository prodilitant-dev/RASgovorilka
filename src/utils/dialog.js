import { Modal } from '@components/common/Modal/Modal';

export function confirm(message, title = '') {
  return new Promise((resolve) => {
    const modal = new Modal({
      title,
      body: `<p>${message}</p>`,
      buttons: [
        { label: 'Отмена', action: () => { modal.close(); resolve(false); } },
        { label: 'Да', primary: true, action: () => { modal.close(); resolve(true); } }
      ]
    });
    modal.open();
  });
}

export function alert(message, title = '') {
  return new Promise((resolve) => {
    const modal = new Modal({
      title,
      body: `<p>${message}</p>`,
      buttons: [
        { label: 'OK', primary: true, action: () => { modal.close(); resolve(); } }
      ]
    });
    modal.open();
  });
}