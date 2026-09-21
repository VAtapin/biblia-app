import type { Locale } from '@/domain/localization'
import type { BibleBook, BibleChapter, TranslationSummary } from '@/services/api/contracts'

export function preferredTranslation(translations: TranslationSummary[], locale: Locale): TranslationSummary | undefined {
  const languageMatches = translations.filter((translation) => translation.language.code === locale)
  return languageMatches.find((translation) => translation.is_default) ?? languageMatches[0] ?? translations.find((translation) => translation.is_default) ?? translations[0]
}

export function bookForOsis(books: BibleBook[], osisCode: string): BibleBook | undefined {
  const matches = books.filter((book) => book.canonical_book?.osis_code === osisCode)
  return matches.length === 1 ? matches[0] : undefined
}

export function isValidChapter(chapter: BibleChapter, translationCode: string, bookSlug: string, number: number): boolean {
  return chapter.translation.code === translationCode
    && chapter.book.slug === bookSlug
    && chapter.chapter.number === number
    && chapter.verses.length > 0
    && chapter.verses.every((verse) => Number.isInteger(verse.number) && verse.number > 0 && typeof verse.plain_text === 'string' && verse.plain_text.trim().length > 0)
    && new Set(chapter.verses.map((verse) => verse.number)).size === chapter.verses.length
}

export function chapterPath(translationCode: string, bookSlug: string, chapter: number, verse?: number): string {
  const path = `/scripture/${encodeURIComponent(translationCode)}/${encodeURIComponent(bookSlug)}/${chapter}`
  return verse ? `${path}#v${verse}` : path
}

export function plainLexiconContent(content: string): string {
  return content
    .replace(/<\s*br\s*\/?\s*>|<\s*\/\s*(?:p|div|li)\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:nbsp|#160);/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&#(\d+);/g, (_, value: string) => String.fromCodePoint(Number(value)))
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
