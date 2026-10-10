// Two-letter code a Topic shows in the collapsed Sidebar rail: the initials
// of the first two words of its title, or the first two letters of a
// one-word title. Collisions are tolerated — the accent square, the rail
// position and the title tooltip tell the Topics apart.
export function topicCode(title) {
  const words = String(title ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const code = words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)
  return code.toUpperCase()
}
