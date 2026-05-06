<script setup>
defineProps({
  subtopics: { type: Array, required: true },
  current: { type: String, default: null },
  label: { type: String, default: null },
})

defineEmits(['switch'])
</script>

<template>
  <div class="flex items-center gap-2">
    <span v-if="label" class="section-label">{{ label }}</span>
    <div class="flex items-center gap-1">
      <button
        v-for="s in subtopics"
        :key="s.name"
        type="button"
        class="px-2 py-0.5 text-xs rounded border transition-colors"
        :class="
          s.name === current
            ? 'border-accent text-accent bg-accent/5'
            : 'border-hairline text-muted hover:text-ink hover:border-ink/30'
        "
        @click="$emit('switch', s.name)"
      >
        {{ s.name }}
      </button>
    </div>
  </div>
</template>
