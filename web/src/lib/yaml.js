/**
 * Minimal YAML parser — handles scalar `key: value` pairs only.
 *
 * No support for: nested objects, arrays, block scalars (`|` / `>`),
 * multi-line strings, anchors, flow style. If a cheatsheet ever needs
 * those, swap in a real YAML lib. For our frontmatter (title, subtitle)
 * this is enough and keeps the browser bundle free of Node-oriented
 * parser libs.
 *
 * Values are returned as strings. Surrounding single or double quotes
 * are stripped. `#` inside a value is treated as literal (not a comment).
 */
export function parseSimpleYaml(raw) {
  const out = {}
  if (!raw) return out
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf(':')
    if (idx < 0) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    value = value.replace(/^["']|["']$/g, '')
    if (key) out[key] = value
  }
  return out
}

/**
 * Parse a top-level YAML block sequence of mappings:
 *
 *   <listKey>:
 *     - keyA: valueA
 *       keyB: valueB
 *     - keyA: ...
 *
 * Returns an array of plain objects. Only scalar string values are supported
 * (same constraints as `parseSimpleYaml`). Stops at the next top-level key
 * or end of input. Lines whose first non-space character is `#` are ignored.
 *
 * @param {string} raw
 * @param {string} listKey
 * @returns {Array<Object>}
 */
export function parseListOfObjects(raw, listKey) {
  if (!raw) return []
  const items = []
  let inList = false
  let current = null

  const addKv = (text) => {
    if (!current) return
    const idx = text.indexOf(':')
    if (idx < 0) return
    const k = text.slice(0, idx).trim()
    let v = text.slice(idx + 1).trim()
    v = v.replace(/^["']|["']$/g, '')
    if (k) current[k] = v
  }

  for (const rawLine of raw.split('\n')) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue
    const indent = rawLine.match(/^\s*/)[0].length
    const trimmed = rawLine.trim()

    if (!inList) {
      if (indent === 0 && trimmed === `${listKey}:`) inList = true
      continue
    }

    if (indent === 0) {
      if (current) { items.push(current); current = null }
      inList = false
      continue
    }

    if (trimmed === '-' || trimmed.startsWith('- ')) {
      if (current) items.push(current)
      current = {}
      if (trimmed.length > 1) addKv(trimmed.slice(2))
    } else {
      addKv(trimmed)
    }
  }

  if (current) items.push(current)
  return items
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

/**
 * Split a Markdown string into its YAML frontmatter (as parsed object)
 * and the body (the rest of the string, with the `---` block removed).
 *
 * @param {string} raw
 * @returns {{frontmatter: Object, body: string}}
 */
export function splitFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) return { frontmatter: {}, body: raw }
  const frontmatter = parseSimpleYaml(match[1])
  const body = raw.slice(match[0].length)
  return { frontmatter, body }
}

/**
 * Parse a Sheet manifest (`sheet.yml`).
 *
 * Schema (fixed indent: 0 / 2 / 4 / 6 spaces):
 *
 *   title: <string>
 *   subtitle: <string>
 *   chapters:
 *     - title: <string>      # optional; absent ⇒ chapterless render (no rail/divider)
 *       id: <string>         # optional; auto-slug from title at render time
 *       cards:
 *         - <id>             # ordered list of card filenames (without .md)
 *         - <id>
 *
 * Returns: { title, subtitle, chapters: [{ title, id?, cards: [...] }] }
 *
 * Constraints (consistent with the rest of yaml.js): scalar string values
 * only, surrounding single/double quotes are stripped, `#` comments allowed
 * only at the start of a (trimmed) line, no flow style, no anchors.
 *
 * @param {string} raw
 * @returns {{title: string, subtitle: string, chapters: Array<{title: string, id?: string, cards: string[]}>}}
 */
export function parseSheetManifest(raw) {
  const out = { title: '', subtitle: '', chapters: [] }
  if (!raw) return out

  const stripQuotes = (v) => v.replace(/^["']|["']$/g, '')
  const splitKv = (text) => {
    const idx = text.indexOf(':')
    if (idx < 0) return null
    return [text.slice(0, idx).trim(), stripQuotes(text.slice(idx + 1).trim())]
  }

  let inChapters = false
  let inCards = false
  let current = null

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (!line.trim() || line.trim().startsWith('#')) continue
    const indent = line.match(/^\s*/)[0].length
    const trimmed = line.trim()

    if (indent === 0) {
      current = null
      inCards = false
      if (trimmed === 'chapters:') { inChapters = true; continue }
      inChapters = false
      const kv = splitKv(trimmed)
      if (!kv) continue
      const [k, v] = kv
      if (k === 'title') out.title = v
      else if (k === 'subtitle') out.subtitle = v
      continue
    }

    if (!inChapters) continue

    if (indent === 2 && trimmed.startsWith('-')) {
      current = { cards: [] }
      out.chapters.push(current)
      inCards = false
      const after = trimmed.slice(1).trim()
      if (after) {
        const kv = splitKv(after)
        if (kv) {
          if (kv[0] === 'cards') {
            inCards = true
          } else {
            current[kv[0]] = kv[1]
          }
        }
      }
      continue
    }

    if (!current) continue

    if (indent === 4) {
      if (trimmed === 'cards:') { inCards = true; continue }
      inCards = false
      const kv = splitKv(trimmed)
      if (kv) current[kv[0]] = kv[1]
      continue
    }

    if (indent === 6 && trimmed.startsWith('-') && inCards) {
      const id = stripQuotes(trimmed.slice(1).trim())
      if (id) current.cards.push(id)
  if (inChapters && out.chapters.length === 0) {
    console.warn('[content] sheet.yml has a chapters: block but no chapters were parsed — check indentation (must be 0/2/4/6 spaces, no tabs)')
  }

  return out
}
