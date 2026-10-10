// A Topic or Plan carries two accents, `{ light, dark }`, one per theme.
// The page uses the one for the current theme as-is; the validator checks
// that each meets WCAG AA (4.5:1) on every background of its theme.

export const MIN_CONTRAST = 4.5

// paper, paper-warm and surface from index.css, per theme.
export const BACKGROUNDS = {
  light: [[250, 248, 245], [243, 239, 230], [255, 255, 255]],
  dark: [[14, 15, 17], [22, 24, 26], [26, 28, 31]],
}

export const HEX = /^#[0-9a-f]{6}$/i

export const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

const channel = (c) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// The accent hex for the current theme, or null when the entry has none.
export const accentFor = (accent, theme) => accent?.[theme] ?? null

// Style object overriding the site accent for one page; null keeps the default.
export function accentStyle(accent, theme) {
  const hex = accentFor(accent, theme)
  return hex ? { '--c-accent': hexToRgb(hex).join(' ') } : null
}
