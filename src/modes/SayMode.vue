<template>
  <div class="say-mode">
    <div class="tiles-grid">
      <TileCard
        v-for="card in store.currentCards"
        :key="card.id"
        :card="card"
        @select="store.addToSentence"
      />
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores/app';
import TileCard from '@/components/TileCard.vue';

const store = useAppStore();
</script>

<style scoped>
.tiles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding-bottom: 12px;
}
</style>
