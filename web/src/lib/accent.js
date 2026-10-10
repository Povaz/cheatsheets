// A Topic's or Plan's accent colour, made readable as text in the current
// theme: mixed toward black (light) or white (dark) until it reaches WCAG AA
// contrast (4.5:1) against every background it sits on. Returned as the
// "r g b" triplet the theme tokens use, so it can override --c-accent.

export const MIN_CONTRAST = 4.5

// paper, paper-warm and surface from index.css, per theme.
export const BACKGROUNDS = {
  light: [[250, 248, 245], [243, 239, 230], [255, 255, 255]],
  dark: [[14, 15, 17], [22, 24, 26], [26, 28, 31]],
}

const channel = (c) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}

export function readableAccent(hex, theme) {
  const target = theme === 'dark' ? 255 : 0
  const base = hexToRgb(hex)
  for (let t = 0; t <= 1; t += 0.05) {
    const rgb = base.map((c) => Math.round(c + (target - c) * t))
    if (BACKGROUNDS[theme].every((bg) => contrast(rgb, bg) >= MIN_CONTRAST)) return rgb.join(' ')
  }
  return theme === 'dark' ? '255 255 255' : '0 0 0'
}

// Style object overriding the site accent for one page; null keeps the default.
export const accentStyle = (hex, theme) => (hex ? { '--c-accent': readableAccent(hex, theme) } : null)
