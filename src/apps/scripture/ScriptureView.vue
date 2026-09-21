<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { readyApps } from '@/registry/features'
import type { TranslationSummary } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AsyncNotice from '@/shared/components/AsyncNotice.vue'
import SectionHeader from '@/shared/components/SectionHeader.vue'

const { locale, t } = useI18n()
const app = readyApps.find((item) => item.id === 'scripture')!
const translations = ref<TranslationSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const filter = ref('')

const filtered = computed(() => {
  const query = filter.value.trim().toLocaleLowerCase()
  if (!query) return translations.value
  return translations.value.filter((translation) => `${translation.name} ${translation.language.name}`.toLocaleLowerCase().includes(query))
})

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    translations.value = await bibleDesktopApi.translations()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page app-page">
    <SectionHeader :title="localize(app.title, locale)" :description="localize(app.description, locale)" icon="book" :eyebrow="t('dataFrom')" />
    <nav class="scripture-nav" :aria-label="t('scriptureNavigation')">
      <RouterLink to="/scripture" active-class="active" exact-active-class="active">{{ t('readBible') }}</RouterLink>
      <RouterLink to="/scripture/search" active-class="active">{{ t('searchBible') }}</RouterLink>
    </nav>
    <section class="workspace-card">
      <div class="workspace-toolbar">
        <div><h2>{{ t('translations') }}</h2><span v-if="translations.length" class="count-badge">{{ translations.length }}</span></div>
        <label class="search-field"><span class="sr-only">{{ t('search') }}</span><input v-model="filter" type="search" :placeholder="t('chooseTranslation')" /></label>
      </div>
      <AsyncNotice :loading="loading" :error="error" :empty="!loading && !error && !filtered.length" @retry="load" />
      <div v-if="!loading && !error" class="translation-grid">
        <RouterLink v-for="translation in filtered" :key="translation.code" class="translation-card" :to="`/scripture/${encodeURIComponent(translation.code)}`">
          <span class="language-code">{{ translation.language.code }}</span>
          <div><h3>{{ translation.name }}</h3><p>{{ translation.language.name }}</p></div>
          <span v-if="translation.has_strong" class="capability-badge">Strong</span>
          <span class="translation-arrow" aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
