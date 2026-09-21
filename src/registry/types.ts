import type { LocalizedText } from '@/domain/localization'

export type FeatureGroupId = 'scripture' | 'prayer' | 'calendar' | 'icons' | 'slavonic' | 'resources'
export type FeatureAvailability = 'available' | 'planned'
export type FeatureIcon = 'book' | 'prayer' | 'calendar' | 'image' | 'letters' | 'search' | 'link' | 'food' | 'quiz' | 'tour'

export interface FeatureDefinition {
  id: string
  group: FeatureGroupId
  title: LocalizedText
  description: LocalizedText
  icon: FeatureIcon
  route: string
  dependencies: string[]
  availability: FeatureAvailability
  exposure: {
    builder: boolean
    navigation: boolean
    standalone: boolean
  }
  apiCapabilities: string[]
  homeStatKey?: string
}

export interface FeatureGroupDefinition {
  id: FeatureGroupId
  title: LocalizedText
  description: LocalizedText
  icon: FeatureIcon
}

export interface ReadyAppDefinition {
  id: string
  title: LocalizedText
  description: LocalizedText
  icon: FeatureIcon
  route: string
  featureIds: string[]
}
