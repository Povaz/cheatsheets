<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { findSubTopic } from '../lib/content.js'
import SheetFragment from '../components/SheetFragment.vue'
import SourcesFooter from '../components/SourcesFooter.vue'

const props = defineProps({
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
})

const entry = computed(() => findSubTopic(props.topic, props.subtopic))

onMounted(() => document.documentElement.classList.add('sheet-lock'))
onUnmounted(() => document.documentElement.classList.remove('sheet-lock'))
</script>

<template>
  <div v-if="!entry" class="text-muted">
    Sheet not found.
    <RouterLink to="/" class="underline decoration-hairline hover:decoration-accent">back</RouterLink>.
  </div>
  <div v-else class="sheet-page">
    <header class="sheet-page-header">
      <div class="flex items-baseline gap-3 flex-wrap">
        <h1 class="font-serif text-4xl md:text-5xl font-extrabold leading-none">
          {{ entry.frontmatter.title }}
        </h1>
        <span
          class="font-serif text-3xl font-extrabold text-muted leading-none"
        >{{ entry.name }}</span>
      </div>
      <p v-if="entry.frontmatter.subtitle" class="text-muted text-sm mt-1">
        {{ entry.frontmatter.subtitle }}
      </p>
    </header>

    <div class="sheet-page-body">
      <SheetFragment :html="entry.fragmentHtml" />
      <SourcesFooter :sources="entry.sources" />
    </div>
  </div>
</template>
