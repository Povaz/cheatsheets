import { splitFrontmatter } from './yaml.js'

/**
 * @typedef {Object} Cheatsheet
 * @property {Object} frontmatter
 * @property {Chapter[]} chapters
 */

/**
 * @typedef {Object} Chapter
 * @property {string} id            slug; '' for the implicit chapter
 * @property {string} title         '' for the implicit chapter (no divider/rail rendered)
 * @property {Section[]} sections
 */

/**
 * @typedef {Object} Section
 * @property {'card'|'pills'|'code'|'diagram'|'text'} type
 * @property {string} id
 * @property {string} title
 * @property {Object} attrs
 * @property {Callout[]} callouts
 * @property {string[]} [columns]
 * @property {Object[]} [rows]
 * @property {CodeBlock[]} [blocks]
 * @property {string[]} [items]
 */

/**
 * @typedef {{kind: string, text: string}} Callout
 * @typedef {{lang: string, code: string}} CodeBlock
 */

const SECTION_TYPES = new Set(['card', 'pills', 'code', 'diagram', 'text', 'chapter'])

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseAttrs(raw) {
  const attrs = {}
  if (!raw) return attrs
  for (const pair of raw.split(',')) {
    const idx = pair.indexOf(':')
    if (idx < 0) continue
    const key = pair.slice(0, idx).trim()
    let value = pair.slice(idx + 1).trim()
    value = value.replace(/^["']|["']$/g, '')
    if (key) attrs[key] = value
  }
  return attrs
}

function parseHeader(line) {
  let rest = line.replace(/^##\s+/, '')
  let type = 'card'
  let id = null

  const typeMatch = rest.match(/^\[\s*([\w-]+)(?:\s+([\w./-]+))?\s*\]\s*/)
  if (typeMatch) {
    type = typeMatch[1]
    id = typeMatch[2] || null
    rest = rest.slice(typeMatch[0].length)
  }

  let attrs = {}
  const attrMatch = rest.match(/\s*\{([^}]+)\}\s*$/)
  if (attrMatch) {
    attrs = parseAttrs(attrMatch[1])
    rest = rest.slice(0, rest.length - attrMatch[0].length).trimEnd()
  }

  const title = rest.trim()
  if (!id) id = slugify(title) || type

  return {
    type: SECTION_TYPES.has(type) ? type : 'card',
    id,
    title,
    attrs,
  }
}

function splitTableRow(line) {
  const body = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '')
  const cells = []
  let current = ''
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    if (ch === '\\' && body[i + 1] === '|') {
      current += '|'
      i++
    } else if (ch === '|') {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

function isSeparatorRow(line) {
  return /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && /-/.test(line)
}

function parseTable(lines) {
  const pipeLines = lines.filter((l) => l.trim().startsWith('|'))
  if (pipeLines.length < 2) return { columns: [], rows: [] }
  const headerIdx = 0
  const sepIdx = isSeparatorRow(pipeLines[1]) ? 1 : -1
  const columns = splitTableRow(pipeLines[headerIdx])
  const bodyStart = sepIdx >= 0 ? sepIdx + 1 : 1
  const rows = pipeLines.slice(bodyStart).map((line) => {
    const cells = splitTableRow(line)
    const row = {}
    columns.forEach((col, i) => {
      row[col] = cells[i] ?? ''
    })
    return row
  })
  return { columns, rows }
}

function parseCallouts(lines) {
  const callouts = []
  for (const line of lines) {
    const m = line.match(/^>\s*\[([\w-]+)\]\s*(.+)$/)
    if (m) callouts.push({ kind: m[1], text: m[2].trim() })
  }
  return callouts
}

function parseCodeBlocks(lines) {
  const blocks = []
  let current = null
  for (const line of lines) {
    const fence = line.match(/^```(.*)$/)
    if (fence) {
      if (current) {
        blocks.push(current)
        current = null
      } else {
        current = { lang: fence[1].trim(), code: '' }
      }
      continue
    }
    if (current) {
      current.code += (current.code ? '\n' : '') + line
    }
  }
  if (current) blocks.push(current)
  return blocks
}

function parseTextItems(lines) {
  const items = []
  for (const line of lines) {
    const m = line.match(/^\s*-\s+(.+)$/)
    if (m) items.push(m[1])
  }
  return items
}

function finalizeSection(header, bodyLines) {
  const calloutLines = []
  const other = []
  let inFence = false
  for (const line of bodyLines) {
    if (/^```/.test(line)) inFence = !inFence
    if (!inFence && /^>\s*\[/.test(line)) calloutLines.push(line)
    else other.push(line)
  }
  const callouts = parseCallouts(calloutLines)

  const section = { ...header, callouts }
  if (header.type === 'card' || header.type === 'pills') {
    Object.assign(section, parseTable(other))
  } else if (header.type === 'code' || header.type === 'diagram') {
    section.blocks = parseCodeBlocks(other)
  } else if (header.type === 'text') {
    section.items = parseTextItems(other)
  }
  return section
}

/**
 * Parse a cheatsheet Markdown string into a structured object.
 * @param {string} raw
 * @returns {Cheatsheet}
 */
export function parseCheatsheet(raw) {
  const { frontmatter, body } = splitFrontmatter(raw)
  const lines = body.split('\n')

  const chapters = []
  let currentChapter = null
  let currentSection = null
  let bodyLines = []

  const ensureChapter = () => {
    if (currentChapter) return currentChapter
    currentChapter = { id: '', title: '', sections: [] }
    chapters.push(currentChapter)
    return currentChapter
  }

  const flushSection = () => {
    if (!currentSection) return
    ensureChapter().sections.push(finalizeSection(currentSection, bodyLines))
    currentSection = null
    bodyLines = []
  }

  let inFence = false
  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence
    if (!inFence && /^##\s+/.test(line)) {
      const header = parseHeader(line)
      if (header.type === 'chapter') {
        flushSection()
        currentChapter = {
          id: header.id,
          title: header.title,
          sections: [],
        }
        chapters.push(currentChapter)
      } else {
        flushSection()
        currentSection = header
      }
    } else if (currentSection) {
      bodyLines.push(line)
    }
  }
  flushSection()

  if (chapters.length === 0) {
    chapters.push({ id: '', title: '', sections: [] })
  }

  return { frontmatter, chapters }
}
