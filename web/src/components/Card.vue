<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  collapsed: { type: Boolean, default: false },
  accent: { type: String, default: null },
})

defineEmits(['toggle-collapse'])

const topBorderStyle = computed(() =>
  props.accent ? { borderTop: `3px solid ${props.accent}` } : null,
)
</script>

<template>
  <section
    class="bg-white border border-hairline rounded-sm shadow-card overflow-hidden flex flex-col"
    :data-section-id="id"
    :style="topBorderStyle"
  >
    <header
      class="flex items-center justify-between px-3 py-2 border-b border-hairline cursor-pointer select-none hover:bg-paper transition-colors"
      role="button"
      :aria-expanded="!collapsed"
      @click="$emit('toggle-collapse')"
    >
      <h2 class="section-label">{{ title }}</h2>
      <div class="flex items-center gap-3 text-2xs text-muted">
        <span
          class="inline-block transition-transform"
          :class="{ '-rotate-90': collapsed }"
        >▾</span>
      </div>
    </header>
    <div v-show="!collapsed" class="flex flex-col">
      <slot />
    </div>
  </section>
</template>
