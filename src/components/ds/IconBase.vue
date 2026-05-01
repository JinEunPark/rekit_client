<script setup lang="ts">
import { computed } from 'vue'
import { ICON_PATHS, type IconName } from '@/design/icons'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number
    stroke?: number
  }>(),
  { size: 20, stroke: 1.6 },
)

const path = computed(() => ICON_PATHS[props.name] ?? '')
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="flex-shrink: 0; display: inline-block; vertical-align: middle"
    v-html="path"
  />
</template>
