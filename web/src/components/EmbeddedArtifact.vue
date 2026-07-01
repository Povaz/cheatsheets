<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { searchQuery } from '../store.js'

const props = defineProps({
  html: { type: String, required: true },
})

const frame = ref(null)
let resizeObserver = null

// The frame is isolated, so the app's theme-driven --c-search-hit var does not
// reach inside it. Use a fixed, high-contrast highlight that reads on any
// artifact background.
const HILITE_STYLE =
  'mark.search-hit{background:rgb(253 230 138);color:#1a1a1a;padding:0 1px;border-radius:2px}'

function frameDoc() {
  return frame.value?.contentDocument || null
}

function syncHeight() {
  const doc = frameDoc()
  if (!doc || !frame.value) return
  const h = doc.documentElement?.scrollHeight || doc.body?.scrollHeight || 0
  if (h) frame.value.style.height = `${h}px`
}

function clearHighlights(doc) {
  doc.querySelectorAll('mark.search-hit').forEach((mark) => {
    const parent = mark.parentNode
    if (!parent) return
    parent.replaceChild(doc.createTextNode(mark.textContent), mark)
    parent.normalize()
  })
}

function applyHighlights(doc, query) {
  // Matches are highlighted per text node (same as the app's card search), so a
  // query spanning element boundaries (e.g. across a <strong>) is not marked.
  const q = String(query || '').trim()
  clearHighlights(doc)
  if (!q || !doc.body) return
  const ql = q.toLowerCase()
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentNode
      if (!p || p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE') return NodeFilter.FILTER_REJECT
      if (!node.nodeValue || !node.nodeValue.toLowerCase().includes(ql)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const targets = []
  let n
  while ((n = walker.nextNode())) targets.push(n)
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  for (const node of targets) {
    const text = node.nodeValue
    re.lastIndex = 0
    const frag = doc.createDocumentFragment()
    let last = 0
    let m
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(doc.createTextNode(text.slice(last, m.index)))
      const mark = doc.createElement('mark')
      mark.className = 'search-hit'
      mark.textContent = m[0]
      frag.appendChild(mark)
      last = m.index + m[0].length
    }
    if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)))
    node.parentNode.replaceChild(frag, node)
  }
}

function onLoad() {
  const doc = frameDoc()
  if (!doc) return
  if (doc.head && !doc.head.querySelector('style[data-search-hit]')) {
    const style = doc.createElement('style')
    style.setAttribute('data-search-hit', '')
    style.textContent = HILITE_STYLE
    doc.head.appendChild(style)
  }
  syncHeight()
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(syncHeight)
  resizeObserver.observe(doc.documentElement)
  applyHighlights(doc, searchQuery.value)
}

watch(searchQuery, (q) => {
  const doc = frameDoc()
  if (doc) {
    applyHighlights(doc, q)
    syncHeight()
  }
})

onMounted(() => {
  frame.value?.addEventListener('load', onLoad)
  // Guard: if the frame already finished parsing before the listener attached.
  if (frame.value?.contentDocument?.readyState === 'complete') onLoad()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  frame.value?.removeEventListener('load', onLoad)
})
</script>

<template>
  <iframe
    ref="frame"
    :srcdoc="html"
    class="w-full block border-0 rounded-sm"
    style="min-height: 60vh;"
    title="Embedded artifact"
  />
</template>
