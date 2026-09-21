<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { readyApps } from '@/registry/features'
import type { LiturgicalCollection } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AppIcon from '@/shared/components/AppIcon.vue'
import AsyncNotice from '@/shared/components/AsyncNotice.vue'
import SectionHeader from '@/shared/components/SectionHeader.vue'

const { locale, t } = useI18n()
const app = readyApps.find((item) => item.id === 'prayer')!
const collections = ref<LiturgicalCollection[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    collections.value = await bibleDesktopApi.liturgicalCollections()
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
    <SectionHeader :title="localize(app.title, locale)" :description="localize(app.description, locale)" icon="prayer" :eyebrow="t('dataFrom')" />
    <section class="workspace-card">
      <div class="workspace-toolbar"><div><h2>{{ t('collections') }}</h2><span v-if="collections.length" class="count-badge">{{ collections.length }}</span></div></div>
      <AsyncNotice :loading="loading" :error="error" :empty="!loading && !error && !collections.length" @retry="load" />
      <div v-if="!loading && !error" class="collection-grid">
        <article v-for="collection in collections" :key="collection.id" class="collection-card">
          <span class="feature-icon quiet"><AppIcon name="book" /></span>
          <div><h3>{{ collection.title }}</h3><p>{{ collection.count }} {{ t('texts') }}</p></div>
          <span aria-hidden="true">→</span>
        </article>
      </div>
    </section>
  </div>
</template>
