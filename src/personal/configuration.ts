import type { Locale } from '@/domain/localization'
import { resolveFeatureSelection } from '@/registry/resolveFeatures'
import type { PersonalConfiguration } from '@/services/api/contracts'

export const quickStartFeatures = ['scripture.reader', 'prayer.library', 'calendar.today']

export function createPersonalConfiguration(
  selectedIds: string[],
  locale: Locale,
  previous?: PersonalConfiguration,
  now = new Date(),
): PersonalConfiguration {
  const sections = resolveFeatureSelection(selectedIds)
  if (!sections.length) throw new Error('features-required')
  const timestamp = now.toISOString()
  return {
    version: 3,
    locale,
    sections,
    navigation: sections,
    startFeature: sections[0],
    createdAt: previous?.createdAt ?? timestamp,
    updatedAt: timestamp,
  }
}

export function isPersonalConfiguration(value: unknown): value is PersonalConfiguration {
  if (!isRecord(value) || value.version !== 3) return false
  return (value.locale === 'ru' || value.locale === 'de')
    && isStringArray(value.sections)
    && value.sections.length > 0
    && isStringArray(value.navigation)
    && typeof value.startFeature === 'string'
    && typeof value.createdAt === 'string'
    && typeof value.updatedAt === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
