<script setup>
import { computed } from 'vue'
import { formatInline } from '../lib/format.js'

const props = defineProps({
  kind: { type: String, required: true },
  text: { type: String, required: true },
})

const klass = computed(() =>
  props.kind === 'warn' ? 'callout-warn' : 'callout-tip',
)
</script>

<template>
  <div :class="klass" class="mx-3 my-2">
    <span class="section-label mr-2">{{ kind }}</span>
    <span v-html="formatInline(text)" />
  </div>
</template>
