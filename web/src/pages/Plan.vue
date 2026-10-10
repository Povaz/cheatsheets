<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { findPlan } from '../lib/content.js'
import { isSmallScreen } from '../store.js'
import Icon from '../components/Icon.vue'

const props = defineProps({
  plan: { type: String, required: true },
})

const router = useRouter()
const entry = computed(() => findPlan(props.plan))
const accentStyle = computed(() => ({ '--plan-accent': entry.value?.accent || 'rgb(var(--c-accent))' }))
const progress = computed(() =>
  entry.value?.stepCount ? Math.round((entry.value.doneCount / entry.value.stepCount) * 100) : 0,
)
const ROLE_LABEL = { original: 'Original', video: 'Video', written: 'Written' }
const pad = (n) => String(n).padStart(2, '0')

// Roadmap: scroll to a Step inside the scrolling body; scroll-spy marks the current one.
const bodyRef = ref(null)
const activeStep = ref('')
let observer = null

function goTo(id) {
  const root = bodyRef.value
  const el = root?.querySelector(`#${id}`)
  if (!el) return
  const top = root.scrollTop + el.getBoundingClientRect().top - root.getBoundingClientRect().top - 16
  root.scrollTo({ top, behavior: 'smooth' })
  activeStep.value = id
}
function spy() {
  observer?.disconnect()
  if (!bodyRef.value) return
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) activeStep.value = e.target.id
  }, { root: bodyRef.value, rootMargin: '-10% 0px -70% 0px' })
  bodyRef.value.querySelectorAll('.plan-step').forEach((s) => observer.observe(s))
}
onMounted(spy)
watch([() => props.plan, isSmallScreen], () => nextTick(spy))
onBeforeUnmount(() => observer?.disconnect())

// Mobile scroll-driven nav collapse — same 40/24px hysteresis as Sheet.vue.
const scrolledPast = ref(false)
function onScroll() {
  if (!isSmallScreen.value || !bodyRef.value) return
  const st = bodyRef.value.scrollTop
  if (!scrolledPast.value && st >= 40) scrolledPast.value = true
  else if (scrolledPast.value && st <= 24) scrolledPast.value = false
}
</script>

<template>
  <div v-if="!entry" class="p-8 text-muted">
    Plan not found.
    <RouterLink to="/" class="underline decoration-hairline hover:decoration-accent">back</RouterLink>.
  </div>

  <div v-else class="plan" :class="{ 'plan--mobile': isSmallScreen }" :style="accentStyle">
    <div v-if="isSmallScreen" class="mobile-nav" :class="{ 'mobile-nav--shadow': scrolledPast }">
      <button class="mobile-nav-back" @click="router.push('/')">
        <span aria-hidden="true">‹</span> <span class="mobile-nav-back-text">Index</span>
      </button>
      <span v-if="scrolledPast" class="mobile-nav-name">{{ entry.title }}</span>
    </div>

    <header v-if="!isSmallScreen" class="plan-header">
      <div class="plan-path">
        <span class="plan-sq"></span>
        <span class="plan-path-text">learning plan / {{ entry.slug }}</span>
      </div>
      <h1 class="plan-title" :title="entry.title">{{ entry.title }}</h1>
      <p v-if="entry.subtitle" class="plan-subtitle" :title="entry.subtitle">{{ entry.subtitle }}</p>
      <div class="plan-progress" :aria-label="`${entry.doneCount} of ${entry.stepCount} steps done`">
        <div class="plan-progress-bar"><div :style="{ width: progress + '%' }"></div></div>
        <span>{{ entry.doneCount }} / {{ entry.stepCount }} steps done</span>
      </div>
    </header>

    <div ref="bodyRef" class="plan-body" @scroll="onScroll">
      <header v-if="isSmallScreen" class="plan-header plan-header--mobile">
        <div class="plan-path">
          <span class="plan-sq"></span>
          <span class="plan-path-text">learning plan / {{ entry.slug }}</span>
        </div>
        <h1 class="plan-title">{{ entry.title }}</h1>
        <p v-if="entry.subtitle" class="plan-subtitle">{{ entry.subtitle }}</p>
        <div class="plan-progress">
          <div class="plan-progress-bar"><div :style="{ width: progress + '%' }"></div></div>
          <span>{{ entry.doneCount }} / {{ entry.stepCount }} steps done</span>
        </div>
      </header>

      <div class="plan-layout">
        <component :is="isSmallScreen ? 'details' : 'nav'" class="roadmap" aria-label="Roadmap">
          <summary v-if="isSmallScreen" class="roadmap-label">Roadmap</summary>
          <p v-else class="roadmap-label">Roadmap</p>
          <div v-for="part in entry.parts" :key="part.id" class="roadmap-part">
            <p class="roadmap-part-title"><span>{{ pad(part.number) }}</span> {{ part.title }}</p>
            <button
              v-for="step in part.steps" :key="step.id" type="button" class="roadmap-step"
              :class="{ 'roadmap-step--active': step.id === activeStep, 'roadmap-step--done': step.done }"
              :aria-current="step.id === activeStep ? 'step' : undefined"
              @click="goTo(step.id)"
            >
              <span class="roadmap-dot"><Icon v-if="step.done" name="check" /></span>
              <span class="sr-only">{{ step.done ? 'Done:' : 'To do:' }}</span>
              <span class="roadmap-step-title" :title="step.title">{{ step.title }}</span>
            </button>
          </div>
        </component>

        <main class="plan-main">
          <section v-for="part in entry.parts" :id="part.id" :key="part.id" class="plan-part">
            <header class="part-header">
              <span class="part-number">{{ pad(part.number) }}</span>
              <div>
                <h2 class="part-title">{{ part.title }}</h2>
                <p v-if="part.summary" class="part-summary">{{ part.summary }}</p>
              </div>
            </header>

            <article v-for="step in part.steps" :id="step.id" :key="step.id" class="plan-step">
              <div class="step-head">
                <span class="step-number">Step {{ pad(step.number) }}</span>
                <h3 class="step-title">{{ step.title }}</h3>
                <span v-if="step.done" class="step-done"><Icon name="check" /> Done</span>
                <a v-if="step.sheet" class="step-sheet" :href="step.sheet.href">
                  <Icon name="sheet" /> {{ step.sheet.title }}
                </a>
              </div>
              <p v-if="step.summary" class="step-summary">{{ step.summary }}</p>

              <ul class="sources">
                <li v-for="src in step.sources" :key="src.url + src.title" class="source" :class="`source--${src.role}`">
                  <span class="source-role"><Icon :name="src.role" /> {{ ROLE_LABEL[src.role] }}</span>
                  <p class="source-title">{{ src.title }}</p>
                  <p v-if="src.by || src.year" class="source-by">{{ [src.by, src.year].filter(Boolean).join(' · ') }}</p>
                  <p v-if="src.note" class="source-note">{{ src.note }}</p>
                  <a class="source-link" :href="src.url" target="_blank" rel="noopener noreferrer"
                     :aria-label="`Open ${src.title} on ${src.host}`">
                    {{ src.host }} <Icon name="external" />
                  </a>
                </li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan { display: flex; flex-direction: column; flex: 1 1 0; min-height: 0; }

/* --- Header: shares the desktop header band with the Sidebar head (index.css). --- */
.plan-header {
  flex: 0 0 auto;
  height: var(--header-band);
  overflow: hidden;
  padding: 26px 32px 0;
  border-bottom: 1px solid rgb(var(--c-hairline));
}
.plan-header--mobile { height: auto; padding: 14px 16px 16px; }
.plan-path { display: flex; align-items: center; gap: 7px; margin-bottom: 11px; }
.plan-sq { width: 5px; height: 5px; background: var(--plan-accent); flex-shrink: 0; }
.plan-path-text {
  text-transform: uppercase; letter-spacing: 0.12em;
  font-size: 10px; font-weight: 700; color: rgb(var(--c-muted));
}
.plan-title {
  font-family: Fraunces, ui-serif, serif; font-size: 44px; font-weight: 800;
  line-height: 1.2; margin: -0.1em 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.plan--mobile .plan-title { font-size: 30px; white-space: normal; }
.plan-subtitle {
  font-size: 12px; color: rgb(var(--c-muted)); margin: 9px 0 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.plan--mobile .plan-subtitle { white-space: normal; }
.plan-progress {
  display: flex; align-items: center; gap: 10px; margin-top: 10px;
  font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: rgb(var(--c-muted));
}
.plan-progress-bar { flex: 0 0 160px; height: 4px; border-radius: 2px; background: rgb(var(--c-hairline)); overflow: hidden; }
.plan-progress-bar > div { height: 100%; background: var(--plan-accent); }

/* --- Body: roadmap + main --- */
.plan-body { flex: 1 1 0; min-height: 0; overflow-y: auto; padding: 0 32px; }
.plan--mobile .plan-body { padding: 0; }
.plan-layout {
  display: grid; grid-template-columns: 15rem minmax(0, 1fr); gap: 2.5rem;
  max-width: 76rem; margin: 0 auto; padding: 1.75rem 0 4rem;
}
.plan--mobile .plan-layout { grid-template-columns: minmax(0, 1fr); gap: 1rem; padding: 1rem 16px 3rem; }

.roadmap { position: sticky; top: 1.75rem; align-self: start; max-height: calc(100vh - var(--header-band) - 3.5rem); overflow-y: auto; }
.plan--mobile .roadmap {
  position: static; max-height: none;
  border: 1px solid rgb(var(--c-hairline)); border-radius: 8px; padding: 6px 12px;
}
.roadmap-label {
  text-transform: uppercase; letter-spacing: 0.12em; font-size: 10px; font-weight: 700;
  color: rgb(var(--c-muted)); margin: 0 0 10px;
}
.plan--mobile .roadmap-label { margin: 0; padding: 6px 0; cursor: pointer; }
.roadmap-part { margin-bottom: 14px; }
.roadmap-part-title {
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: rgb(var(--c-ink)); margin: 0 0 4px;
}
.roadmap-part-title span { color: var(--plan-accent); margin-right: 4px; }
.roadmap-step {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  padding: 4px 8px; border: none; border-left: 2px solid transparent; background: none;
  font: inherit; font-size: 11px; color: rgb(var(--c-muted)); cursor: pointer;
}
.roadmap-step:hover { color: rgb(var(--c-ink)); }
.roadmap-step--active { color: rgb(var(--c-ink)); border-left-color: var(--plan-accent); background: rgb(var(--c-paper-warm)); }
.roadmap-dot {
  width: 12px; height: 12px; flex-shrink: 0; border-radius: 50%;
  border: 1.5px solid rgb(var(--c-hairline)); display: inline-flex; align-items: center; justify-content: center;
  font-size: 9px; color: rgb(var(--c-paper));
}
.roadmap-step--done .roadmap-dot { background: var(--plan-accent); border-color: var(--plan-accent); }
.roadmap-step-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* --- Parts and Steps --- */
.plan-part + .plan-part { margin-top: 3rem; }
.part-header {
  display: flex; align-items: baseline; gap: 14px;
  padding-bottom: 12px; border-bottom: 2px solid rgb(var(--c-ink) / 0.85);
}
.part-number { font-size: 28px; font-weight: 700; color: var(--plan-accent); font-variant-numeric: tabular-nums; }
.part-title { font-family: Fraunces, ui-serif, serif; font-size: 24px; font-weight: 800; margin: 0; }
.part-summary { margin: 4px 0 0; font-size: 12px; color: rgb(var(--c-muted)); }

.plan-step { padding: 1.5rem 0; scroll-margin-top: 1rem; }
.plan-step + .plan-step { border-top: 1px solid rgb(var(--c-hairline)); }
.step-head { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 12px; }
.step-number {
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--plan-accent);
}
.step-title { font-size: 15px; font-weight: 700; margin: 0; }
.step-done {
  display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--plan-accent); border: 1px solid var(--plan-accent);
}
.step-sheet {
  margin-left: auto; display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border: 1px solid rgb(var(--c-hairline)); border-radius: 6px;
  font-size: 11px; color: rgb(var(--c-ink)); text-decoration: none; background: rgb(var(--c-surface));
}
.step-sheet:hover { border-color: var(--plan-accent); }
.step-summary { margin: 6px 0 14px; font-size: 12px; color: rgb(var(--c-muted)); }

/* --- Source cards --- */
.sources {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 12px;
}
.source {
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px 14px; border: 1px solid rgb(var(--c-hairline)); border-radius: 10px;
  background: rgb(var(--c-surface)); box-shadow: var(--shadow-card);
}
.source-role {
  display: inline-flex; align-items: center; gap: 5px; align-self: flex-start;
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgb(var(--c-muted));
}
.source--original .source-role { color: var(--plan-accent); }
.source-title {
  margin: 0; font-size: 13px; font-weight: 700; line-height: 1.35; color: rgb(var(--c-ink));
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.source-by { margin: 0; font-size: 10px; color: rgb(var(--c-muted)); }
.source-note { margin: 0; font-size: 11px; line-height: 1.5; color: rgb(var(--c-ink) / 0.8); }
.source-link {
  margin-top: auto; align-self: flex-start; display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border: 1px solid rgb(var(--c-hairline)); border-radius: 6px;
  font-size: 11px; color: rgb(var(--c-ink)); text-decoration: none; background: rgb(var(--c-paper));
}
.source-link:hover { border-color: var(--plan-accent); color: var(--plan-accent); }

/* --- Mobile nav (same pattern as Sheet.vue) --- */
.mobile-nav {
  flex: 0 0 auto; height: 46px; display: flex; align-items: center; gap: 8px; padding: 0 8px;
  border-bottom: 1px solid rgb(var(--c-hairline) / 0.6); background: rgb(var(--c-paper));
  transition: box-shadow 160ms ease;
}
.mobile-nav--shadow { border-bottom-color: rgb(var(--c-hairline)); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); }
.mobile-nav-back {
  display: flex; align-items: center; gap: 4px; height: 44px; padding: 0 8px;
  background: none; border: none; font: inherit; color: rgb(var(--c-muted)); cursor: pointer;
}
.mobile-nav-back-text { text-transform: uppercase; letter-spacing: 0.12em; font-size: 11px; font-weight: 700; }
.mobile-nav-name {
  flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  text-transform: uppercase; letter-spacing: 0.12em; font-size: 11px; font-weight: 700;
}
@media (prefers-reduced-motion: reduce) { .mobile-nav { transition: none; } }
</style>
