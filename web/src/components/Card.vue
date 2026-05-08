<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  accent: { type: String, default: null },
})

const topBorderStyle = computed(() =>
  props.accent ? { borderTop: `3px solid ${props.accent}` } : null,
)
</script>

<template>
  <section
    class="bg-surface border border-hairline rounded-sm shadow-card overflow-hidden flex flex-col"
    :data-section-id="id"
    :style="topBorderStyle"
  >
    <header class="px-3 py-1 border-b border-hairline">
      <h2 class="section-label card-title">{{ title }}</h2>
    </header>
    <div class="flex flex-col">
      <slot />
    </div>
  </section>
</template>
