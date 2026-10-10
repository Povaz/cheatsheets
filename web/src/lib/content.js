// Content loader (HLDD §3). Every manifest is JSON, parsed by Vite at build
// time; Fragments (sheet.html, plan.html) are bundled as raw strings.

const topicJsonFiles = import.meta.glob('../../../content/*/topic.json', {
  import: 'default',
  eager: true,
})

const sheetJsonFiles = import.meta.glob('../../../content/*/*/sheet.json', {
  import: 'default',
  eager: true,
})

const sheetHtmlFiles = import.meta.glob('../../../content/*/*/sheet.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Questions — one optional questions.json per Sheet folder. Presence is
// known at build time from the glob keys, but the JSON stays out of the main
// bundle (non-eager glob) and is fetched in full on the first draw, so the
// bundle stays flat as the Bank grows. Each entry is lean
// ({question, choices, answer, explanation}); topic, sheet and the stable
// id (`topic/sheet#index`) are derived here from the file path.
const questionFiles = import.meta.glob('../../../content/*/*/questions.json', {
  import: 'default',
})

export const bankAvailable = Object.keys(questionFiles).length > 0

let bankPromise = null
export function loadBank() {
  if (!bankAvailable) return Promise.resolve([])
  if (!bankPromise) {
    bankPromise = Promise.all(
      Object.entries(questionFiles).map(([path, load]) => {
        // ../../../content/<topic>/<sheet>/questions.json
        const parts = path.split('/')
        const sheet = parts[parts.length - 2]
        const topic = parts[parts.length - 3]
        return load()
          .then((data) => (Array.isArray(data) ? data : []).map((q, i) => ({
            ...q,
            topic,
            sheet,
            id: `${topic}/${sheet}#${i}`,
          })))
          .catch(() => [])
      }),
    ).then((lists) => lists.flat())
  }
  return bankPromise
}

// Learning Plans — top-level, flat entries, sibling collection to topics
// (HLDD §3). A Plan is data: `content/plans/<slug>/plan.json` holds
// Parts → Steps → Sources; Plan.vue owns the whole layout.
const planJsonFiles = import.meta.glob('../../../content/plans/*/plan.json', {
  import: 'default',
  eager: true,
})

export const SOURCE_ROLES = ['original', 'video', 'written']

const hostOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function buildPlans() {
  const out = []
  for (const [path, meta] of Object.entries(planJsonFiles)) {
    // ../../../content/plans/<slug>/plan.json
    const slug = path.split('/').at(-2)
    let stepNo = 0
    const parts = (meta.parts || []).map((part, pi) => ({
      id: `part-${pi + 1}`,
      number: pi + 1,
      title: part.title,
      summary: part.summary || null,
      steps: (part.steps || []).map((step) => {
        stepNo += 1
        const [topic, name] = (step.sheet || '').split('/')
        const sheet = step.sheet ? findSheet(topic, name) : null
        return {
          id: `step-${stepNo}`,
          number: stepNo,
          title: step.title,
          summary: step.summary || null,
          done: step.done === true,
          sheet: sheet ? { href: `#/${sheet.slug}`, title: sheet.title } : null,
          sources: (step.sources || []).map((src) => ({ ...src, host: hostOf(src.url) })),
        }
      }),
    }))
    const steps = parts.flatMap((p) => p.steps)
    out.push({
      slug,
      title: meta.title || slug,
      subtitle: meta.subtitle || null,
      accent: meta.accent || null,
      parts,
      stepCount: steps.length,
      doneCount: steps.filter((s) => s.done).length,
    })
  }

  out.sort((a, b) => a.title.localeCompare(b.title))
  return out
}

// Local source files (referenced by relative `url` in sheet.json). Vite
// emits each match as a static asset and gives us its bundled URL.
//
// Two locations are allowed:
//   1. `content/local_sources/**` — shared markdown / text write-ups.
//   2. `content/<topic>/<sheet>/*.{binary}` — binaries (PDFs, slide
//      decks, images) co-located with the Sheet.
//
// When adding a new local-source file type (epub, zip, etc.), extend the
// brace list below — otherwise the file will be silently skipped at runtime.
const localAssetFiles = {
  ...import.meta.glob('../../../content/local_sources/**/*', {
    query: '?url', import: 'default', eager: true,
  }),
  ...import.meta.glob(
    '../../../content/*/*/*.{pdf,txt,png,jpg,jpeg,svg,webp,gif}',
    { query: '?url', import: 'default', eager: true },
  ),
}

const REMOTE_URL_RE = /^https?:\/\//i

function resolveRelative(fromPath, relUrl) {
  // fromPath is the absolute glob key of sheet.json, e.g.
  //   ../../../content/git/worktrees-agents/sheet.json
  // relUrl is e.g. ../../local_sources/worktrees-study.md
  const baseParts = fromPath.split('/').slice(0, -1) // drop sheet.json
  for (const seg of relUrl.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') baseParts.pop()
    else baseParts.push(seg)
  }
  return baseParts.join('/')
}

function buildSources(sheetJsonPath, entries) {
  const out = []
  for (const entry of entries || []) {
    if (!entry.url || !entry.title) continue
    if (REMOTE_URL_RE.test(entry.url)) {
      out.push({ ...entry, kind: 'remote', href: entry.url, filename: null })
      continue
    }
    const resolved = resolveRelative(sheetJsonPath, entry.url)
    const bundledUrl = localAssetFiles[resolved]
    if (!bundledUrl) {
      console.warn(
        `[content] sheet.json source refers to missing local file: ${entry.url} ` +
        `(resolved to ${resolved}, from ${sheetJsonPath}). ` +
        `Local sources must live in content/local_sources/ or alongside sheet.json.`,
      )
      continue
    }
    out.push({
      ...entry,
      kind: 'local',
      href: bundledUrl,
      filename: resolved.split('/').at(-1),
    })
  }
  return out
}

function buildTopics() {
  const byTopic = new Map()
  const ensure = (topic) => {
    if (!byTopic.has(topic)) byTopic.set(topic, { meta: {}, sheets: [] })
    return byTopic.get(topic)
  }

  for (const [path, meta] of Object.entries(topicJsonFiles)) {
    // ../../../content/<topic>/topic.json
    ensure(path.split('/').at(-2)).meta = meta
  }

  for (const [path, manifest] of Object.entries(sheetJsonFiles)) {
    // ../../../content/<topic>/<sheet>/sheet.json
    const parts = path.split('/')
    const name = parts.at(-2)
    const topic = parts.at(-3)
    const fragmentHtml = sheetHtmlFiles[path.replace(/sheet\.json$/, 'sheet.html')]
    if (!fragmentHtml) continue

    ensure(topic).sheets.push({
      name,
      slug: `${topic}/${name}`,
      title: manifest.title || name,
      subtitle: manifest.subtitle || null,
      fragmentHtml,
      sources: buildSources(path, manifest.sources),
    })
  }

  const topics = []
  for (const [slug, { meta, sheets }] of byTopic) {
    if (sheets.length === 0) continue

    sheets.sort((a, b) =>
      b.name.localeCompare(a.name, undefined, { numeric: true }),
    )
    if (Array.isArray(meta.order)) {
      // Explicit reading order; unlisted Sheets keep the descending default
      // after the listed ones (sort is stable).
      const pos = new Map(meta.order.map((s, i) => [s, i]))
      sheets.sort(
        (a, b) => (pos.get(a.name) ?? Infinity) - (pos.get(b.name) ?? Infinity),
      )
    }

    topics.push({
      slug,
      title: meta.title || sheets[0].title || slug,
      subtitle: meta.subtitle || null,
      default: meta.default || sheets[0].name,
      accent: meta.accent || null,
      sheets,
    })
  }

  topics.sort((a, b) => a.slug.localeCompare(b.slug))
  return topics
}

export const topics = buildTopics()

export function findTopic(slug) {
  return topics.find((t) => t.slug === slug) || null
}

export function findSheet(topicSlug, sheetName) {
  const topic = findTopic(topicSlug)
  if (!topic) return null
  return topic.sheets.find((s) => s.name === sheetName) || null
}

// Built after topics: a Step's `sheet` resolves against them.
export const plans = buildPlans()

export function findPlan(slug) {
  return plans.find((p) => p.slug === slug) || null
}
