<script setup>
defineProps({
  subtopics: { type: Array, required: true },
  current: { type: String, default: null },
})

defineEmits(['switch'])
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex items-center gap-1">
      <button
        v-for="s in subtopics"
        :key="s.name"
        type="button"
        class="px-2 py-0.5 text-xs rounded border transition-colors"
        :class="
          s.name === current
            ? 'border-accent text-paper bg-accent'
            : 'border-hairline text-muted hover:text-accent hover:border-accent hover:bg-accent/5'
        "
        @click="$emit('switch', s.name)"
      >
        {{ s.name }}
      </button>
    </div>
  </div>
</template>
