/**
 * Minimal Markdown → HTML renderer for Learning Plan bodies — same spirit
 * as yaml.js: hand-rolled, no runtime deps, supports exactly the constructs
 * present in content/plans/<slug>/plan.md and nothing more.
 *
 * Block level: # / ## / ### headings (the leading H1 is skipped — the Plan
 * page header already shows the title), `---` rules, `> ` blockquotes
 * (single level), flat `- ` unordered lists (no nesting), paragraphs.
 * No tables — none of the source plans use one.
 *
 * Inline: **bold**, *italic*, `code`, and bare https:// URLs (auto-linked).
 * All other HTML is escaped before inline rules run, so raw text can never
 * inject markup.
 */

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const URL_RE = /https?:\/\/\S+/g
const TRAILING_PUNCT_RE = /[.,;:!?)\]]$/

function linkifyUrls(html) {
  return html.replace(URL_RE, (raw) => {
    let url = raw
    let trail = ''
    // Bare URLs sit inline with prose; strip trailing punctuation that
    // belongs to the sentence, not the link (e.g. "(PDF: https://...)").
    while (url && TRAILING_PUNCT_RE.test(url)) {
      trail = url.slice(-1) + trail
      url = url.slice(0, -1)
    }
    if (!url) return raw
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${trail}`
  })
}

function renderInline(text) {
  let html = escapeHtml(text)

  // Code spans first, so `*` inside code is never treated as emphasis.
  const codeSpans = []
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code)
    return `\u0000${codeSpans.length - 1}\u0000`
  })

  // Bold wrapping a trailing italic span — the one nested-emphasis shape
  // present in the source plans, e.g. "**Devlin et al. 2019, *BERT***".
  html = html.replace(/\*\*([^*]+?)\*([^*]+?)\*\*\*/g, '<strong>$1<em>$2</em></strong>')
  html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+?)\*/g, '<em>$1</em>')

  html = linkifyUrls(html)

  html = html.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codeSpans[Number(i)]}</code>`)

  return html
}

/**
 * @param {string} md
 * @returns {string} HTML
 */
export function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0
  let skippedH1 = false

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) { i++; continue }

    if (!skippedH1 && /^#\s+/.test(line)) {
      skippedH1 = true
      i++
      continue
    }

    if (/^---\s*$/.test(line)) {
      out.push('<hr>')
      i++
      continue
    }

    let m
    if ((m = /^###\s+(.+)$/.exec(line))) {
      out.push(`<h3 id="${slugify(m[1])}">${renderInline(m[1])}</h3>`)
      i++
      continue
    }
    if ((m = /^##\s+(.+)$/.exec(line))) {
      out.push(`<h2 id="${slugify(m[1])}">${renderInline(m[1])}</h2>`)
      i++
      continue
    }

    if (line.startsWith('> ')) {
      const quoteLines = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      out.push(`<blockquote>${renderInline(quoteLines.join(' '))}</blockquote>`)
      continue
    }

    if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      out.push(`<ul>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</ul>`)
      continue
    }

    // Paragraph: consecutive plain lines join into one block (lazy
    // continuation), same as every other block type interrupts it.
    const paraLines = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,3}\s+/.test(lines[i]) &&
      !/^---\s*$/.test(lines[i]) &&
      !lines[i].startsWith('> ') &&
      !lines[i].startsWith('- ')
    ) {
      paraLines.push(lines[i])
      i++
    }
    out.push(`<p>${renderInline(paraLines.join(' '))}</p>`)
  }

  return out.join('\n')
}
