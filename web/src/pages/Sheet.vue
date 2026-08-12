<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { findTopic, findSubTopic } from '../lib/content.js'
import { searchQuery, sourcesOpen, isSmallScreen } from '../store.js'
import SheetFragment from '../components/SheetFragment.vue'
import SourcesDrawer from '../components/SourcesDrawer.vue'

const props = defineProps({
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
})

const router = useRouter()
const topicData = computed(() => findTopic(props.topic))
const entry = computed(() => findSubTopic(props.topic, props.subtopic))
const searchInput = ref(null)
const mobileSearchInput = ref(null)

function onSearchKey(e) {
  if (e.key === 'Escape') {
    if (sourcesOpen.value) return
    if (searchQuery.value) {
      searchQuery.value = ''
      e.preventDefault()
    } else {
      searchInput.value?.blur()
      mobileSearchInput.value?.blur()
      showMobileSearch.value = false
    }
  }
}

// Mobile scroll-driven nav collapse
const mobileBodyRef = ref(null)
const scrolledPast = ref(false)
const showMobileSearch = ref(false)

function onMobileScroll() {
  if (!mobileBodyRef.value) return
  const st = mobileBodyRef.value.scrollTop
  if (!scrolledPast.value && st >= 40) scrolledPast.value = true
  else if (scrolledPast.value && st <= 24) scrolledPast.value = false
}

function openMobileSearch() {
  showMobileSearch.value = true
  setTimeout(() => mobileSearchInput.value?.focus(), 50)
}

</script>

<template>
  <div v-if="!entry" class="p-8 text-muted">
    Sheet not found.
    <RouterLink to="/" class="underline decoration-hairline hover:decoration-accent">back</RouterLink>.
  </div>

  <!-- Desktop -->
  <template v-else-if="!isSmallScreen">
    <header class="sheet-header">
      <div class="sheet-header-top">
        <div class="sheet-path">
          <span class="sheet-path-sq" :style="{ background: topicData?.accent || 'rgb(var(--c-muted))' }"></span>
          <span class="sheet-path-text">{{ props.topic }} / {{ props.subtopic }}</span>
        </div>
        <div class="sheet-search">
          <input
            ref="searchInput"
            type="search"
            placeholder="/ to search"
            :value="searchQuery"
            class="sheet-search-input"
            @input="searchQuery = $event.target.value"
            @keydown="onSearchKey"
          />
        </div>
      </div>
      <h1 class="sheet-title">{{ entry.frontmatter.title }}</h1>
      <p v-if="entry.frontmatter.subtitle" class="sheet-subtitle">{{ entry.frontmatter.subtitle }}</p>
    </header>
    <div class="sheet-body">
      <SheetFragment :html="entry.fragmentHtml" />
    </div>
    <SourcesDrawer :sources="entry.sources" />
  </template>

  <!-- Mobile -->
  <template v-else>
    <!-- Nav bar -->
    <div class="mobile-nav" :class="{ 'mobile-nav--shadow': scrolledPast }">
      <!-- Search mode -->
      <div v-if="showMobileSearch" class="mobile-nav-search-row">
        <input
          ref="mobileSearchInput"
          type="search"
          placeholder="search in sheet"
          :value="searchQuery"
          class="mobile-nav-search-field"
          @input="searchQuery = $event.target.value"
          @keydown="onSearchKey"
        />
        <button class="mobile-nav-search-close" @click="showMobileSearch = false; searchQuery = ''">✕</button>
      </div>
      <!-- Normal mode -->
      <template v-else>
        <!-- Expanded state (scrollTop < 40) -->
        <div class="mobile-nav-layer" :style="{ opacity: scrolledPast ? 0 : 1, pointerEvents: scrolledPast ? 'none' : 'auto' }">
          <button class="mobile-nav-back" @click="router.push('/')">
            <span class="mobile-nav-back-chevron">‹</span>
            <span class="mobile-nav-back-text">Index</span>
          </button>
          <span class="flex-1"></span>
          <button class="mobile-nav-search-btn" @click="openMobileSearch" aria-label="Search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
        </div>
        <!-- Collapsed state (scrollTop >= 40) -->
        <div class="mobile-nav-layer mobile-nav-layer--collapsed" :style="{ opacity: scrolledPast ? 1 : 0, pointerEvents: scrolledPast ? 'auto' : 'none' }">
          <button class="mobile-nav-back-sm" @click="router.push('/')">‹</button>
          <span class="mobile-nav-sq" :style="{ background: topicData?.accent || 'rgb(var(--c-muted))' }"></span>
          <span class="mobile-nav-name">{{ props.subtopic }}</span>
          <span class="flex-1"></span>
          <button class="mobile-nav-search-btn" @click="openMobileSearch" aria-label="Search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
        </div>
      </template>
    </div>

    <!-- Scrolling body: header + fragment -->
    <div class="mobile-body" ref="mobileBodyRef" @scroll="onMobileScroll">
      <header class="mobile-sheet-header">
        <div class="mobile-sheet-path">
          <span class="mobile-sheet-path-sq" :style="{ background: topicData?.accent || 'rgb(var(--c-muted))' }"></span>
          <span class="mobile-sheet-path-text">{{ props.topic }} / {{ props.subtopic }}</span>
        </div>
        <h1 class="mobile-sheet-title">{{ entry.frontmatter.title }}</h1>
        <p v-if="entry.frontmatter.subtitle" class="mobile-sheet-subtitle">{{ entry.frontmatter.subtitle }}</p>
      </header>
      <div class="mobile-fragment-wrap">
        <SheetFragment :html="entry.fragmentHtml" />
      </div>
    </div>

    <!-- Sources bar -->
    <SourcesDrawer :sources="entry.sources" />
  </template>
</template>

<style scoped>
/* --- Desktop --- */
.sheet-header {
  flex: 0 0 auto;
  padding: 26px 32px 16px;
  border-bottom: 1px solid rgb(var(--c-hairline));
}
.sheet-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 11px;
}
.sheet-path {
  display: flex;
  align-items: center;
  gap: 7px;
}
.sheet-path-sq {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
}
.sheet-path-text {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
  font-weight: 700;
  color: rgb(var(--c-muted));
}
.sheet-search-input {
  padding: 4px 8px;
  border: 1px solid rgb(var(--c-hairline));
  border-radius: 2px;
  background: rgb(var(--c-surface));
  font-size: 11px;
  font-family: inherit;
  color: rgb(var(--c-ink));
  width: 160px;
}
.sheet-search-input::placeholder { color: rgb(var(--c-muted)); }
.sheet-search-input:focus {
  outline: none;
  border-color: rgb(var(--c-accent));
}
.sheet-title {
  font-family: Fraunces, ui-serif, serif;
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  margin: 0;
}
.sheet-subtitle {
  font-size: 12px;
  color: rgb(var(--c-muted));
  margin: 9px 0 0;
}
.sheet-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 32px;
}

/* --- Mobile --- */
.mobile-nav {
  flex: 0 0 auto;
  height: 46px;
  padding: 0 6px 0 8px;
  position: relative;
  border-bottom: 1px solid rgb(var(--c-hairline) / 0.6);
  background: rgb(var(--c-paper));
  z-index: 5;
  transition: box-shadow 160ms ease;
}
.mobile-nav--shadow {
  border-bottom-color: rgb(var(--c-hairline));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
:global(html.dark) .mobile-nav--shadow {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}

.mobile-nav-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 6px 0 8px;
  transition: opacity 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .mobile-nav-layer { transition: none; }
  .mobile-nav { transition: none; }
}

.mobile-nav-back {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 44px;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  color: rgb(var(--c-muted));
  padding: 0 8px;
}
.mobile-nav-back-chevron { font-size: 14px; }
.mobile-nav-back-text {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
}

.mobile-nav-back-sm {
  width: 32px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 14px;
  color: rgb(var(--c-muted));
  cursor: pointer;
  font-family: inherit;
}

.mobile-nav-sq {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
}
.mobile-nav-name {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--c-ink));
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-nav-search-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgb(var(--c-muted));
  cursor: pointer;
}

.mobile-nav-search-row {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 8px;
  padding: 0 8px;
}
.mobile-nav-search-field {
  flex: 1;
  height: 34px;
  padding: 0 10px;
  border: 1px solid rgb(var(--c-hairline));
  border-radius: 3px;
  background: rgb(var(--c-surface));
  font-family: inherit;
  font-size: 13px;
  color: rgb(var(--c-ink));
}
.mobile-nav-search-field::placeholder { color: rgb(var(--c-muted)); }
.mobile-nav-search-field:focus { outline: none; border-color: rgb(var(--c-accent)); }
.mobile-nav-search-close {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 14px;
  color: rgb(var(--c-muted));
  cursor: pointer;
}

.mobile-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
}

.mobile-sheet-header {
  padding: 14px 16px 16px;
  border-bottom: 1px solid rgb(var(--c-hairline));
}
.mobile-sheet-path {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
}
.mobile-sheet-path-sq {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
}
.mobile-sheet-path-text {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--c-muted));
}
.mobile-sheet-title {
  font-family: Fraunces, ui-serif, serif;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.05;
  margin: 0;
}
.mobile-sheet-subtitle {
  font-size: 12px;
  line-height: 1.6;
  color: rgb(var(--c-muted));
  margin: 9px 0 0;
}

.mobile-fragment-wrap {
  padding: 18px 16px;
}
</style>
