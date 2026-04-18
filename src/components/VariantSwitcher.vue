<script setup>
defineProps({
  variants: { type: Array, required: true },
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
        v-for="v in variants"
        :key="v.variant"
        type="button"
        class="px-2 py-0.5 text-xs rounded border transition-colors"
        :class="
          v.variant === current
            ? 'border-accent text-accent bg-accent/5'
            : 'border-hairline text-muted hover:text-ink hover:border-ink/30'
        "
        @click="$emit('switch', v.variant)"
      >
        {{ v.variant }}
      </button>
    </div>
  </div>
</template>
