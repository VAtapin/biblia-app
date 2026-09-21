export type Locale = 'ru' | 'de'

export interface LocalizedText {
  ru: string
  de: string
}

export function localize(value: LocalizedText, locale: Locale): string {
  return value[locale]
}
