<script setup>
import { computed } from 'vue'
import { findTopic } from '../lib/content.js'
import Cheatsheet from './Cheatsheet.vue'

const props = defineProps({
  topic: { type: String, required: true },
})

const t = computed(() => findTopic(props.topic))
</script>

<template>
  <div v-if="!t" class="text-muted">
    Unknown topic. <RouterLink to="/" class="underline">back</RouterLink>.
  </div>
  <Cheatsheet v-else-if="t.isFlat" :topic="t.slug" :variant="null" />
  <div v-else class="space-y-6">
    <section>
      <h1 class="font-serif text-4xl font-extrabold leading-none">{{ t.title }}</h1>
      <p v-if="t.subtitle" class="text-muted text-sm mt-2">{{ t.subtitle }}</p>
    </section>
    <section class="space-y-3">
      <h2 class="section-label">variants</h2>
      <ul class="grid gap-3 cards2:grid-cols-2 cards3:grid-cols-3">
        <li v-for="v in t.variants" :key="v.variant">
          <RouterLink
            :to="`/${v.slug}`"
            class="block bg-white border border-hairline rounded-sm shadow-card p-3 hover:border-accent/60 transition-colors"
          >
            <div class="flex items-baseline justify-between gap-2">
              <span class="font-serif text-xl font-extrabold">{{ v.variant }}</span>
              <span class="section-label">variant</span>
            </div>
            <p class="text-xs text-muted mt-1">
              {{ v.cheatsheet.frontmatter.subtitle || '' }}
            </p>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>
