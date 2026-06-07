import { parseCheatsheet } from './parseCheatsheet.js'
import { parseSimpleYaml, parseListOfObjects, parseSheetManifest } from './yaml.js'
import { assembleSheet } from './assembleSheet.js'

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

const cardFiles = import.meta.glob('../../../content/*/*/cards/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

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

// Bucket cards/*.md raw bodies by `topic/subtopic`, keyed by card id (filename
// without the .md). Also detect duplicate card ids inside the same SubTopic.
function indexCardsBySubtopic() {
  const bySubtopic = new Map()
  for (const [path, raw] of Object.entries(cardFiles)) {
    // ../../../content/<topic>/<subtopic>/cards/<id>.md
    const parts = path.split('/')
    const subtopic = parts[parts.length - 3]
    const topic = parts[parts.length - 4]
    const slug = `${topic}/${subtopic}`
    const id = parts[parts.length - 1].replace(/\.md$/, '')
    if (!bySubtopic.has(slug)) bySubtopic.set(slug, {})
    const bucket = bySubtopic.get(slug)
    if (Object.prototype.hasOwnProperty.call(bucket, id)) {
      console.warn(`[content] ${slug}: duplicate card id "${id}" — multiple files share the same name`)
    }
    bucket[id] = raw
  }
  return bySubtopic
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

  const cardsBySubtopic = indexCardsBySubtopic()

  for (const [path, raw] of Object.entries(sheetYmlFiles)) {
    // ../../../content/<topic>/<subtopic>/sheet.yml
    const parts = path.split('/')
    const subtopic = parts[parts.length - 2]
    const topic = parts[parts.length - 3]
    const slug = `${topic}/${subtopic}`

    const manifest = parseSheetManifest(raw)
    const cardBodyById = cardsBySubtopic.get(slug) || {}

    // Warn about cards on disk that the manifest doesn't reference.
    const referenced = new Set()
    for (const ch of manifest.chapters) for (const id of ch.cards) referenced.add(id)
    for (const id of Object.keys(cardBodyById)) {
      if (!referenced.has(id)) {
        console.warn(
          `[content] ${slug}: cards/${id}.md present on disk but not listed in sheet.yml — ignoring`,
        )
      }
    }

    const assembled = assembleSheet(manifest, cardBodyById, slug)

    if (!byTopic.has(topic)) byTopic.set(topic, { meta: {}, subtopics: [] })
    byTopic.get(topic).subtopics.push({
      name: subtopic,
      slug,
      cheatsheet: parseCheatsheet(assembled),
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
    const title = meta.title || subtopics[0].cheatsheet.frontmatter.title || slug

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
