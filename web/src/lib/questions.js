import { ref } from 'vue'
import { loadBank, bankAvailable } from './content.js'

export { bankAvailable }

const KEY_PREFIX = 'cheatsheet:questions:'

function localDate() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// Captured once: a commit after midnight still writes to the key the session
// started on, and the next load sweeps it — the score resets with the day.
const KEY = KEY_PREFIX + localDate()

function readToday() {
  const state = { correct: 0, answered: 0, seen: [] }
  try {
    // Daily reset: drop every cheatsheet:questions:* key except today's,
    // plus the retired Daily Recall `recall:*` session keys.
    const stale = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      if ((k.startsWith(KEY_PREFIX) && k !== KEY) || k.startsWith('recall:')) stale.push(k)
    }
    stale.forEach((k) => localStorage.removeItem(k))
    const stored = JSON.parse(localStorage.getItem(KEY))
    if (
      stored &&
      Number.isInteger(stored.correct) &&
      Number.isInteger(stored.answered) &&
      Array.isArray(stored.seen)
    ) return stored
  } catch {}
  return state
}

const initial = readToday()

export const correct = ref(initial.correct)
export const answered = ref(initial.answered)
let seen = new Set(initial.seen)

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      correct: correct.value,
      answered: answered.value,
      seen: [...seen],
    }))
  } catch {}
}

export const current = ref(null)
export const picked = ref(null)
export const questionsOpen = ref(false)

async function draw() {
  const bank = await loadBank()
  if (!bank.length) return null
  let pool = bank.filter((q) => !seen.has(q.id))
  if (!pool.length) {
    // Whole bank seen today — recycle; the score keeps counting.
    seen = new Set()
    pool = bank
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export async function start() {
  if (!current.value) await next()
}

export async function next() {
  picked.value = null
  current.value = await draw()
}

export function pick(i) {
  if (picked.value !== null || !current.value) return
  picked.value = i
  seen.add(current.value.id)
  answered.value += 1
  if (i === current.value.answer) correct.value += 1
  persist()
}
