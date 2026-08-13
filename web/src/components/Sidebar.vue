<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { topics, plans } from '../lib/content.js'
import { bankAvailable, correct, answered, questionsOpen } from '../lib/questions.js'
import { openFolders, treeFilter, indexTab } from '../store.js'
import ThemeToggle from './ThemeToggle.vue'

const props = defineProps({
  variant: { type: String, default: 'rail' },
})

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

function goHome() {
  questionsOpen.value = false
  router.push('/')
}

function pad(n) {
  return String(n).padStart(2, '0')
}

const sheetsCount = computed(() => topics.reduce((sum, t) => sum + t.subtopics.length, 0))

const filteredPlans = computed(() => {
  const q = treeFilter.value.toLowerCase().trim()
  if (!q) return plans
  return plans.filter((p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
})

const activePlan = computed(() => (route.name === 'plan' ? route.params.plan : null))

function navigateToPlan(slug) {
  router.push(`/plans/${slug}`)
}

watch(() => route.params.topic, (slug) => {
  if (slug && !openFolders.value.has(slug)) {
    const next = new Set(openFolders.value)
    next.add(slug)
    openFolders.value = next
  }
}, { immediate: true })

// Opening a sheet URL selects Sheets; opening a plan URL selects Learning
// Plans; any other route (e.g. `/`, `/questions`) leaves the restored tab
// alone (§8.3).
watch(() => route.name, (name) => {
  if (name === 'sheet' || name === 'topic') indexTab.value = 'sheets'
  else if (name === 'plan') indexTab.value = 'plans'
}, { immediate: true })

// Tree scroll preservation (mobile)
const treeEl = ref(null)
let savedScrollTop = 0

function onTreeScroll() {
  if (treeEl.value) savedScrollTop = treeEl.value.scrollTop
}

watch(() => props.variant, async (v) => {
  if (v === 'screen') {
    await nextTick()
    if (treeEl.value) treeEl.value.scrollTop = savedScrollTop
  }
})

onMounted(() => {
  if (treeEl.value && props.variant === 'screen') {
    treeEl.value.scrollTop = savedScrollTop
  }
})
</script>

<template>
  <aside class="sidebar" :class="[`sidebar--${variant}`]">
    <div class="sidebar-brand">
      <span class="sidebar-wordmark">cheatsheet</span>
      <span class="sidebar-os">OS</span>
      <span class="flex-1"></span>
      <div v-if="variant === 'screen'" class="sidebar-brand-theme">
        <ThemeToggle />
      </div>
      <button v-else class="sidebar-collapse" disabled title="Collapse (coming soon)">‹</button>
    </div>

    <div class="sidebar-tabs">
      <button
        type="button"
        class="sidebar-tab"
        :class="{ 'sidebar-tab--active': indexTab === 'sheets' }"
        @click="indexTab = 'sheets'"
      >
        <span class="sidebar-tab-label">Sheets</span>
        <span class="sidebar-tab-count">{{ sheetsCount }}</span>
      </button>
      <button
        type="button"
        class="sidebar-tab sidebar-tab--second"
        :class="{ 'sidebar-tab--active': indexTab === 'plans' }"
        @click="indexTab = 'plans'"
      >
        <span class="sidebar-tab-label">{{ variant === 'screen' ? 'Plans' : 'Learning Plans' }}</span>
        <span class="sidebar-tab-count">{{ plans.length }}</span>
      </button>
    </div>

    <div class="sidebar-filter">
      <input
        type="search"
        :placeholder="indexTab === 'plans' ? 'filter learning plans' : 'filter sheets'"
        v-model="treeFilter"
        class="sidebar-filter-input"
      />
    </div>

    <nav
      class="sidebar-tree"
      :role="indexTab === 'plans' ? 'list' : 'tree'"
      :aria-label="indexTab === 'plans' ? 'Learning Plans' : 'Sheets'"
      ref="treeEl"
      @scroll="onTreeScroll"
    >
      <template v-if="indexTab === 'sheets'">
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
      </template>

      <template v-else>
        <p v-if="!filteredPlans.length" class="sidebar-plans-empty">No learning plans yet.</p>
        <div
          v-for="(p, pi) in filteredPlans"
          :key="p.slug"
          role="listitem"
          :aria-current="activePlan === p.slug ? 'page' : undefined"
          class="sidebar-plan"
          :class="{ 'sidebar-plan--active': activePlan === p.slug }"
          @click="navigateToPlan(p.slug)"
        >
          <span class="sidebar-plan-index">{{ pad(pi + 1) }}</span>
          <span class="sidebar-plan-sq" :style="{ background: p.accent || 'rgb(var(--c-muted))' }"></span>
          <span class="sidebar-plan-title">{{ p.title }}</span>
        </div>
      </template>

      <!-- Site links inside scroll on mobile -->
      <div v-if="variant === 'screen'" class="sidebar-links sidebar-links--scroll">
        <div class="sidebar-links-row">
          <a href="https://github.com/Povaz" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span class="sidebar-links-sep">·</span>
          <a href="https://www.linkedin.com/in/erick-venneri-4296601a4" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
        <div>&copy; 2026 Erick Venneri</div>
      </div>
    </nav>

    <!-- Desktop: recall + theme row, then pinned links -->
    <template v-if="variant === 'rail'">
      <div class="sidebar-bottom-row">
        <button v-if="bankAvailable" class="sidebar-recall" @click="goHome">
          <span class="sidebar-accent-sq"></span>
          <span class="sidebar-recall-label">Home</span>
          <span class="flex-1"></span>
          <span class="sidebar-recall-count">{{ correct }}/{{ answered }}</span>
        </button>
        <div v-else class="sidebar-recall-placeholder"></div>
        <div class="sidebar-theme"><ThemeToggle /></div>
      </div>
      <div class="sidebar-links">
        <div class="sidebar-links-row">
          <a href="https://github.com/Povaz" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span class="sidebar-links-sep">·</span>
          <a href="https://www.linkedin.com/in/erick-venneri-4296601a4" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
        <div>&copy; 2026 Erick Venneri</div>
      </div>
    </template>

    <!-- Mobile: pinned recall bar -->
    <button
      v-if="variant === 'screen' && bankAvailable"
      class="sidebar-recall-bar"
      @click="$router.push('/questions')"
    >
      <span class="sidebar-recall-bar-sq"></span>
      <span class="sidebar-recall-bar-label">Questions</span>
      <span class="flex-1"></span>
      <span class="sidebar-recall-bar-count">{{ correct }}/{{ answered }}</span>
      <span class="sidebar-recall-bar-chevron">›</span>
    </button>
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

.sidebar-tabs {
  flex: 0 0 auto;
  display: flex;
  border-bottom: 1px solid rgb(var(--c-hairline));
}
.sidebar-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 0 8px;
  border: 0;
  background: none;
  color: rgb(var(--c-muted));
  font-family: inherit;
  cursor: pointer;
}
.sidebar-tab--second {
  border-left: 1px solid rgb(var(--c-hairline));
}
.sidebar-tab-label {
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-size: 10px;
  font-weight: 700;
}
.sidebar-tab-count {
  font-size: 10px;
  font-weight: 600;
  color: rgb(var(--c-muted));
  font-variant-numeric: tabular-nums;
}
.sidebar-tab--active {
  color: rgb(var(--c-accent));
  background: rgb(var(--c-accent) / 0.07);
  box-shadow: inset 0 -2px 0 rgb(var(--c-accent));
}
@media (hover: hover) {
  .sidebar-tab:not(.sidebar-tab--active):hover {
    color: rgb(var(--c-ink));
  }
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

.sidebar-plan {
  display: grid;
  grid-template-columns: 1.5rem 5px 1fr;
  align-items: center;
  column-gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
}
.sidebar-plan:hover {
  background: rgb(0 0 0 / 0.03);
}
:global(html.dark) .sidebar-plan:hover {
  background: rgb(255 255 255 / 0.04);
}
.sidebar-plan--active {
  background: rgb(var(--c-accent) / 0.09);
  box-shadow: inset 2px 0 0 rgb(var(--c-accent));
}
:global(html.dark) .sidebar-plan--active {
  background: rgb(var(--c-accent) / 0.13);
}
.sidebar-plan-index {
  font-size: 10px;
  color: rgb(var(--c-muted));
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.sidebar-plan-sq {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
}
.sidebar-plan-title {
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--c-ink));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-plan--active .sidebar-plan-title {
  color: rgb(var(--c-accent));
}
.sidebar-plans-empty {
  font-size: 11px;
  color: rgb(var(--c-muted));
  padding: 14px 16px;
  margin: 0;
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

/* --- Mobile tree screen (variant="screen") --- */

.sidebar--screen {
  flex: none;
  width: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  border-right: none;
}

.sidebar--screen .sidebar-brand {
  padding: 18px 16px 14px;
}
.sidebar--screen .sidebar-wordmark {
  font-size: 23px;
}
.sidebar--screen .sidebar-os {
  padding: 3px 6px;
  font-size: 11px;
}
.sidebar-brand-theme {
  width: 44px;
  height: 44px;
  margin: -10px -10px -10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar--screen .sidebar-tab {
  height: 46px;
}
.sidebar--screen .sidebar-tab-label {
  font-size: 11px;
}
.sidebar--screen .sidebar-tab-count {
  font-size: 11px;
}

.sidebar--screen .sidebar-filter {
  padding: 12px 16px;
}
.sidebar--screen .sidebar-filter-input {
  height: 40px;
  padding: 0 11px;
  font-size: 13px;
  border-radius: 3px;
}

.sidebar--screen .sidebar-folder {
  height: 46px;
  padding: 0 16px;
  gap: 10px;
  align-items: center;
}
.sidebar--screen .sidebar-caret {
  font-size: 8px;
}
.sidebar--screen .sidebar-accent-sq {
  width: 6px;
  height: 6px;
}
.sidebar--screen .sidebar-folder-title {
  font-size: 11px;
}
.sidebar--screen .sidebar-folder-count {
  font-size: 11px;
}

.sidebar--screen .sidebar-file {
  height: 44px;
  grid-template-columns: 1.75rem 1fr;
  align-items: center;
  column-gap: 10px;
  padding: 0 16px 0 35px;
  border-top: 1px solid rgb(var(--c-hairline) / 0.7);
}
.sidebar--screen .sidebar-file-index {
  font-size: 11px;
}
.sidebar--screen .sidebar-file-name {
  font-size: 13px;
  color: rgb(var(--c-ink));
}
.sidebar--screen .sidebar-file--active .sidebar-file-name {
  color: rgb(var(--c-accent));
}

.sidebar--screen .sidebar-plan {
  height: 52px;
  grid-template-columns: 1.75rem 6px 1fr;
  column-gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid rgb(var(--c-hairline) / 0.7);
}
.sidebar--screen .sidebar-plan-index {
  font-size: 11px;
}
.sidebar--screen .sidebar-plan-sq {
  width: 6px;
  height: 6px;
}
.sidebar--screen .sidebar-plan-title {
  font-size: 13px;
}

.sidebar-links--scroll {
  border-top: 1px solid rgb(var(--c-hairline));
  margin-top: 8px;
  padding: 20px 16px 26px;
  font-size: 11px;
  gap: 5px;
}

.sidebar-recall-bar {
  flex: 0 0 auto;
  height: 54px;
  border-top: 1px solid rgb(var(--c-hairline));
  background: rgb(var(--c-paper));
  padding: 0 16px;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: inherit;
  border-left: 0;
  border-right: 0;
  border-bottom: 0;
  color: inherit;
}
.sidebar-recall-bar-sq {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  background: rgb(var(--c-accent));
}
.sidebar-recall-bar-label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--c-accent));
}
.sidebar-recall-bar-count {
  font-size: 11px;
  color: rgb(var(--c-muted));
  font-variant-numeric: tabular-nums;
}
.sidebar-recall-bar-chevron {
  font-size: 14px;
  color: rgb(var(--c-muted));
}
</style>
