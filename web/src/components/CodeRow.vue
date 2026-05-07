<script setup>
import { computed } from 'vue'
import { formatInline } from '../lib/format.js'

const props = defineProps({
  row: { type: Object, required: true },
  columns: { type: Array, required: true },
  dimmed: { type: Boolean, default: false },
  hasDetail: { type: Boolean, default: false },
  showDetail: { type: Boolean, default: false },
})

const emit = defineEmits(['copy', 'open-detail'])

const visibleColumns = computed(() =>
  props.showDetail
    ? props.columns
    : props.columns.filter((c) => c !== 'detail'),
)

const gridTemplate = computed(() => {
  const n = visibleColumns.value.length
  const first = 'var(--row-first-col, max-content)'
  if (n === 0) return '22px'
  if (n === 1) return `${first} 22px`
  if (n === 2) return `${first} minmax(0, 1fr) 22px`
  const extras = Array(n - 2).fill('minmax(0, 1.5fr)').join(' ')
  return `${first} minmax(0, 1fr) ${extras} 22px`
})

function cellClass(_col, index) {
  if (index === 0) return 'font-semibold text-ink'
  return 'text-muted'
}

function onCopyClick(e) {
  e.stopPropagation()
  const text = visibleColumns.value
    .map((c) => props.row[c])
    .filter(Boolean)
    .join(' — ')
  emit('copy', text)
}

const rowClickable = computed(() => props.hasDetail && !props.showDetail)

function onRowClick() {
  if (rowClickable.value) emit('open-detail')
}
</script>

<template>
  <div
    class="group grid gap-x-3 px-3 py-1 border-b border-hairline/60 last:border-b-0 items-baseline transition-colors hover:bg-paper-warm"
    :class="[
      dimmed ? 'opacity-60' : '',
      rowClickable ? 'cursor-pointer' : '',
    ]"
    :style="{ gridTemplateColumns: gridTemplate }"
    @click="onRowClick"
  >
    <span
      v-for="(col, i) in visibleColumns"
      :key="col"
      :class="cellClass(col, i)"
      v-html="formatInline(row[col], { plainCode: i === 0 })"
    />
    <button
      type="button"
      class="opacity-30 group-hover:opacity-100 tool-btn transition-opacity text-[10px]"
      title="copy row"
      @click="onCopyClick"
    >⧉</button>
  </div>
</template>
