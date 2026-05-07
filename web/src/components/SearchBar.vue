<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const input = ref(null)

function focus() {
  input.value?.focus()
  input.value?.select()
}

function blur() {
  input.value?.blur()
}

function onKey(e) {
  if (e.key === 'Escape') {
    if (props.modelValue) {
      emit('update:modelValue', '')
      e.preventDefault()
    } else {
      blur()
    }
  }
}

defineExpose({ focus, blur })
</script>

<template>
  <div class="relative">
    <input
      ref="input"
      type="search"
      :value="modelValue"
      placeholder="/ to search"
      class="w-40 md:w-56 px-2 py-1 border border-hairline rounded-sm bg-white text-xs focus:border-accent placeholder:text-muted"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown="onKey"
    />
    <kbd
      v-if="!modelValue"
      class="kbd absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
    >/</kbd>
  </div>
</template>
