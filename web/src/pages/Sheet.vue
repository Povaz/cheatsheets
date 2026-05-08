<script setup>
import { computed, ref, watch } from 'vue'
import { findSubTopic } from '../lib/content.js'
import { searchQuery } from '../store.js'
import { cardHasMatch, escapeHtml, formatInline, highlight, rowMatches, visibleColumns } from '../lib/format.js'
import { STATUS_ACCENTS } from '../lib/accents.js'
import Card from '../components/Card.vue'
import CodeRow from '../components/CodeRow.vue'
import PillRow from '../components/PillRow.vue'
import Callout from '../components/Callout.vue'
import DetailModal from '../components/DetailModal.vue'
import SourcesFooter from '../components/SourcesFooter.vue'

const props = defineProps({
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
})

const entry = computed(() => findSubTopic(props.topic, props.subtopic))
const cheatsheet = computed(() => entry.value?.cheatsheet || null)

function sectionAccent(section) {
  const a = section.attrs?.accent
  if (!a || a === 'neutral') return null
  return STATUS_ACCENTS[a] ?? a
}

const modalOpen = ref(false)
const modalRow = ref(null)
const modalTitle = ref('')
const modalColumns = ref([])

const expandedChapters = ref(new Set())

watch(
  () => `${props.topic}/${props.subtopic}`,
  () => { expandedChapters.value = new Set() },
)

function isCollapsed(ch, ci) {
  if (!ch.title) return false
  if (searchQuery.value) return false
  return !expandedChapters.value.has(ci)
}

function toggleChapter(ch, ci) {
  if (!ch.title) return
  const next = new Set(expandedChapters.value)
  if (next.has(ci)) next.delete(ci)
  else next.add(ci)
  expandedChapters.value = next
}

function openDetail(section, row) {
  modalRow.value = row
  modalTitle.value = section.title
  modalColumns.value = section.columns
  modalOpen.value = true
}

function closeDetail() {
  modalOpen.value = false
}

function sectionSpan(section) {
  return section.attrs?.span === 'full' ? 'card-span-all' : ''
}

function showBody(section) {
  return !searchQuery.value || cardHasMatch(section, searchQuery.value)
}

function cardGridColumns(section, showDetail) {
  const n = visibleColumns(section.columns, showDetail).length
  const first = 'var(--row-first-col, max-content)'
  if (n === 0) return ''
  if (n === 1) return first
  if (n === 2) return `${first} minmax(0, 1fr)`
  const extras = Array(n - 2).fill('minmax(0, 1.5fr)').join(' ')
  return `${first} minmax(0, 1fr) ${extras}`
}
</script>

<template>
  <div v-if="!entry" class="text-muted">
    Sheet not found.
    <RouterLink to="/" class="underline decoration-hairline hover:decoration-accent">back</RouterLink>.
  </div>
  <div v-else class="space-y-6">
    <header class="space-y-1">
      <div class="flex items-baseline gap-3 flex-wrap">
        <h1 class="font-serif text-4xl md:text-5xl font-extrabold leading-none">
          {{ cheatsheet.frontmatter.title }}
        </h1>
        <span
          class="font-serif text-3xl font-extrabold text-muted leading-none"
        >{{ entry.name }}</span>
      </div>
      <p v-if="cheatsheet.frontmatter.subtitle" class="text-muted text-sm">
        {{ cheatsheet.frontmatter.subtitle }}
      </p>
    </header>

    <section
      v-for="(ch, ci) in cheatsheet.chapters"
      :key="ci"
      class="chapter"
      :class="{ 'chapter--collapsed': isCollapsed(ch, ci) }"
    >
      <hr v-if="ch.title" class="chapter-divider" />
      <div class="chapter-body">
        <button
          v-if="ch.title"
          type="button"
          class="chapter-rail"
          :class="[ci === 0 ? 'chapter-rail--accent' : '', 'chapter-rail--clickable']"
          :aria-expanded="!isCollapsed(ch, ci)"
          :title="isCollapsed(ch, ci) ? 'Expand chapter' : 'Collapse chapter'"
          @click="toggleChapter(ch, ci)"
        >
          <span class="chapter-rail-title">{{ ch.title }}</span>
          <span
            v-if="isCollapsed(ch, ci)"
            class="chapter-rail-summary"
          >
            <span
              v-for="(s, si) in ch.sections"
              :key="s.id || si"
              class="chapter-rail-summary-item"
            >{{ s.title }}</span>
          </span>
        </button>
        <div
          v-if="!isCollapsed(ch, ci)"
          :class="ch.type === 'vertical' ? 'cards-vertical' : 'cards-masonry'"
        >
          <Card
            v-for="section in ch.sections"
            :key="section.id"
            :id="section.id"
            :title="section.title"
            :accent="sectionAccent(section)"
            :class="sectionSpan(section)"
          >
            <div :class="{ 'card-body--blank': !showBody(section) }">
              <template v-if="section.type === 'card'">
                <div
                  class="grid gap-x-3"
                  :style="{ gridTemplateColumns: cardGridColumns(section, ch.type === 'vertical') }"
                >
                  <CodeRow
                    v-for="(row, i) in section.rows"
                    :key="i"
                    :row="row"
                    :columns="section.columns"
                    :dimmed="!rowMatches(row, searchQuery)"
                    :has-detail="!!row.detail"
                    :show-detail="ch.type === 'vertical'"
                    @open-detail="openDetail(section, row)"
                  />
                </div>
              </template>

              <template v-else-if="section.type === 'pills'">
                <PillRow
                  v-for="(row, i) in section.rows"
                  :key="i"
                  :row="row"
                  :dimmed="!rowMatches(row, searchQuery)"
                />
              </template>

              <template v-else-if="section.type === 'code'">
                <div v-for="(block, i) in section.blocks" :key="i" class="px-3 py-2">
                  <pre class="overflow-x-auto text-xs leading-relaxed"><code v-html="highlight(escapeHtml(block.code), searchQuery)" /></pre>
                </div>
              </template>

              <template v-else-if="section.type === 'diagram'">
                <div
                  v-for="(block, i) in section.blocks"
                  :key="i"
                  class="px-3 py-2"
                  v-html="block.code"
                />
              </template>

              <template v-else-if="section.type === 'text'">
                <ul class="px-4 py-2 space-y-1 list-disc list-outside">
                  <li
                    v-for="(item, i) in section.items"
                    :key="i"
                    class="ml-2"
                    v-html="highlight(formatInline(item), searchQuery)"
                  />
                </ul>
              </template>

              <Callout
                v-for="(c, i) in section.callouts"
                :key="`callout-${i}`"
                :kind="c.kind"
                :text="c.text"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>

    <SourcesFooter :sources="entry.sources" />

    <DetailModal
      :open="modalOpen"
      :title="modalTitle"
      :row="modalRow"
      :columns="modalColumns"
      @close="closeDetail"
    />
  </div>
</template>
