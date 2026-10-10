// Fragment contract validator (scripts/validate-fragments.mjs), run against
// throwaway content trees and against the real content/.
import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { validate } from '../scripts/validate-fragments.mjs'

const GOOD_SHEET = '<section id="intro"><h2>Intro</h2><p>Text <a href="#intro">here</a>.</p></section>\n'
const ACCENT = { light: '#7C3AED', dark: '#9D6BF2' }
const roots = []

// Build a content tree: { 'topic/sheet/sheet.html': '...', ... }; manifests are JSON-stringified.
function tree(files) {
  const root = mkdtempSync(join(tmpdir(), 'cheatsheets-'))
  roots.push(root)
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), typeof body === 'string' ? body : JSON.stringify(body))
  }
  return root
}
const sheet = (html, extra = {}) => tree({
  't/topic.json': { title: 'T', accent: ACCENT },
  't/s/sheet.json': { title: 'S' },
  't/s/sheet.html': html,
  ...extra,
})

afterEach(() => { while (roots.length) rmSync(roots.pop(), { recursive: true, force: true }) })

describe('validator', () => {
  it('accepts the real content/ tree', () => {
    const { errors, fragments } = validate()
    expect(errors).toEqual([])
    expect(fragments).toBeGreaterThan(0)
  })

  it('accepts a minimal valid Sheet', () => {
    expect(validate(sheet(GOOD_SHEET)).errors).toEqual([])
  })

  it.each([
    ['<script>', '<section id="a"><script>alert(1)</script></section>', /contains <script>/],
    ['<style>', '<style>p{}</style><section id="a"></section>', /contains <style>/],
    ['a style attribute', '<section id="a"><p style="color:red">x</p></section>', /attribute 'style' not allowed/],
    ['a literal SVG colour', '<section id="a"><figure class="diagram"><svg><rect fill="#ff0000"/></svg></figure></section>', /literal colour/],
    ['an external href', '<section id="a"><a href="https://example.com">x</a></section>', /external href/],
    ['a tag outside the vocabulary', '<section id="a"><img></section>', /<img> not in vocabulary/],
    ['a duplicate section id', '<section id="a"></section><section id="a"></section>', /duplicate id 'a'/],
  ])('rejects a Sheet with %s', (_, html, msg) => {
    const { errors } = validate(sheet(html))
    expect(errors.some((e) => msg.test(e)), errors.join('\n')).toBe(true)
  })

  it('rejects a Sheet whose manifest is missing or has no title', () => {
    const missing = tree({ 't/topic.json': { title: 'T', accent: ACCENT }, 't/s/sheet.html': GOOD_SHEET })
    expect(validate(missing).errors).toEqual([expect.stringMatching(/sheet\.json:1: missing manifest/)])
    const untitled = sheet(GOOD_SHEET, { 't/s/sheet.json': { subtitle: 'x' } })
    expect(validate(untitled).errors).toEqual([expect.stringMatching(/missing "title"/)])
  })

  it('rejects a Topic without topic.json', () => {
    const root = tree({ 't/s/sheet.json': { title: 'S' }, 't/s/sheet.html': GOOD_SHEET })
    expect(validate(root).errors).toEqual([expect.stringMatching(/missing topic\.json/)])
  })

  const PLAN = {
    title: 'P',
    accent: ACCENT,
    parts: [{ title: 'Part', summary: 'One line.', steps: [{ title: 'Step', summary: 'One line.', sources: [
      { role: 'original', title: 'Paper', url: 'https://example.com/paper', note: 'Where it began.' },
    ] }] }],
  }

  it('accepts a well-formed Plan', () => {
    expect(validate(tree({ 'plans/p/plan.json': PLAN })).errors).toEqual([])
  })

  it('rejects a Plan Source with an unknown role, a non-https link or no note', () => {
    const bad = structuredClone(PLAN)
    bad.parts[0].steps[0].sources[0] = { role: 'extra', title: 'X', url: 'http://example.com' }
    const errors = validate(tree({ 'plans/p/plan.json': bad })).errors
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/role must be one of/),
      expect.stringMatching(/https:\/\/ link/),
      expect.stringMatching(/needs a one-line "note"/),
    ]))
  })

  it('rejects a Step whose Sheet link points nowhere', () => {
    const bad = structuredClone(PLAN)
    bad.parts[0].steps[0].sheet = 'nope/missing'
    expect(validate(tree({ 'plans/p/plan.json': bad })).errors)
      .toEqual([expect.stringMatching(/is not an existing topic\/sheet/)])
  })

  it('rejects a Topic accent that is missing or unreadable in its theme', () => {
    const noAccent = tree({ 't/topic.json': { title: 'T' }, 't/s/sheet.json': { title: 'S' }, 't/s/sheet.html': GOOD_SHEET })
    expect(validate(noAccent).errors).toEqual([expect.stringMatching(/needs "accent"/)])
    const pale = tree({
      't/topic.json': { title: 'T', accent: { light: '#61DAFB', dark: '#61DAFB' } },
      't/s/sheet.json': { title: 'S' }, 't/s/sheet.html': GOOD_SHEET,
    })
    expect(validate(pale).errors).toEqual([expect.stringMatching(/accent\.light #61DAFB has contrast .* on the light theme/)])
  })
})
