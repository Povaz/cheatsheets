<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { topics, recallData } from '../lib/content.js'
import { openFolders, treeFilter } from '../store.js'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const router = useRouter()

const activeTopic = computed(() => route.params.topic || null)
const activeSubtopic = computed(() => route.params.subtopic || null)

function toggleFolder(slug) {
  const next = new Set(openFolders.value)
  if (next.has(slug)) next.delete(slug)
  else next.add(slug)
  openFolders.value = next
}

function isFolderOpen(slug) {
  if (treeFilter.value.trim()) return true
  return openFolders.value.has(slug)
}

const filteredTopics = computed(() => {
  const q = treeFilter.value.toLowerCase().trim()
  if (!q) return topics
  return topics
    .map(t => {
      const topicMatch = t.title.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
      const matchingSubs = t.subtopics.filter(s => s.name.toLowerCase().includes(q))
      if (topicMatch) return t
      if (matchingSubs.length) return { ...t, subtopics: matchingSubs }
      return null
    })
    .filter(Boolean)
})

function navigateTo(slug) {
  router.push(`/${slug}`)
}

function pad(n) {
  return String(n).padStart(2, '0')
}

watch(() => route.params.topic, (slug) => {
  if (slug && !openFolders.value.has(slug)) {
    const next = new Set(openFolders.value)
    next.add(slug)
    openFolders.value = next
  }
}, { immediate: true })
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <span class="sidebar-wordmark">cheatsheet</span>
      <span class="sidebar-os">OS</span>
      <span class="flex-1"></span>
      <button class="sidebar-collapse" disabled title="Collapse (coming soon)">‹</button>
    </div>

    <div class="sidebar-filter">
      <input
        type="search"
        placeholder="filter"
        v-model="treeFilter"
        class="sidebar-filter-input"
      />
    </div>

    <nav class="sidebar-tree" role="tree" aria-label="Sheets">
      <div v-for="t in filteredTopics" :key="t.slug" role="treeitem" :aria-expanded="isFolderOpen(t.slug)">
        <div class="sidebar-folder" @click="toggleFolder(t.slug)">
          <span class="sidebar-caret">{{ isFolderOpen(t.slug) ? '▼' : '▶' }}</span>
          <span class="sidebar-accent-sq" :style="{ background: t.accent || 'rgb(var(--c-muted))' }"></span>
          <span class="sidebar-folder-title">{{ t.title }}</span>
          <span class="sidebar-folder-count">{{ pad(t.subtopics.length) }}</span>
        </div>
        <div v-if="isFolderOpen(t.slug)" role="group">
          <div
            v-for="(s, si) in t.subtopics"
            :key="s.name"
            role="treeitem"
            :aria-current="activeTopic === t.slug && activeSubtopic === s.name ? 'page' : undefined"
            class="sidebar-file"
            :class="{ 'sidebar-file--active': activeTopic === t.slug && activeSubtopic === s.name }"
            @click="navigateTo(s.slug)"
          >
            <span class="sidebar-file-index">{{ pad(si + 1) }}</span>
            <span class="sidebar-file-name">{{ s.name }}</span>
          </div>
        </div>
      </div>
    </nav>

    <div class="sidebar-bottom-row">
      <button
        v-if="recallData"
        class="sidebar-recall"
        @click="$router.push('/recall')"
      >
        <span class="sidebar-accent-sq"></span>
        <span class="sidebar-recall-label">Daily Recall</span>
        <span class="flex-1"></span>
        <span class="sidebar-recall-count">{{ recallData.questions.length }}</span>
      </button>
      <div v-else class="sidebar-recall-placeholder"></div>
      <div class="sidebar-theme">
        <ThemeToggle />
      </div>
    </div>

    <div class="sidebar-links">
      <div class="sidebar-links-row">
        <a href="https://github.com/Povaz" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span class="sidebar-links-sep">·</span>
        <a href="https://www.linkedin.com/in/erick-venneri-4296601a4" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
      <div>&copy; 2026 Erick Venneri</div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgb(var(--c-paper-warm));
  border-right: 1px solid rgb(var(--c-hairline));
  flex: 0 0 268px;
  width: 268px;
}

.sidebar-brand {
  flex: 0 0 auto;
  padding: 16px 16px 13px;
  border-bottom: 1px solid rgb(var(--c-hairline));
  display: flex;
  align-items: center;
  gap: 8px;
}
.sidebar-wordmark {
  font-family: Fraunces, ui-serif, serif;
  font-size: 19px;
  font-weight: 800;
  line-height: 1;
  color: rgb(var(--c-ink));
}
.sidebar-os {
  display: inline-flex;
  align-items: center;
  padding: 2px 5px;
  border-radius: 3px;
  background: rgb(var(--c-accent));
  color: rgb(var(--c-paper));
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.sidebar-collapse {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid rgb(var(--c-hairline));
  background: rgb(var(--c-paper));
  color: rgb(var(--c-muted));
  font-size: 11px;
  cursor: default;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sidebar-filter {
  flex: 0 0 auto;
  padding: 10px 16px;
  border-bottom: 1px solid rgb(var(--c-hairline));
}
.sidebar-filter-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid rgb(var(--c-hairline));
  border-radius: 2px;
  background: rgb(var(--c-paper));
  font-size: 11px;
  font-family: inherit;
  color: rgb(var(--c-ink));
}
.sidebar-filter-input::placeholder { color: rgb(var(--c-muted)); }
.sidebar-filter-input:focus {
  outline: none;
  border-color: rgb(var(--c-accent));
}

.sidebar-tree {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 8px;
}

.sidebar-folder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px 5px;
  cursor: pointer;
}
.sidebar-caret {
  font-size: 7px;
  width: 8px;
  color: rgb(var(--c-muted));
  flex-shrink: 0;
}
.sidebar-accent-sq {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  background: rgb(var(--c-accent));
}
.sidebar-folder-title {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
  font-weight: 700;
  color: rgb(var(--c-muted));
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-folder-count {
  font-size: 10px;
  color: rgb(var(--c-muted));
  font-variant-numeric: tabular-nums;
}

.sidebar-file {
  display: grid;
  grid-template-columns: 1.5rem 1fr;
  align-items: baseline;
  column-gap: 8px;
  padding: 3px 16px 3px 32px;
  cursor: pointer;
  transition: background-color 120ms;
}
.sidebar-file:hover {
  background: rgb(var(--c-hairline) / 0.5);
}
.sidebar-file--active {
  background: rgb(var(--c-accent) / 0.09);
  box-shadow: inset 2px 0 0 rgb(var(--c-accent));
}
:global(html.dark) .sidebar-file--active {
  background: rgb(var(--c-accent) / 0.13);
}
.sidebar-file-index {
  font-size: 10px;
  color: rgb(var(--c-muted));
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.sidebar-file-name {
  font-size: 11px;
  font-weight: 400;
  color: rgb(var(--c-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-file--active .sidebar-file-name {
  font-weight: 600;
  color: rgb(var(--c-accent));
}

.sidebar-bottom-row {
  flex: 0 0 auto;
  border-top: 1px solid rgb(var(--c-hairline));
  display: flex;
  align-items: stretch;
}
.sidebar-recall {
  flex: 1;
  padding: 11px 16px;
  border-right: 1px solid rgb(var(--c-hairline));
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border-top: 0;
  border-bottom: 0;
  border-left: 0;
  font-family: inherit;
  color: inherit;
}
.sidebar-recall:hover .sidebar-recall-label {
  opacity: 0.8;
}
.sidebar-recall-placeholder {
  flex: 1;
  border-right: 1px solid rgb(var(--c-hairline));
}
.sidebar-recall-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
  font-weight: 700;
  color: rgb(var(--c-accent));
}
.sidebar-recall-count {
  font-size: 10px;
  color: rgb(var(--c-muted));
  font-variant-numeric: tabular-nums;
}
.sidebar-theme {
  flex: 0 0 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-links {
  flex: 0 0 auto;
  border-top: 1px solid rgb(var(--c-hairline));
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  font-size: 10px;
  color: rgb(var(--c-muted));
}
.sidebar-links-row {
  display: flex;
  gap: 8px;
}
.sidebar-links-sep {
  color: rgb(var(--c-hairline));
}
.sidebar-links a {
  color: rgb(var(--c-muted));
  text-decoration: none;
}
.sidebar-links a:hover {
  color: rgb(var(--c-accent));
}
</style>
