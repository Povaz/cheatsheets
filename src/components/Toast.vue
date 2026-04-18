<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
  duration: { type: Number, default: 1500 },
})

const visible = ref(false)
let timer = null

watch(
  () => props.message,
  (msg) => {
    if (!msg) return
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      visible.value = false
    }, props.duration)
  },
)

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-paper text-xs px-3 py-1.5 rounded-sm shadow-card z-50"
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
  transform: translate(-50%, 6px);
}
</style>
