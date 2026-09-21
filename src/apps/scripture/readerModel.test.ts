import { describe, expect, it } from 'vitest'
import type { BibleBook, BibleChapter, TranslationSummary } from '@/services/api/contracts'
import { bookForOsis, chapterPath, isValidChapter, plainLexiconContent, preferredTranslation } from './readerModel'

const translations = [
  { code: 'ru-a', language: { code: 'ru', name: 'Русский' }, is_default: true },
  { code: 'de-a', language: { code: 'de', name: 'Deutsch' }, is_default: false },
] as TranslationSummary[]

describe('Bible reader model', () => {
  it('prefers the interface language without assuming a translation code', () => {
    expect(preferredTranslation(translations, 'de')?.code).toBe('de-a')
    expect(preferredTranslation(translations, 'ru')?.code).toBe('ru-a')
  })

  it('maps OSIS only when the book is unambiguous', () => {
    const book = { slug: 'genesis', canonical_book: { osis_code: 'Gen' } } as BibleBook
    expect(bookForOsis([book], 'Gen')).toBe(book)
    expect(bookForOsis([book, book], 'Gen')).toBeUndefined()
  })

  it('rejects empty or mismatched chapter text', () => {
    const chapter = {
      translation: { code: 'ru-a' }, book: { slug: 'genesis' }, chapter: { number: 1 },
      verses: [{ number: 1, plain_text: 'В начале...' }],
    } as BibleChapter
    expect(isValidChapter(chapter, 'ru-a', 'genesis', 1)).toBe(true)
    expect(isValidChapter(chapter, 'de-a', 'genesis', 1)).toBe(false)
    expect(isValidChapter({ ...chapter, verses: [] }, 'ru-a', 'genesis', 1)).toBe(false)
    expect(chapterPath('ru-a', 'genesis', 1, 1)).toBe('/scripture/ru-a/genesis/1#v1')
  })

  it('shows lexicon markup as safe, readable text', () => {
    expect(plainLexiconContent('<he>רֵאשִׁית</he><br/>начало &amp; начаток <a href="S:H7218">H7218</a>'))
      .toBe('רֵאשִׁית\nначало & начаток H7218')
  })
})
