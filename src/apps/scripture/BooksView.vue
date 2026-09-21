<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import type { BibleBook, TranslationBooks } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AsyncNotice from '@/shared/components/AsyncNotice.vue'
import { chapterPath } from './readerModel'

const route = useRoute()
const { locale, t } = useI18n()
const translationCode = computed(() => String(route.params.translation ?? ''))
const catalog = ref<TranslationBooks | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const filter = ref('')
let request: AbortController | null = null

const groups = computed(() => {
  const query = filter.value.trim().toLocaleLowerCase()
  const books = (catalog.value?.books ?? []).filter((book) => !query || `${book.name} ${book.short_name ?? ''}`.toLocaleLowerCase().includes(query))
  return [
    { key: 'oldTestament', books: books.filter((book) => book.canonical_book?.testament === 'old') },
    { key: 'newTestament', books: books.filter((book) => book.canonical_book?.testament === 'new') },
    { key: 'otherBooks', books: books.filter((book) => book.canonical_book?.testament !== 'old' && book.canonical_book?.testament !== 'new') },
  ].filter((group) => group.books.length)
})

function bookPath(book: BibleBook): string {
  return chapterPath(translationCode.value, book.slug, 1)
}

function chapterWord(count: number): string {
  if (locale.value === 'de') return t('chapters')
  const ending = count % 10
  if (ending === 1 && count % 100 !== 11) return t('chapterCountOne')
  if (ending >= 2 && ending <= 4 && (count % 100 < 12 || count % 100 > 14)) return t('chapterCountFew')
  return t('chapters')
}

async function load(): Promise<void> {
  request?.abort()
  request = new AbortController()
  const signal = request.signal
  loading.value = true
  error.value = null
  catalog.value = null
  try {
    const response = await bibleDesktopApi.translationBooks(translationCode.value, signal)
    if (response.translation.code !== translationCode.value) throw new Error('Translation mismatch')
    catalog.value = response
  } catch (caught) {
    if (!signal.aborted) error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    if (!signal.aborted) loading.value = false
  }
}

watch(translationCode, load, { immediate: true })
onUnmounted(() => request?.abort())
</script>

<template>
  <div class="page app-page scripture-page">
    <nav class="scripture-breadcrumbs" :aria-label="t('scriptureNavigation')">
      <RouterLink to="/scripture">{{ t('translations') }}</RouterLink><span aria-hidden="true">/</span><span>{{ catalog?.translation.name ?? translationCode }}</span>
    </nav>
    <div class="scripture-heading">
      <p class="eyebrow">{{ t('readBible') }}</p>
      <h1>{{ catalog?.translation.name ?? t('loading') }}</h1>
      <p>{{ t('chooseBook') }}</p>
    </div>
    <AsyncNotice :loading="loading" :error="error" :empty="!loading && !error && !catalog?.books.length" @retry="load" />
    <template v-if="catalog && !loading && !error">
      <label class="search-field scripture-book-search"><span class="sr-only">{{ t('search') }}</span><input v-model="filter" type="search" :placeholder="t('searchBook')" /></label>
      <section v-for="group in groups" :key="group.key" class="scripture-book-group">
        <h2>{{ t(group.key as 'oldTestament' | 'newTestament' | 'otherBooks') }}</h2>
        <div class="scripture-book-grid">
          <RouterLink v-for="book in group.books" :key="book.slug" :to="bookPath(book)" class="scripture-book-card" :aria-label="`${book.name}, ${book.chapters_count} ${chapterWord(book.chapters_count)}`">
            <span>{{ book.order.toString().padStart(2, '0') }}</span>
            <strong>{{ book.name }}</strong>
            <small>{{ book.chapters_count }} {{ chapterWord(book.chapters_count) }}</small>
            <b aria-hidden="true">→</b>
          </RouterLink>
        </div>
      </section>
      <p v-if="!groups.length" class="empty-panel">{{ t('empty') }}</p>
    </template>
  </div>
</template>
