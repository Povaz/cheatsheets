<script setup>
import { computed, ref } from 'vue'
import { findSubTopic } from '../lib/content.js'
import { searchQuery, showToast } from '../store.js'
import { rowMatches, formatInline } from '../lib/format.js'
import { STATUS_ACCENTS } from '../lib/accents.js'
import Card from '../components/Card.vue'
import CodeRow from '../components/CodeRow.vue'
import PillRow from '../components/PillRow.vue'
import Callout from '../components/Callout.vue'
import DetailModal from '../components/DetailModal.vue'

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

function openDetail(section, row) {
  modalRow.value = row
  modalTitle.value = section.title
  modalColumns.value = section.columns
  modalOpen.value = true
}

function closeDetail() {
  modalOpen.value = false
}

function doCopy(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast('copied'),
      () => showToast('copy failed'),
    )
  } else {
    showToast('clipboard unavailable')
  }
}

function sectionSpan(section) {
  return section.attrs?.span === 'full' ? 'card-span-all' : ''
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
      :key="ch.id || `ch-${ci}`"
      class="chapter"
    >
      <hr v-if="ch.title" class="chapter-divider" />
      <div class="chapter-body">
        <div
          v-if="ch.title"
          class="chapter-rail"
          :class="ci === 0 ? 'chapter-rail--accent' : ''"
        >{{ ch.title }}</div>
        <div :class="ch.type === 'vertical' ? 'cards-vertical' : 'cards-masonry'">
          <Card
            v-for="section in ch.sections"
            :key="section.id"
            :id="section.id"
            :title="section.title"
            :accent="sectionAccent(section)"
            :class="sectionSpan(section)"
          >
            <template v-if="section.type === 'card'">
              <CodeRow
                v-for="(row, i) in section.rows"
                :key="i"
                :row="row"
                :columns="section.columns"
                :dimmed="!rowMatches(row, searchQuery)"
                :has-detail="!!row.detail"
                :show-detail="ch.type === 'vertical'"
                @copy="doCopy"
                @open-detail="openDetail(section, row)"
              />
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
                <pre class="overflow-x-auto text-xs leading-relaxed"><code>{{ block.code }}</code></pre>
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
                  v-html="formatInline(item)"
                />
              </ul>
            </template>

            <Callout
              v-for="(c, i) in section.callouts"
              :key="`callout-${i}`"
              :kind="c.kind"
              :text="c.text"
            />
          </Card>
        </div>
      </div>
    </section>

    <DetailModal
      :open="modalOpen"
      :title="modalTitle"
      :row="modalRow"
      :columns="modalColumns"
      @close="closeDetail"
    />
  </div>
</template>
