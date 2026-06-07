<template>
  <div class="modal" :class="{ visible: store.isSettingsOpen }" @click.self="close">
    <div class="modal-content">
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">{{ tab.label }}</button>
      </div>

      <div class="tab-content">
        <!-- Категории -->
        <div v-if="activeTab === 'categories'">
          <h3>Категории</h3>
          <div
            v-for="(cat, index) in store.data.categories"
            :key="cat.id"
            class="list-item"
            :class="{ 'drag-over': dragOverIndex === index && dragArray === 'categories' }"
            draggable="true"
            @dragstart="onDragStart(cat, index, 'categories', $event)"
            @dragover.prevent="onDragOver(index, 'categories', $event)"
            @drop.prevent="onDrop(index, 'categories', $event)"
            @dragend="onDragEnd"
            @dragenter.prevent
          >
            <span>{{ cat.name }}</span>
            <div>
              <button @click="renameCategory(cat)">✏️</button>
              <button @click="deleteCategory(cat.id)">🗑️</button>
            </div>
          </div>
          <button class="btn" @click="addCategory">+ Добавить категорию</button>
        </div>

        <!-- Карточки -->
        <div v-if="activeTab === 'cards'">
          <h3>Карточки</h3>
          <div class="form-group">
            <label>Категория</label>
            <select v-model="selectedCatId">
              <option v-for="cat in store.data.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div
            v-for="(card, index) in currentCards"
            :key="card.id"
            class="list-item"
            :class="{ 'drag-over': dragOverIndex === index && dragArray === 'cards' }"
            draggable="true"
            @dragstart="onDragStart(card, index, 'cards', $event)"
            @dragover.prevent="onDragOver(index, 'cards', $event)"
            @drop.prevent="onDrop(index, 'cards', $event)"
            @dragend="onDragEnd"
            @dragenter.prevent
          >
            <div class="item-info">
              <img v-if="card.imageBase64" :src="card.imageBase64" class="item-preview" />
              <span>{{ card.emoji }} {{ card.text }}</span>
            </div>
            <div>
              <button @click="editCard(card)">✏️</button>
              <button @click="uploadImage(card)">🖼</button>
              <button v-if="card.imageBase64" @click="removeImage(card)">❌</button>
              <button @click="deleteCard(card.id)">🗑️</button>
            </div>
          </div>
          <button class="btn" @click="addCard">+ Добавить карточку</button>
        </div>

        <!-- Быстрые кнопки -->
        <div v-if="activeTab === 'quick'">
          <h3>Быстрые кнопки</h3>
          <div
            v-for="(btn, index) in store.data.quickButtons"
            :key="btn.id"
            class="list-item"
            :class="{ 'drag-over': dragOverIndex === index && dragArray === 'quick' }"
            draggable="true"
            @dragstart="onDragStart(btn, index, 'quick', $event)"
            @dragover.prevent="onDragOver(index, 'quick', $event)"
            @drop.prevent="onDrop(index, 'quick', $event)"
            @dragend="onDragEnd"
            @dragenter.prevent
          >
            <div class="item-info">
              <img v-if="btn.imageBase64" :src="btn.imageBase64" class="item-preview" />
              <span>{{ btn.emoji }} {{ btn.text }}</span>
            </div>
            <div>
              <button @click="editQuick(btn)">✏️</button>
              <button @click="uploadImage(btn)">🖼</button>
              <button v-if="btn.imageBase64" @click="removeImage(btn)">❌</button>
              <button @click="deleteQuick(btn.id)">🗑️</button>
            </div>
          </div>
          <button class="btn" @click="addQuick">+ Добавить</button>
        </div>

        <!-- Да/Нет -->
        <div v-if="activeTab === 'yesno'">
          <h3>Быстрые ответы</h3>
          <div
            v-for="(ans, index) in store.data.yesnoAnswers"
            :key="ans.id"
            class="list-item"
            :class="{ 'drag-over': dragOverIndex === index && dragArray === 'yesno' }"
            draggable="true"
            @dragstart="onDragStart(ans, index, 'yesno', $event)"
            @dragover.prevent="onDragOver(index, 'yesno', $event)"
            @drop.prevent="onDrop(index, 'yesno', $event)"
            @dragend="onDragEnd"
            @dragenter.prevent
          >
            <div class="item-info">
              <img v-if="ans.imageBase64" :src="ans.imageBase64" class="item-preview" />
              <span>{{ ans.emoji }} {{ ans.text }}</span>
            </div>
            <div>
              <button @click="editYesno(ans)">✏️</button>
              <button @click="uploadImage(ans)">🖼</button>
              <button v-if="ans.imageBase64" @click="removeImage(ans)">❌</button>
              <button @click="deleteYesno(ans.id)">🗑️</button>
            </div>
          </div>
          <button class="btn" @click="addYesno">+ Добавить</button>
        </div>

        <!-- Настройки -->
        <div v-if="activeTab === 'settings'">
          <h3>Настройки</h3>
          <div class="toggle-row">
            <span>Высокий контраст</span>
            <label class="switch">
              <input type="checkbox" v-model="store.data.highContrast" @change="saveStore" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="form-group">
            <label>Макс. слов</label>
            <input type="number" v-model.number="store.data.maxSentenceLength" @change="saveStore" />
          </div>
          <div class="form-group">
            <label>Приветствие</label>
            <input v-model="store.data.greetingText" @change="saveStore" />
            <div class="toggle-row">
              <span>Произносить при старте</span>
              <label class="switch">
                <input type="checkbox" v-model="store.data.greetingEnabled" @change="saveStore" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Таймер (мин)</label>
            <input type="number" v-model.number="store.data.timerMinutes" @change="saveStore" min="1" />
          </div>
          <div class="form-group">
            <label>Фраза таймера</label>
            <input v-model="store.data.timerPhrase" @change="saveStore" />
          </div>
          <div class="form-group">
            <strong>Режимы</strong>
            <div v-for="(label, mode) in modeLabels" :key="mode" class="toggle-row">
              <span>{{ label }}</span>
              <label class="switch">
                <input type="checkbox" :checked="store.data.visibleModes[mode]" @change="toggleMode(mode, $event)" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="form-group" v-if="store.data.visibleModes.whatisthis">
            <strong>Категории для викторины</strong>
            <p v-if="store.data.categories.length === 0">Нет категорий</p>
            <div v-for="cat in store.data.categories" :key="cat.id" class="toggle-row">
              <span>{{ cat.name }}</span>
              <label class="switch">
                <input type="checkbox"
                  :checked="whatIsThisCategoryChecked(cat.id)"
                  @change="toggleWhatIsThisCategory(cat.id, $event)" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="form-group" v-if="store.data.visibleModes.math">
            <strong>Математика</strong>
            <div class="toggle-row">
              <span>Максимальное число</span>
              <input type="number" v-model.number="store.data.math.maxNumber" @change="saveStore" min="1" max="100" style="width:80px;" />
            </div>
            <div class="toggle-row">
              <span>Сложение</span>
              <label class="switch">
                <input type="checkbox" :checked="opChecked('+')" @change="toggleOp('+', $event)" />
                <span class="slider"></span>
              </label>
            </div>
            <div class="toggle-row">
              <span>Вычитание</span>
              <label class="switch">
                <input type="checkbox" :checked="opChecked('-')" @change="toggleOp('-', $event)" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <div class="toggle-row">
              <span>Полноэкранный режим</span>
              <label class="switch">
                <input type="checkbox" v-model="store.data.fullscreenEnabled" @change="saveStore" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <button class="btn-outline" @click="exportData">📤 Экспорт</button>
            <button class="btn-outline" @click="importData">📥 Импорт</button>
          </div>
        </div>
      </div>
      <div class="modal-buttons">
        <button class="btn" @click="close">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '@/stores/app';
import { useStorage } from '@/composables/useStorage';
import { useData } from '@/composables/useData';
import { uid } from '@/utils/helpers';
import { invoke } from '@tauri-apps/api/core';

const store = useAppStore();
const { save } = useStorage();
const { getDefaultData } = useData();

const activeTab = ref('categories');
const selectedCatId = ref(store.data.categories[0]?.id || null);
const currentCards = computed(() => store.data.cards[selectedCatId.value] || []);

// Drag state
const draggedItem = ref(null);
const draggedFromIndex = ref(-1);
const dragArray = ref('');
const dragOverIndex = ref(-1);

const tabs = [
  { id: 'categories', label: '📁 Категории' },
  { id: 'cards', label: '🃏 Карточки' },
  { id: 'quick', label: '⚡ Быстрые' },
  { id: 'yesno', label: '🔘 Да/Нет' },
  { id: 'settings', label: '⚙️ Настройки' },
];

const modeLabels = {
  say: '🗣 Сказать',
  yesno: '🙂 Быстрые',
  text: '📝 Текст',
  timer: '⏱ Таймер',
  whatisthis: '❓ Что это',
  math: '🔢 Математика',
};

function close() { store.isSettingsOpen = false; activeTab.value = 'categories'; }
function saveStore() { save(store.data); }

function toggleMode(mode, event) {
  store.data.visibleModes[mode] = event.target.checked;
  saveStore();
}

// Викторина
function whatIsThisCategoryChecked(catId) {
  const ids = store.data.whatIsThisCategoryIds;
  if (!ids || ids.length === 0) return true;
  return ids.includes(catId);
}
function toggleWhatIsThisCategory(catId, event) {
  const checked = event.target.checked;
  let ids = store.data.whatIsThisCategoryIds;
  if (!ids || ids.length === 0) {
    ids = store.data.categories.map(c => c.id);
  }
  if (checked) {
    if (!ids.includes(catId)) ids.push(catId);
  } else {
    ids = ids.filter(id => id !== catId);
  }
  store.data.whatIsThisCategoryIds = ids;
  saveStore();
}

// Математика
function opChecked(op) { return store.data.math.operations.includes(op); }
function toggleOp(op, event) {
  const checked = event.target.checked;
  if (checked) {
    if (!store.data.math.operations.includes(op)) store.data.math.operations.push(op);
  } else {
    store.data.math.operations = store.data.math.operations.filter(o => o !== op);
  }
  saveStore();
}

// Загрузка изображения
function uploadImage(item) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      item.imageBase64 = ev.target.result;
      saveStore();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function removeImage(item) {
  item.imageBase64 = null;
  saveStore();
}

// Drag & Drop
function getArray(name) {
  if (name === 'categories') return store.data.categories;
  if (name === 'cards') return currentCards.value;
  if (name === 'quick') return store.data.quickButtons;
  if (name === 'yesno') return store.data.yesnoAnswers;
  return null;
}

function onDragStart(item, index, arrayName, event) {
  draggedItem.value = item;
  draggedFromIndex.value = index;
  dragArray.value = arrayName;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', '');
}

function onDragOver(index, arrayName, event) {
  dragOverIndex.value = index;
  if (dragArray.value === arrayName) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function onDrop(targetIndex, arrayName, event) {
  if (!draggedItem.value || dragArray.value !== arrayName) return;
  const array = getArray(arrayName);
  if (!array) return;
  const fromIndex = draggedFromIndex.value;
  if (fromIndex === targetIndex) return;

  const moved = array.splice(fromIndex, 1)[0];
  array.splice(targetIndex, 0, moved);
  saveStore();
  // Сброс
  draggedItem.value = null;
  draggedFromIndex.value = -1;
  dragArray.value = '';
  dragOverIndex.value = -1;
}

function onDragEnd() {
  draggedItem.value = null;
  draggedFromIndex.value = -1;
  dragArray.value = '';
  dragOverIndex.value = -1;
}

// Категории
function addCategory() {
  const name = prompt('Название категории:');
  if (name) {
    const id = uid();
    store.data.categories.push({ id, name });
    store.data.cards[id] = [];
    saveStore();
  }
}
function renameCategory(cat) {
  const newName = prompt('Новое название:', cat.name);
  if (newName) { cat.name = newName; saveStore(); }
}
function deleteCategory(id) {
  if (store.data.categories.length <= 1) return alert('Нельзя удалить последнюю категорию');
  if (confirm('Удалить категорию и все карточки?')) {
    store.data.categories = store.data.categories.filter(c => c.id !== id);
    delete store.data.cards[id];
    if (store.currentCategoryId === id) store.currentCategoryId = store.data.categories[0]?.id;
    if (selectedCatId.value === id) selectedCatId.value = store.data.categories[0]?.id;
    saveStore();
  }
}

// Карточки
function editCard(card) {
  const newText = prompt('Текст карточки:', card.text);
  if (newText) {
    card.text = newText;
    card.emoji = prompt('Эмодзи (можно пусто):', card.emoji || '') || null;
    saveStore();
  }
}
function deleteCard(cardId) {
  if (confirm('Удалить карточку?')) {
    store.data.cards[selectedCatId.value] = store.data.cards[selectedCatId.value].filter(c => c.id !== cardId);
    saveStore();
  }
}
function addCard() {
  const text = prompt('Текст карточки:');
  if (text) {
    const emoji = prompt('Эмодзи (можно пусто):') || null;
    store.data.cards[selectedCatId.value].push({
      id: uid(), text, emoji, imageBase64: null, audioBase64: null
    });
    saveStore();
  }
}

// Быстрые кнопки
function editQuick(btn) {
  const text = prompt('Текст:', btn.text);
  if (text) {
    btn.text = text;
    btn.emoji = prompt('Эмодзи:', btn.emoji || '') || null;
    saveStore();
  }
}
function deleteQuick(id) {
  if (confirm('Удалить кнопку?')) {
    store.data.quickButtons = store.data.quickButtons.filter(b => b.id !== id);
    saveStore();
  }
}
function addQuick() {
  const text = prompt('Текст:');
  if (text) {
    const emoji = prompt('Эмодзи:') || null;
    store.data.quickButtons.push({
      id: uid(), text, emoji, imageBase64: null, audioBase64: null
    });
    saveStore();
  }
}

// Да/Нет
function editYesno(ans) {
  const text = prompt('Текст:', ans.text);
  if (text) {
    ans.text = text;
    ans.emoji = prompt('Эмодзи:', ans.emoji || '') || null;
    saveStore();
  }
}
function deleteYesno(id) {
  if (confirm('Удалить?')) {
    store.data.yesnoAnswers = store.data.yesnoAnswers.filter(a => a.id !== id);
    saveStore();
  }
}
function addYesno() {
  const text = prompt('Текст:');
  if (text) {
    const emoji = prompt('Эмодзи:') || null;
    store.data.yesnoAnswers.push({
      id: uid(), text, emoji, imageBase64: null, audioBase64: null
    });
    saveStore();
  }
}

// Экспорт/импорт
async function exportData() {
  if ('__TAURI__' in window) {
    try {
      const path = await invoke('export_data', { data: JSON.stringify(store.data, null, 2) });
      window.__showToast?.('Файл сохранён: ' + path);
    } catch (e) {
      window.__showToast?.('Ошибка экспорта: ' + e);
    }
  } else {
    const blob = new Blob([JSON.stringify(store.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rasgovorilka_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (confirm('Заменить текущие данные импортированными?')) {
          store.data = imported;
          if (!store.data.visibleModes) store.data.visibleModes = { say: true, yesno: true, text: true, timer: true, whatisthis: false, math: false };
          if (!store.data.whatIsThisCategoryIds) store.data.whatIsThisCategoryIds = [];
          if (!store.data.math) store.data.math = { maxNumber: 10, operations: ['+', '-'] };
          saveStore();
          store.currentCategoryId = store.data.categories[0]?.id || null;
          window.__showToast?.('Данные импортированы');
        }
      } catch { alert('Неверный файл'); }
    };
    reader.readAsText(file);
  };
  input.click();
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s;
}
.modal.visible { visibility: visible; opacity: 1; }
.modal-content {
  background: var(--bg-card, #fff);
  width: 95%;
  max-width: 550px;
  max-height: 85%;
  border-radius: 10px;
  padding: 20px;
  overflow-y: auto;
  color: var(--text-main);
  border: 1px solid var(--border);
}
.tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.tab-btn {
  background: var(--tab-bg, #e9ecef);
  border: 1px solid var(--border);
  border-radius: 10px; padding: 6px 12px; cursor: pointer; font-size: 14px;
  color: var(--text-main, #1a1a1a);
}
.tab-btn.active { background: var(--accent); color: #000; }
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--border);
  color: var(--text-main, #1a1a1a);
}
.list-item.drag-over {
  background: var(--accent);
  opacity: 0.7;
}
.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.item-preview {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}
.list-item button { margin-left: 4px; background: var(--tab-bg); border: 1px solid var(--border); border-radius: 5px; padding: 4px 8px; cursor: pointer; color: var(--text-main, #1a1a1a); font-size: 14px; }
.form-group { margin: 12px 0; }
.form-group label { display: block; margin-bottom: 4px; }
.form-group input, .form-group select { width: 100%; padding: 8px; border-radius: 5px; border: 1px solid var(--border); background: var(--bg-card, #fff); color: var(--text-main, #1a1a1a); }
.toggle-row { display: flex; justify-content: space-between; align-items: center; margin: 8px 0; }
.switch { position: relative; display: inline-block; width: 48px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; border-radius: 24px; transition: 0.3s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: 0.3s; }
input:checked + .slider { background-color: var(--accent); }
input:checked + .slider:before { transform: translateX(24px); }
.btn { border: none; padding: 8px 18px; border-radius: 40px; font-weight: bold; cursor: pointer; background: var(--accent); color: #000; }
.btn-outline { background: transparent; border: 1px solid var(--accent); color: var(--accent); padding: 8px 18px; border-radius: 40px; font-weight: bold; cursor: pointer; margin-right: 8px; }
.modal-buttons { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>
