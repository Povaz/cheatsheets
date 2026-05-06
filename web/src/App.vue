<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findTopic, findSubTopic } from './lib/content.js'
import { searchQuery, marksFor, toastState } from './store.js'
import SearchBar from './components/SearchBar.vue'
import SubTopicSwitcher from './components/SubTopicSwitcher.vue'
import Toast from './components/Toast.vue'

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

const currentCheatsheet = computed(
  () => currentEntry.value?.cheatsheet || null,
)

const currentSubTopicName = computed(() => currentEntry.value?.name || null)

const progress = computed(() => {
  const entry = currentEntry.value
  if (!entry) return null
  const total = (entry.cheatsheet.sections || [])
    .filter((s) => s.type === 'card')
    .reduce((sum, s) => sum + (s.rows?.length || 0), 0)
  if (!total) return null
  const ms = marksFor(entry.slug)
  const known = Object.values(ms).filter((m) => m === 'known').length
  return { known, total }
})

function switchSubTopic(name) {
  const t = currentTopic.value
  if (!t) return
  router.push(`/${t.slug}/${name}`)
}

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

onMounted(() => document.addEventListener('keydown', onGlobalKey))
onUnmounted(() => document.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <div class="min-h-screen bg-paper text-ink">
    <header
      class="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-hairline"
    >
      <div
        class="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-3 flex-wrap"
      >
        <RouterLink
          to="/"
          class="section-label text-ink hover:text-accent whitespace-nowrap"
        >cheatsheets</RouterLink>

        <span class="text-hairline" aria-hidden="true">/</span>

        <div v-if="currentCheatsheet" class="flex items-baseline gap-2 min-w-0">
          <span class="text-xs font-semibold truncate">
            {{ currentCheatsheet.frontmatter.title }}
          </span>
          <span
            v-if="currentSubTopicName"
            class="text-2xs text-muted tabular-nums"
          >{{ currentSubTopicName }}</span>
        </div>

        <div class="flex-1"></div>

        <span
          v-if="progress"
          class="text-2xs text-muted tabular-nums whitespace-nowrap"
          :title="`${progress.known} of ${progress.total} rows marked known`"
        >{{ progress.known }}/{{ progress.total }} known</span>

        <SubTopicSwitcher
          v-if="currentTopic && currentTopic.subtopics.length > 1 && currentSubTopicName"
          :subtopics="currentTopic.subtopics"
          :current="currentSubTopicName"
          @switch="switchSubTopic"
        />

        <SearchBar ref="searchRef" v-model="searchQuery" />
      </div>
    </header>

    <main class="max-w-[1400px] mx-auto px-4 py-6">
      <RouterView />
    </main>

    <Toast :message="toastState.message" :visible="toastState.visible" />
  </div>
</template>
