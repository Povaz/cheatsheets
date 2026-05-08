<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  settings,
  effectiveChapterSetting,
  setChapterOverride,
  resetChapter,
} from '../store.js'

const props = defineProps({
  chapterId: { type: String, required: true },
})

const open = ref(false)
const root = ref(null)

const BODY_MIN = 5
const BODY_MAX = 16
const CARD_TITLE_MIN = 5
const CARD_TITLE_MAX = 20
const CHAPTER_TITLE_MIN = 8
const CHAPTER_TITLE_MAX = 30
const COL_OPTIONS = [1, 2, 3, 4, 5, 6]

const overrides = computed(() => settings.chapters[props.chapterId] || {})

function isOverridden(key) {
  return overrides.value[key] !== undefined
}

function effective(key) {
  return effectiveChapterSetting(props.chapterId, key)
}

function toggle(e) {
  e.stopPropagation()
  open.value = !open.value
}

function close() {
  open.value = false
}

function bump(key, delta, min, max) {
  const next = Math.min(max, Math.max(min, effective(key) + delta))
  setChapterOverride(props.chapterId, key, next)
}

function setValue(key, value) {
  setChapterOverride(props.chapterId, key, value)
}

function reset() {
  resetChapter(props.chapterId)
}

const colsDisabled = computed(() => effective('type') === 'vertical')

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
  <div ref="root" class="chapter-settings">
    <button
      type="button"
      class="chapter-settings-trigger"
      title="chapter settings"
      aria-label="chapter settings"
      :aria-expanded="open"
      @click="toggle"
    >
      <svg
        viewBox="0 0 24 24"
        width="11"
        height="11"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
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
      class="chapter-settings-popover bg-paper-warm border border-hairline"
      @click.stop
      @mousedown.stop
    >
      <header class="px-3 py-1 border-b border-hairline">
        <h2 class="label-soft">chapter</h2>
      </header>

      <div class="px-3 py-2 space-y-3">
        <div>
          <div class="label-soft mb-1 flex items-center gap-1">
            <span>body text</span>
            <span v-if="isOverridden('bodySize')" class="chapter-settings-dot" title="overridden" />
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="tool-btn" @click="bump('bodySize', -1, BODY_MIN, BODY_MAX)">−</button>
            <span class="tabular-nums text-xs flex-1 text-center">{{ effective('bodySize') }}px</span>
            <button type="button" class="tool-btn" @click="bump('bodySize', 1, BODY_MIN, BODY_MAX)">+</button>
          </div>
        </div>

        <div>
          <div class="label-soft mb-1 flex items-center gap-1">
            <span>card titles</span>
            <span v-if="isOverridden('cardTitleSize')" class="chapter-settings-dot" title="overridden" />
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="tool-btn" @click="bump('cardTitleSize', -1, CARD_TITLE_MIN, CARD_TITLE_MAX)">−</button>
            <span class="tabular-nums text-xs flex-1 text-center">{{ effective('cardTitleSize') }}px</span>
            <button type="button" class="tool-btn" @click="bump('cardTitleSize', 1, CARD_TITLE_MIN, CARD_TITLE_MAX)">+</button>
          </div>
        </div>

        <div>
          <div class="label-soft mb-1 flex items-center gap-1">
            <span>chapter title</span>
            <span v-if="isOverridden('chapterTitleSize')" class="chapter-settings-dot" title="overridden" />
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="tool-btn" @click="bump('chapterTitleSize', -1, CHAPTER_TITLE_MIN, CHAPTER_TITLE_MAX)">−</button>
            <span class="tabular-nums text-xs flex-1 text-center">{{ effective('chapterTitleSize') }}px</span>
            <button type="button" class="tool-btn" @click="bump('chapterTitleSize', 1, CHAPTER_TITLE_MIN, CHAPTER_TITLE_MAX)">+</button>
          </div>
        </div>

        <div>
          <div class="label-soft mb-1 flex items-center gap-1">
            <span>layout</span>
            <span v-if="isOverridden('type')" class="chapter-settings-dot" title="overridden" />
          </div>
          <div class="flex flex-wrap gap-1">
            <button
              type="button"
              class="pill cursor-pointer transition-colors"
              :class="effective('type') === 'columns' ? 'bg-ink text-paper border-ink' : 'hover:border-ink/40'"
              @click="setValue('type', 'columns')"
            >columns</button>
            <button
              type="button"
              class="pill cursor-pointer transition-colors"
              :class="effective('type') === 'vertical' ? 'bg-ink text-paper border-ink' : 'hover:border-ink/40'"
              @click="setValue('type', 'vertical')"
            >vertical</button>
          </div>
        </div>

        <div :class="{ 'opacity-40': colsDisabled }">
          <div class="label-soft mb-1 flex items-center gap-1">
            <span>columns</span>
            <span v-if="isOverridden('cols') && !colsDisabled" class="chapter-settings-dot" title="overridden" />
            <span v-if="colsDisabled" class="text-2xs text-muted ml-auto">vertical layout</span>
          </div>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="opt in COL_OPTIONS"
              :key="opt"
              type="button"
              class="pill transition-colors"
              :class="[
                effective('cols') === opt ? 'bg-ink text-paper border-ink' : 'hover:border-ink/40',
                colsDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
              ]"
              :disabled="colsDisabled"
              @click="!colsDisabled && setValue('cols', opt)"
            >{{ opt }}</button>
          </div>
        </div>
      </div>

      <footer class="px-3 py-1 border-t border-hairline flex justify-end">
        <button
          type="button"
          class="text-2xs text-muted hover:text-accent"
          :disabled="Object.keys(overrides).length === 0"
          :class="{ 'opacity-40 cursor-not-allowed': Object.keys(overrides).length === 0 }"
          @click="reset"
          title="clear this chapter's overrides — falls back to sheet defaults"
        >reset to defaults</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.chapter-settings {
  position: relative;
  display: inline-block;
}

.chapter-settings-trigger {
  appearance: none;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  color: #b8b1a4;
  padding: 0;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.12s, border-color 0.12s, background-color 0.12s;
}

.chapter-settings-trigger:hover,
.chapter-settings-trigger[aria-expanded='true'] {
  color: #c1440e;
  border-color: rgba(193, 68, 14, 0.25);
  background: rgba(193, 68, 14, 0.06);
}

.chapter-settings-popover {
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 0.4rem;
  width: 16rem;
  border-radius: 2px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  z-index: 50;
  /* Reset the parent rail's vertical-typography styling for popover content. */
  writing-mode: horizontal-tb;
  text-align: left;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 400;
  /* Pin to 12px so the popover does NOT scale with the chapter's --body-size:
     the controls that adjust body-size shouldn't grow with the value they set. */
  font-size: 12px;
  color: #1a1a1a;
}

.chapter-settings-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #c1440e;
}
</style>
