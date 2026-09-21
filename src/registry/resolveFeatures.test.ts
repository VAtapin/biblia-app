import { describe, expect, it } from 'vitest'
import { featureGroups, features, readyApps } from './features'
import { removeFeatureWithDependents, resolveFeatureSelection } from './resolveFeatures'

describe('feature dependency resolver', () => {
  it('adds the Scripture reader for Strong automatically', () => {
    expect(resolveFeatureSelection(['scripture.strong'])).toEqual(['scripture.reader', 'scripture.strong'])
  })

  it('does not enable planned features', () => {
    expect(resolveFeatureSelection(['slavonic.learning'])).toEqual([])
  })

  it('removes dependent features with their requirement', () => {
    expect(removeFeatureWithDependents(['scripture.reader', 'scripture.search', 'calendar.today'], 'scripture.reader'))
      .toEqual(['calendar.today'])
  })

  it('keeps the registry internally consistent', () => {
    const featureIds = features.map((feature) => feature.id)
    const groupIds = new Set(featureGroups.map((group) => group.id))

    expect(new Set(featureIds).size).toBe(featureIds.length)
    for (const feature of features) {
      expect(groupIds.has(feature.group)).toBe(true)
      for (const dependency of feature.dependencies) expect(featureIds).toContain(dependency)
    }
    for (const app of readyApps) {
      for (const featureId of app.featureIds) expect(featureIds).toContain(featureId)
    }
  })
})
