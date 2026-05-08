<script setup>
import { escapeHtml, formatInline, highlight } from '../lib/format.js'
import { searchQuery } from '../store.js'

defineProps({
  row: { type: Object, required: true },
  dimmed: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="grid items-baseline gap-3 px-3 py-1 border-b border-hairline/60 last:border-b-0 transition-colors hover:bg-paper-warm"
    :class="dimmed ? 'opacity-60' : ''"
    :style="{ gridTemplateColumns: 'max-content minmax(0, 1fr)' }"
  >
    <span class="pill" v-html="highlight(escapeHtml(row.pill), searchQuery)" />
    <span class="text-muted" v-html="highlight(formatInline(row.desc), searchQuery)" />
  </div>
</template>
