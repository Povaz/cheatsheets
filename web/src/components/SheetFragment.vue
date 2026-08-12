<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { searchQuery, isSmallScreen } from '../store.js'

const props = defineProps({ html: { type: String, required: true } })
const body = ref(null)
const toc = ref([])          // [{ id, title }]
const activeId = ref('')
let observer = null

function buildToc() {
  toc.value = [...body.value.querySelectorAll('section[id]')].map((s, i) => ({
    id: s.id, num: String(i + 1).padStart(2, '0'), title: s.querySelector('h2')?.textContent ?? s.id,
  }))
}
function goTo(id) {
  const el = body.value.querySelector(`section[id="${id}"]`)
  if (!el) return
  const scrollRoot = body.value.closest('.sheet-body')
  if (scrollRoot) {
    scrollRoot.scrollTo({ top: el.offsetTop - scrollRoot.offsetTop, behavior: 'smooth' })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
function spy() {
  observer?.disconnect()
  const scrollRoot = body.value.closest('.sheet-body')
  observer = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) activeId.value = e.target.id
  }, { root: scrollRoot, rootMargin: '-10% 0px -70% 0px' })
  body.value.querySelectorAll('section[id]').forEach(s => observer.observe(s))
}

function clearHits() {
  body.value.querySelectorAll('mark.search-hit').forEach(m => {
    m.replaceWith(document.createTextNode(m.textContent))
  })
  body.value.normalize()     // AC-sheet-search.2: restore exactly
}
function applyHits(q) {
  const walker = document.createTreeWalker(body.value, NodeFilter.SHOW_TEXT)
  const needle = q.toLowerCase(); const targets = []
  let n
  while ((n = walker.nextNode())) if (n.textContent.toLowerCase().includes(needle)) targets.push(n)
  for (const node of targets) {
    const frag = document.createDocumentFragment()
    let rest = node.textContent, i
    while ((i = rest.toLowerCase().indexOf(needle)) !== -1) {
      frag.append(rest.slice(0, i))
      const mark = document.createElement('mark')
      mark.className = 'search-hit'; mark.textContent = rest.slice(i, i + needle.length)
      frag.append(mark); rest = rest.slice(i + needle.length)
    }
    frag.append(rest); node.replaceWith(frag)
  }
}
watch(searchQuery, q => { clearHits(); if (q?.trim()) applyHits(q.trim()) })
watch(() => props.html, () => nextTick(() => { buildToc(); spy(); if (searchQuery.value?.trim()) applyHits(searchQuery.value.trim()) }))
onMounted(() => { buildToc(); spy(); if (searchQuery.value?.trim()) applyHits(searchQuery.value.trim()) })
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="flex gap-8 items-start">
    <nav v-if="!isSmallScreen" class="sticky top-4 w-56 shrink-0 text-sm max-h-[calc(100vh-12rem)] overflow-y-auto" aria-label="Table of contents">
      <p class="uppercase tracking-widest text-xs font-bold opacity-60 mb-2">Contents</p>
      <ol>
        <li v-for="t in toc" :key="t.id">
          <button type="button" class="block w-full text-left py-1 px-2 rounded hover:opacity-100 flex gap-2"
                  :class="t.id === activeId ? 'font-semibold opacity-100' : 'opacity-70'"
                  @click="goTo(t.id)"><span class="font-mono text-xs opacity-50 tabular-nums shrink-0 pt-px">{{ t.num }}</span><span>{{ t.title }}</span></button>
        </li>
      </ol>
    </nav>
    <div class="min-w-0 flex-1">
      <details v-if="isSmallScreen" class="mb-4 border rounded-lg px-3 py-2" style="border-color: rgb(var(--c-hairline))">
        <summary class="cursor-pointer font-semibold text-sm py-1">Contents</summary>
        <ol class="pb-2">
          <li v-for="t in toc" :key="t.id">
            <button type="button" class="block w-full text-left py-1 text-sm opacity-80 flex gap-2" @click="goTo(t.id)"><span class="font-mono text-xs opacity-50 tabular-nums shrink-0">{{ t.num }}</span><span>{{ t.title }}</span></button>
          </li>
        </ol>
      </details>
      <!-- First-party content whose shape the build-time validator guarantees (HLDD §3.5) -->
      <div ref="body" class="sheet-fragment" v-html="html"></div>
    </div>
  </div>
</template>
