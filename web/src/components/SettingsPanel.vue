<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { settings, resetSettings } from '../store.js'

const open = ref(false)
const root = ref(null)

const BODY_MIN = 10
const BODY_MAX = 16
const WIDTH_MIN = 1000
const WIDTH_MAX = 2000
const WIDTH_STEP = 50
const COL_OPTIONS = [null, 1, 2, 3, 4, 5, 6]

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function bumpBody(delta) {
  const next = Math.min(BODY_MAX, Math.max(BODY_MIN, settings.bodySize + delta))
  settings.bodySize = next
}

function bumpWidth(delta) {
  const next = Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, settings.maxWidth + delta))
  settings.maxWidth = next
}

function setCols(value) {
  settings.cols = value
}

function colLabel(value) {
  return value == null ? 'auto' : String(value)
}

function isActiveCol(value) {
  return settings.cols === value
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
  <div ref="root" class="fixed bottom-12 right-4 z-50">
    <div
      v-if="open"
      class="mb-2 w-72 bg-white border border-hairline rounded-sm shadow-card overflow-hidden"
    >
      <header class="px-3 py-1 border-b border-hairline">
        <h2 class="section-label">settings</h2>
      </header>

      <div class="px-3 py-2 space-y-3">
        <div>
          <div class="section-label mb-1">body text</div>
          <div class="flex items-center gap-2">
            <button type="button" class="tool-btn" @click="bumpBody(-1)">−</button>
            <span class="tabular-nums text-xs flex-1 text-center">{{ settings.bodySize }}px</span>
            <button type="button" class="tool-btn" @click="bumpBody(1)">+</button>
          </div>
        </div>

        <div>
          <div class="section-label mb-1">columns</div>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="opt in COL_OPTIONS"
              :key="opt == null ? 'auto' : opt"
              type="button"
              class="pill cursor-pointer transition-colors"
              :class="isActiveCol(opt) ? 'bg-ink text-paper border-ink' : 'hover:border-ink/40'"
              @click="setCols(opt)"
            >{{ colLabel(opt) }}</button>
          </div>
        </div>

        <div>
          <div class="section-label mb-1">max-width</div>
          <div class="flex items-center gap-2">
            <button type="button" class="tool-btn" @click="bumpWidth(-WIDTH_STEP)">−</button>
            <span class="tabular-nums text-xs flex-1 text-center">{{ settings.maxWidth }}px</span>
            <button type="button" class="tool-btn" @click="bumpWidth(WIDTH_STEP)">+</button>
          </div>
        </div>
      </div>

      <footer class="px-3 py-1 border-t border-hairline flex justify-end">
        <button
          type="button"
          class="text-2xs text-muted hover:text-accent uppercase tracking-label"
          @click="resetSettings"
        >reset</button>
      </footer>
    </div>

    <button
      type="button"
      class="px-2 py-1 bg-white border border-hairline rounded-sm shadow-card section-label hover:text-accent"
      :aria-expanded="open"
      @click="toggle"
    >settings</button>
  </div>
</template>
