// Topic and Plan accents must stay readable as text in both themes.
import { describe, it, expect } from 'vitest'
import { readableAccent, contrast, hexToRgb, BACKGROUNDS, MIN_CONTRAST } from '../src/lib/accent.js'
import { topics, plans } from '../src/lib/content.js'

const accents = [...topics, ...plans].filter((x) => x.accent).map((x) => [x.slug, x.accent])
const rgb = (triplet) => triplet.split(' ').map(Number)

describe('readableAccent', () => {
  it.each(['light', 'dark'])('makes every Topic and Plan accent readable in the %s theme', (theme) => {
    for (const [slug, hex] of accents) {
      const out = rgb(readableAccent(hex, theme))
      for (const bg of BACKGROUNDS[theme]) expect(contrast(out, bg), `${slug} ${hex}`).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
  })

  it('leaves an already readable colour unchanged', () => {
    expect(readableAccent('#1a1a1a', 'light')).toBe(hexToRgb('#1a1a1a').join(' '))
  })
})
