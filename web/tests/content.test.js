// Content integrity against the REAL content/ tree, through the same loader
// the site uses (content.js, import.meta.glob).
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { topics, plans, findTopic, findSheet, loadBank } from '../src/lib/content.js'

const CONTENT = join(import.meta.dirname, '..', '..', 'content')
const readJson = (...p) => JSON.parse(readFileSync(join(CONTENT, ...p), 'utf8'))
const topicDirs = readdirSync(CONTENT).filter((t) => existsSync(join(CONTENT, t, 'topic.json')))

describe('Topics and Sheets', () => {
  it('loads every Topic folder with at least one Sheet, each with a title and a Fragment', () => {
    expect(topics.map((t) => t.slug).sort()).toEqual([...topicDirs].sort())
    for (const t of topics) {
      expect(t.sheets.length).toBeGreaterThan(0)
      for (const s of t.sheets) {
        expect(s.title, s.slug).toBeTruthy()
        expect(s.fragmentHtml.trim(), s.slug).not.toBe('')
      }
    }
  })

  it("names an existing Sheet in every topic.json `default` and `order` entry", () => {
    for (const t of topicDirs) {
      const meta = readJson(t, 'topic.json')
      for (const name of [meta.default, ...(meta.order ?? [])].filter(Boolean))
        expect(findSheet(t, name), `${t}/${name}`).not.toBeNull()
    }
  })

  it('resolves every Topic default to a loaded Sheet (the /:topic redirect target)', () => {
    for (const t of topics) expect(findSheet(t.slug, t.default), t.slug).not.toBeNull()
  })

  it("honours `order` first, then the remaining Sheets descending by name", () => {
    for (const t of topicDirs) {
      const order = readJson(t, 'topic.json').order ?? []
      const names = findTopic(t).sheets.map((s) => s.name)
      const listed = order.filter((n) => names.includes(n))
      const rest = names.filter((n) => !order.includes(n))
      const desc = [...rest].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
      expect(names, t).toEqual([...listed, ...desc])
    }
  })

  it('resolves every Source in sheet.json (remote URL or bundled local file)', () => {
    for (const t of topics) for (const s of t.sheets) {
      const declared = readJson(t.slug, s.name, 'sheet.json').sources ?? []
      expect(s.sources.length, `${s.slug}: a Source did not resolve`).toBe(declared.length)
      for (const src of s.sources) {
        expect(src.href, s.slug).toBeTruthy()
        if (src.kind === 'local') expect(src.filename, s.slug).toBeTruthy()
      }
    }
  })
})

describe('Question Bank', () => {
  it('has a well-formed entry for every question (4 choices, valid zero-indexed answer, text)', async () => {
    const bank = await loadBank()
    expect(bank.length).toBeGreaterThan(0)
    for (const q of bank) {
      expect(q.question?.trim(), q.id).toBeTruthy()
      expect(q.explanation?.trim(), q.id).toBeTruthy()
      expect(q.choices, q.id).toHaveLength(4)
      for (const c of q.choices) expect(typeof c === 'string' && c.trim(), q.id).toBeTruthy()
      expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${q.id} answer=${q.answer}`).toBe(true)
    }
  })

  it('belongs to an existing Sheet and has unique ids', async () => {
    const bank = await loadBank()
    for (const q of bank) expect(findSheet(q.topic, q.sheet), q.id).not.toBeNull()
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length)
  })
})

describe('Learning Plans', () => {
  it('loads every Plan folder with a title and a Fragment', () => {
    const dirs = readdirSync(join(CONTENT, 'plans')).filter((d) => existsSync(join(CONTENT, 'plans', d, 'plan.json')))
    expect(plans.map((p) => p.slug).sort()).toEqual(dirs.sort())
    for (const p of plans) {
      expect(p.title, p.slug).toBeTruthy()
      expect(p.fragmentHtml.trim(), p.slug).not.toBe('')
    }
  })

  it('opens every external Plan link in a new tab', () => {
    for (const p of plans) {
      const links = p.fragmentHtml.match(/<a href="https?:\/\/[^"]+"[^>]*>/g) ?? []
      for (const a of links) expect(a, p.slug).toContain('target="_blank"')
    }
  })
})
