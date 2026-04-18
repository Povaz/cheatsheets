import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCheatsheet } from '../src/lib/parseCheatsheet.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const files = [
  'content/python/3.14.md',
  'content/python/3.13.md',
  'content/http/http.md',
]

for (const rel of files) {
  const raw = fs.readFileSync(path.join(root, rel), 'utf-8')
  const { frontmatter, sections } = parseCheatsheet(raw)
  console.log(`\n=== ${rel} ===`)
  console.log('frontmatter:', frontmatter)
  for (const s of sections) {
    const shape =
      s.type === 'card' || s.type === 'pills'
        ? `cols=[${s.columns.join(', ')}] rows=${s.rows.length}`
        : s.type === 'code' || s.type === 'diagram'
        ? `blocks=${s.blocks.length}`
        : s.type === 'text'
        ? `items=${s.items.length}`
        : ''
    const attrs = Object.keys(s.attrs).length
      ? ` attrs=${JSON.stringify(s.attrs)}`
      : ''
    console.log(
      `  [${s.type} ${s.id}] "${s.title}" — ${shape} callouts=${s.callouts.length}${attrs}`,
    )
  }
}
