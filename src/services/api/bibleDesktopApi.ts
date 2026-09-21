import { apiRequest } from './client'
import type {
  CalendarDay,
  CalendarIconPage,
  HomeSummary,
  InscriptionRecognitionResult,
  LiturgicalCollection,
  PublicContentItem,
  PublicContentKind,
  RemoteProfileCredentials,
  RemoteProfileData,
  PersonalConfiguration,
  TranslationResult,
  TranslationSummary,
  TranslatorStatus,
} from './contracts'

const installationStorageKey = 'biblia-app.installation-id'

function installationId(): string {
  if (typeof window === 'undefined') return '00000000-0000-4000-8000-000000000001'
  const existing = window.localStorage.getItem(installationStorageKey)
  if (existing) return existing
  const created = crypto.randomUUID()
  window.localStorage.setItem(installationStorageKey, created)
  return created
}

function externalAiHeaders(): HeadersInit {
  return {
    'X-Bible-Desktop-Client': 'biblia-app-web',
    'X-Bible-Desktop-Installation': installationId(),
  }
}

export const bibleDesktopApi = {
  home(signal?: AbortSignal): Promise<HomeSummary> {
    return apiRequest('/home', { signal })
  },

  translations(signal?: AbortSignal): Promise<TranslationSummary[]> {
    return apiRequest('/translations', { signal })
  },

  liturgicalCollections(signal?: AbortSignal): Promise<LiturgicalCollection[]> {
    return apiRequest('/liturgical/collections', { signal })
  },

  calendarDay(date: string, language: 'ru' | 'de', signal?: AbortSignal): Promise<CalendarDay> {
    const query = new URLSearchParams({ date, lang: language, profile: 'typikon-strict' })
    return apiRequest(`/calendar/day?${query}`, { signal })
  },

  icons(query = '', signal?: AbortSignal): Promise<CalendarIconPage> {
    const parameters = new URLSearchParams({ with_images: '1', per_page: '12' })
    if (query.trim()) parameters.set('query', query.trim())
    return apiRequest(`/calendar/icons?${parameters}`, { signal, unwrap: false })
  },

  translatorStatus(signal?: AbortSignal): Promise<TranslatorStatus> {
    return apiRequest('/v1/church-slavonic/status', { headers: externalAiHeaders(), signal })
  },

  translate(
    text: string,
    direction: 'to_church_slavonic' | 'to_russian',
    signal?: AbortSignal,
  ): Promise<TranslationResult> {
    const toRussian = direction === 'to_russian'
    return apiRequest('/v1/church-slavonic/translate', {
      method: 'POST',
      headers: externalAiHeaders(),
      body: JSON.stringify({
        text,
        source_language: toRussian ? 'cu' : 'auto',
        target_language: toRussian ? 'ru' : 'cu',
        options: { accents: true, titlo: true, breathings: true, slavonic_numbers: false },
      }),
      signal,
    })
  },

  recognizeInscription(image: File, signal?: AbortSignal): Promise<InscriptionRecognitionResult> {
    const body = new FormData()
    body.append('image', image)
    return apiRequest('/v1/icon-inscriptions/recognize', {
      method: 'POST',
      headers: externalAiHeaders(),
      body,
      signal,
    })
  },

  async publicContent(kind: PublicContentKind, signal?: AbortSignal): Promise<PublicContentItem[]> {
    const paths: Record<PublicContentKind, string> = {
      faith: '/faith-questions',
      recipes: '/recipes',
      quizzes: '/quizzes',
      tours: '/virtual-tours',
      links: '/useful-links',
    }
    const rows = await apiRequest<Record<string, unknown>[]>(paths[kind], { signal })
    return rows.map((row) => normalizePublicContent(kind, row))
  },

  createProfile(configuration: PersonalConfiguration): Promise<RemoteProfileCredentials> {
    return apiRequest('/v1/profiles', {
      method: 'POST',
      body: JSON.stringify({ schema_version: 3, configuration }),
    })
  },

  profile(profileId: string, secret: string, signal?: AbortSignal): Promise<RemoteProfileData> {
    return apiRequest(`/v1/profiles/${encodeURIComponent(profileId)}`, {
      headers: { 'X-Profile-Secret': secret },
      signal,
    })
  },

  recoverProfile(recoveryCode: string): Promise<RemoteProfileCredentials> {
    return apiRequest('/v1/profiles/recover', {
      method: 'POST',
      body: JSON.stringify({ recovery_code: recoveryCode }),
    })
  },
}

function normalizePublicContent(kind: PublicContentKind, row: Record<string, unknown>): PublicContentItem {
  const title = stringValue(kind === 'faith' ? row.question : row.title)
  const description = nullableString(kind === 'faith' ? stripHtml(row.answer_html) : row.description ?? row.summary)
  const href = kind === 'links' ? nullableString(row.url) : kind === 'tours' ? nullableString(row.tour_url) : null
  const imageUrl = nullableString(row.cover_image_url ?? row.image_url)
  const meta = kind === 'recipes' && isRecord(row.category) ? nullableString(row.category.name) : nullableString(row.category)
  return { id: numberValue(row.id), title, description, imageUrl, href, meta }
}

function stripHtml(value: unknown): string | null {
  if (typeof value !== 'string') return null
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function numberValue(value: unknown): number {
  return typeof value === 'number' ? value : Number(value) || 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
