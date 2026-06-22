const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch])
}

function normalizedQuery(q) {
  return String(q ?? '').trim()
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Render minimal inline Markdown: `code`, **bold**, *em*, [text](href).
 * HTML is escaped first — input is not trusted to be HTML-safe.
 *
 * `plainCode: true` strips the inline-code chip styling — backticked
 * spans render as plain text. Use in cells that are already
 * typographically emphasised (e.g. the first row column) so the chip
 * doesn't add padding/background that widens the column track.
 */
export function formatInline(text, { plainCode = false } = {}) {
  if (!text) return ''
  let s = escapeHtml(text)
  s = plainCode
    ? s.replace(/`([^`]+)`/g, '$1')
    : s.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="underline decoration-hairline hover:decoration-accent">$1</a>',
  )
  return s
}

export function rowMatches(row, query) {
  const q = normalizedQuery(query)
  if (!q) return true
  const ql = q.toLowerCase()
  return Object.values(row).some((v) =>
    String(v ?? '').toLowerCase().includes(ql),
  )
}

/**
 * Wrap each case-insensitive occurrence of `query` in <mark class="search-hit">.
 * Operates on HTML produced by `formatInline` (or pre-escaped plain text):
 * splits on tag boundaries so substitutions never land inside an attribute
 * value or tag name. `formatInline` produces only flat, well-formed tags
 * with HTML-escaped attributes, so this is safe.
 */
export function highlight(html, query) {
  const q = normalizedQuery(query)
  if (!q) return html
  const re = new RegExp(escapeRegex(q), 'gi')
  return String(html ?? '').split(/(<[^>]+>)/).map((seg) => {
    if (!seg || seg[0] === '<') return seg
    return seg.replace(re, (m) => `<mark class="search-hit">${m}</mark>`)
  }).join('')
}

/**
 * True when a section contains at least one occurrence of `query`. Card
 * titles are intentionally NOT considered. Diagrams are treated as visual
 * landmarks and always match (their bodies are never blanked).
 */
export function cardHasMatch(section, query) {
  const q = normalizedQuery(query)
  if (!q) return true
  const ql = q.toLowerCase()
  const hit = (s) => String(s ?? '').toLowerCase().includes(ql)
  switch (section.type) {
    case 'table':
      return (section.rows || []).some((r) => rowMatches(r, q))
    case 'code':
      return (section.blocks || []).some(
        (b) => hit(b.code) || hit(b.heading) || hit(b.filename) || hit(b.preface) || hit(b.caption),
      )
    case 'text':
      return (section.items || []).some(hit)
    default:
      // Unknown section types render their body so a future type added
      // to the parser does not silently blank under search. Update this
      // switch when adding a section type that should participate.
      return true
  }
}

/**
 * Render a caption: paragraphs (separated by blank lines) of inline-formatted
 * Markdown. Soft line breaks within a paragraph collapse to spaces. Paragraphs
 * are joined with `<br><br>` so the result fits inside a single host element
 * (the renderer uses a `<p v-html=...>`, which can't legally contain `<p>`).
 */
export function formatCaption(text) {
  if (!text) return ''
  return String(text)
    .split(/\n\s*\n/)
    .map((para) => formatInline(para.replace(/\n/g, ' ').trim()))
    .filter(Boolean)
    .join('<br><br>')
}
