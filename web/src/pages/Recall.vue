<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { recallData, findTopic } from '../lib/content.js'
import { isSmallScreen } from '../store.js'

const router = useRouter()
const STORAGE_PREFIX = 'recall:'

function loadSession() {
  if (!recallData) return { current: 0, answers: [] }
  const key = STORAGE_PREFIX + recallData.generated
  try {
    const stored = JSON.parse(localStorage.getItem(key))
    if (stored && Array.isArray(stored.answers)) return stored
  } catch {}
  return { current: 0, answers: new Array(recallData.questions.length).fill(null) }
}

function saveSession() {
  if (!recallData) return
  const key = STORAGE_PREFIX + recallData.generated
  try {
    localStorage.setItem(key, JSON.stringify({ current: current.value, answers: answers.value }))
  } catch {}
  try {
    const stale = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(STORAGE_PREFIX) && k !== key) stale.push(k)
    }
    stale.forEach(k => localStorage.removeItem(k))
  } catch {}
}

const session = loadSession()
const firstUnanswered = session.answers.findIndex(a => a === null)
const current = ref(firstUnanswered >= 0 ? firstUnanswered : session.current)
const answers = ref(session.answers)

const questions = computed(() => recallData?.questions || [])
const totalQuestions = computed(() => questions.value.length)
const allAnswered = computed(() => answers.value.length > 0 && answers.value.every(a => a !== null))
const correctCount = computed(() =>
  questions.value.reduce((n, q, i) => n + (answers.value[i] === q.answer ? 1 : 0), 0)
)
const correctQuestions = computed(() =>
  questions.value.map((q, i) => ({ q, i })).filter(({ q, i }) => answers.value[i] === q.answer)
)
const incorrectQuestions = computed(() =>
  questions.value.map((q, i) => ({ q, i })).filter(({ q, i }) => answers.value[i] !== q.answer)
)

const showSummary = ref(false)
const currentQ = computed(() => questions.value[current.value] || null)
const currentAnswer = computed(() => answers.value[current.value])
const isAnswered = computed(() => currentAnswer.value !== null)

function selectAnswer(choiceIndex) {
  if (isAnswered.value) return
  answers.value[current.value] = choiceIndex
  const nextUnanswered = answers.value.findIndex((a, i) => i > current.value && a === null)
  if (nextUnanswered >= 0) current.value = nextUnanswered
  saveSession()
}

function goTo(index) {
  if (index < 0 || index >= totalQuestions.value) return
  showSummary.value = false
  current.value = index
  saveSession()
}

function viewSummary() {
  showSummary.value = true
}

watch(current, saveSession)

function pad(n) { return String(n).padStart(2, '0') }

function canGoPrev() { return current.value > 0 }
function canGoNext() { return current.value < totalQuestions.value - 1 }

function progressColor(i) {
  if (i === current.value && !showSummary.value) return 'rgb(var(--c-accent))'
  if (answers.value[i] === null) return 'rgb(var(--c-hairline))'
  if (answers.value[i] === questions.value[i].answer) return '#16A34A'
  return '#EF4444'
}

function topicAccent(q) {
  const t = findTopic(q.topic)
  return t?.accent || 'rgb(var(--c-accent))'
}

// Swipe handling
const swipeOffset = ref(0)
let touchStartX = 0
let touchStartY = 0
let swiping = false

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  swiping = false
  swipeOffset.value = 0
}

function onTouchMove(e) {
  const dx = e.touches[0].clientX - touchStartX
  const dy = e.touches[0].clientY - touchStartY
  if (!swiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
    swiping = true
  }
  if (swiping) {
    e.preventDefault()
    swipeOffset.value = dx
  }
}

function onTouchEnd() {
  if (!swiping) { swipeOffset.value = 0; return }
  const threshold = 60
  if (swipeOffset.value < -threshold && canGoNext()) {
    goTo(current.value + 1)
  } else if (swipeOffset.value > threshold && canGoPrev()) {
    goTo(current.value - 1)
  }
  swipeOffset.value = 0
  swiping = false
}
</script>

<template>
  <!-- Empty state -->
  <div v-if="!recallData || !questions.length" class="text-center py-16">
    <p class="text-muted text-sm">No questions available today.</p>
  </div>

  <!-- ============ DESKTOP ============ -->
  <template v-else-if="!isSmallScreen">
    <header class="recall-header">
      <h1 class="recall-title">Daily Recall</h1>
      <p class="recall-subtitle">{{ recallData.generated }}</p>
    </header>

    <div class="recall-body">
      <!-- Summary -->
      <div v-if="showSummary" class="max-w-2xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <p class="text-2xl font-bold">{{ correctCount }} / {{ totalQuestions }}</p>
        </div>
        <div class="space-y-3">
          <p class="label-soft">Correct</p>
          <div v-for="{ q, i } in correctQuestions" :key="q.id"
               class="border border-hairline rounded-sm p-3 cursor-pointer hover:border-accent transition-colors border-l-2 border-l-green-600"
               @click="goTo(i)">
            <div class="flex items-start gap-2">
              <span class="text-2xs text-muted tabular-nums whitespace-nowrap mt-0.5">{{ i + 1 }}.</span>
              <div class="min-w-0">
                <p class="text-xs font-medium">{{ q.question }}</p>
                <p class="text-2xs text-muted mt-1">Your answer: {{ q.choices[answers[i]] }}</p>
              </div>
            </div>
          </div>
          <p class="label-soft mt-4">Incorrect</p>
          <div v-for="{ q, i } in incorrectQuestions" :key="q.id"
               class="border border-hairline rounded-sm p-3 cursor-pointer hover:border-accent transition-colors border-l-2 border-l-red-500"
               @click="goTo(i)">
            <div class="flex items-start gap-2">
              <span class="text-2xs text-muted tabular-nums whitespace-nowrap mt-0.5">{{ i + 1 }}.</span>
              <div class="min-w-0">
                <p class="text-xs font-medium">{{ q.question }}</p>
                <p class="text-2xs text-muted mt-1">Your answer: {{ q.choices[answers[i]] }} — Correct: {{ q.choices[q.answer] }}</p>
              </div>
            </div>
          </div>
        </div>
        <button class="text-2xs text-accent hover:underline" @click="showSummary = false">Back to questions</button>
      </div>

      <!-- Question / Reveal -->
      <div v-else class="max-w-2xl mx-auto space-y-6">
        <div class="flex items-center gap-1 flex-wrap">
          <button v-for="(q, i) in questions" :key="i"
                  class="w-9 h-9 rounded-sm text-2xs font-semibold tabular-nums border transition-colors"
                  :class="[
                    i === current ? 'border-accent text-accent bg-accent/10' : 'border-hairline text-muted hover:border-accent',
                    answers[i] !== null && answers[i] === q.answer ? 'bg-green-600/10' : '',
                    answers[i] !== null && answers[i] !== q.answer ? 'bg-red-500/10' : '',
                  ]"
                  @click="goTo(i)">{{ i + 1 }}</button>
          <button v-if="allAnswered"
                  class="ml-auto text-2xs font-semibold text-accent border border-accent rounded-sm px-3 h-7 hover:bg-accent/10 transition-colors"
                  @click="viewSummary">Scorecard</button>
        </div>
        <div v-if="currentQ" class="space-y-4">
          <div>
            <div class="flex items-center justify-between">
              <span class="label-soft">{{ currentQ.topic }} / {{ currentQ.subtopic }}</span>
              <span class="text-2xs text-muted tabular-nums">{{ current + 1 }} of {{ totalQuestions }}</span>
            </div>
            <p class="text-sm font-medium mt-2">{{ currentQ.question }}</p>
          </div>
          <div class="grid gap-2">
            <button v-for="(choice, ci) in currentQ.choices" :key="ci"
                    class="text-left text-xs p-3 border rounded-sm transition-colors min-h-[44px]"
                    :class="[
                      !isAnswered ? 'border-hairline hover:border-accent cursor-pointer' : 'cursor-default',
                      isAnswered && ci === currentQ.answer ? 'border-green-600 bg-green-600/10' : '',
                      isAnswered && ci === currentAnswer && ci !== currentQ.answer ? 'border-red-500 bg-red-500/10' : '',
                      isAnswered && ci !== currentQ.answer && ci !== currentAnswer ? 'border-hairline opacity-50' : '',
                    ]"
                    :disabled="isAnswered"
                    @click="selectAnswer(ci)">{{ choice }}</button>
          </div>
          <div v-if="isAnswered" class="space-y-2 border-t border-hairline pt-3">
            <p class="text-xs text-muted">{{ currentQ.explanation }}</p>
            <RouterLink :to="`/${currentQ.topic}/${currentQ.subtopic}`" class="text-2xs text-accent hover:underline">Review this sheet →</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- ============ MOBILE ============ -->
  <template v-else>
    <!-- Summary -->
    <template v-if="showSummary">
      <div class="m-recall-nav">
        <button class="m-recall-back" @click="router.push('/')">
          <span class="m-recall-back-chev">‹</span>
          <span class="m-recall-back-text">Index</span>
        </button>
      </div>
      <div class="m-recall-summary-body">
        <div class="text-center space-y-2 pt-4">
          <h1 class="font-serif text-2xl font-extrabold">Daily Recall</h1>
          <p class="text-xl font-bold">{{ correctCount }} / {{ totalQuestions }}</p>
          <p class="text-muted text-xs">{{ recallData.generated }}</p>
        </div>
        <div class="space-y-3 mt-6">
          <p class="label-soft">Correct</p>
          <div v-for="{ q, i } in correctQuestions" :key="q.id"
               class="border border-hairline rounded-sm p-3 border-l-2 border-l-green-600" @click="goTo(i)">
            <div class="flex items-start gap-2">
              <span class="text-xs text-muted tabular-nums whitespace-nowrap mt-0.5">{{ i + 1 }}.</span>
              <div class="min-w-0">
                <p class="text-xs font-medium">{{ q.question }}</p>
                <p class="text-2xs text-muted mt-1">Your answer: {{ q.choices[answers[i]] }}</p>
              </div>
            </div>
          </div>
          <p class="label-soft mt-4">Incorrect</p>
          <div v-for="{ q, i } in incorrectQuestions" :key="q.id"
               class="border border-hairline rounded-sm p-3 border-l-2 border-l-red-500" @click="goTo(i)">
            <div class="flex items-start gap-2">
              <span class="text-xs text-muted tabular-nums whitespace-nowrap mt-0.5">{{ i + 1 }}.</span>
              <div class="min-w-0">
                <p class="text-xs font-medium">{{ q.question }}</p>
                <p class="text-2xs text-muted mt-1">Your answer: {{ q.choices[answers[i]] }} — Correct: {{ q.choices[q.answer] }}</p>
              </div>
            </div>
          </div>
        </div>
        <button class="text-xs text-accent hover:underline mt-4" @click="showSummary = false">Back to questions</button>
      </div>
    </template>

    <!-- Question -->
    <template v-else>
      <div class="m-recall-nav">
        <button class="m-recall-back" @click="router.push('/')">
          <span class="m-recall-back-chev">‹</span>
          <span class="m-recall-back-text">Index</span>
        </button>
        <span class="flex-1"></span>
        <span class="m-recall-counter">{{ pad(current + 1) }} / {{ pad(totalQuestions) }}</span>
      </div>

      <div class="m-recall-progress">
        <button v-for="(q, i) in questions" :key="i"
                class="m-recall-seg" :style="{ background: progressColor(i) }" @click="goTo(i)"></button>
      </div>

      <div class="m-recall-body"
           :style="{ transform: `translateX(${swipeOffset}px)` }"
           @touchstart.passive="onTouchStart"
           @touchmove="onTouchMove"
           @touchend.passive="onTouchEnd">
        <div v-if="currentQ" class="m-recall-content">
          <div class="m-recall-topic-path">
            <span class="m-recall-topic-sq" :style="{ background: topicAccent(currentQ) }"></span>
            <span class="m-recall-topic-text">{{ currentQ.topic }} / {{ currentQ.subtopic }}</span>
          </div>
          <p class="m-recall-question">{{ currentQ.question }}</p>

          <div class="m-recall-choices">
            <button v-for="(choice, ci) in currentQ.choices" :key="ci"
                    class="m-recall-choice"
                    :class="[
                      !isAnswered ? 'm-recall-choice--active' : '',
                      isAnswered && ci === currentQ.answer ? 'm-recall-choice--correct' : '',
                      isAnswered && ci === currentAnswer && ci !== currentQ.answer ? 'm-recall-choice--wrong' : '',
                      isAnswered && ci !== currentQ.answer && ci !== currentAnswer ? 'm-recall-choice--dim' : '',
                    ]"
                    :disabled="isAnswered"
                    @click="selectAnswer(ci)">{{ choice }}</button>
          </div>

          <div v-if="isAnswered" class="m-recall-reveal">
            <p class="m-recall-explanation">{{ currentQ.explanation }}</p>
            <RouterLink :to="`/${currentQ.topic}/${currentQ.subtopic}`" class="m-recall-review-link">Review this sheet →</RouterLink>
          </div>

          <button v-if="allAnswered" class="m-recall-scorecard-btn" @click="viewSummary">Scorecard</button>
        </div>
      </div>

      <div class="m-recall-bottom-bar">
        <button class="m-recall-bottom-half" :class="{ 'm-recall-bottom-half--off': !canGoPrev() }" :disabled="!canGoPrev()" @click="goTo(current - 1)">‹ Prev</button>
        <div class="m-recall-bottom-sep"></div>
        <button class="m-recall-bottom-half" :class="{ 'm-recall-bottom-half--off': !canGoNext() }" :disabled="!canGoNext()" @click="goTo(current + 1)">Next ›</button>
      </div>
    </template>
  </template>
</template>

<style scoped>
/* --- Desktop --- */
.recall-header {
  flex: 0 0 auto;
  padding: 26px 32px 16px;
  border-bottom: 1px solid rgb(var(--c-hairline));
}
.recall-title {
  font-family: Fraunces, ui-serif, serif;
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  margin: 0;
}
.recall-subtitle {
  font-size: 12px;
  color: rgb(var(--c-muted));
  margin: 9px 0 0;
}
.recall-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 24px 32px 60px;
}

/* --- Mobile --- */
.m-recall-nav {
  flex: 0 0 auto;
  height: 46px;
  padding: 0 6px 0 8px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgb(var(--c-hairline) / 0.6);
}
.m-recall-back {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 44px;
  padding: 0 8px;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  color: rgb(var(--c-muted));
}
.m-recall-back-chev { font-size: 14px; }
.m-recall-back-text {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
}
.m-recall-counter {
  font-size: 11px;
  color: rgb(var(--c-muted));
  font-variant-numeric: tabular-nums;
  padding-right: 10px;
}

.m-recall-progress {
  display: flex;
  gap: 3px;
  padding: 0 16px 14px;
}
.m-recall-seg {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  border: none;
  cursor: pointer;
  padding: 0;
}

.m-recall-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 16px 0;
  transition: transform 200ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .m-recall-body { transition: none; }
}

.m-recall-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 24px;
}

.m-recall-topic-path {
  display: flex;
  align-items: center;
  gap: 7px;
}
.m-recall-topic-sq {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
}
.m-recall-topic-text {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--c-muted));
}

.m-recall-question {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.45;
  text-wrap: pretty;
  margin: 0;
}

.m-recall-choices {
  display: grid;
  gap: 9px;
}
.m-recall-choice {
  min-height: 52px;
  padding: 13px 14px;
  border-radius: 3px;
  border: 1px solid rgb(var(--c-hairline));
  background: rgb(var(--c-surface));
  font-family: inherit;
  font-size: 13px;
  color: rgb(var(--c-ink));
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms;
}
.m-recall-choice--active:hover {
  border-color: rgb(var(--c-accent));
}
.m-recall-choice--correct {
  border-color: #16A34A;
  background: rgba(22, 163, 74, 0.1);
  cursor: default;
}
.m-recall-choice--wrong {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
  cursor: default;
}
.m-recall-choice--dim {
  opacity: 0.5;
  cursor: default;
}

.m-recall-reveal {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgb(var(--c-hairline));
  padding-top: 12px;
}
.m-recall-explanation {
  font-size: 12px;
  color: rgb(var(--c-muted));
  line-height: 1.5;
  margin: 0;
}
.m-recall-review-link {
  font-size: 11px;
  color: rgb(var(--c-accent));
  text-decoration: none;
}
.m-recall-review-link:hover { text-decoration: underline; }

.m-recall-scorecard-btn {
  align-self: center;
  font-size: 11px;
  font-weight: 600;
  color: rgb(var(--c-accent));
  border: 1px solid rgb(var(--c-accent));
  border-radius: 3px;
  padding: 8px 20px;
  background: none;
  cursor: pointer;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.m-recall-summary-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px 24px;
}

.m-recall-bottom-bar {
  flex: 0 0 auto;
  height: 56px;
  border-top: 1px solid rgb(var(--c-hairline));
  background: rgb(var(--c-paper-warm));
  display: flex;
  align-items: stretch;
  padding-bottom: env(safe-area-inset-bottom);
}
.m-recall-bottom-half {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--c-muted));
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
}
.m-recall-bottom-half--off {
  opacity: 0.4;
  cursor: default;
}
.m-recall-bottom-sep {
  width: 1px;
  background: rgb(var(--c-hairline));
}
</style>
