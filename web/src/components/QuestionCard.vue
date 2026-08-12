<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  picked: { type: Number, default: null },
})
const emit = defineEmits(['pick'])

const isAnswered = computed(() => props.picked !== null)
const isCorrect = computed(() => props.picked === props.question.answer)
const answerLetter = computed(() => String.fromCharCode(65 + props.question.answer))

function letter(i) { return String.fromCharCode(65 + i) }

function choiceState(i) {
  if (!isAnswered.value) return 'idle'
  if (i === props.question.answer) return 'correct'
  if (i === props.picked) return 'wrong'
  return 'dim'
}
</script>

<template>
  <div class="qc">
    <p class="qc-stem">{{ question.question }}</p>

    <div class="qc-choices">
      <button
        v-for="(choice, i) in question.choices"
        :key="i"
        class="qc-choice"
        :class="`qc-choice--${choiceState(i)}`"
        :disabled="isAnswered"
        @click="emit('pick', i)"
      >
        <span class="qc-badge">{{ letter(i) }}</span>
        <span class="qc-choice-text">{{ choice }}</span>
        <span v-if="choiceState(i) === 'correct'" class="qc-mark qc-mark--correct">✓</span>
        <span v-else-if="choiceState(i) === 'wrong'" class="qc-mark qc-mark--wrong">✗</span>
      </button>
    </div>

    <div v-if="isAnswered" class="qc-reveal" :class="isCorrect ? 'qc-reveal--correct' : 'qc-reveal--wrong'">
      <div class="qc-reveal-header">
        <span class="qc-verdict-circle" :class="isCorrect ? 'qc-verdict-circle--correct' : 'qc-verdict-circle--wrong'">
          {{ isCorrect ? '✓' : '✗' }}
        </span>
        <span class="qc-verdict" :class="isCorrect ? 'qc-verdict--correct' : 'qc-verdict--wrong'">
          {{ isCorrect ? 'Correct' : `Not quite — the answer was ${answerLetter}` }}
        </span>
        <span class="flex-1"></span>
        <RouterLink class="qc-sheet-link" :to="`/${question.topic}/${question.subtopic}`">
          Read the sheet →
        </RouterLink>
      </div>
      <p class="qc-explanation">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<style scoped>
.qc {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.qc-stem {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.65;
  text-wrap: pretty;
  color: rgb(var(--c-ink));
  margin: 0;
}

.qc-choices {
  display: grid;
  gap: 9px;
}
.qc-choice {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 14px 16px;
  border-radius: 2px;
  font-size: 13px;
  line-height: 1.7;
  font-family: inherit;
  text-align: left;
  color: rgb(var(--c-ink));
  border: 1px solid rgb(var(--c-hairline));
  background: rgb(var(--c-surface));
  cursor: pointer;
  transition: border-color 120ms;
}
@media (hover: hover) {
  .qc-choice--idle:hover { border-color: rgb(var(--c-accent)); }
}
.qc-choice:disabled { cursor: default; }
.qc-choice--correct {
  border-color: #16A34A;
  background: rgba(22, 163, 74, 0.10);
}
.qc-choice--wrong {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.10);
}
.qc-choice--dim .qc-badge,
.qc-choice--dim .qc-choice-text { opacity: 0.45; }

.qc-badge {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(var(--c-hairline));
  border-radius: 2px;
  font-size: 10px;
  font-weight: 700;
  color: rgb(var(--c-muted));
}
.qc-choice--correct .qc-badge { color: #15803D; border-color: #16A34A; }
.qc-choice--wrong .qc-badge { color: #B91C1C; border-color: #EF4444; }
.qc-choice-text {
  flex: 1;
  min-width: 0;
  text-wrap: pretty;
}
.qc-mark {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 700;
}
.qc-mark--correct { color: #15803D; }
.qc-mark--wrong { color: #B91C1C; }

.qc-reveal {
  border-radius: 2px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.qc-reveal--correct {
  border: 1px solid rgba(22, 163, 74, 0.35);
  background: rgba(22, 163, 74, 0.07);
}
.qc-reveal--wrong {
  border: 1px solid rgba(239, 68, 68, 0.32);
  background: rgba(239, 68, 68, 0.06);
}
.qc-reveal-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.qc-verdict-circle {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
}
.qc-verdict-circle--correct { background: #16A34A; }
.qc-verdict-circle--wrong { background: #EF4444; }
.qc-verdict {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
  font-weight: 700;
}
.qc-verdict--correct { color: #15803D; }
.qc-verdict--wrong { color: #B91C1C; }
.qc-sheet-link {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgb(var(--c-accent));
  text-decoration: none;
  white-space: nowrap;
}
.qc-sheet-link:hover { text-decoration: underline; }
.qc-explanation {
  font-size: 12.5px;
  line-height: 1.8;
  text-wrap: pretty;
  color: #4A4340;
  margin: 0;
}
:global(html.dark) .qc-explanation { color: rgb(var(--c-ink) / 0.85); }

/* Mobile (§7.4) */
@media (max-width: 767.98px) {
  .qc { gap: 16px; }
  .qc-stem { font-size: 15px; line-height: 1.6; }
  .qc-choice { padding: 13px 14px; font-size: 12.5px; }
  .qc-reveal { padding: 14px; }
  .qc-explanation { line-height: 1.75; }
  .qc-reveal-header { flex-wrap: wrap; }
  .qc-sheet-link { order: 3; width: 100%; margin-top: 4px; }
}
</style>
