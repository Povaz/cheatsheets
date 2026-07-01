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
 * @property {'table'|'code'|'text'} type
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
 */

/**
 * @typedef {Object} CodeBlock
 * @property {string} lang
 * @property {string} code
 * @property {string} [heading]   present only when the markdown supplied a ### sub-heading
 * @property {string} [filename]  present only when the opening fence info string included a filename: ```lang filename
 * @property {string} [preface]   present only when prose preceded the opening fence; paragraphs joined with \n
 * @property {string} [caption]   present only when prose followed the closing fence; paragraphs joined with \n\n
 */

const SECTION_TYPES = new Set(['table', 'code', 'text', 'chapter'])

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
  let type = 'table'
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
    type: SECTION_TYPES.has(type) ? type : 'table',
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

function parseCodeAnnotated(lines) {
  const blocks = []
  let pendingHeading = null
  let inFence = false
  let current = null
  /** @type {string[] | null} */
  let captionLines = null
  /** @type {string[]} */
  let prefaceLines = []
  let warnedOrphan = false

  const flushCaption = () => {
    if (captionLines && blocks.length > 0) {
      while (captionLines.length && captionLines[0].trim() === '') captionLines.shift()
      while (captionLines.length && captionLines[captionLines.length - 1].trim() === '') captionLines.pop()
      if (captionLines.length) {
        blocks[blocks.length - 1].caption = captionLines.join('\n')
      }
    }
    captionLines = null
  }

  for (const line of lines) {
    const fence = line.match(/^```(.*)$/)
    if (fence) {
      if (!inFence) {
        flushCaption()
        const info = fence[1].trim()
        const sp = info.search(/\s/)
        const lang = sp >= 0 ? info.slice(0, sp) : info
        const filename = sp >= 0 ? info.slice(sp + 1).trim() : ''
        current = { lang, code: '' }
        if (filename) current.filename = filename
        if (pendingHeading) {
          current.heading = pendingHeading
          pendingHeading = null
        }
        while (prefaceLines.length && prefaceLines[0].trim() === '') prefaceLines.shift()
        while (prefaceLines.length && prefaceLines[prefaceLines.length - 1].trim() === '') prefaceLines.pop()
        if (prefaceLines.length) {
          current.preface = prefaceLines.join('\n')
        }
        prefaceLines = []
        inFence = true
      } else {
        blocks.push(current)
        current = null
        inFence = false
        captionLines = []
      }
      continue
    }
    if (inFence) {
      current.code += (current.code ? '\n' : '') + line
      continue
    }
    const headingMatch = line.match(/^###\s+(.+)$/)
    if (headingMatch) {
      flushCaption()
      if (pendingHeading && !warnedOrphan) {
        // eslint-disable-next-line no-console
        console.warn('parseCheatsheet: orphan ### heading dropped (no fence followed):', pendingHeading)
        warnedOrphan = true
      }
      pendingHeading = headingMatch[1].trim()
      continue
    }
    if (captionLines !== null) {
      captionLines.push(line)
    } else {
      prefaceLines.push(line)
    }
  }
  flushCaption()
  if (pendingHeading && !warnedOrphan) {
    // eslint-disable-next-line no-console
    console.warn('parseCheatsheet: orphan ### heading dropped (no fence followed):', pendingHeading)
  }
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
  if (header.type === 'table') {
    Object.assign(section, parseTable(other))
  } else if (header.type === 'code') {
    section.blocks = parseCodeAnnotated(other)
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
