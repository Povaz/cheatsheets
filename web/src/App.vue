<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findTopic, findSubTopic } from './lib/content.js'
import { searchQuery, loadSheetSettings, clearSheetSettings } from './store.js'
import SearchBar from './components/SearchBar.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import CheatSheetMenu from './components/CheatSheetMenu.vue'
import ThemeToggle from './components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const searchRef = ref(null)

const currentTopic = computed(() =>
  route.params.topic ? findTopic(route.params.topic) : null,
)

const currentEntry = computed(() => {
  const t = currentTopic.value
  if (!t) return null
  const subParam = route.params.subtopic
  if (!subParam) return null
  return findSubTopic(t.slug, subParam)
})

const currentSubTopicName = computed(() => currentEntry.value?.name || null)

function onGlobalKey(e) {
  const tag = e.target?.tagName
  const typing =
    tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable

  if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault()
    searchRef.value?.focus()
    return
  }

  if ((e.metaKey || e.ctrlKey) && (e.key === '[' || e.key === ']')) {
    const t = currentTopic.value
    if (!t || t.subtopics.length < 2) return
    const cur = currentSubTopicName.value
    if (!cur) return
    const idx = t.subtopics.findIndex((s) => s.name === cur)
    if (idx < 0) return
    const delta = e.key === ']' ? 1 : -1
    const next = t.subtopics[(idx + delta + t.subtopics.length) % t.subtopics.length]
    router.push(`/${t.slug}/${next.name}`)
    e.preventDefault()
  }
}

watch(
  () => [route.params.topic, route.params.subtopic],
  ([topic, subtopic]) => {
    if (topic && subtopic) loadSheetSettings(`${topic}/${subtopic}`)
    else clearSheetSettings()
  },
  { immediate: true },
)

onMounted(() => document.addEventListener('keydown', onGlobalKey))
onUnmounted(() => document.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <div class="min-h-screen bg-paper text-ink">
    <header
      class="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-hairline"
    >
      <div
        class="max-w-page mx-auto px-4 py-2 flex items-center gap-3 flex-nowrap"
      >
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <RouterLink
            to="/"
            class="uppercase tracking-label text-2xs font-semibold text-accent hover:opacity-70 whitespace-nowrap transition-opacity"
          >cheatsheets</RouterLink>
          <template v-if="currentTopic">
            <CheatSheetMenu mode="topics" />
            <span class="text-xs font-semibold whitespace-nowrap">{{ currentTopic.title }}</span>
            <template v-if="currentSubTopicName">
              <CheatSheetMenu mode="subtopics" />
              <span class="text-2xs text-muted tabular-nums truncate min-w-0">{{ currentSubTopicName }}</span>
            </template>
          </template>
        </div>

        <SearchBar ref="searchRef" v-model="searchQuery" />

        <ThemeToggle />

        <SettingsPanel />
      </div>
    </header>

    <main class="max-w-page mx-auto px-4 py-6">
      <RouterView />
    </main>

    <footer class="sticky bottom-0 bg-paper border-t border-hairline z-30">
      <div
        class="max-w-page mx-auto px-4 py-3 flex items-center gap-3 text-2xs text-muted"
      >
        <span>© 2026 Erick Venneri</span>
        <span class="text-hairline" aria-hidden="true">·</span>
        <a
          href="https://github.com/Povaz"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-accent"
        >GitHub</a>
        <span class="text-hairline" aria-hidden="true">·</span>
        <a
          href="https://www.linkedin.com/in/erick-venneri-4296601a4"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-accent"
        >LinkedIn</a>
      </div>
    </footer>
  </div>
</template>
