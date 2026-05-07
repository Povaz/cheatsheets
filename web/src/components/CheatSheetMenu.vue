<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { topics } from '../lib/content.js'

const route = useRoute()
const open = ref(false)
const root = ref(null)

const activeTopic = computed(() => route.params.topic || null)
const activeSlug = computed(() =>
  route.params.topic && route.params.subtopic
    ? `${route.params.topic}/${route.params.subtopic}`
    : null,
)

watch(
  () => route.fullPath,
  () => {
    if (open.value) close()
  },
)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

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
  <div ref="root" class="relative flex items-center">
    <button
      type="button"
      class="text-hairline text-2xs px-1 cursor-pointer hover:text-accent transition-colors"
      :class="{ 'text-accent': open }"
      title="browse cheatsheets"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="toggle"
    >/</button>

    <div
      v-if="open"
      class="absolute left-0 top-full mt-2 w-72 bg-white border border-hairline rounded-sm shadow-card overflow-hidden z-50"
    >
      <header class="px-3 py-1 border-b border-hairline">
        <h2 class="label-soft">cheatsheets</h2>
      </header>

      <div v-if="topics.length === 0" class="px-3 py-2 text-2xs text-muted">
        no sheets yet
      </div>

      <ul v-else class="py-1 max-h-[70vh] overflow-y-auto">
        <li
          v-for="t in topics"
          :key="t.slug"
          class="px-3 py-1.5"
          :class="t.slug === activeTopic ? 'border-l-2 border-accent' : 'border-l-2 border-transparent'"
        >
          <RouterLink
            :to="`/${t.slug}`"
            class="block text-xs font-semibold truncate"
            :class="t.slug === activeTopic ? 'text-accent' : 'text-ink hover:text-accent'"
            @click="close"
          >{{ t.title }}</RouterLink>
          <div v-if="t.subtopics.length" class="flex flex-wrap gap-1 mt-1">
            <RouterLink
              v-for="s in t.subtopics"
              :key="s.name"
              :to="`/${s.slug}`"
              class="pill transition-colors"
              :class="
                s.slug === activeSlug
                  ? 'bg-ink text-paper border-ink'
                  : 'hover:border-accent hover:text-accent hover:bg-accent/5'
              "
              @click="close"
            >{{ s.name }}</RouterLink>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
