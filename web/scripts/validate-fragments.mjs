#!/usr/bin/env node
// Validates every Sheet Fragment (content/*/*/sheet.html) against the Fragment contract
// (HLDD §2) plus its JSON manifest, and every Plan (content/plans/*/plan.json) against
// the Plan shape: Parts → Steps → Sources (HLDD §3).
import { readFileSync, readdirSync, statSync, existsSync, realpathSync } from 'node:fs'
import { join, relative } from 'node:path'
import { BACKGROUNDS, MIN_CONTRAST, HEX, hexToRgb, contrast } from '../src/lib/accent.js'

const CONTENT = join(import.meta.dirname, '..', '..', 'content')

const ALLOWED = {
  section: ['id'], h2: [], h3: [], p: [], ul: [], ol: [], li: [],
  strong: [], em: [], code: [], br: [], a: ['href'],
  div: ['class'], span: ['class'],
  table: [], thead: [], tbody: [], tr: [], th: ['colspan', 'rowspan'], td: ['colspan', 'rowspan'],
  pre: [], figure: ['class'], figcaption: [], svg: null, // null = svg subtree, checked separately
}
const DIV_CLASSES = new Set(['tbl', 'code', 'flow', 'note', 'cols', 'step'])
const SPAN_CLASSES = new Set(['label'])
const FIGURE_CLASSES = new Set(['diagram'])
const SVG_CLASSES = new Set(['dg-box', 'dg-hot', 'dg-txt', 'dg-txt-inv', 'dg-lbl', 'dg-line', 'dg-flow'])
const COLOUR = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i

function* tags(html) {
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g
  let m
  while ((m = re.exec(html))) {
    const line = html.slice(0, m.index).split('\n').length
    yield { closing: m[1] === '/', name: m[2].toLowerCase(), attrs: m[3], line, raw: m[0] }
  }
}
function attrPairs(attrs) {
  const out = []
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g
  let m
  while ((m = re.exec(attrs))) out.push([m[1].toLowerCase(), m[3] ?? m[4] ?? ''])
  return out
}

// Returns the violation messages ("file:line: msg") for the content tree at ROOT.
export function validate(ROOT = CONTENT) {
  const errors = []
  const fail = (file, line, msg) => { errors.push(`${file}:${line}: ${msg}`) }

  const fragments = [] // { file, manifest }
  const planFiles = []
  for (const topic of readdirSync(ROOT)) {
    const tdir = join(ROOT, topic)
    if (!statSync(tdir).isDirectory()) continue
    for (const sub of readdirSync(tdir)) {
      if (topic === 'plans') {
        const f = join(tdir, sub, 'plan.json')
        if (existsSync(f)) planFiles.push(f)
        continue
      }
      const f = join(tdir, sub, 'sheet.html')
      if (existsSync(f)) fragments.push({ file: f, manifest: join(tdir, sub, 'sheet.json') })
    }
    if (topic !== 'plans' && fragments.some(fr => fr.file.startsWith(tdir + '/'))) {
      const tj = join(tdir, 'topic.json')
      if (!existsSync(tj)) fail(relative(join(ROOT, '..'), tdir), 1, 'missing topic.json')
      else {
        try { checkAccent(relative(join(ROOT, '..'), tj), JSON.parse(readFileSync(tj, 'utf8')).accent) }
        catch (e) { fail(relative(join(ROOT, '..'), tj), 1, `invalid JSON: ${e.message}`) }
      }
    }
  }

  // Every Topic and Plan has one accent per theme, each readable as text on that theme.
  function checkAccent(rel, accent) {
    if (!accent || typeof accent !== 'object') return fail(rel, 1, 'needs "accent": { "light": "#rrggbb", "dark": "#rrggbb" }')
    for (const theme of ['light', 'dark']) {
      const hex = accent[theme]
      if (!HEX.test(hex ?? '')) { fail(rel, 1, `accent.${theme} must be a #rrggbb colour`); continue }
      const worst = Math.min(...BACKGROUNDS[theme].map((bg) => contrast(hexToRgb(hex), bg)))
      if (worst < MIN_CONTRAST) fail(rel, 1, `accent.${theme} ${hex} has contrast ${worst.toFixed(2)}:1 on the ${theme} theme (needs ${MIN_CONTRAST}:1)`)
    }
  }

  const ROLES = new Set(['original', 'video', 'written'])
  const text = (v) => typeof v === 'string' && v.trim() !== ''
  function checkPlan(path) {
    const rel = relative(join(ROOT, '..'), path)
    let m
    try { m = JSON.parse(readFileSync(path, 'utf8')) } catch (e) { return fail(rel, 1, `invalid JSON: ${e.message}`) }
    if (!text(m.title)) fail(rel, 1, 'missing "title"')
    checkAccent(rel, m.accent)
    if (!Array.isArray(m.parts) || !m.parts.length) return fail(rel, 1, 'needs a non-empty "parts" array')
    m.parts.forEach((part, pi) => {
      const at = `parts[${pi}]`
      if (!text(part.title)) fail(rel, 1, `${at} needs "title"`)
      if (!text(part.summary)) fail(rel, 1, `${at} needs a one-line "summary"`)
      if (!Array.isArray(part.steps) || !part.steps.length) return fail(rel, 1, `${at} needs a non-empty "steps" array`)
      part.steps.forEach((step, si) => {
        const st = `${at}.steps[${si}]`
        if (!text(step.title)) fail(rel, 1, `${st} needs "title"`)
        if (!text(step.summary)) fail(rel, 1, `${st} needs a one-line "summary"`)
        if (step.done !== undefined && typeof step.done !== 'boolean') fail(rel, 1, `${st}.done must be true or false`)
        if (step.sheet !== undefined && !existsSync(join(ROOT, ...String(step.sheet).split('/'), 'sheet.json')))
          fail(rel, 1, `${st}.sheet '${step.sheet}' is not an existing topic/sheet`)
        if (!Array.isArray(step.sources) || !step.sources.length) return fail(rel, 1, `${st} needs a non-empty "sources" array`)
        step.sources.forEach((src, ki) => {
          const so = `${st}.sources[${ki}]`
          if (!ROLES.has(src.role)) fail(rel, 1, `${so}.role must be one of ${[...ROLES].join(', ')}`)
          if (!text(src.title)) fail(rel, 1, `${so} needs "title"`)
          if (!text(src.note)) fail(rel, 1, `${so} needs a one-line "note"`)
          if (!/^https:\/\//.test(src.url ?? '')) fail(rel, 1, `${so}.url must be an https:// link`)
        })
      })
    })
  }
  planFiles.forEach(checkPlan)

  function checkManifest(path) {
    const rel = relative(join(ROOT, '..'), path)
    if (!existsSync(path)) return fail(rel, 1, 'missing manifest')
    let m
    try { m = JSON.parse(readFileSync(path, 'utf8')) } catch (e) { return fail(rel, 1, `invalid JSON: ${e.message}`) }
    if (typeof m.title !== 'string' || !m.title) fail(rel, 1, 'missing "title"')
    for (const [i, src] of (m.sources ?? []).entries())
      if (!src.title || !src.url) fail(rel, 1, `sources[${i}] needs "title" and "url"`)
  }

  for (const { file, manifest } of fragments) {
    checkManifest(manifest)
    const rel = relative(join(ROOT, '..'), file)
    const html = readFileSync(file, 'utf8')
    if (/<style[\s>]/i.test(html)) fail(rel, 1, 'contains <style>')
    if (/<script[\s>]/i.test(html)) fail(rel, 1, 'contains <script>')
    const ids = new Set()
    let svgDepth = 0
    for (const t of tags(html)) {
      if (t.name === 'svg') { svgDepth += t.closing ? -1 : 1; if (t.closing) continue }
      if (svgDepth > 0 || t.name === 'svg') {
        // inside SVG: any element, but no style/on*/literal colours; classes from SVG_CLASSES
        if (t.closing) continue
        for (const [k, v] of attrPairs(t.attrs)) {
          if (k === 'style' || k.startsWith('on')) fail(rel, t.line, `<${t.name}> ${k} attribute forbidden`)
          else if ((k === 'fill' || k === 'stroke') && COLOUR.test(v)) fail(rel, t.line, `<${t.name}> literal colour '${v}'`)
          else if (k === 'class') for (const c of v.split(/\s+/).filter(Boolean))
            if (!SVG_CLASSES.has(c)) fail(rel, t.line, `svg class '${c}' not in vocabulary`)
        }
        continue
      }
      if (t.closing) continue
      if (!(t.name in ALLOWED)) { fail(rel, t.line, `<${t.name}> not in vocabulary`); continue }
      for (const [k, v] of attrPairs(t.attrs)) {
        if (!ALLOWED[t.name]?.includes(k)) { fail(rel, t.line, `<${t.name}> attribute '${k}' not allowed`); continue }
        if (k === 'id') { if (ids.has(v)) fail(rel, t.line, `duplicate id '${v}'`); ids.add(v) }
        if (k === 'href' && !v.startsWith('#')) fail(rel, t.line, `external href '${v}' forbidden`)
        if (k === 'class') {
          const set = t.name === 'div' ? DIV_CLASSES : t.name === 'span' ? SPAN_CLASSES : FIGURE_CLASSES
          for (const c of v.split(/\s+/).filter(Boolean))
            if (!set.has(c)) fail(rel, t.line, `<${t.name}> class '${c}' not in vocabulary`)
        }
      }
      if (COLOUR.test(t.attrs)) fail(rel, t.line, `literal colour in <${t.name}> attributes`)
    }
    for (const t of tags(html)) { // top-level structure: every h2 must live in a section with id
      if (!t.closing && t.name === 'section' && !/id\s*=/.test(t.attrs)) fail(rel, t.line, '<section> without id')
    }
  }
  return { errors, fragments: fragments.length, plans: planFiles.length }
}

if (process.argv[1] && realpathSync(process.argv[1]) === import.meta.filename) {
  const { errors, fragments, plans } = validate()
  for (const e of errors) console.error(e)
  const scope = `${fragments} Sheet(s) and ${plans} Plan(s)`
  console.error(errors.length ? `\n${errors.length} violation(s) across ${scope}` : `OK — ${scope} valid`)
  process.exit(errors.length ? 1 : 0)
}
