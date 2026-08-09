import { ref, watch } from 'vue'

export const searchQuery = ref('')

const THEME_KEY = 'cheatsheet:theme'

try {
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith('cheatsheet:settings:')) localStorage.removeItem(k)
  }
} catch {}

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

// 767.98px (sub-pixel cap) pairs with Tailwind's md:768px min-width so the
// two queries never both miss at exactly 768px on fractional-DPR displays.
export const SMALL_SCREEN_QUERY = '(max-width: 767.98px)'

export const isSmallScreen = ref(false)

try {
  const mq = window.matchMedia(SMALL_SCREEN_QUERY)
  isSmallScreen.value = mq.matches
  const onSmallScreenChange = (e) => { isSmallScreen.value = e.matches }
  if (mq.addEventListener) mq.addEventListener('change', onSmallScreenChange)
  else if (mq.addListener) mq.addListener(onSmallScreenChange)
} catch {}
