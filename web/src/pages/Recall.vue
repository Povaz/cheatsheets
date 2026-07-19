<script setup>
import { computed, ref, watch } from 'vue'
import { recallData } from '../lib/content.js'

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
  // clean stale keys
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
  // advance current to next unanswered if exists
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
</script>

<template>
  <!-- Empty state -->
  <div v-if="!recallData || !questions.length" class="text-center py-16">
    <p class="text-muted text-sm">No questions available today.</p>
  </div>

  <!-- Summary -->
  <div v-else-if="showSummary" class="max-w-2xl mx-auto space-y-6">
    <div class="text-center space-y-2">
      <h1 class="font-serif text-3xl font-extrabold">Daily Recall</h1>
      <p class="text-2xl font-bold">
        {{ correctCount }} / {{ totalQuestions }}
      </p>
      <p class="text-muted text-sm">{{ recallData.generated }}</p>
    </div>

    <div class="space-y-3">
      <p class="label-soft">Correct</p>
      <div
        v-for="{ q, i } in correctQuestions"
        :key="q.id"
        class="border border-hairline rounded-sm p-3 cursor-pointer hover:border-accent transition-colors border-l-2 border-l-green-600"
        @click="goTo(i)"
      >
        <div class="flex items-start gap-2">
          <span class="text-2xs text-muted tabular-nums whitespace-nowrap mt-0.5">{{ i + 1 }}.</span>
          <div class="min-w-0">
            <p class="text-xs font-medium">{{ q.question }}</p>
            <p class="text-2xs text-muted mt-1">
              Your answer: {{ q.choices[answers[i]] }}
            </p>
          </div>
        </div>
      </div>

      <p class="label-soft mt-4">Incorrect</p>
      <div
        v-for="{ q, i } in incorrectQuestions"
        :key="q.id"
        class="border border-hairline rounded-sm p-3 cursor-pointer hover:border-accent transition-colors border-l-2 border-l-red-500"
        @click="goTo(i)"
      >
        <div class="flex items-start gap-2">
          <span class="text-2xs text-muted tabular-nums whitespace-nowrap mt-0.5">{{ i + 1 }}.</span>
          <div class="min-w-0">
            <p class="text-xs font-medium">{{ q.question }}</p>
            <p class="text-2xs text-muted mt-1">
              Your answer: {{ q.choices[answers[i]] }}
              — Correct: {{ q.choices[q.answer] }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <button
      class="text-2xs text-accent hover:underline"
      @click="showSummary = false"
    >Back to questions</button>
  </div>

  <!-- Question / Reveal -->
  <div v-else class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="font-serif text-2xl font-extrabold">Daily Recall</h1>
      <span class="text-2xs text-muted tabular-nums">{{ recallData.generated }}</span>
    </div>

    <!-- Question navigation dots -->
    <div class="flex items-center gap-1 flex-wrap">
      <button
        v-for="(q, i) in questions"
        :key="i"
        class="w-9 h-9 rounded-sm text-2xs font-semibold tabular-nums border transition-colors"
        :class="[
          i === current ? 'border-accent text-accent bg-accent/10' : 'border-hairline text-muted hover:border-accent',
          answers[i] !== null && answers[i] === q.answer ? 'bg-green-600/10' : '',
          answers[i] !== null && answers[i] !== q.answer ? 'bg-red-500/10' : '',
        ]"
        @click="goTo(i)"
      >{{ i + 1 }}</button>

      <button
        v-if="allAnswered"
        class="ml-auto text-2xs font-semibold text-accent border border-accent rounded-sm px-3 h-7 hover:bg-accent/10 transition-colors"
        @click="viewSummary"
      >Scorecard</button>
    </div>

    <!-- Question card -->
    <div v-if="currentQ" class="space-y-4">
      <div>
        <div class="flex items-center justify-between">
          <span class="label-soft">{{ currentQ.topic }} / {{ currentQ.subtopic }}</span>
          <span class="text-2xs text-muted tabular-nums">{{ current + 1 }} of {{ totalQuestions }}</span>
        </div>
        <p class="text-sm font-medium mt-2">{{ currentQ.question }}</p>
      </div>

      <!-- Choices -->
      <div class="grid gap-2">
        <button
          v-for="(choice, ci) in currentQ.choices"
          :key="ci"
          class="text-left text-xs p-3 border rounded-sm transition-colors min-h-[44px]"
          :class="[
            !isAnswered ? 'border-hairline hover:border-accent cursor-pointer' : 'cursor-default',
            isAnswered && ci === currentQ.answer ? 'border-green-600 bg-green-600/10' : '',
            isAnswered && ci === currentAnswer && ci !== currentQ.answer ? 'border-red-500 bg-red-500/10' : '',
            isAnswered && ci !== currentQ.answer && ci !== currentAnswer ? 'border-hairline opacity-50' : '',
          ]"
          :disabled="isAnswered"
          @click="selectAnswer(ci)"
        >{{ choice }}</button>
      </div>

      <!-- Reveal: explanation + sheet link -->
      <div v-if="isAnswered" class="space-y-2 border-t border-hairline pt-3">
        <p class="text-xs text-muted">{{ currentQ.explanation }}</p>
        <RouterLink
          :to="`/${currentQ.topic}/${currentQ.subtopic}`"
          class="text-2xs text-accent hover:underline"
        >Review this sheet →</RouterLink>
      </div>
    </div>
  </div>
</template>
