<script setup lang="ts">
import IconBase from './IconBase.vue'

const props = defineProps<{ open: boolean; title: string; preventOverlayClose?: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="modal" @click="!props.preventOverlayClose && emit('close')">
      <div class="modal__box" @click.stop>
        <header class="modal__head">
          <h2>{{ title }}</h2>
          <button type="button" aria-label="닫기" @click="emit('close')">
            <IconBase name="close" :size="22" />
          </button>
        </header>
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(20, 20, 15, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.modal__box {
  width: 100%;
  max-width: 480px;
  background: var(--rekit-surface);
  border-radius: 20px 20px 0 0;
  padding: 20px 20px max(20px, env(safe-area-inset-bottom));
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal__head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.025em;
}
.modal__head button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
@media (min-width: 768px) {
  .modal {
    align-items: center;
  }
  .modal__box {
    border-radius: 20px;
  }
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}
.modal-enter-active .modal__box,
.modal-leave-active .modal__box {
  transition: transform 0.22s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal__box,
.modal-leave-to .modal__box {
  transform: translateY(20px);
}
</style>
