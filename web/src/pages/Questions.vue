<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { isSmallScreen } from '../store.js'
import { findTopic } from '../lib/content.js'
import {
  correct, answered, current, picked, questionsOpen, start, next, pick,
} from '../lib/questions.js'
import QuestionCard from '../components/QuestionCard.vue'

const router = useRouter()

// Desktop: the question view lives on Home (§7.1 — no navigation).
// A deep link lands here, flips the flag, and goes to `/`.
watch(isSmallScreen, redirectIfDesktop, { immediate: true })
function redirectIfDesktop(small = isSmallScreen.value) {
  if (!small) {
    questionsOpen.value = true
    router.replace('/')
  }
}

start()

const pct = computed(() =>
  answered.value > 0 ? Math.round((correct.value / answered.value) * 100) : null,
)

const topicAccent = computed(() => {
  if (!current.value) return 'rgb(var(--c-accent))'
  return findTopic(current.value.topic)?.accent || 'rgb(var(--c-accent))'
})

const bodyEl = ref(null)

async function nextQuestion() {
  await next()
  if (bodyEl.value) bodyEl.value.scrollTop = 0
}
</script>

<template>
  <div class="mq-screen">
    <div class="mq-nav">
      <button class="mq-back" @click="router.push('/')" aria-label="Back to index">‹</button>
      <span class="mq-sq" :style="{ background: topicAccent }"></span>
      <span class="mq-slug" v-if="current">{{ current.topic }} / {{ current.subtopic }}</span>
      <span class="flex-1"></span>
      <span class="mq-score">
        {{ correct }}/{{ answered }}
        <span v-if="pct !== null" class="mq-score-pct">{{ pct }}%</span>
      </span>
    </div>

    <div class="mq-body" ref="bodyEl">
      <QuestionCard v-if="current" :question="current" :picked="picked" @pick="pick" />
      <p v-else class="mq-empty">The Question Bank is empty.</p>
    </div>

    <div class="mq-actionbar">
      <button
        class="mq-next"
        :class="{ 'mq-next--live': picked !== null }"
        :disabled="picked === null"
        @click="nextQuestion"
      >Next question →</button>
    </div>
  </div>
</template>

<style scoped>
.mq-screen {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: rgb(var(--c-paper));
}

.mq-nav {
  flex: 0 0 auto;
  padding: 13px 16px;
  border-bottom: 1px solid rgb(var(--c-hairline));
  display: flex;
  align-items: center;
  gap: 8px;
}
.mq-back {
  width: 44px;
  height: 44px;
  margin: -13px 0 -13px -14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 18px;
  color: rgb(var(--c-muted));
  cursor: pointer;
}
.mq-sq {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
}
.mq-slug {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
  font-weight: 700;
  color: rgb(var(--c-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.mq-score {
  font-size: 12px;
  color: rgb(var(--c-muted));
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.mq-score-pct {
  font-size: 10px;
  font-weight: 600;
  color: rgb(var(--c-accent));
}

.mq-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}
.mq-empty {
  font-size: 12px;
  color: rgb(var(--c-muted));
}

.mq-actionbar {
  flex: 0 0 auto;
  border-top: 1px solid rgb(var(--c-hairline));
  background: rgb(var(--c-paper-warm));
  padding: 12px 16px 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}
.mq-next {
  width: 100%;
  height: 50px;
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
}
.mq-next--live {
  background: rgb(var(--c-accent));
  border-color: rgb(var(--c-accent));
  color: rgb(var(--c-paper));
  cursor: pointer;
}
</style>
