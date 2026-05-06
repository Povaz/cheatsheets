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
