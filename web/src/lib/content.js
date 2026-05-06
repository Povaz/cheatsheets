import { parseCheatsheet } from './parseCheatsheet.js'
import { parseSimpleYaml } from './yaml.js'

const sheetFiles = import.meta.glob('../../../content/*/*/sheet.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const topicYmlFiles = import.meta.glob('../../../content/*/topic.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function pathParts(path) {
  // ../../../content/<topic>/<subtopic>/sheet.md
  // ../../../content/<topic>/topic.yml
  const parts = path.split('/')
  const filename = parts.pop()
  return { parts, filename }
}

function buildTopics() {
  const byTopic = new Map()

  for (const [path, raw] of Object.entries(topicYmlFiles)) {
    const { parts } = pathParts(path)
    const topic = parts[parts.length - 1]
    if (!byTopic.has(topic)) byTopic.set(topic, { meta: {}, subtopics: [] })
    byTopic.get(topic).meta = parseSimpleYaml(raw)
  }

  for (const [path, raw] of Object.entries(sheetFiles)) {
    const { parts } = pathParts(path)
    const subtopic = parts[parts.length - 1]
    const topic = parts[parts.length - 2]
    if (!byTopic.has(topic)) byTopic.set(topic, { meta: {}, subtopics: [] })
    byTopic.get(topic).subtopics.push({
      name: subtopic,
      slug: `${topic}/${subtopic}`,
      cheatsheet: parseCheatsheet(raw),
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
      accent: meta.accent || null,
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
