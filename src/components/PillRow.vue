<script setup>
import { formatInline } from '../lib/format.js'

defineProps({
  row: { type: Object, required: true },
  dimmed: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="grid items-baseline gap-3 px-3 py-1.5 border-b border-hairline/60 last:border-b-0 transition-opacity"
    :class="dimmed ? 'opacity-25' : ''"
    :style="{ gridTemplateColumns: 'max-content minmax(0, 1fr)' }"
  >
    <span class="pill">{{ row.pill }}</span>
    <span class="text-muted" v-html="formatInline(row.desc)" />
  </div>
</template>
