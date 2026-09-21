import type { Locale } from '@/domain/localization'

export interface ApiEnvelope<T> {
  data: T
}

export interface HomeSummary {
  bibles: number
  recipes: number
  quizzes: number
  tours: number
  prayers: number
  materials: number
  faith_questions: number
  canons: number
  akathists: number
  horologion: number
  horologion_laity: number
  horologion_appendix: number
}

export interface TranslationSummary {
  code: string
  name: string
  short_name: string | null
  language: { code: string; name: string; native_name?: string }
  canon_code: string | null
  has_old_testament: boolean
  has_new_testament: boolean
  has_apocrypha: boolean
  has_strong: boolean
  is_default: boolean
}

export interface BibleBook {
  slug: string
  name: string
  short_name: string | null
  order: number
  chapters_count: number
  canonical_book: { osis_code: string; testament: 'old' | 'new'; is_deuterocanonical: boolean } | null
}

export interface TranslationBooks {
  translation: Pick<TranslationSummary, 'code' | 'name' | 'short_name' | 'language'>
  books: BibleBook[]
}

export interface StrongToken {
  id: number
  strong_number: string
  token_order: number
  surface_text: string | null
  grammar_code: string | null
  entry: { word: string | null; transliteration: string | null }
}

export interface BibleVerse {
  id: number
  number: number
  osis_ref: string
  text: string
  plain_text: string
  has_strong_markup: boolean
  strong_tokens: StrongToken[]
}

export interface BibleChapter {
  translation: Pick<TranslationSummary, 'code' | 'name' | 'short_name' | 'language'>
  book: Pick<BibleBook, 'slug' | 'name' | 'short_name' | 'chapters_count'>
  chapter: { number: number; verses_count: number }
  verses: BibleVerse[]
}

export interface VerseSearchResult {
  verse_id: number
  osis_ref: string
  reference: string
  translation: { code: string; short_name: string | null }
  book: { slug: string; osis_code: string; name: string; short_name: string | null }
  chapter_number: number
  verse_number: number
  snippet: string
  snippet_segments: Array<{ text: string; match: boolean }>
}

export interface VerseSearchResponse {
  query: string
  mode: 'text' | 'reference'
  translation_code: string | null
  results: VerseSearchResult[]
}

export interface StrongEntry {
  id: number
  number: string
  word: string | null
  transliteration: string | null
  pronunciation: string | null
  content: string | null
  lexicon: { code: string; name: string; language: string }
}

export interface VerseStrongTokens {
  verse: { id: number; osis_ref: string }
  tokens: StrongToken[]
}

export interface VerseCrossReference {
  id: number
  type: string | null
  source: string | null
  target: {
    verse_id: number
    osis_ref: string
    reference: string
    chapter_number: number
    verse_number: number
    text: string | null
  }
}

export interface VerseCrossReferences {
  verse: { id: number; osis_ref: string }
  translation_code: string
  references: VerseCrossReference[]
}

export interface LiturgicalCollection {
  id: string
  title: string
  count: number
}

export interface CalendarEvent {
  id: string
  name?: string
  title?: string
  description?: string | null
  category?: string
  is_fasting?: boolean
}

export interface CalendarReading {
  id: string
  title: string
  display_ref?: string
  passage_ref?: string
}

export interface CalendarDay {
  date: string
  old_style_date: string
  liturgical_period?: string
  source?: string
  metadata: Record<string, unknown>
  events: CalendarEvent[]
  fasting_events: CalendarEvent[]
  readings: CalendarReading[]
  icons?: CalendarIconEntry[]
}

export interface CalendarIconImage {
  url: string
  mime: string
  width: number | null
  height: number | null
}

export interface CalendarIconEntry {
  id: number
  title: string
  kind: string
  description: string | null
  descriptionKind?: string | null
  dates: Array<{ label: string; monthDay?: string; movable?: boolean | null }>
  rightsStatus?: string
  imageCount: number
  images: CalendarIconImage[]
}

export interface CalendarIconPage {
  schemaVersion: number
  total: number
  page: number
  perPage: number
  imageTotal: number
  data: CalendarIconEntry[]
}

export interface PublicContentItem {
  id: number
  title: string
  description: string | null
  imageUrl: string | null
  href: string | null
  meta: string | null
}

export type PublicContentKind = 'faith' | 'recipes' | 'quizzes' | 'tours' | 'links'

export interface TranslatorStatus {
  service: string
  available: boolean
  ai_configured: boolean
  access_mode: string
  max_characters: number
  directions: string[]
  image_recognition: {
    endpoint: string
    max_megabytes: number
    mime_types: string[]
  }
  free_tier: {
    ai_requests_per_day: number
    ai_characters_per_request: number
    ai_characters_per_day: number
  }
}

export interface TranslationResult {
  translated_text?: string
  translation?: string
  source_type: 'corpus' | 'ai'
  target_language: 'cu' | 'ru'
  cache_hit: boolean
  reference?: string | null
}

export interface InscriptionRecognitionResult {
  detected_language: 'church_slavonic' | 'greek' | 'mixed' | 'russian' | 'unknown'
  recognized_text: string
  expanded_text: string
  russian_translation: string
  uncertain_fragments: string[]
  confidence: 'high' | 'medium' | 'low'
  matched_icon: { id: number; title: string; kind: string; source: string } | null
  translation_source: 'catalogue' | 'ai' | 'corpus'
  cache_hit: boolean
}

export interface PersonalConfiguration {
  version: 3
  locale: Locale
  sections: string[]
  navigation: string[]
  startFeature: string
  createdAt: string
  updatedAt: string
}

export interface RemoteProfileData {
  profile_id: string
  schema_version: number
  revision: number
  configuration: PersonalConfiguration
  created_at: string
  updated_at: string
}

export interface RemoteProfileCredentials extends RemoteProfileData {
  secret: string
  recovery_code: string
}
