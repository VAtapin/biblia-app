import { describe, expect, it } from 'vitest'
import { createPersonalConfiguration, quickStartFeatures } from './configuration'

describe('personal configuration', () => {
  it('creates a stable versioned feature composition', () => {
    const configuration = createPersonalConfiguration(quickStartFeatures, 'ru', undefined, new Date('2026-09-21T12:00:00Z'))
    expect(configuration.version).toBe(3)
    expect(configuration.sections).toEqual(quickStartFeatures)
    expect(configuration.startFeature).toBe('scripture.reader')
    expect(configuration.createdAt).toBe('2026-09-21T12:00:00.000Z')
  })
})
