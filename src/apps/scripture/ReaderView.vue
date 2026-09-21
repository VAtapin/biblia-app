<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import type { BibleChapter, BibleVerse, StrongEntry, TranslationBooks, VerseCrossReference, VerseStrongTokens, VerseCrossReferences } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AsyncNotice from '@/shared/components/AsyncNotice.vue'
import { bookForOsis, chapterPath, isValidChapter, plainLexiconContent } from './readerModel'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const translationCode = computed(() => String(route.params.translation ?? ''))
const bookSlug = computed(() => String(route.params.book ?? ''))
const chapterNumber = computed(() => Number(route.params.chapter))
const catalog = ref<TranslationBooks | null>(null)
const chapter = ref<BibleChapter | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const selectedVerse = ref<BibleVerse | null>(null)
const tokens = ref<VerseStrongTokens | null>(null)
const references = ref<VerseCrossReferences | null>(null)
const studyLoading = ref(false)
const studyError = ref(false)
const entry = ref<StrongEntry | null>(null)
const entryLoading = ref(false)
const entryError = ref(false)
const showAllReferences = ref(false)
const fontSize = ref(readFontSize())
let request: AbortController | null = null
let studyRequest: AbortController | null = null
let entryRequest: AbortController | null = null

const book = computed(() => catalog.value?.books.find((item) => item.slug === bookSlug.value))
const chapterChoices = computed(() => Array.from({ length: book.value?.chapters_count ?? 0 }, (_, index) => index + 1))
const previousPath = computed(() => chapterNumber.value > 1 ? chapterPath(translationCode.value, bookSlug.value, chapterNumber.value - 1) : null)
const nextPath = computed(() => book.value && chapterNumber.value < book.value.chapters_count ? chapterPath(translationCode.value, bookSlug.value, chapterNumber.value + 1) : null)
const visibleReferences = computed(() => showAllReferences.value ? references.value?.references ?? [] : references.value?.references.slice(0, 8) ?? [])

function readFontSize(): number {
  const saved = Number(window.localStorage.getItem('biblia-app.reader-font-size'))
  return Number.isFinite(saved) && saved >= 16 && saved <= 28 ? saved : 20
}

function adjustFont(delta: number): void {
  fontSize.value = Math.min(28, Math.max(16, fontSize.value + delta))
  window.localStorage.setItem('biblia-app.reader-font-size', String(fontSize.value))
}

function verseFromHash(): BibleVerse | undefined {
  const match = /^#v(\d+)$/.exec(route.hash)
  return match ? chapter.value?.verses.find((verse) => verse.number === Number(match[1])) : undefined
}

function scrollToVerse(verse: BibleVerse): void {
  void nextTick(() => document.getElementById(`v${verse.number}`)?.scrollIntoView({ block: 'center' }))
}

async function load(): Promise<void> {
  request?.abort()
  studyRequest?.abort()
  entryRequest?.abort()
  request = new AbortController()
  const signal = request.signal
  loading.value = true
  error.value = null
  chapter.value = null
  selectedVerse.value = null
  catalog.value = null
  try {
    const books = await bibleDesktopApi.translationBooks(translationCode.value, signal)
    if (books.translation.code !== translationCode.value) throw new Error('Translation mismatch')
    const selectedBook = books.books.find((item) => item.slug === bookSlug.value)
    if (!selectedBook || !Number.isInteger(chapterNumber.value) || chapterNumber.value < 1 || chapterNumber.value > selectedBook.chapters_count) {
      throw new Error('Chapter not found')
    }
    catalog.value = books
    const loaded = await bibleDesktopApi.chapter(translationCode.value, bookSlug.value, chapterNumber.value, signal)
    if (!isValidChapter(loaded, translationCode.value, bookSlug.value, chapterNumber.value)) throw new Error('Chapter text is unavailable')
    chapter.value = loaded
    const verse = verseFromHash()
    if (verse) {
      scrollToVerse(verse)
      void openVerse(verse)
    }
  } catch (caught) {
    if (!signal.aborted) error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    if (!signal.aborted) loading.value = false
  }
}

function selectChapter(event: Event): void {
  const value = Number((event.target as HTMLSelectElement).value)
  if (Number.isInteger(value) && value >= 1 && value <= (book.value?.chapters_count ?? 0)) {
    void router.push(chapterPath(translationCode.value, bookSlug.value, value))
  }
}

function selectBook(event: Event): void {
  const slug = (event.target as HTMLSelectElement).value
  if (catalog.value?.books.some((item) => item.slug === slug)) void router.push(chapterPath(translationCode.value, slug, 1))
}

function selectVerse(verse: BibleVerse): void {
  if (route.hash === `#v${verse.number}`) void openVerse(verse)
  else void router.replace({ hash: `#v${verse.number}` })
}

async function openVerse(verse: BibleVerse): Promise<void> {
  studyRequest?.abort()
  entryRequest?.abort()
  studyRequest = new AbortController()
  const signal = studyRequest.signal
  selectedVerse.value = verse
  tokens.value = null
  references.value = null
  entry.value = null
  entryLoading.value = false
  entryError.value = false
  showAllReferences.value = false
  studyLoading.value = true
  studyError.value = false
  try {
    const [strongData, referenceData] = await Promise.all([
      verse.has_strong_markup ? bibleDesktopApi.verseStrongTokens(verse.id, translationCode.value, signal) : Promise.resolve(null),
      bibleDesktopApi.verseCrossReferences(verse.id, translationCode.value, signal),
    ])
    if (!signal.aborted) {
      tokens.value = strongData
      references.value = referenceData
    }
  } catch {
    if (!signal.aborted) studyError.value = true
  } finally {
    if (!signal.aborted) studyLoading.value = false
  }
}

async function showStrong(number: string): Promise<void> {
  if (!selectedVerse.value) return
  entryRequest?.abort()
  entryRequest = new AbortController()
  const signal = entryRequest.signal
  entry.value = null
  entryLoading.value = true
  entryError.value = false
  try {
    entry.value = await bibleDesktopApi.strongEntry(number, selectedVerse.value.id, signal)
  } catch {
    if (!signal.aborted) entryError.value = true
  } finally {
    if (!signal.aborted) entryLoading.value = false
  }
}

function referencePath(reference: VerseCrossReference): string | null {
  const osisCode = reference.target.osis_ref.split('.')[0] ?? ''
  const targetBook = bookForOsis(catalog.value?.books ?? [], osisCode)
  return targetBook ? chapterPath(translationCode.value, targetBook.slug, reference.target.chapter_number, reference.target.verse_number) : null
}

watch(() => [route.params.translation, route.params.book, route.params.chapter], load, { immediate: true })
watch(() => route.hash, () => {
  const verse = verseFromHash()
  if (verse) {
    scrollToVerse(verse)
    void openVerse(verse)
  } else selectedVerse.value = null
})
onUnmounted(() => { request?.abort(); studyRequest?.abort(); entryRequest?.abort() })
</script>

<template>
  <div class="page app-page scripture-page reader-page">
    <nav class="scripture-breadcrumbs" :aria-label="t('scriptureNavigation')">
      <RouterLink to="/scripture">{{ t('translations') }}</RouterLink><span aria-hidden="true">/</span>
      <RouterLink :to="`/scripture/${encodeURIComponent(translationCode)}`">{{ chapter?.translation.name ?? translationCode }}</RouterLink><span aria-hidden="true">/</span>
      <span>{{ book?.name ?? bookSlug }}</span>
    </nav>
    <div class="reader-heading">
      <div><p class="eyebrow">{{ chapter?.translation.name ?? t('readBible') }}</p><h1>{{ book?.name ?? t('loading') }} <span v-if="chapter">{{ chapterNumber }}</span></h1></div>
      <RouterLink class="secondary-button" :to="{ name: 'scripture-search', query: { translation: translationCode } }">{{ t('searchBible') }}</RouterLink>
    </div>
    <AsyncNotice :loading="loading" :error="error" @retry="load" />
    <template v-if="chapter && catalog && !loading && !error">
      <div class="reader-controls">
        <label><span>{{ t('book') }}</span><select :value="bookSlug" @change="selectBook"><option v-for="item in catalog.books" :key="item.slug" :value="item.slug">{{ item.name }}</option></select></label>
        <label><span>{{ t('chapter') }}</span><select :value="chapterNumber" @change="selectChapter"><option v-for="number in chapterChoices" :key="number" :value="number">{{ number }}</option></select></label>
        <div class="reader-font-controls" :aria-label="t('fontSize')"><button type="button" :aria-label="t('smallerText')" :disabled="fontSize <= 16" @click="adjustFont(-2)">A−</button><button type="button" :aria-label="t('largerText')" :disabled="fontSize >= 28" @click="adjustFont(2)">A+</button></div>
      </div>
      <div class="reader-layout">
        <article class="reader-text workspace-card" :lang="chapter.translation.language.code" :style="{ '--reader-font-size': `${fontSize}px` }">
          <p class="reader-instruction">{{ t('verseStudyHint') }}</p>
          <div v-for="verse in chapter.verses" :id="`v${verse.number}`" :key="verse.id" class="reader-verse" :class="{ active: selectedVerse?.id === verse.id }">
            <button type="button" class="verse-number" :aria-label="`${t('verse')} ${verse.number}`" @click="selectVerse(verse)">{{ verse.number }}</button>
            <p>{{ verse.plain_text }}</p>
          </div>
        </article>
        <aside class="reader-study mini-panel">
          <template v-if="selectedVerse">
            <h2>{{ t('verse') }} {{ selectedVerse.number }}</h2>
            <p class="reader-study-reference">{{ selectedVerse.osis_ref }}</p>
            <AsyncNotice :loading="studyLoading" :error="studyError ? t('apiUnavailable') : null" @retry="openVerse(selectedVerse!)" />
            <template v-if="!studyLoading && !studyError">
              <section v-if="tokens?.tokens.length" class="study-section"><h3>{{ t('strongNumbers') }}</h3><div class="strong-list"><button v-for="token in tokens.tokens" :key="`${token.id}-${token.token_order}`" type="button" @click="showStrong(token.strong_number)">{{ token.strong_number }}</button></div>
                <div v-if="entryLoading" class="study-entry">{{ t('loading') }}</div>
                <div v-else-if="entryError" class="study-entry" role="alert">{{ t('apiUnavailable') }}</div>
                <div v-else-if="entry" class="study-entry"><strong>{{ entry.number }} · {{ entry.word || entry.transliteration || '—' }}</strong><p v-if="entry.content">{{ plainLexiconContent(entry.content) }}</p></div>
              </section>
              <section class="study-section"><h3>{{ t('crossReferences') }} <span class="count-badge">{{ references?.references.length ?? 0 }}</span></h3>
                <p v-if="!references?.references.length">{{ t('noCrossReferences') }}</p>
                <ul v-else class="cross-reference-list"><li v-for="reference in visibleReferences" :key="reference.id">
                  <RouterLink v-if="referencePath(reference)" :to="referencePath(reference)!">{{ reference.target.reference }}</RouterLink><strong v-else>{{ reference.target.reference }}</strong>
                  <small v-if="reference.target.text">{{ reference.target.text }}</small>
                </li></ul>
                <button v-if="(references?.references.length ?? 0) > 8" type="button" class="text-button reference-toggle" @click="showAllReferences = !showAllReferences">{{ showAllReferences ? t('showFewerReferences') : t('showAllReferences') }}</button>
              </section>
            </template>
          </template>
          <template v-else><h2>{{ t('verseStudy') }}</h2><p>{{ t('verseStudyHint') }}</p></template>
        </aside>
      </div>
      <nav class="reader-pagination" :aria-label="t('chapterNavigation')">
        <RouterLink v-if="previousPath" :to="previousPath" class="secondary-button">← {{ t('previousChapter') }}</RouterLink><span v-else />
        <RouterLink v-if="nextPath" :to="nextPath" class="secondary-button">{{ t('nextChapter') }} →</RouterLink>
      </nav>
    </template>
  </div>
</template>
