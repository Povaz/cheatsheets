import { reactive, ref } from 'vue'

export const searchQuery = ref('')

const collapsedByTopic = reactive({})

const readLS = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable — fail silently; in-memory state still works
  }
}

const collapsedKey = (slug) => `cheatsheet:collapsed:${slug}`

const ensureCollapsed = (slug) => {
  if (!(slug in collapsedByTopic)) collapsedByTopic[slug] = readLS(collapsedKey(slug))
  return collapsedByTopic[slug]
}

export const collapsedFor = (slug) => ensureCollapsed(slug)

export function toggleCollapsed(slug, sectionId) {
  const c = ensureCollapsed(slug)
  if (c[sectionId]) delete c[sectionId]
  else c[sectionId] = true
  writeLS(collapsedKey(slug), c)
}

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
