<script setup>
import { computed } from 'vue'
import { formatInline } from '../lib/format.js'

const props = defineProps({
  row: { type: Object, required: true },
  columns: { type: Array, required: true },
  dimmed: { type: Boolean, default: false },
  hasDetail: { type: Boolean, default: false },
})

const emit = defineEmits(['copy', 'open-detail'])

const visibleColumns = computed(() =>
  props.columns.filter((c) => c !== 'detail'),
)

const gridTemplate = computed(() => {
  const parts = []
  visibleColumns.value.forEach((_, i) => {
    if (i === 0) parts.push('max-content')
    else if (i === 1) parts.push('minmax(0, 1fr)')
    else parts.push('minmax(0, 1.5fr)')
  })
  parts.push('22px')
  return parts.join(' ')
})

function cellClass(col, index) {
  if (index === 0) return 'font-semibold text-ink whitespace-nowrap'
  if (col === 'desc' || col === 'notes') return 'text-muted'
  return ''
}

function onCopyClick(e) {
  e.stopPropagation()
  const text = visibleColumns.value
    .map((c) => props.row[c])
    .filter(Boolean)
    .join(' — ')
  emit('copy', text)
}

function onRowClick() {
  if (props.hasDetail) emit('open-detail')
}
</script>

<template>
  <div
    class="group grid gap-x-3 px-3 py-1 border-b border-hairline/60 last:border-b-0 items-baseline transition-opacity"
    :class="[
      dimmed ? 'opacity-25' : '',
      hasDetail ? 'cursor-pointer hover:bg-paper/70' : '',
    ]"
    :style="{ gridTemplateColumns: gridTemplate }"
    @click="onRowClick"
  >
    <span
      v-for="(col, i) in visibleColumns"
      :key="col"
      :class="cellClass(col, i)"
      v-html="formatInline(row[col])"
    />
    <button
      type="button"
      class="opacity-0 group-hover:opacity-100 tool-btn transition-opacity text-[10px]"
      title="copy row"
      @click="onCopyClick"
    >⧉</button>
  </div>
</template>
