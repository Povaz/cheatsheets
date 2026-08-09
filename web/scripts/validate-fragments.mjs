#!/usr/bin/env node
// Validates every content/*/*/sheet.html against the Fragment contract (HLDD §3.5, §4.1).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(import.meta.dirname, '..', '..', 'content')

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

let failures = 0
const fail = (file, line, msg) => { failures++; console.error(`${file}:${line}: ${msg}`) }

const sheets = []
for (const topic of readdirSync(ROOT)) {
  const tdir = join(ROOT, topic)
  if (!statSync(tdir).isDirectory()) continue
  for (const sub of readdirSync(tdir)) {
    const f = join(tdir, sub, 'sheet.html')
    if (existsSync(f)) sheets.push(f)
  }
}

for (const file of sheets) {
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

console.error(failures ? `\n${failures} violation(s) across ${sheets.length} Fragment(s)` : `OK — ${sheets.length} Fragment(s) valid`)
process.exit(failures ? 1 : 0)
