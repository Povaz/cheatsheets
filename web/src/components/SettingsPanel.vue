<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  settings,
  setSheetMaxWidth,
  SHEET_DEFAULT_MAX_WIDTH,
} from '../store.js'

const open = ref(false)
const root = ref(null)

const WIDTH_MIN = 1000
const WIDTH_MAX = 2000
const WIDTH_STEP = 50

const isDirty = computed(() => settings.maxWidth !== SHEET_DEFAULT_MAX_WIDTH)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function bumpWidth(delta) {
  const next = Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, settings.maxWidth + delta))
  setSheetMaxWidth(next)
}

function resetWidth() {
  setSheetMaxWidth(SHEET_DEFAULT_MAX_WIDTH)
}

function onDocMousedown(e) {
  if (!open.value) return
  if (root.value && !root.value.contains(e.target)) close()
}

function onKey(e) {
  if (e.key === 'Escape' && open.value) {
    close()
    e.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocMousedown)
  document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocMousedown)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="tool-btn"
      title="page settings"
      aria-label="page settings"
      :aria-expanded="open"
      @click="toggle"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full mt-2 w-48 bg-paper-warm border border-hairline rounded-sm shadow-card overflow-hidden z-50"
    >
      <div class="px-3 py-2 flex items-center gap-2">
        <span class="label-soft flex-1">max-width</span>
        <button type="button" class="tool-btn" @click="bumpWidth(-WIDTH_STEP)">−</button>
        <span class="tabular-nums text-xs w-12 text-center">{{ settings.maxWidth }}px</span>
        <button type="button" class="tool-btn" @click="bumpWidth(WIDTH_STEP)">+</button>
        <button
          type="button"
          class="text-2xs text-muted hover:text-accent leading-none transition-colors"
          :class="{ 'opacity-0 pointer-events-none': !isDirty }"
          @click="resetWidth"
          title="reset to default max-width"
          aria-label="reset max-width"
        >↺</button>
      </div>
    </div>
  </div>
</template>
