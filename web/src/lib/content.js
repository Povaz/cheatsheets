import { parseSimpleYaml, parseListOfObjects, parseSheetManifest } from './yaml.js'

const topicYmlFiles = import.meta.glob('../../../content/*/topic.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const sourcesYmlFiles = import.meta.glob('../../../content/*/*/sources.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const sheetYmlFiles = import.meta.glob('../../../content/*/*/sheet.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const sheetHtmlFiles = import.meta.glob('../../../content/*/*/sheet.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Questions — one optional questions.json per SubTopic folder. Presence is
// known at build time from the glob keys, but the JSON stays out of the main
// bundle (non-eager glob) and is fetched in full on the first draw, so the
// bundle stays flat as the Bank grows. Each entry is lean
// ({question, choices, answer, explanation}); topic, subtopic and the stable
// id (`topic/subtopic#index`) are derived here from the file path.
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
        // ../../../content/<topic>/<subtopic>/questions.json
        const parts = path.split('/')
        const subtopic = parts[parts.length - 2]
        const topic = parts[parts.length - 3]
        return load()
          .then((data) => (Array.isArray(data) ? data : []).map((q, i) => ({
            ...q,
            topic,
            subtopic,
            id: `${topic}/${subtopic}#${i}`,
          })))
          .catch(() => [])
      }),
    ).then((lists) => lists.flat())
  }
  return bankPromise
}

// Learning Plans — top-level, flat entries, sibling collection to topics
// (HLDD §3, §8.4). `content/plans/<slug>/plan.yml` carries the same kind
// of index metadata as `topic.yml`; `plan.md` is the plan body, rendered
// via lib/markdown.js.
const planYmlFiles = import.meta.glob('../../../content/plans/*/plan.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const planMdFiles = import.meta.glob('../../../content/plans/*/plan.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function buildPlans() {
  const bySlug = new Map()

  for (const [path, raw] of Object.entries(planYmlFiles)) {
    // ../../../content/plans/<slug>/plan.yml
    const parts = path.split('/')
    const slug = parts[parts.length - 2]
    if (!bySlug.has(slug)) bySlug.set(slug, { meta: {}, markdown: null })
    bySlug.get(slug).meta = parseSimpleYaml(raw)
  }

  for (const [path, raw] of Object.entries(planMdFiles)) {
    const parts = path.split('/')
    const slug = parts[parts.length - 2]
    if (!bySlug.has(slug)) bySlug.set(slug, { meta: {}, markdown: null })
    bySlug.get(slug).markdown = raw
  }

  const out = []
  for (const [slug, { meta, markdown }] of bySlug) {
    if (markdown == null) continue
    out.push({
      slug,
      title: meta.title || slug,
      subtitle: meta.subtitle || null,
      accent: meta.accent || null,
      markdown,
    })
  }

  out.sort((a, b) => a.title.localeCompare(b.title))
  return out
}

export const plans = buildPlans()

export function findPlan(slug) {
  return plans.find((p) => p.slug === slug) || null
}

// Local source files (referenced by relative `url` in sources.yml). Vite
// emits each match as a static asset and gives us its bundled URL.
//
// Two locations are allowed (per `docs/hldd/content.md` §4):
//   1. `content/local_sources/**` — shared markdown / text write-ups.
//   2. `content/<topic>/<subtopic>/*.{binary}` — binaries (PDFs, slide
//      decks, images) co-located with the SubTopic.
//
// When adding a new local-source file type (epub, zip, etc.), extend the
// brace list below — otherwise the file will be silently skipped at runtime.
const localAssetFiles = {
  ...import.meta.glob('../../../content/local_sources/**/*', {
    query: '?url', import: 'default', eager: true,
  }),
  ...import.meta.glob(
    '../../../content/*/*/*.{pdf,txt,html,htm,png,jpg,jpeg,svg,webp,gif}',
    { query: '?url', import: 'default', eager: true },
  ),
}

const REMOTE_URL_RE = /^https?:\/\//i

function resolveRelative(fromPath, relUrl) {
  // fromPath is the absolute glob key of sources.yml, e.g.
  //   ../../../content/git/worktrees-agents/sources.yml
  // relUrl is e.g. ../../local_sources/worktrees-study.md
  const baseParts = fromPath.split('/').slice(0, -1) // drop sources.yml
  for (const seg of relUrl.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') baseParts.pop()
    else baseParts.push(seg)
  }
  return baseParts.join('/')
}

function basename(path) {
  const i = path.lastIndexOf('/')
  return i >= 0 ? path.slice(i + 1) : path
}

function buildSources(sourcesYmlPath, raw) {
  const entries = parseListOfObjects(raw, 'sources')
  const out = []
  for (const entry of entries) {
    if (!entry.url || !entry.title) continue
    if (REMOTE_URL_RE.test(entry.url)) {
      out.push({ ...entry, kind: 'remote', href: entry.url, filename: null })
      continue
    }
    const resolved = resolveRelative(sourcesYmlPath, entry.url)
    const bundledUrl = localAssetFiles[resolved]
    if (!bundledUrl) {
      console.warn(
        `[content] sources.yml entry refers to missing local file: ${entry.url} ` +
        `(resolved to ${resolved}, from ${sourcesYmlPath}). ` +
        `Local sources must live in content/local_sources/ or alongside sources.yml.`,
      )
      continue
    }
    out.push({
      ...entry,
      kind: 'local',
      href: bundledUrl,
      filename: basename(resolved),
    })
  }
  return out
}

// Bucket sheet.html raw bodies by `topic/subtopic`.
function indexFragmentsBySubtopic() {
  const bySlug = {}
  for (const [path, raw] of Object.entries(sheetHtmlFiles)) {
    // ../../../content/<topic>/<subtopic>/sheet.html
    const parts = path.split('/')
    const subtopic = parts[parts.length - 2]
    const topic = parts[parts.length - 3]
    bySlug[`${topic}/${subtopic}`] = raw
  }
  return bySlug
}

function buildTopics() {
  const byTopic = new Map()

  for (const [path, raw] of Object.entries(topicYmlFiles)) {
    // ../../../content/<topic>/topic.yml
    const parts = path.split('/')
    const topic = parts[parts.length - 2]
    if (!byTopic.has(topic)) byTopic.set(topic, { meta: {}, subtopics: [] })
    byTopic.get(topic).meta = parseSimpleYaml(raw)
  }

  // Index sources by `topic/subtopic` so the sheet loop can look them up.
  const sourcesBySubtopic = new Map()
  for (const [path, raw] of Object.entries(sourcesYmlFiles)) {
    const parts = path.split('/')
    const subtopic = parts[parts.length - 2]
    const topic = parts[parts.length - 3]
    sourcesBySubtopic.set(`${topic}/${subtopic}`, buildSources(path, raw))
  }

  const fragmentsBySubtopic = indexFragmentsBySubtopic()

  for (const [path, raw] of Object.entries(sheetYmlFiles)) {
    // ../../../content/<topic>/<subtopic>/sheet.yml
    const parts = path.split('/')
    const subtopic = parts[parts.length - 2]
    const topic = parts[parts.length - 3]
    const slug = `${topic}/${subtopic}`

    const manifest = parseSheetManifest(raw)

    const fragmentHtml = fragmentsBySubtopic[slug]
    if (!fragmentHtml) continue

    if (!byTopic.has(topic)) byTopic.set(topic, { meta: {}, subtopics: [] })
    byTopic.get(topic).subtopics.push({
      name: subtopic,
      slug,
      frontmatter: { title: manifest.title, subtitle: manifest.subtitle },
      fragmentHtml,
      sources: sourcesBySubtopic.get(slug) || [],
    })
  }

  const topics = []
  for (const [slug, { meta, subtopics }] of byTopic) {
    if (subtopics.length === 0) continue

    subtopics.sort((a, b) =>
      b.name.localeCompare(a.name, undefined, { numeric: true }),
    )
    if (meta.order) {
      // `order: a, b, c` — explicit reading order; unlisted SubTopics keep
      // the descending default after the listed ones (sort is stable).
      const pos = new Map(
        meta.order.split(',').map((s, i) => [s.trim(), i]),
      )
      subtopics.sort(
        (a, b) => (pos.get(a.name) ?? Infinity) - (pos.get(b.name) ?? Infinity),
      )
    }

    const defaultSub = meta.default || subtopics[0].name
    const title = meta.title || subtopics[0].frontmatter?.title || slug

    topics.push({
      slug,
      title,
      subtitle: meta.subtitle || null,
      default: defaultSub,
      accent: meta.accent || null,
      subtopics,
    })
  }

  topics.sort((a, b) => a.slug.localeCompare(b.slug))
  return topics
}

export const topics = buildTopics()

export function findTopic(slug) {
  return topics.find((t) => t.slug === slug) || null
}

export function findSubTopic(topicSlug, subtopicName) {
  const topic = findTopic(topicSlug)
  if (!topic) return null
  return topic.subtopics.find((s) => s.name === subtopicName) || null
}
