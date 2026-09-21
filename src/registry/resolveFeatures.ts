import { featureById, features } from './features'

export function resolveFeatureSelection(requestedIds: string[]): string[] {
  const resolved = new Set<string>()
  const resolving = new Set<string>()

  function add(id: string): void {
    if (resolved.has(id)) return
    const feature = featureById(id)
    if (!feature || feature.availability !== 'available') return
    if (resolving.has(id)) throw new Error(`Circular feature dependency: ${id}`)
    resolving.add(id)
    feature.dependencies.forEach(add)
    resolving.delete(id)
    resolved.add(id)
  }

  requestedIds.forEach(add)
  return features.filter((feature) => resolved.has(feature.id)).map((feature) => feature.id)
}

export function removeFeatureWithDependents(selectedIds: string[], removedId: string): string[] {
  const removed = new Set([removedId])
  let changed = true
  while (changed) {
    changed = false
    for (const id of selectedIds) {
      const feature = featureById(id)
      if (feature?.dependencies.some((dependency) => removed.has(dependency)) && !removed.has(id)) {
        removed.add(id)
        changed = true
      }
    }
  }
  return selectedIds.filter((id) => !removed.has(id))
}
