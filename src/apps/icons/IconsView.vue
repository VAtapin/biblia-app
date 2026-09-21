<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { readyApps } from '@/registry/features'
import type { CalendarIconPage } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AsyncNotice from '@/shared/components/AsyncNotice.vue'
import SectionHeader from '@/shared/components/SectionHeader.vue'

const { locale, t } = useI18n()
const app = readyApps.find((item) => item.id === 'icons')!
const result = ref<CalendarIconPage | null>(null)
const query = ref('')
const loading = ref(true)
const error = ref<string | null>(null)

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    result.value = await bibleDesktopApi.icons(query.value)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page app-page icons-page">
    <SectionHeader :title="localize(app.title, locale)" :description="localize(app.description, locale)" icon="image" :eyebrow="t('dataFrom')" />
    <form class="catalog-toolbar" @submit.prevent="load">
      <label class="search-field grow"><span class="sr-only">{{ t('search') }}</span><input v-model="query" type="search" :placeholder="t('searchIcons')" /></label>
      <button class="primary-button" type="submit">{{ t('search') }}</button>
      <span v-if="result" class="catalog-total">{{ result.total.toLocaleString() }} · {{ result.imageTotal.toLocaleString() }} {{ t('images') }}</span>
    </form>
    <AsyncNotice :loading="loading" :error="error" :empty="!loading && !error && !result?.data.length" @retry="load" />
    <div v-if="result && !loading && !error" class="icon-grid">
      <article v-for="icon in result.data" :key="icon.id" class="icon-card">
        <div class="icon-image-frame"><img v-if="icon.images[0]" :src="icon.images[0].url" :alt="icon.title" loading="lazy" /></div>
        <div class="icon-card-copy"><small>{{ icon.dates[0]?.label ?? icon.kind }}</small><h2>{{ icon.title }}</h2><p v-if="icon.imageCount > 1">{{ icon.imageCount }} {{ t('images') }}</p></div>
      </article>
    </div>
  </div>
</template>
