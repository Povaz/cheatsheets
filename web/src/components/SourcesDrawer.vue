<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { sourcesOpen } from '../store.js'

const props = defineProps({
  sources: { type: Array, default: () => [] },
})

const route = useRoute()

function toggle() { sourcesOpen.value = !sourcesOpen.value }
function close() { sourcesOpen.value = false }

function onKey(e) {
  if (e.key === 'Escape' && sourcesOpen.value) {
    close()
    e.preventDefault()
  }
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))

watch(() => route.fullPath, () => { sourcesOpen.value = false })

function pad(n) { return String(n).padStart(2, '0') }

function badgeLabel(src) {
  if (src.kind === 'remote') return src.type ? `link · ${src.type}` : 'link'
  return src.type || 'src'
}

function previewText(sources) {
  if (!sources.length) return ''
  const first = sources[0].title
  if (sources.length === 1) return first
  return `${first} · +${sources.length - 1}`
}
</script>

<template>
  <button
    v-if="sources.length && !sourcesOpen"
    class="drawer-bar"
    aria-expanded="false"
    aria-controls="sources-panel"
    @click="toggle"
  >
    <span class="drawer-chevron">⌃</span>
    <span class="drawer-label">Sources</span>
    <span class="drawer-count">{{ pad(sources.length) }}</span>
    <span class="flex-1"></span>
    <span class="drawer-preview">{{ previewText(sources) }}</span>
  </button>

  <div v-if="sources.length" class="drawer-overlay" :class="{ 'drawer-overlay--open': sourcesOpen }">
    <div class="drawer-dim" @click="close"></div>
    <div class="drawer-panel" id="sources-panel">
      <button class="drawer-bar drawer-bar--open" aria-expanded="true" @click="close">
        <span class="drawer-chevron">⌄</span>
        <span class="drawer-label">Sources</span>
        <span class="drawer-count">{{ pad(sources.length) }}</span>
        <span class="flex-1"></span>
        <span class="drawer-preview">{{ previewText(sources) }}</span>
      </button>
      <div class="drawer-body">
        <a
          v-for="(src, i) in sources"
          :key="src.href"
          class="drawer-row"
          :href="src.href"
          :target="src.kind === 'remote' ? '_blank' : null"
          :rel="src.kind === 'remote' ? 'noopener noreferrer' : null"
          :download="src.kind === 'local' ? src.filename : null"
          :title="src.kind === 'local' ? `Download ${src.filename}` : src.href"
        >
          <span class="drawer-row-index">{{ pad(i + 1) }}</span>
          <span class="drawer-row-type">{{ badgeLabel(src) }}</span>
          <span class="drawer-row-title">{{ src.title }}</span>
          <span v-if="src.read_as" class="drawer-row-readas" :title="src.read_as">{{ src.read_as }}</span>
          <span v-if="src.fetched" class="drawer-row-date">{{ src.fetched }}</span>
          <span class="drawer-row-affordance" :aria-label="src.kind === 'local' ? 'download' : 'open in new tab'">
            {{ src.kind === 'local' ? '⬇' : '↗' }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-bar {
  flex: 0 0 auto;
  padding: 10px 32px;
  border-top: 1px solid rgb(var(--c-hairline));
  background: rgb(var(--c-paper-warm));
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
  font-family: inherit;
  border-left: 0;
  border-right: 0;
  border-bottom: 0;
  color: rgb(var(--c-ink));
}
.drawer-bar--open {
  border-top: 0;
  border-bottom: 1px solid rgb(var(--c-hairline));
  background: rgb(var(--c-paper));
}
.drawer-chevron { font-size: 11px; color: rgb(var(--c-muted)); }
.drawer-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
  font-weight: 700;
  color: rgb(var(--c-ink));
}
.drawer-count {
  font-size: 10px;
  color: rgb(var(--c-muted));
  font-variant-numeric: tabular-nums;
}
.drawer-preview {
  font-size: 10px;
  color: rgb(var(--c-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.drawer-overlay { pointer-events: none; }
.drawer-overlay--open { pointer-events: auto; }

.drawer-dim {
  position: absolute;
  inset: 0;
  background: rgb(var(--c-overlay-rgb) / var(--overlay-alpha));
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms ease-out;
}
.drawer-overlay--open .drawer-dim {
  opacity: 1;
  pointer-events: auto;
}

.drawer-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 300px;
  background: rgb(var(--c-paper));
  border-top: 1px solid rgb(var(--c-hairline));
  box-shadow: var(--shadow-popover-up);
  z-index: 11;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 220ms ease-out;
}
.drawer-overlay--open .drawer-panel {
  transform: translateY(0);
}

.drawer-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 32px 16px;
}

.drawer-row {
  display: grid;
  grid-template-columns: 1.75rem 7rem minmax(0, 1.1fr) minmax(0, 1.6fr) auto 1rem;
  column-gap: 0.7rem;
  align-items: baseline;
  padding: 9px 8px 9px 0;
  border-bottom: 1px solid rgb(var(--c-hairline));
  border-left: 2px solid transparent;
  color: rgb(var(--c-ink));
  text-decoration: none;
  transition: background-color 120ms, border-color 120ms;
}
.drawer-row:hover, .drawer-row:focus-visible {
  background: rgb(var(--c-hairline) / 0.35);
  border-left-color: rgb(var(--c-accent));
}
.drawer-row:hover .drawer-row-title, .drawer-row:focus-visible .drawer-row-title {
  text-decoration: underline;
  text-decoration-color: rgb(var(--c-accent));
  text-underline-offset: 3px;
}
.drawer-row-index {
  font-size: 10px;
  color: rgb(var(--c-muted));
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.drawer-row-type {
  display: inline-block;
  text-align: center;
  padding: 0 0.35rem;
  border: 1px solid rgb(var(--c-hairline));
  border-radius: 2px;
  background: rgb(var(--c-paper-warm));
  font-size: 10px;
  font-weight: 600;
  color: rgb(var(--c-muted));
  line-height: 1.5;
}
.drawer-row-title {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.drawer-row-readas {
  font-size: 10px;
  color: rgb(var(--c-muted));
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.drawer-row-date {
  font-size: 10px;
  color: rgb(var(--c-muted));
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.drawer-row-affordance {
  font-size: 11px;
  color: rgb(var(--c-muted));
  text-align: center;
  transition: color 120ms;
}
.drawer-row:hover .drawer-row-affordance {
  color: rgb(var(--c-accent));
}

</style>
