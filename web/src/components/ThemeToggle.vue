<script setup>
import { computed } from 'vue'
import { theme, toggleTheme } from '../store.js'

const isDark = computed(() => theme.value === 'dark')
const label = computed(() =>
  isDark.value ? 'Switch to light theme' : 'Switch to dark theme'
)
</script>

<template>
  <button
    type="button"
    class="tool-btn theme-toggle"
    :title="label"
    :aria-label="label"
    :aria-pressed="isDark"
    @click="toggleTheme"
  >
    <svg
      v-if="isDark"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </svg>
    <svg
      v-else
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle svg {
  transition: transform 200ms ease;
}
.theme-toggle:hover svg {
  transform: rotate(-12deg);
}
</style>
