<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { formatInline } from '../lib/format.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  row: { type: Object, default: null },
  columns: { type: Array, default: () => [] },
})

const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Escape' && props.open) {
    e.stopPropagation()
    emit('close')
  }
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-overlay flex items-center justify-center px-4 py-8"
        @click.self="$emit('close')"
      >
        <div
          class="bg-surface border border-hairline rounded-sm shadow-card max-w-xl w-full max-h-[80vh] flex flex-col"
        >
          <header
            class="flex items-center justify-between px-4 py-2 border-b border-hairline flex-shrink-0"
          >
            <h3 class="label-soft">{{ title }}</h3>
            <button
              type="button"
              class="tool-btn"
              aria-label="close"
              @click="$emit('close')"
            >×</button>
          </header>
          <div class="p-4 space-y-3 text-sm overflow-y-auto">
            <div v-for="col in columns" :key="col" class="grid gap-1">
              <span class="label-soft">{{ col }}</span>
              <div class="leading-relaxed" v-html="formatInline(row?.[col])" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 120ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
