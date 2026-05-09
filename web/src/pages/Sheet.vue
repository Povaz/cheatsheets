<script setup>
import { computed, ref } from 'vue'
import { findSubTopic } from '../lib/content.js'
import { searchQuery, effectiveChapterSetting, setChapterOverride } from '../store.js'
import { cardHasMatch, escapeHtml, formatCaption, formatInline, highlight, rowMatches, visibleColumns } from '../lib/format.js'
import { STATUS_ACCENTS } from '../lib/accents.js'
import Card from '../components/Card.vue'
import CodeRow from '../components/CodeRow.vue'
import PillRow from '../components/PillRow.vue'
import Callout from '../components/Callout.vue'
import DetailModal from '../components/DetailModal.vue'
import SourcesFooter from '../components/SourcesFooter.vue'
import ChapterSettingsPopover from '../components/ChapterSettingsPopover.vue'

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

function isCollapsed(ch) {
  if (!ch.title) return false
  if (searchQuery.value) return false
  return effectiveChapterSetting(ch.id, 'collapsed')
}

function toggleChapter(ch) {
  if (!ch.title) return
  setChapterOverride(ch.id, 'collapsed', !effectiveChapterSetting(ch.id, 'collapsed'))
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

function chapterType(ch) {
  return effectiveChapterSetting(ch.id, 'type')
}

function chapterStyle(ch) {
  return {
    '--body-size': `${effectiveChapterSetting(ch.id, 'bodySize')}px`,
    '--card-title-size': `${effectiveChapterSetting(ch.id, 'cardTitleSize')}px`,
    '--chapter-title-size': `${effectiveChapterSetting(ch.id, 'chapterTitleSize')}px`,
    '--cards-cols': String(effectiveChapterSetting(ch.id, 'cols')),
  }
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
      :class="{ 'chapter--collapsed': isCollapsed(ch) }"
      :style="chapterStyle(ch)"
    >
      <hr v-if="ch.title" class="chapter-divider" />
      <div class="chapter-body">
        <div v-if="ch.title" class="chapter-rail-wrap">
          <ChapterSettingsPopover :chapter-id="ch.id" />
          <button
            type="button"
            class="chapter-rail"
            :class="['chapter-rail--accent', 'chapter-rail--clickable']"
            :aria-expanded="!isCollapsed(ch)"
            :title="isCollapsed(ch) ? 'Expand chapter' : 'Collapse chapter'"
            @click="toggleChapter(ch)"
          >
            <span class="chapter-rail-title">{{ ch.title }}</span>
            <span
              v-if="isCollapsed(ch)"
              class="chapter-rail-summary"
            >
              <span
                v-for="(s, si) in ch.sections"
                :key="s.id || si"
                class="chapter-rail-summary-item"
              >{{ s.title }}</span>
            </span>
          </button>
        </div>
        <div
          v-if="!isCollapsed(ch)"
          :class="chapterType(ch) === 'vertical' ? 'cards-vertical' : 'cards-masonry'"
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
                  :style="{ gridTemplateColumns: cardGridColumns(section, chapterType(ch) === 'vertical') }"
                >
                  <CodeRow
                    v-for="(row, i) in section.rows"
                    :key="i"
                    :row="row"
                    :columns="section.columns"
                    :dimmed="!rowMatches(row, searchQuery)"
                    :has-detail="!!row.detail"
                    :show-detail="chapterType(ch) === 'vertical'"
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
                <div v-for="(block, i) in section.blocks" :key="i" class="min-w-0 px-3 py-2 space-y-2">
                  <div v-if="block.heading" class="section-label">{{ block.heading }}</div>
                  <pre class="max-w-full overflow-x-auto text-xs leading-relaxed bg-paper-warm border border-hairline rounded-sm p-2"><code v-html="highlight(escapeHtml(block.code), searchQuery)" /></pre>
                  <div v-if="block.caption" class="callout-why">
                    <span class="label-soft mr-2 text-status-3xx-soft">why</span>
                    <span v-html="highlight(formatCaption(block.caption), searchQuery)" />
                  </div>
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
