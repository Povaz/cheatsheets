<script setup>
import { computed } from 'vue'
import { formatInline, visibleColumns as visibleColumnsOf } from '../lib/format.js'

const props = defineProps({
  row: { type: Object, required: true },
  columns: { type: Array, required: true },
  dimmed: { type: Boolean, default: false },
  hasDetail: { type: Boolean, default: false },
  showDetail: { type: Boolean, default: false },
})

const emit = defineEmits(['open-detail'])

const visibleColumns = computed(() =>
  visibleColumnsOf(props.columns, props.showDetail),
)

function cellClass(_col, index) {
  if (index === 0) return 'font-semibold text-ink'
  return 'text-muted'
}

const rowClickable = computed(() => props.hasDetail && !props.showDetail)

function onRowClick() {
  if (rowClickable.value) emit('open-detail')
}
</script>

<template>
  <div
    class="grid col-span-full px-3 py-1 border-b border-hairline/60 last:border-b-0 items-baseline transition-colors hover:bg-paper-warm"
    :class="[
      dimmed ? 'opacity-60' : '',
      rowClickable ? 'cursor-pointer' : '',
    ]"
    style="grid-template-columns: subgrid;"
    @click="onRowClick"
  >
    <span
      v-for="(col, i) in visibleColumns"
      :key="col"
      :class="cellClass(col, i)"
      v-html="formatInline(row[col], { plainCode: i === 0 })"
    />
  </div>
</template>
