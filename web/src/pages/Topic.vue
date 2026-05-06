<script setup>
import { computed } from 'vue'
import { findTopic } from '../lib/content.js'

const props = defineProps({
  topic: { type: String, required: true },
})

const t = computed(() => findTopic(props.topic))
</script>

<template>
  <div v-if="!t" class="text-muted">
    Unknown CheatSheet. <RouterLink to="/" class="underline">back</RouterLink>.
  </div>
  <div v-else class="space-y-6">
    <section>
      <h1 class="font-serif text-4xl font-extrabold leading-none">{{ t.title }}</h1>
      <p v-if="t.subtitle" class="text-muted text-sm mt-2">{{ t.subtitle }}</p>
    </section>
    <section class="space-y-3">
      <h2 class="section-label">sheets</h2>
      <ul class="grid gap-3 cards2:grid-cols-2 cards3:grid-cols-3">
        <li v-for="s in t.subtopics" :key="s.name">
          <RouterLink
            :to="`/${s.slug}`"
            class="block bg-white border border-hairline rounded-sm shadow-card p-3 hover:border-accent/60 transition-colors"
          >
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-serif text-xl font-extrabold">{{ s.name }}</span>
              <span class="section-label">sheet</span>
            </div>
            <p class="text-xs text-muted mt-1">
              {{ s.cheatsheet.frontmatter.subtitle || '' }}
            </p>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>
