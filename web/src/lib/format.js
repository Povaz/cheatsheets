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
 */
export function formatInline(text) {
  if (!text) return ''
  let s = escapeHtml(text)
  s = s.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="underline decoration-hairline hover:decoration-accent">$1</a>',
  )
  return s
}

export function rowMatches(row, query) {
  if (!query) return true
  const q = query.toLowerCase()
  return Object.values(row).some((v) =>
    String(v ?? '').toLowerCase().includes(q),
  )
}
