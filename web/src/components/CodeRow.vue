<script setup>
import { computed } from 'vue'
import { formatInline, highlight } from '../lib/format.js'
import { searchQuery } from '../store.js'

const props = defineProps({
  row: { type: Object, required: true },
  columns: { type: Array, required: true },
  dimmed: { type: Boolean, default: false },
})

const topColumns = computed(() => props.columns.filter((c) => c !== 'detail'))

const hasDetail = computed(
  () => props.columns.includes('detail') && !!props.row.detail,
)

function cellClass(_col, index) {
  if (index === 0) return 'font-semibold text-ink'
  return 'text-muted'
}
</script>

<template>
  <div
    class="grid col-span-full px-3 py-1 border-b border-hairline/60 last:border-b-0 items-baseline transition-colors hover:bg-paper-warm"
    :class="dimmed ? 'opacity-60' : ''"
    style="grid-template-columns: subgrid;"
  >
    <span
      v-for="(col, i) in topColumns"
      :key="col"
      :class="cellClass(col, i)"
      v-html="highlight(formatInline(row[col], { plainCode: i === 0 }), searchQuery)"
    />
    <div
      v-if="hasDetail"
      class="card-detail-row"
      v-html="highlight(formatInline(row.detail), searchQuery)"
    />
  </div>
</template>
