import { reactive, ref, watch } from 'vue'

export const searchQuery = ref('')

const SETTINGS_PREFIX = 'cheatsheet:settings:'
const LEGACY_SETTINGS_KEY = 'cheatsheet:settings'
const THEME_KEY = 'cheatsheet:theme'

function readStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch { return null }
}

function osPrefersDark() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch { return false }
}

const storedTheme = readStoredTheme()
let userChoseExplicit = storedTheme !== null

export const theme = ref(storedTheme ?? (osPrefersDark() ? 'dark' : 'light'))

function applyTheme(value) {
  const root = document.documentElement
  if (value === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

watch(theme, (value) => {
  applyTheme(value)
  if (userChoseExplicit) {
    try { localStorage.setItem(THEME_KEY, value) } catch {}
  }
}, { immediate: true, flush: 'sync' })

try {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onOsChange = (e) => {
    if (!userChoseExplicit) theme.value = e.matches ? 'dark' : 'light'
  }
  if (mq.addEventListener) mq.addEventListener('change', onOsChange)
  else if (mq.addListener) mq.addListener(onOsChange)
} catch {}

export function setTheme(value) {
  userChoseExplicit = true
  theme.value = value === 'dark' ? 'dark' : 'light'
}

export function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

export const SHEET_DEFAULT_MAX_WIDTH = 1400

export const CHAPTER_DEFAULTS = Object.freeze({
  bodySize: 12,
  cardTitleSize: 10,
  chapterTitleSize: 20,
  cols: 3,
  type: 'columns',
})

const CHAPTER_DEFAULT_KEYS = Object.keys(CHAPTER_DEFAULTS)

function emptyState() {
  return {
    maxWidth: SHEET_DEFAULT_MAX_WIDTH,
    chapters: {},
  }
}

function pickChapterFields(obj) {
  const out = {}
  for (const k of CHAPTER_DEFAULT_KEYS) {
    if (obj[k] === undefined) continue
    if (k === 'cols' && obj[k] === null) continue
    out[k] = obj[k]
  }
  return out
}

function migrateLegacy(stored) {
  const next = emptyState()
  if (!stored || typeof stored !== 'object') return next

  if (typeof stored.maxWidth === 'number') next.maxWidth = stored.maxWidth

  // v3 (current shape): { maxWidth, chapters } — passthrough.
  // v2 (just-shipped): { maxWidth, defaults, chapters } — drop `defaults`.
  // v1 (pre-feature flat): { bodySize, cols, ... } — only maxWidth survives.
  if (stored.chapters && typeof stored.chapters === 'object') {
    for (const [id, overrides] of Object.entries(stored.chapters)) {
      if (overrides && typeof overrides === 'object') {
        const picked = pickChapterFields(overrides)
        if (Object.keys(picked).length > 0) next.chapters[id] = picked
      }
    }
  }

  return next
}

try { localStorage.removeItem(LEGACY_SETTINGS_KEY) } catch {}

let activeKey = null

export const settings = reactive(emptyState())

function applyPageVars() {
  const r = document.documentElement.style
  r.setProperty('--page-max', `${settings.maxWidth}px`)
}

function persist() {
  if (!activeKey) return
  try {
    localStorage.setItem(activeKey, JSON.stringify(settings))
  } catch {
    // storage unavailable — settings still apply for the session
  }
}

watch(
  settings,
  () => {
    applyPageVars()
    persist()
  },
  { deep: true, immediate: true, flush: 'sync' },
)

function replaceState(next) {
  settings.maxWidth = next.maxWidth
  settings.chapters = { ...next.chapters }
}

export function loadSheetSettings(slug) {
  activeKey = SETTINGS_PREFIX + slug
  let stored = null
  try {
    stored = JSON.parse(localStorage.getItem(activeKey) || 'null')
  } catch {
    stored = null
  }
  replaceState(migrateLegacy(stored))
}

export function clearSheetSettings() {
  activeKey = null
  replaceState(emptyState())
}

export function effectiveChapterSetting(chapterId, key) {
  const override = settings.chapters[chapterId]
  if (override && override[key] !== undefined) return override[key]
  return CHAPTER_DEFAULTS[key]
}

export function setSheetMaxWidth(value) {
  settings.maxWidth = value
}

export function setChapterOverride(chapterId, key, value) {
  if (!CHAPTER_DEFAULT_KEYS.includes(key)) return
  const prev = settings.chapters[chapterId] || {}
  settings.chapters = {
    ...settings.chapters,
    [chapterId]: { ...prev, [key]: value },
  }
}

export function clearChapterOverride(chapterId, key) {
  const prev = settings.chapters[chapterId]
  if (!prev || prev[key] === undefined) return
  const next = { ...prev }
  delete next[key]
  const nextChapters = { ...settings.chapters }
  if (Object.keys(next).length === 0) delete nextChapters[chapterId]
  else nextChapters[chapterId] = next
  settings.chapters = nextChapters
}

export function resetChapter(chapterId) {
  if (!settings.chapters[chapterId]) return
  const next = { ...settings.chapters }
  delete next[chapterId]
  settings.chapters = next
}

export function resetSheetSettings() {
  replaceState(emptyState())
}
