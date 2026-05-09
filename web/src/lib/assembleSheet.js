/**
 * Reassemble a Sheet manifest + per-card files into a single Markdown
 * string in the format `parseCheatsheet` accepts.
 *
 * The output starts with `---`-delimited frontmatter (title, subtitle),
 * then for each chapter:
 *   - A `## [chapter <id>] <Title>` line, omitted entirely when the
 *     chapter has no `title` (the chapterless case — `parseCheatsheet`
 *     already handles "no chapter headers" as a single implicit chapter
 *     with no rail/divider).
 *   - The verbatim body of each card file, in manifest order.
 *
 * Validation warnings (non-fatal, all emitted to console.warn):
 *   - card listed in manifest but its body is missing (skip the card)
 *   - id of section header inside the card file != filename
 *     (rewrite the header line so DOM anchors match the manifest)
 *
 * @param {{title: string, subtitle: string, chapters: Array}} manifest
 * @param {Object<string,string>} cardBodyById  card id -> raw markdown
 * @param {string} subtopicSlug  "topic/subtopic", used in warnings
 * @returns {string}
 */
export function assembleSheet(manifest, cardBodyById, subtopicSlug) {
  const out = ['---']
  if (manifest.title) out.push(`title: ${manifest.title}`)
  if (manifest.subtitle) out.push(`subtitle: ${manifest.subtitle}`)
  out.push('---', '')

  for (const chapter of manifest.chapters || []) {
    if (chapter.title) {
      const idPart = chapter.id ? ` ${chapter.id}` : ''
      out.push(`## [chapter${idPart}] ${chapter.title}`, '')
    }
    for (const cardId of chapter.cards || []) {
      const body = cardBodyById[cardId]
      if (body == null) {
        console.warn(
          `[content] ${subtopicSlug}: card "${cardId}" listed in sheet.yml ` +
          `but cards/${cardId}.md is missing — skipping`,
        )
        continue
      }
      out.push(rewriteSectionId(body, cardId, subtopicSlug).replace(/\s+$/, ''), '')
    }
  }

  return out.join('\n')
}

const SECTION_HEADER_RE = /^(##\s+\[\s*[\w-]+)(?:\s+[\w./-]+)?(\s*\])/m

function rewriteSectionId(body, expectedId, subtopicSlug) {
  const m = body.match(SECTION_HEADER_RE)
  if (!m) return body
  const fullMatch = m[0]
  const before = m[1]   // "## [card"
  const after = m[2]    // "]"
  const idInsideMatch = fullMatch.match(/^##\s+\[\s*[\w-]+\s+([\w./-]+)\s*\]/)
  const idInside = idInsideMatch ? idInsideMatch[1] : null

  if (idInside === expectedId) return body
  if (idInside) {
    console.warn(
      `[content] ${subtopicSlug}: cards/${expectedId}.md has section id ` +
      `"${idInside}" inside but the filename is "${expectedId}" — ` +
      `using the filename as the canonical id`,
    )
  } else {
    console.warn(
      `[content] ${subtopicSlug}: cards/${expectedId}.md has no section id ` +
      `inside — inserting "${expectedId}" from the filename`,
    )
  }
  return body.replace(SECTION_HEADER_RE, `${before} ${expectedId}${after}`)
}
