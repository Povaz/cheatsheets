import { parseCheatsheet } from './parseCheatsheet.js'

const mdFiles = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const ymlFiles = import.meta.glob('../../content/**/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function parseSimpleYaml(raw) {
  const out = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf(':')
    if (idx < 0) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    value = value.replace(/^["']|["']$/g, '')
    out[key] = value
  }
  return out
}

function splitPath(path) {
  const parts = path.split('/')
  const filename = parts.pop()
  const topic = parts.pop()
  return { topic, filename }
}

function buildTopics() {
  const byTopic = new Map()

  for (const [path, raw] of Object.entries(mdFiles)) {
    const { topic, filename } = splitPath(path)
    if (!byTopic.has(topic)) byTopic.set(topic, { files: [], meta: {} })
    byTopic.get(topic).files.push({ filename, raw })
  }

  for (const [path, raw] of Object.entries(ymlFiles)) {
    const { topic, filename } = splitPath(path)
    if (filename !== '_topic.yml') continue
    if (!byTopic.has(topic)) byTopic.set(topic, { files: [], meta: {} })
    byTopic.get(topic).meta = parseSimpleYaml(raw)
  }

  const topics = []
  for (const [slug, { files, meta }] of byTopic) {
    const contentFiles = files.filter((f) => !f.filename.startsWith('_'))
    if (contentFiles.length === 0) continue

    const variants = contentFiles.map(({ filename, raw }) => {
      const cheatsheet = parseCheatsheet(raw)
      const baseName = filename.replace(/\.md$/, '')
      const isOnlyFile = contentFiles.length === 1
      const variantKey = isOnlyFile ? null : baseName
      return {
        slug: variantKey ? `${slug}/${variantKey}` : slug,
        variant: variantKey,
        filename,
        cheatsheet,
      }
    })

    variants.sort((a, b) => {
      if (a.variant && b.variant) return b.variant.localeCompare(a.variant, undefined, { numeric: true })
      return 0
    })

    const isFlat = variants.length === 1 && variants[0].variant === null
    const title = meta.title || variants[0].cheatsheet.frontmatter.title || slug

    topics.push({
      slug,
      title,
      subtitle: meta.subtitle || null,
      isFlat,
      default: meta.default || (isFlat ? null : variants[0].variant),
      variants,
    })
  }

  topics.sort((a, b) => a.slug.localeCompare(b.slug))
  return topics
}

export const topics = buildTopics()

export function findTopic(slug) {
  return topics.find((t) => t.slug === slug) || null
}

export function getCheatsheet(topicSlug, variantSlug = null) {
  const topic = findTopic(topicSlug)
  if (!topic) return null
  if (variantSlug == null) {
    return topic.variants[0] || null
  }
  return topic.variants.find((v) => v.variant === variantSlug) || null
}
