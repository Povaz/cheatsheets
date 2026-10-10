// Practice-question draw/score logic (questions.js). The module captures
// today's key and reads localStorage at import time, so each test imports a
// fresh copy over its own fake storage and a mocked five-question Bank.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const TODAY = 'cheatsheet:questions:2026-10-10'
const BANK = ['a', 'b', 'c', 'd', 'e'].map((x) => ({ id: `t/s#${x}`, answer: 0 }))

function memoryStorage(entries = {}) {
  const m = new Map(Object.entries(entries))
  return {
    get length() { return m.size },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    keys: () => [...m.keys()],
  }
}

async function load(storage, bank = BANK) {
  vi.stubGlobal('localStorage', storage)
  vi.doMock('../src/lib/content.js', () => ({
    bankAvailable: bank.length > 0,
    loadBank: async () => bank,
  }))
  return import('../src/lib/questions.js')
}

// Answer `n` questions in a row, returning the drawn ids.
async function answer(q, n) {
  const ids = []
  for (let i = 0; i < n; i++) {
    await q.next()
    ids.push(q.current.value.id)
    q.pick(0)
  }
  return ids
}

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 10, 12, 0))
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.doUnmock('../src/lib/content.js')
})

describe('questions', () => {
  it('never repeats a question within the day until the Bank is exhausted', async () => {
    const q = await load(memoryStorage())
    const ids = await answer(q, BANK.length)
    expect(new Set(ids).size).toBe(BANK.length)
  })

  it('recycles the whole Bank once every question was seen, and the score keeps counting', async () => {
    const q = await load(memoryStorage())
    await answer(q, BANK.length)
    await q.next()
    expect(q.current.value).not.toBeNull()
    q.pick(1) // wrong
    expect(q.answered.value).toBe(BANK.length + 1)
    expect(q.correct.value).toBe(BANK.length)
  })

  it("resumes today's score and skips today's seen questions after a reload", async () => {
    const seen = BANK.slice(0, 4).map((b) => b.id)
    const storage = memoryStorage({ [TODAY]: JSON.stringify({ correct: 3, answered: 4, seen }) })
    const q = await load(storage)
    expect([q.correct.value, q.answered.value]).toEqual([3, 4])
    await q.next()
    expect(q.current.value.id).toBe('t/s#e')
  })

  it("drops stale days' keys and retired recall:* keys, keeping today's and unrelated ones", async () => {
    const storage = memoryStorage({
      'cheatsheet:questions:2026-10-09': JSON.stringify({ correct: 9, answered: 9, seen: [] }),
      'recall:session': '{}',
      [TODAY]: JSON.stringify({ correct: 1, answered: 1, seen: [] }),
      'other:key': 'x',
    })
    const q = await load(storage)
    expect(storage.keys().sort()).toEqual([TODAY, 'other:key'])
    expect(q.answered.value).toBe(1)
  })

  it('scores a question once: a second pick on the same question is ignored', async () => {
    const storage = memoryStorage()
    const q = await load(storage)
    await q.next()
    q.pick(0)
    q.pick(0)
    expect([q.correct.value, q.answered.value]).toEqual([1, 1])
    expect(JSON.parse(storage.getItem(TODAY))).toMatchObject({ correct: 1, answered: 1, seen: [q.current.value.id] })
  })

  it('keeps working when localStorage throws (private mode / blocked storage)', async () => {
    const boom = () => { throw new Error('SecurityError') }
    const q = await load({ get length() { return boom() }, key: boom, getItem: boom, setItem: boom, removeItem: boom })
    const ids = await answer(q, 2)
    expect(ids).toHaveLength(2)
    expect(q.answered.value).toBe(2)
  })

  it('draws nothing from an empty Bank without throwing', async () => {
    const q = await load(memoryStorage(), [])
    await q.start()
    expect(q.current.value).toBeNull()
    q.pick(0)
    expect(q.answered.value).toBe(0)
  })
})
