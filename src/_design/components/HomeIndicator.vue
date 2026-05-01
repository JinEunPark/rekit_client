<script setup lang="ts">
import { REKIT } from '@/design/tokens'
</script>

<template>
  <div class="home-indicator" :style="{ background: REKIT.color.ink }" />
</template>

<style scoped>
.home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  border-radius: 3px;
  opacity: 0.9;
  pointer-events: none;
}
</style>
