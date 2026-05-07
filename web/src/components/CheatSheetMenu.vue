<script>
import { ref } from 'vue'

// Module-scoped so only one CheatSheetMenu instance is open at a time.
const openMenuId = ref(null)
let nextId = 0
function getId() { return ++nextId }
</script>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { topics, findTopic } from '../lib/content.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'topics',
    validator: (v) => v === 'topics' || v === 'subtopics',
  },
})

const route = useRoute()
const open = ref(false)
const root = ref(null)
const myId = getId()

const activeTopic = computed(() => route.params.topic || null)
const activeSlug = computed(() =>
  route.params.topic && route.params.subtopic
    ? `${route.params.topic}/${route.params.subtopic}`
    : null,
)
const currentTopic = computed(() =>
  activeTopic.value ? findTopic(activeTopic.value) : null,
)

const items = computed(() => {
  if (props.mode === 'topics') {
    return topics.filter((t) => t.slug !== activeTopic.value)
  }
  return currentTopic.value
    ? currentTopic.value.subtopics.filter((s) => s.slug !== activeSlug.value)
    : []
})

watch(
  () => route.fullPath,
  () => { if (open.value) close() },
)

watch(openMenuId, (id) => {
  if (id !== myId && open.value) open.value = false
})

function toggle() {
  if (open.value) {
    close()
  } else {
    open.value = true
    openMenuId.value = myId
  }
}

function close() {
  open.value = false
  if (openMenuId.value === myId) openMenuId.value = null
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
  <div v-if="items.length > 0" ref="root" class="relative flex items-center">
    <button
      type="button"
      class="menu-slash"
      :class="{ 'menu-slash--open': open }"
      :title="mode === 'topics' ? 'browse cheatsheets' : 'switch sheet'"
      :aria-label="mode === 'topics' ? 'browse cheatsheets' : 'switch sheet'"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="toggle"
    >/</button>

    <div
      v-if="open && mode === 'topics'"
      class="absolute left-0 top-full mt-2 w-72 bg-paper-warm border border-hairline rounded-sm shadow-card overflow-hidden z-50"
    >
      <ul class="py-1 max-h-[70vh] overflow-y-auto">
        <li v-for="t in items" :key="t.slug">
          <RouterLink
            :to="`/${t.slug}`"
            class="block px-3 py-1.5 text-xs font-semibold truncate text-ink hover:text-accent"
            @click="close"
          >{{ t.title }}</RouterLink>
        </li>
      </ul>
    </div>

    <div
      v-else-if="open && mode === 'subtopics'"
      class="absolute left-0 top-full mt-2 w-56 bg-paper-warm border border-hairline rounded-sm shadow-card overflow-hidden z-50"
    >
      <ul class="py-1 max-h-[70vh] overflow-y-auto">
        <li v-for="s in items" :key="s.name">
          <RouterLink
            :to="`/${s.slug}`"
            class="block px-3 py-1.5 text-xs text-ink hover:text-accent"
            @click="close"
          >{{ s.name }}</RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
