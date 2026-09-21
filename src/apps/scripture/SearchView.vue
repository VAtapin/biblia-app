<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import type { TranslationBooks, TranslationSummary, VerseSearchResponse, VerseSearchResult } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AsyncNotice from '@/shared/components/AsyncNotice.vue'
import { bookForOsis, chapterPath, preferredTranslation } from './readerModel'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const translations = ref<TranslationSummary[]>([])
const translationCode = ref('')
const query = ref('')
const response = ref<VerseSearchResponse | null>(null)
const books = ref<TranslationBooks | null>(null)
const loadingCatalog = ref(true)
const loadingSearch = ref(false)
const error = ref<string | null>(null)
let request: AbortController | null = null

const submittedQuery = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '')

function resultPath(result: VerseSearchResult): string | null {
  if (books.value?.translation.code !== result.translation.code) return null
  const book = bookForOsis(books.value?.books ?? [], result.book.osis_code)
  return book ? chapterPath(result.translation.code, book.slug, result.chapter_number, result.verse_number) : null
}

async function loadCatalog(): Promise<void> {
  loadingCatalog.value = true
  error.value = null
  try {
    translations.value = await bibleDesktopApi.translations()
    const requested = typeof route.query.translation === 'string' ? route.query.translation : ''
    translationCode.value = translations.value.find((item) => item.code === requested)?.code
      ?? preferredTranslation(translations.value, locale.value)?.code ?? ''
    query.value = submittedQuery.value
    if (submittedQuery.value) await runSearch()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loadingCatalog.value = false
  }
}

async function runSearch(): Promise<void> {
  request?.abort()
  request = new AbortController()
  const signal = request.signal
  const searchText = submittedQuery.value
  if (searchText.length < 2 || !translationCode.value) {
    response.value = null
    books.value = null
    return
  }
  loadingSearch.value = true
  error.value = null
  response.value = null
  try {
    const [searchResult, catalog] = await Promise.all([
      bibleDesktopApi.searchVerses(searchText, translationCode.value, signal),
      bibleDesktopApi.translationBooks(translationCode.value, signal),
    ])
    if (catalog.translation.code !== translationCode.value) throw new Error('Translation mismatch')
    response.value = searchResult
    books.value = catalog
  } catch (caught) {
    if (!signal.aborted) error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    if (!signal.aborted) loadingSearch.value = false
  }
}

async function submit(): Promise<void> {
  const next = { q: query.value.trim(), translation: translationCode.value }
  if (submittedQuery.value === next.q && route.query.translation === next.translation) await runSearch()
  else await router.push({ name: 'scripture-search', query: next })
}

watch(() => [route.query.q, route.query.translation], () => {
  if (!translations.value.length) return
  query.value = submittedQuery.value
  const requested = typeof route.query.translation === 'string' ? route.query.translation : ''
  translationCode.value = translations.value.find((item) => item.code === requested)?.code
    ?? preferredTranslation(translations.value, locale.value)?.code ?? ''
  void runSearch()
})
onMounted(loadCatalog)
onUnmounted(() => request?.abort())
</script>

<template>
  <div class="page app-page scripture-page">
    <nav class="scripture-breadcrumbs" :aria-label="t('scriptureNavigation')"><RouterLink to="/scripture">{{ t('readBible') }}</RouterLink><span aria-hidden="true">/</span><span>{{ t('searchBible') }}</span></nav>
    <div class="scripture-heading"><p class="eyebrow">{{ t('dataFrom') }}</p><h1>{{ t('searchBible') }}</h1><p>{{ t('searchBibleIntro') }}</p></div>
    <form class="scripture-search-form" @submit.prevent="submit">
      <label><span>{{ t('chooseTranslation') }}</span><select v-model="translationCode" :disabled="loadingCatalog"><option v-for="translation in translations" :key="translation.code" :value="translation.code">{{ translation.name }}</option></select></label>
      <label class="grow"><span>{{ t('search') }}</span><input v-model="query" type="search" minlength="2" :placeholder="t('searchBiblePlaceholder')" required /></label>
      <button class="primary-button" type="submit" :disabled="loadingCatalog || loadingSearch || query.trim().length < 2">{{ t('search') }}</button>
    </form>
    <AsyncNotice :loading="loadingCatalog || loadingSearch" :error="error" @retry="loadCatalog" />
    <section v-if="response && !loadingSearch && !error" class="search-results">
      <div class="search-results-heading"><h2>{{ t('searchResults') }}</h2><span class="count-badge">{{ response.results.length }}</span></div>
      <p v-if="!response.results.length" class="empty-panel">{{ t('noSearchResults') }}</p>
      <article v-for="result in response.results" :key="`${result.verse_id}-${result.translation.code}`" class="search-result-card">
        <RouterLink v-if="resultPath(result)" :to="resultPath(result)!" class="search-result-reference">{{ result.reference }} <span aria-hidden="true">→</span></RouterLink>
        <strong v-else class="search-result-reference">{{ result.reference }}</strong>
        <p><template v-for="(segment, index) in result.snippet_segments" :key="index"><mark v-if="segment.match">{{ segment.text }}</mark><template v-else>{{ segment.text }}</template></template></p>
      </article>
    </section>
  </div>
</template>
