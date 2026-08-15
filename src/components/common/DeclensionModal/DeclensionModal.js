// src/components/common/DeclensionModal/DeclensionModal.js
import { Modal } from '../Modal/Modal';
import { createElement, on } from '@utils/dom';
import { toast } from '@utils/toast';
import { getNounGender, autoDetectCard } from '@utils/inflect';

export function openDeclensionModal(card, onSave) {
  const isNoun = card.wordType === 'noun' || card.wordType === 'pronoun';
  const isAdjective = card.wordType === 'adjective';

  if (!isNoun && !isAdjective) {
    toast('Эта часть речи не требует падежей', 'info');
    return;
  }

  const currentForms = card.forms ? JSON.parse(JSON.stringify(card.forms)) : null;

  let bodyHtml = '';
  if (isNoun) {
    const defaultForms = currentForms || { nominative: '', genitive: '', dative: '', accusative: '', instrumental: '', prepositional: '' };
    bodyHtml = `
      <div style="padding: 8px 0; width: 100%;">
        <p style="font-size:14px; color:var(--text-secondary);">Редактируйте падежные формы для слова «${card.text}».</p>
        <div class="form-row"><label>Именительный</label><input type="text" id="declNominative" value="${defaultForms.nominative || ''}" placeholder="кто? что?"></div>
        <div class="form-row"><label>Родительный</label><input type="text" id="declGenitive" value="${defaultForms.genitive || ''}" placeholder="кого? чего?"></div>
        <div class="form-row"><label>Дательный</label><input type="text" id="declDative" value="${defaultForms.dative || ''}" placeholder="кому? чему?"></div>
        <div class="form-row"><label>Винительный</label><input type="text" id="declAccusative" value="${defaultForms.accusative || ''}" placeholder="кого? что?"></div>
        <div class="form-row"><label>Творительный</label><input type="text" id="declInstrumental" value="${defaultForms.instrumental || ''}" placeholder="кем? чем?"></div>
        <div class="form-row"><label>Предложный</label><input type="text" id="declPrepositional" value="${defaultForms.prepositional || ''}" placeholder="о ком? о чём?"></div>
      </div>
    `;
  } else if (isAdjective) {
    const defaultForms = currentForms || {
      masculine: { nominative: '', genitive: '', dative: '', accusative: '', instrumental: '', prepositional: '' },
      feminine:  { nominative: '', genitive: '', dative: '', accusative: '', instrumental: '', prepositional: '' },
      neuter:    { nominative: '', genitive: '', dative: '', accusative: '', instrumental: '', prepositional: '' }
    };
    bodyHtml = `
      <div style="padding: 8px 0; width: 100%;">
        <p style="font-size:14px; color:var(--text-secondary);">Редактируйте формы прилагательного «${card.text}» для каждого рода.</p>
        <h5 style="margin: 8px 0 4px;">Мужской род</h5>
        ${generateAdjectiveFields('masculine', defaultForms.masculine)}
        <h5 style="margin: 8px 0 4px;">Женский род</h5>
        ${generateAdjectiveFields('feminine', defaultForms.feminine)}
        <h5 style="margin: 8px 0 4px;">Средний род</h5>
        ${generateAdjectiveFields('neuter', defaultForms.neuter)}
      </div>
    `;
  }

  const modal = new Modal({
    title: 'Падежные формы',
    body: bodyHtml,
    buttons: [
      {
        label: 'Отмена',
        action: () => modal.close(),
      },
      {
        label: 'Сбросить к автоматическим',
        primary: false,
        action: () => {
          const backup = { ...card };
          card.forms = null;
          card.formsEdited = false;
          autoDetectCard(card);
          modal.close();
          openDeclensionModal(card, onSave);
        },
      },
      {
        label: 'Сохранить',
        primary: true,
        action: () => {
          const newForms = {};
          if (isNoun) {
            newForms.nominative = document.getElementById('declNominative')?.value.trim() || '';
            newForms.genitive = document.getElementById('declGenitive')?.value.trim() || '';
            newForms.dative = document.getElementById('declDative')?.value.trim() || '';
            newForms.accusative = document.getElementById('declAccusative')?.value.trim() || '';
            newForms.instrumental = document.getElementById('declInstrumental')?.value.trim() || '';
            newForms.prepositional = document.getElementById('declPrepositional')?.value.trim() || '';
          } else if (isAdjective) {
            ['masculine', 'feminine', 'neuter'].forEach(gender => {
              newForms[gender] = {
                nominative: document.getElementById(`declAdj_${gender}_nominative`)?.value.trim() || '',
                genitive: document.getElementById(`declAdj_${gender}_genitive`)?.value.trim() || '',
                dative: document.getElementById(`declAdj_${gender}_dative`)?.value.trim() || '',
                accusative: document.getElementById(`declAdj_${gender}_accusative`)?.value.trim() || '',
                instrumental: document.getElementById(`declAdj_${gender}_instrumental`)?.value.trim() || '',
                prepositional: document.getElementById(`declAdj_${gender}_prepositional`)?.value.trim() || '',
              };
            });
          }
          card.forms = newForms;
          card.formsEdited = true;
          modal.close();
          if (onSave) onSave(card);
        },
      },
    ],
  });

  modal.open();
}

function generateAdjectiveFields(gender, forms) {
  const caseLabels = {
    nominative: 'Именительный',
    genitive: 'Родительный',
    dative: 'Дательный',
    accusative: 'Винительный',
    instrumental: 'Творительный',
    prepositional: 'Предложный'
  };
  let html = '';
  for (const caseKey in caseLabels) {
    html += `
      <div class="form-row">
        <label>${caseLabels[caseKey]}</label>
        <input type="text" id="declAdj_${gender}_${caseKey}" value="${forms[caseKey] || ''}" placeholder="форма">
      </div>
    `;
  }
  return html;
}