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

export function prompt(message, defaultValue = '') {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue;
    input.className = 'modal-input'; // можно добавить стиль
    const modal = new Modal({
      title: message,
      body: input,
      buttons: [
        { label: 'Отмена', action: () => { modal.close(); resolve(null); } },
        { label: 'OK', primary: true, action: () => { modal.close(); resolve(input.value); } }
      ]
    });
    modal.open();
    setTimeout(() => input.focus(), 100);
  });
}