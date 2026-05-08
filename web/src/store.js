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

const stored = readStoredTheme()
let userChoseExplicit = stored !== null

export const theme = ref(stored ?? (osPrefersDark() ? 'dark' : 'light'))

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

const settingsDefaults = {
  bodySize: 12,
  cols: null,
  maxWidth: 1400,
  cardTitleSize: 10,
  chapterTitleSize: 20,
}

try { localStorage.removeItem(LEGACY_SETTINGS_KEY) } catch {}

let activeKey = null

export const settings = reactive({ ...settingsDefaults })

function applySettings() {
  const r = document.documentElement.style
  r.setProperty('--body-size', `${settings.bodySize}px`)
  r.setProperty('--page-max', `${settings.maxWidth}px`)
  r.setProperty('--card-title-size', `${settings.cardTitleSize}px`)
  r.setProperty('--chapter-title-size', `${settings.chapterTitleSize}px`)
  if (settings.cols == null) r.removeProperty('--cards-cols')
  else r.setProperty('--cards-cols', String(settings.cols))
  if (activeKey) {
    try {
      localStorage.setItem(activeKey, JSON.stringify(settings))
    } catch {
      // storage unavailable — settings still apply for the session
    }
  }
}

watch(settings, applySettings, { deep: true, immediate: true, flush: 'sync' })

export function loadSheetSettings(slug) {
  activeKey = SETTINGS_PREFIX + slug
  let stored = {}
  try {
    stored = JSON.parse(localStorage.getItem(activeKey) || '{}')
  } catch {
    stored = {}
  }
  Object.assign(settings, settingsDefaults, stored)
}

export function clearSheetSettings() {
  activeKey = null
  Object.assign(settings, settingsDefaults)
}

export function resetSettings() {
  Object.assign(settings, settingsDefaults)
}
