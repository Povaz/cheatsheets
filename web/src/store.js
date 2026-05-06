import { reactive, ref, watch } from 'vue'

export const searchQuery = ref('')

export const toastState = reactive({ message: '', visible: false })
let toastTimer = null

export function showToast(message, duration = 1500) {
  clearTimeout(toastTimer)
  toastState.message = message
  toastState.visible = true
  toastTimer = setTimeout(() => {
    toastState.visible = false
  }, duration)
}

const SETTINGS_KEY = 'cheatsheet:settings'
const settingsDefaults = {
  bodySize: 12,
  cols: null,
  maxWidth: 1400,
  cardTitleSize: 10,
  chapterTitleSize: 20,
}

function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

export const settings = reactive({ ...settingsDefaults, ...readSettings() })

function applySettings() {
  const r = document.documentElement.style
  r.setProperty('--body-size', `${settings.bodySize}px`)
  r.setProperty('--page-max', `${settings.maxWidth}px`)
  r.setProperty('--card-title-size', `${settings.cardTitleSize}px`)
  r.setProperty('--chapter-title-size', `${settings.chapterTitleSize}px`)
  if (settings.cols == null) r.removeProperty('--cards-cols')
  else r.setProperty('--cards-cols', String(settings.cols))
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // storage unavailable — settings still apply for the session
  }
}

watch(settings, applySettings, { deep: true, immediate: true })

export function resetSettings() {
  Object.assign(settings, settingsDefaults)
}
