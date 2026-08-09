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

let recallRaw = null
try {
  const recallFiles = import.meta.glob('../../../content/recall/today.json', {
    import: 'default',
    eager: true,
  })
  const key = Object.keys(recallFiles)[0]
  if (key) recallRaw = recallFiles[key]
} catch { /* today.json absent — recallRaw stays null */ }

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
      kind: 'page',
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

    const defaultSub = meta.default || subtopics[0].name
    const title = meta.title || subtopics[0].frontmatter?.title || slug

    topics.push({
      slug,
      title,
      subtitle: meta.subtitle || null,
      default: defaultSub,
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

export const recallData = recallRaw && recallRaw.questions?.length
  ? recallRaw
  : null
