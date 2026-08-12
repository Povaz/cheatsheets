<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findTopic } from './lib/content.js'
import { isSmallScreen } from './store.js'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const router = useRouter()

const sidebarVisible = ref(false)
watch(isSmallScreen, (small) => { if (!small) sidebarVisible.value = false })
watch(() => route.fullPath, () => { sidebarVisible.value = false })

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
    <Sidebar v-if="!isSmallScreen || sidebarVisible" :class="{ 'sidebar-overlay': isSmallScreen && sidebarVisible }" />
    <div v-if="isSmallScreen && sidebarVisible" class="sidebar-dim" @click="sidebarVisible = false"></div>
    <div class="sheet-quadrant">
      <button v-if="isSmallScreen" class="mobile-menu-btn" @click="sidebarVisible = !sidebarVisible">☰</button>
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
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 50;
}
.sidebar-dim {
  position: fixed;
  inset: 0;
  background: rgb(var(--c-overlay-rgb) / var(--overlay-alpha));
  z-index: 49;
}
.mobile-menu-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(var(--c-hairline));
  border-radius: 4px;
  background: rgb(var(--c-paper));
  color: rgb(var(--c-muted));
  font-size: 16px;
  cursor: pointer;
}
</style>
