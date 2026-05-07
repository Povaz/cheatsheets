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
    <span class="label-soft mr-2" :class="kind === 'warn' ? 'text-status-4xx-soft' : 'text-status-2xx-soft'">{{ kind }}</span>
    <span v-html="formatInline(text)" />
  </div>
</template>
