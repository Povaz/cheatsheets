// Rail codes shown by the collapsed Sidebar (topicCode.js).
import { describe, it, expect } from 'vitest'
import { topicCode } from '../src/lib/topicCode.js'

describe('topicCode', () => {
  it('takes the initials of the first two words', () => {
    expect(topicCode('PostgreSQL Internals')).toBe('PI')
    expect(topicCode('Neural Networks for everyone')).toBe('NN')
  })

  it('takes the first two letters of a one-word title', () => {
    expect(topicCode('Git')).toBe('GI')
    expect(topicCode('AWS')).toBe('AW')
  })

  it('ignores surrounding and repeated whitespace', () => {
    expect(topicCode('  supervised   learning ')).toBe('SL')
  })

  it('returns an empty code for an empty title', () => {
    expect(topicCode('')).toBe('')
    expect(topicCode(undefined)).toBe('')
  })
})
