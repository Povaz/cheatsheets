<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { findPlan } from '../lib/content.js'
import { isSmallScreen } from '../store.js'
import { renderMarkdown } from '../lib/markdown.js'

const props = defineProps({
  plan: { type: String, required: true },
})

const router = useRouter()
const entry = computed(() => findPlan(props.plan))
const renderedHtml = computed(() => (entry.value ? renderMarkdown(entry.value.markdown) : ''))

// Mobile scroll-driven nav collapse — same 40/24px hysteresis as Sheet.vue.
const mobileBodyRef = ref(null)
const scrolledPast = ref(false)

function onMobileScroll() {
  if (!mobileBodyRef.value) return
  const st = mobileBodyRef.value.scrollTop
  if (!scrolledPast.value && st >= 40) scrolledPast.value = true
  else if (scrolledPast.value && st <= 24) scrolledPast.value = false
}
</script>

<template>
  <div v-if="!entry" class="p-8 text-muted">
    Plan not found.
    <RouterLink to="/" class="underline decoration-hairline hover:decoration-accent">back</RouterLink>.
  </div>

  <!-- Desktop -->
  <template v-else-if="!isSmallScreen">
    <header class="plan-header">
      <div class="plan-path">
        <span class="plan-path-sq" :style="{ background: entry.accent || 'rgb(var(--c-muted))' }"></span>
        <span class="plan-path-text">learning plan / {{ entry.slug }}</span>
      </div>
      <h1 class="plan-title">{{ entry.title }}</h1>
      <p v-if="entry.subtitle" class="plan-subtitle">{{ entry.subtitle }}</p>
    </header>
    <div class="plan-body">
      <div class="plan-column">
        <div class="plan-fragment" v-html="renderedHtml"></div>
      </div>
    </div>
  </template>

  <!-- Mobile: lean duplication of Sheet.vue's screen pattern (README §E) -->
  <template v-else>
    <div class="mobile-nav" :class="{ 'mobile-nav--shadow': scrolledPast }">
      <div class="mobile-nav-layer" :style="{ opacity: scrolledPast ? 0 : 1, pointerEvents: scrolledPast ? 'none' : 'auto' }">
        <button class="mobile-nav-back" @click="router.push('/')">
          <span class="mobile-nav-back-chevron">‹</span>
          <span class="mobile-nav-back-text">Index</span>
        </button>
      </div>
      <div class="mobile-nav-layer mobile-nav-layer--collapsed" :style="{ opacity: scrolledPast ? 1 : 0, pointerEvents: scrolledPast ? 'auto' : 'none' }">
        <button class="mobile-nav-back-sm" @click="router.push('/')">‹</button>
        <span class="mobile-nav-sq" :style="{ background: entry.accent || 'rgb(var(--c-muted))' }"></span>
        <span class="mobile-nav-name">{{ entry.title }}</span>
      </div>
    </div>

    <div class="mobile-body" ref="mobileBodyRef" @scroll="onMobileScroll">
      <header class="mobile-plan-header">
        <div class="mobile-plan-path">
          <span class="mobile-plan-path-sq" :style="{ background: entry.accent || 'rgb(var(--c-muted))' }"></span>
          <span class="mobile-plan-path-text">learning plan / {{ entry.slug }}</span>
        </div>
        <h1 class="mobile-plan-title">{{ entry.title }}</h1>
        <p v-if="entry.subtitle" class="mobile-plan-subtitle">{{ entry.subtitle }}</p>
      </header>
      <div class="mobile-fragment-wrap">
        <div class="plan-fragment" v-html="renderedHtml"></div>
      </div>
    </div>
  </template>
</template>

<style scoped>
/* --- Desktop --- */
.plan-header {
  flex: 0 0 auto;
  padding: 26px 32px 16px;
  border-bottom: 1px solid rgb(var(--c-hairline));
}
.plan-path {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 11px;
}
.plan-path-sq {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
}
.plan-path-text {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
  font-weight: 700;
  color: rgb(var(--c-muted));
}
.plan-title {
  font-family: Fraunces, ui-serif, serif;
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  margin: 0;
}
.plan-subtitle {
  font-size: 12px;
  color: rgb(var(--c-muted));
  margin: 9px 0 0;
}
.plan-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 32px;
}
.plan-column {
  max-width: 48rem;
  margin: 0 auto;
  padding: 24px 0 60px;
}

/* --- Mobile --- */
.mobile-nav {
  flex: 0 0 auto;
  height: 46px;
  padding: 0 6px 0 8px;
  position: relative;
  border-bottom: 1px solid rgb(var(--c-hairline) / 0.6);
  background: rgb(var(--c-paper));
  z-index: 5;
  transition: box-shadow 160ms ease;
}
.mobile-nav--shadow {
  border-bottom-color: rgb(var(--c-hairline));
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
:global(html.dark) .mobile-nav--shadow {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}
.mobile-nav-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 6px 0 8px;
  transition: opacity 160ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .mobile-nav-layer { transition: none; }
  .mobile-nav { transition: none; }
}
.mobile-nav-back {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 44px;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  color: rgb(var(--c-muted));
  padding: 0 8px;
}
.mobile-nav-back-chevron { font-size: 14px; }
.mobile-nav-back-text {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
}
.mobile-nav-back-sm {
  width: 32px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 14px;
  color: rgb(var(--c-muted));
  cursor: pointer;
  font-family: inherit;
}
.mobile-nav-sq {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
}
.mobile-nav-name {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--c-ink));
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
}

.mobile-plan-header {
  padding: 14px 16px 16px;
  border-bottom: 1px solid rgb(var(--c-hairline));
}
.mobile-plan-path {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
}
.mobile-plan-path-sq {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
}
.mobile-plan-path-text {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--c-muted));
}
.mobile-plan-title {
  font-family: Fraunces, ui-serif, serif;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.05;
  margin: 0;
}
.mobile-plan-subtitle {
  font-size: 12px;
  line-height: 1.6;
  color: rgb(var(--c-muted));
  margin: 9px 0 0;
}

.mobile-fragment-wrap {
  padding: 18px 16px;
}
</style>
