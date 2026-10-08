// src/modes/say/Say.categoryCreate.js
import { Modal } from '@components/common/Modal/Modal';
import { createElement, on } from '@utils/dom';
import { toast } from '@utils/toast';
import { uid } from '@utils/id';
import { saveProfile } from '@storage/appStorage';
import { setState } from '@state/store';

/**
 * Открывает модалку создания новой категории.
 * @param {Object} profile - текущий профиль
 * @param {Function} onCreated - (newCategoryId) => void, вызывается после создания
 */
export function openCategoryCreateModal(profile, onCreated) {
  let nameInput = null;
  let wordTypeSelect = null;

  const wordTypeOptions = [
    { value: 'noun', label: 'Существительное' },
    { value: 'verb', label: 'Глагол' },
    { value: 'adjective', label: 'Прилагательное' },
    { value: 'pronoun', label: 'Местоимение' },
    { value: 'preposition', label: 'Предлог' },
    { value: 'other', label: 'Другое' },
  ];

  const modal = new Modal({
    title: 'Новая категория',
    body: () => {
      const wrap = createElement('div', { className: 've-fields' });

      // --- Название ---
      const nameRow = createElement('div', { className: 've-field' });
      const nameLabel = createElement('label', { className: 've-field-label' }, 'Название');
      nameInput = createElement('input', {
        type: 'text',
        placeholder: 'Например: Одежда',
        autofocus: true,
      });
      nameRow.appendChild(nameLabel);
      nameRow.appendChild(nameInput);
      wrap.appendChild(nameRow);

      // --- Тип слова ---
      const typeRow = createElement('div', { className: 've-field' });
      const typeLabel = createElement('label', { className: 've-field-label' }, 'Тип слова');
      wordTypeSelect = createElement('select', {});
      wordTypeOptions.forEach(({ value, label }) => {
        const option = createElement('option', { value }, label);
        wordTypeSelect.appendChild(option);
      });
      typeRow.appendChild(typeLabel);
      typeRow.appendChild(wordTypeSelect);
      wrap.appendChild(typeRow);

      // Фокус на поле через тик (после появления модалки в DOM)
      setTimeout(() => nameInput && nameInput.focus(), 100);

      // Enter в поле названия = создать
      on(nameInput, 'keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCreate();
        }
      });

      return wrap;
    },
    buttons: [
      {
        label: 'Отмена',
        action: () => modal.close(),
      },
      {
        label: 'Создать',
        primary: true,
        action: () => handleCreate(),
      },
    ],
    onClose: () => {},
  });

  function handleCreate() {
    if (!nameInput || !wordTypeSelect) return;

    const name = nameInput.value.trim();
    if (!name) {
      toast('Введите название категории', 'error');
      nameInput.focus();
      return;
    }

    // Проверка на дубликат
    const exists = profile.categories.some(
      (c) => c.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      toast('Категория с таким названием уже есть', 'error');
      nameInput.focus();
      nameInput.select();
      return;
    }

    const newCategory = {
      id: uid(),
      name,
      wordType: wordTypeSelect.value,
      hidden: false,
    };

    profile.categories.push(newCategory);
    profile.cards[newCategory.id] = [];
    saveProfile(profile);
    setState({ currentCategoryId: newCategory.id });

    toast('Категория создана');
    modal.close();
    if (onCreated) onCreated(newCategory.id);
  }

  modal.open();
  return modal;
}