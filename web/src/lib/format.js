const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch])
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

/**
 * The columns of a `card` section that actually render as cells.
 * `detail` is hidden in `columns` chapters (click-to-modal) and shown
 * inline in `vertical` chapters. Used by both the per-row cell renderer
 * and the parent grid's track definition — they MUST agree, or the
 * subgrid track count and the row's cell count drift apart.
 */
export function visibleColumns(columns, showDetail) {
  return showDetail ? columns : columns.filter((c) => c !== 'detail')
}

export function rowMatches(row, query) {
  if (!query) return true
  const q = query.toLowerCase()
  return Object.values(row).some((v) =>
    String(v ?? '').toLowerCase().includes(q),
  )
}
