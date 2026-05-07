<script setup>
defineProps({
  message: { type: String, default: '' },
  visible: { type: Boolean, default: false },
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        class="fixed top-14 left-1/2 -translate-x-1/2 bg-ink text-paper text-xs px-3 py-1.5 rounded-sm shadow-card z-50"
      >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}
</style>
