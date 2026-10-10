<script setup>
// Collapsed desktop Sidebar: Home, one item per Topic, one Learning Plans
// item. Activating an item opens a fly-out listing its Sheets (or the Plans)
// beside the rail. Disclosure pattern: the fly-out follows its opener in the
// DOM, so Tab order runs item → entries → next item.
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { topics, plans } from '../lib/content.js'
import { questionsOpen } from '../lib/questions.js'
import { topicCode } from '../lib/topicCode.js'

const PLANS = 'plans'
const FLYOUT_ID = 'sidebar-rail-flyout'
const EDGE = 8

const route = useRoute()
const router = useRouter()

const rootEl = ref(null)
const openKey = ref(null) // Topic slug, or PLANS
const flyoutPos = ref({ top: 0, left: 0 })
let opener = null

const activeTopic = computed(() => route.params.topic || null)
const activeSheet = computed(() => route.params.sheet || null)
const activePlan = computed(() => (route.name === 'plan' ? route.params.plan : null))

function pad(n) {
  return String(n).padStart(2, '0')
}

function goHome() {
  questionsOpen.value = false
  router.push('/')
}

async function toggle(key, event) {
  if (openKey.value === key) {
    close()
    return
  }
  opener = event.currentTarget
  openKey.value = key
  await nextTick()
  place()
}

function close(restoreFocus = false) {
  if (openKey.value === null) return
  openKey.value = null
  if (restoreFocus && opener) opener.focus()
  opener = null
}

// Top-aligned with the opener, kept inside the viewport, flush with the
// Sidebar's outer edge (its hairline border included).
function place() {
  const flyout = document.getElementById(FLYOUT_ID)
  const sidebar = rootEl.value?.parentElement
  if (!opener || !flyout || !sidebar) return
  const top = opener.getBoundingClientRect().top
  const maxTop = window.innerHeight - flyout.offsetHeight - EDGE
  flyoutPos.value = {
    top: Math.max(EDGE, Math.min(top, maxTop)),
    left: sidebar.getBoundingClientRect().right,
  }
}

const flyoutStyle = computed(() => ({
  top: `${flyoutPos.value.top}px`,
  left: `${flyoutPos.value.left}px`,
}))

function onPointerDown(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) close()
}

function onKeyDown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    close(true)
  }
}

function listen(on) {
  const method = on ? 'addEventListener' : 'removeEventListener'
  document[method]('pointerdown', onPointerDown, true)
  document[method]('keydown', onKeyDown)
  window[method]('resize', place)
}

watch(openKey, (key, prev) => {
  if (key !== null && prev === null) listen(true)
  else if (key === null && prev !== null) listen(false)
})

watch(() => route.fullPath, () => close())

onBeforeUnmount(() => {
  if (openKey.value !== null) listen(false)
})
</script>

<template>
  <div ref="rootEl" class="rail">
    <button
      type="button"
      class="rail-home"
      :class="{ 'rail-home--active': route.name === 'home' }"
      title="Home"
      aria-label="Home"
      :aria-current="route.name === 'home' ? 'page' : undefined"
      @click="goHome"
    ><span class="rail-os">OS</span></button>

    <nav class="rail-topics" aria-label="Topics" @scroll="place">
      <template v-for="t in topics" :key="t.slug">
        <button
          type="button"
          class="rail-item"
          :class="{ 'rail-item--active': activeTopic === t.slug, 'rail-item--open': openKey === t.slug }"
          :title="t.title"
          :aria-label="t.title"
          :aria-expanded="openKey === t.slug"
          :aria-controls="openKey === t.slug ? FLYOUT_ID : undefined"
          @click="toggle(t.slug, $event)"
        >
          <span class="rail-sq" :style="{ background: t.accent || 'rgb(var(--c-muted))' }"></span>
          <span class="rail-code">{{ topicCode(t.title) }}</span>
        </button>

        <div
          v-if="openKey === t.slug"
          :id="FLYOUT_ID"
          class="rail-flyout"
          role="region"
          :aria-label="t.title"
          :style="flyoutStyle"
        >
          <div class="rail-flyout-head">
            <span class="rail-sq" :style="{ background: t.accent || 'rgb(var(--c-muted))' }"></span>
            <span class="rail-flyout-title">{{ t.title }}</span>
            <span class="rail-flyout-count">{{ pad(t.sheets.length) }}</span>
          </div>
          <ul class="rail-flyout-list">
            <li v-for="(s, si) in t.sheets" :key="s.name">
              <RouterLink
                :to="`/${s.slug}`"
                class="rail-flyout-row"
                :class="{ 'rail-flyout-row--active': activeTopic === t.slug && activeSheet === s.name }"
                :aria-current="activeTopic === t.slug && activeSheet === s.name ? 'page' : undefined"
                @click="close()"
              >
                <span class="rail-flyout-index">{{ pad(si + 1) }}</span>
                <span class="rail-flyout-name">{{ s.name }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </template>
    </nav>

    <button
      type="button"
      class="rail-item rail-item--plans"
      :class="{ 'rail-item--active': activePlan !== null, 'rail-item--open': openKey === PLANS }"
      title="Learning Plans"
      aria-label="Learning Plans"
      :aria-expanded="openKey === PLANS"
      :aria-controls="openKey === PLANS ? FLYOUT_ID : undefined"
      @click="toggle(PLANS, $event)"
    >
      <span class="rail-sq rail-sq--hollow"></span>
      <span class="rail-code">LP</span>
    </button>

    <div
      v-if="openKey === PLANS"
      :id="FLYOUT_ID"
      class="rail-flyout"
      role="region"
      aria-label="Learning Plans"
      :style="flyoutStyle"
    >
      <div class="rail-flyout-head">
        <span class="rail-sq rail-sq--hollow"></span>
        <span class="rail-flyout-title">Learning Plans</span>
        <span class="rail-flyout-count">{{ pad(plans.length) }}</span>
      </div>
      <p v-if="!plans.length" class="rail-flyout-empty">No learning plans yet.</p>
      <ul v-else class="rail-flyout-list">
        <li v-for="(p, pi) in plans" :key="p.slug">
          <RouterLink
            :to="`/plans/${p.slug}`"
            class="rail-flyout-row rail-flyout-row--plan"
            :class="{ 'rail-flyout-row--active': activePlan === p.slug }"
            :aria-current="activePlan === p.slug ? 'page' : undefined"
            @click="close()"
          >
            <span class="rail-flyout-index">{{ pad(pi + 1) }}</span>
            <span class="rail-sq" :style="{ background: p.accent || 'rgb(var(--c-muted))' }"></span>
            <span class="rail-flyout-name">{{ p.title }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.rail {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.rail-home,
.rail-item {
  flex: 0 0 auto;
  width: 100%;
  border: 0;
  background: none;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rail-home {
  height: 38px;
}
.rail-os {
  padding: 2px 5px;
  border-radius: 3px;
  background: rgb(var(--c-accent));
  color: rgb(var(--c-paper));
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.rail-home:hover .rail-os {
  opacity: 0.85;
}
.rail-home--active {
  box-shadow: inset 2px 0 0 rgb(var(--c-accent));
}

.rail-topics {
  flex: 0 1 auto;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  border-top: 1px solid rgb(var(--c-hairline));
  border-bottom: 1px solid rgb(var(--c-hairline));
  padding: 4px 0;
}
.rail-topics::-webkit-scrollbar {
  display: none;
}

.rail-item {
  height: 40px;
  flex-direction: column;
  gap: 5px;
  color: rgb(var(--c-muted));
  transition: background-color 120ms;
}
.rail-item--plans {
  margin-top: 4px;
}
.rail-sq {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
}
.rail-sq--hollow {
  box-shadow: inset 0 0 0 1px currentColor;
}
.rail-code {
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.12em;
  padding-left: 0.12em; /* re-centre: letter-spacing trails the last glyph */
}
.rail-item:hover,
.rail-item--open {
  background: rgb(var(--c-hairline) / 0.5);
  color: rgb(var(--c-ink));
}
.rail-item--active,
.rail-item--active:hover {
  background: rgb(var(--c-accent) / 0.09);
  box-shadow: inset 2px 0 0 rgb(var(--c-accent));
  color: rgb(var(--c-accent));
}
:global(html.dark) .rail-item--active {
  background: rgb(var(--c-accent) / 0.13);
}

.rail-home:focus-visible,
.rail-item:focus-visible,
.rail-flyout-row:focus-visible {
  outline: 1px solid rgb(var(--c-accent));
  outline-offset: -1px;
}

/* --- Fly-out --- */

.rail-flyout {
  position: fixed;
  z-index: 50;
  width: 248px;
  max-height: calc(100vh - 16px);
  overflow-y: auto;
  padding-bottom: 6px;
  background: rgb(var(--c-paper-warm));
  border: 1px solid rgb(var(--c-hairline));
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}
:global(html.dark) .rail-flyout {
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.5);
}
.rail-flyout-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px 9px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgb(var(--c-hairline));
  color: rgb(var(--c-muted));
}
.rail-flyout-title {
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rail-flyout-count {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.rail-flyout-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.rail-flyout-row {
  display: grid;
  grid-template-columns: 1.5rem 1fr;
  align-items: baseline;
  column-gap: 8px;
  padding: 4px 14px;
  text-decoration: none;
  color: rgb(var(--c-muted));
  transition: background-color 120ms;
}
.rail-flyout-row--plan {
  grid-template-columns: 1.5rem 6px 1fr;
  align-items: center;
  padding-top: 7px;
  padding-bottom: 7px;
}
.rail-flyout-row:hover {
  background: rgb(var(--c-hairline) / 0.5);
}
.rail-flyout-row--active {
  background: rgb(var(--c-accent) / 0.09);
  box-shadow: inset 2px 0 0 rgb(var(--c-accent));
}
:global(html.dark) .rail-flyout-row--active {
  background: rgb(var(--c-accent) / 0.13);
}
.rail-flyout-index {
  font-size: 10px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.rail-flyout-name {
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rail-flyout-row--plan .rail-flyout-name {
  color: rgb(var(--c-ink));
  font-weight: 500;
}
.rail-flyout-row--active .rail-flyout-name {
  font-weight: 600;
  color: rgb(var(--c-accent));
}
.rail-flyout-empty {
  margin: 0;
  padding: 8px 14px;
  font-size: 11px;
  color: rgb(var(--c-muted));
}
</style>
