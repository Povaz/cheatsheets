<script setup>
import { computed, ref, watch } from 'vue'
import { isSmallScreen } from '../store.js'
import { findTopic } from '../lib/content.js'
import {
  bankAvailable, correct, answered, current, picked, questionsOpen,
  start, next, pick,
} from '../lib/questions.js'
import Sidebar from '../components/Sidebar.vue'
import QuestionCard from '../components/QuestionCard.vue'

const pct = computed(() =>
  answered.value > 0 ? Math.round((correct.value / answered.value) * 100) : null,
)

const bodyEl = ref(null)

function openQuestions() {
  questionsOpen.value = true
  start()
}

async function nextQuestion() {
  await next()
  if (bodyEl.value) bodyEl.value.scrollTop = 0
}

const topicAccent = computed(() => {
  if (!current.value) return 'rgb(var(--c-accent))'
  return findTopic(current.value.topic)?.accent || 'rgb(var(--c-accent))'
})

// Leaving question mode when navigating away is handled by route change
// unmounting Home; questionsOpen persists the session deliberately, so
// returning to `/` reopens the question view mid-round.
watch(questionsOpen, (open) => { if (open) start() })
</script>

<template>
  <Sidebar v-if="isSmallScreen" variant="screen" />

  <!-- Desktop: question view (in place, same route) -->
  <template v-else-if="questionsOpen">
    <div class="q-topbar">
      <div class="q-topbar-path">
        <span class="q-topbar-sq" :style="{ background: topicAccent }"></span>
        <span class="q-topbar-slug" v-if="current">{{ current.topic }} / {{ current.subtopic }}</span>
      </div>
      <span class="flex-1"></span>
      <div class="q-score">
        <span class="q-score-label">correct</span>
        <span class="q-score-value">{{ correct }}</span>
        <span class="q-score-total">/ {{ answered }}</span>
        <span v-if="pct !== null" class="q-score-pct">{{ pct }}%</span>
      </div>
    </div>

    <div class="q-body" ref="bodyEl">
      <div class="q-column">
        <QuestionCard v-if="current" :question="current" :picked="picked" @pick="pick" />
        <p v-else class="q-empty">The Question Bank is empty.</p>
      </div>
    </div>

    <div class="q-actionbar">
      <span class="q-action-hint">
        {{ picked !== null ? 'Next one is drawn at random from the bank.' : 'Pick an answer to see the result.' }}
      </span>
      <span class="flex-1"></span>
      <button
        class="q-next"
        :class="{ 'q-next--live': picked !== null }"
        :disabled="picked === null"
        @click="nextQuestion"
      >Next question →</button>
    </div>
  </template>

  <!-- Desktop: landing -->
  <div v-else class="landing">
    <div class="landing-brand">
      <span class="landing-wordmark">cheatsheet</span>
      <span class="landing-os">OS</span>
    </div>
    <p class="landing-copy">
      Notes worth re-reading, kept in one place. Pick a sheet from the index on the left,
      or answer a question drawn at random from all of them.
    </p>
    <div v-if="bankAvailable" class="landing-questions">
      <button class="landing-questions-btn" @click="openQuestions">Questions →</button>
      <span class="landing-score">
        {{ correct }} / {{ answered }} correct<template v-if="pct !== null"> · {{ pct }}%</template>
      </span>
    </div>
    <div class="landing-hints">
      <span><kbd class="kbd">/</kbd> search within a sheet</span>
      <span><kbd class="kbd">⌘[</kbd> <kbd class="kbd">⌘]</kbd> step between sheets</span>
    </div>
  </div>
</template>

<style scoped>
.landing {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;
  text-align: center;
}
.landing-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.landing-wordmark {
  font-family: Fraunces, ui-serif, serif;
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  color: rgb(var(--c-ink));
}
.landing-os {
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border-radius: 3px;
  background: rgb(var(--c-accent));
  color: rgb(var(--c-paper));
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.landing-copy {
  font-size: 12px;
  color: rgb(var(--c-muted));
  max-width: 34rem;
}
.landing-questions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
}
.landing-questions-btn {
  height: 44px;
  padding: 0 26px;
  border-radius: 2px;
  background: rgb(var(--c-accent));
  border: 1px solid rgb(var(--c-accent));
  color: rgb(var(--c-paper));
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 120ms;
}
.landing-questions-btn:hover { background: #A93A0C; border-color: #A93A0C; }
:global(html.dark) .landing-questions-btn:hover {
  background: rgb(var(--c-accent) / 0.85);
  border-color: transparent;
}
.landing-score {
  font-size: 10px;
  color: rgb(var(--c-muted));
  font-variant-numeric: tabular-nums;
}
.landing-hints {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgb(var(--c-muted));
}

/* Question view (§7.2) */
.q-topbar {
  flex: 0 0 auto;
  padding: 15px 32px 14px;
  border-bottom: 1px solid rgb(var(--c-hairline));
  display: flex;
  align-items: center;
  gap: 16px;
}
.q-topbar-path {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.q-topbar-sq {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
}
.q-topbar-slug {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
  font-weight: 700;
  color: rgb(var(--c-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.q-score {
  display: flex;
  align-items: baseline;
  gap: 7px;
  font-variant-numeric: tabular-nums;
}
.q-score-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(var(--c-muted));
}
.q-score-value {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--c-ink));
}
.q-score-total {
  font-size: 11px;
  color: rgb(var(--c-muted));
}
.q-score-pct {
  font-size: 10px;
  font-weight: 600;
  color: rgb(var(--c-accent));
  background: rgb(var(--c-accent) / 0.10);
  border: 1px solid rgb(var(--c-accent) / 0.25);
  border-radius: 2px;
  padding: 2px 5px;
}

.q-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 32px;
}
.q-column {
  max-width: 48rem;
  margin: 0 auto;
  padding: 30px 0 40px;
}
.q-empty {
  font-size: 12px;
  color: rgb(var(--c-muted));
}

.q-actionbar {
  flex: 0 0 auto;
  border-top: 1px solid rgb(var(--c-hairline));
  background: rgb(var(--c-paper-warm));
  padding: 12px 32px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.q-action-hint {
  font-size: 11px;
  color: rgb(var(--c-muted));
}
.q-next {
  height: 38px;
  padding: 0 20px;
  border-radius: 2px;
  background: rgb(var(--c-paper));
  border: 1px solid rgb(var(--c-hairline));
  color: rgb(var(--c-muted));
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  cursor: not-allowed;
  transition: background-color 120ms;
}
.q-next--live {
  background: rgb(var(--c-accent));
  border-color: rgb(var(--c-accent));
  color: rgb(var(--c-paper));
  cursor: pointer;
}
.q-next--live:hover { background: #A93A0C; border-color: #A93A0C; }
:global(html.dark) .q-next--live:hover {
  background: rgb(var(--c-accent) / 0.85);
  border-color: transparent;
}
</style>
