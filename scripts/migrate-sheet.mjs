#!/usr/bin/env node
// Convert a content/<topic>/<subtopic>/sheet.md into:
//   content/<topic>/<subtopic>/sheet.yml
//   content/<topic>/<subtopic>/cards/<id>.md  (one per non-chapter section)
// Then delete the original sheet.md.
//
// Usage:  node scripts/migrate-sheet.mjs <path/to/sheet.md>
//
// Throw-away: this script is removed from the repo in the same commit
// that drops the legacy sheet.md branch from the loader.

import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'

const path = process.argv[2]
if (!path) {
  console.error('Usage: node scripts/migrate-sheet.mjs <path/to/sheet.md>')
  process.exit(1)
}

const raw = readFileSync(path, 'utf8')
const dir = dirname(path)

// 1. Split frontmatter off.
const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
let frontmatter = {}
let body = raw
if (fmMatch) {
  body = raw.slice(fmMatch[0].length)
  for (const line of fmMatch[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const k = line.slice(0, idx).trim()
    const v = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (k) frontmatter[k] = v
  }
}

// 2. Walk the body section by section. A section starts at a `## [...]` line
//    and runs until the next `## [...]` line (or EOF).
const HEADER_RE = /^##\s+\[\s*([\w-]+)(?:\s+([\w./-]+))?\s*\]\s*(.*?)(\s*\{[^}]+\})?\s*$/
const lines = body.split('\n')

const sections = []   // { type, id, title, attrs, bodyLines: [...] }
let current = null
for (const line of lines) {
  const m = line.match(HEADER_RE)
  if (m) {
    if (current) sections.push(current)
    current = {
      type: m[1],
      id: m[2] || null,
      title: (m[3] || '').trim(),
      attrs: m[4] ? m[4].trim() : '',
      bodyLines: [line],
    }
  } else if (current) {
    current.bodyLines.push(line)
  }
}
if (current) sections.push(current)

// 3. Build manifest chapters and write card files.
const chapters = []
let chapter = null

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const usedIds = new Set()
const ensureUnique = (id) => {
  if (!usedIds.has(id)) { usedIds.add(id); return id }
  let i = 2
  while (usedIds.has(`${id}-${i}`)) i++
  const fresh = `${id}-${i}`
  console.warn(`migrate: duplicate card id "${id}" → renamed to "${fresh}"`)
  usedIds.add(fresh)
  return fresh
}

mkdirSync(join(dir, 'cards'), { recursive: true })

for (const s of sections) {
  if (s.type === 'chapter') {
    chapter = { title: s.title, cards: [] }
    if (s.id) chapter.id = s.id
    chapters.push(chapter)
    continue
  }
  if (!chapter) {
    chapter = { cards: [] }   // chapterless case
    chapters.push(chapter)
  }
  const baseId = s.id || slug(s.title)
  const id = ensureUnique(baseId)

  // Trim trailing blank lines from the card body.
  while (s.bodyLines.length > 0 && s.bodyLines[s.bodyLines.length - 1].trim() === '') {
    s.bodyLines.pop()
  }

  // Rewrite the header line to use the (possibly renamed) id.
  const header = `## [${s.type} ${id}] ${s.title}${s.attrs ? ' ' + s.attrs : ''}`
  s.bodyLines[0] = header

  writeFileSync(join(dir, 'cards', `${id}.md`), s.bodyLines.join('\n') + '\n')
  chapter.cards.push(id)
}

// 4. Emit sheet.yml.
const yml = []
if (frontmatter.title) yml.push(`title: ${frontmatter.title}`)
if (frontmatter.subtitle) yml.push(`subtitle: ${frontmatter.subtitle}`)
yml.push('', 'chapters:')
for (const ch of chapters) {
  if (ch.title) yml.push(`  - title: ${ch.title}`)
  else yml.push(`  -`)
  if (ch.id) yml.push(`    id: ${ch.id}`)
  yml.push(`    cards:`)
  for (const id of ch.cards) yml.push(`      - ${id}`)
  yml.push('')
}
writeFileSync(join(dir, 'sheet.yml'), yml.join('\n'))

// 5. Drop the original sheet.md.
unlinkSync(path)

console.log(`migrated ${path}: ${sections.filter(s => s.type !== 'chapter').length} cards across ${chapters.length} chapter(s)`)
