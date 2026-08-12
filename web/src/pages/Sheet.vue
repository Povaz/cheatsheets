<script setup>
import { computed, ref } from 'vue'
import { findTopic, findSubTopic } from '../lib/content.js'
import { searchQuery, sourcesOpen } from '../store.js'
import SheetFragment from '../components/SheetFragment.vue'
import SourcesDrawer from '../components/SourcesDrawer.vue'

const props = defineProps({
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
})

const topicData = computed(() => findTopic(props.topic))
const entry = computed(() => findSubTopic(props.topic, props.subtopic))
const searchInput = ref(null)

function onSearchKey(e) {
  if (e.key === 'Escape') {
    if (sourcesOpen.value) return
    if (searchQuery.value) {
      searchQuery.value = ''
      e.preventDefault()
    } else {
      searchInput.value?.blur()
    }
  }
}
</script>

<template>
  <div v-if="!entry" class="p-8 text-muted">
    Sheet not found.
    <RouterLink to="/" class="underline decoration-hairline hover:decoration-accent">back</RouterLink>.
  </div>
  <template v-else>
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
</template>

<style scoped>
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
</style>
