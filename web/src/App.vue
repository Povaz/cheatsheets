<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findTopic } from './lib/content.js'
import { isSmallScreen } from './store.js'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const router = useRouter()

const currentTopic = computed(() =>
  route.params.topic ? findTopic(route.params.topic) : null,
)

const currentSubTopicName = computed(() => route.params.subtopic || null)

function onGlobalKey(e) {
  const tag = e.target?.tagName
  const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable

  if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault()
    const searchInput = document.querySelector('.sheet-search-input')
    if (searchInput) { searchInput.focus(); searchInput.select() }
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
  <div class="app-shell">
    <Sidebar v-if="!isSmallScreen" variant="rail" />
    <div class="sheet-quadrant">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
}
.sheet-quadrant {
  flex: 1 1 0;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgb(var(--c-paper));
}
</style>
