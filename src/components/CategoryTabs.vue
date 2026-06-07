<template>
  <div class="categories" v-if="visible">
    <div
      v-for="cat in store.activeCategories"
      :key="cat.id"
      class="category"
      :class="{ active: cat.id === store.currentCategoryId }"
      @click="store.setCategory(cat.id)"
    >
      {{ cat.name }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';

const store = useAppStore();
const visible = computed(() => store.currentMode === 'say');
</script>

<style scoped>
.categories {
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  overflow-x: auto;
}
.category {
  background: var(--tab-bg, #e9ecef);
  padding: 8px 20px;
  border-radius: 10px;
  white-space: nowrap;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-main, #1a1a1a);
}
.category.active {
  background: var(--accent, #4caf50);
  color: #000;
}
</style>
