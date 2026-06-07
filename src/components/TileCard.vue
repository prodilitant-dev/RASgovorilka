<template>
  <div class="tile" @click="$emit('select', card)">
    <div
      class="tile-bg"
      :style="card.imageBase64 ? { backgroundImage: `url(${card.imageBase64})` } : {}"
    >
      <span v-if="!card.imageBase64">{{ card.emoji || '📄' }}</span>
    </div>
    <div class="tile-label">{{ card.text }}</div>
  </div>
</template>

<script setup>
defineProps({
  card: { type: Object, required: true }
});
defineEmits(['select']);
</script>

<style scoped>
.tile {
  background: var(--bg-card, #fff);
  border: 2px solid var(--border, #d0d7de);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow, 0 2px 8px rgba(0,0,0,0.08));
  height: 160px;
  transition: transform 0.05s linear;
}
.tile:active { transform: scale(0.97); }
.tile-bg {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 0;
}
.tile-label {
  color: var(--accent, #4caf50);
  text-align: center;
  padding: 8px;
  font-size: 20px;
  font-weight: 500;
  word-break: break-word;
}
</style>
