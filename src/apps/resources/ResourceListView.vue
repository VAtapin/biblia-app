<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { features } from '@/registry/features'
import type { PublicContentItem, PublicContentKind } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AsyncNotice from '@/shared/components/AsyncNotice.vue'
import SectionHeader from '@/shared/components/SectionHeader.vue'

const props = defineProps<{ kind: PublicContentKind }>()
const { locale, t } = useI18n()
const items = ref<PublicContentItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const feature = computed(() => features.find((item) => item.id === `resources.${props.kind}`) ?? features.find((item) => item.id === 'resources.links')!)

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    items.value = await bibleDesktopApi.publicContent(props.kind)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loading.value = false
  }
}

watch(() => props.kind, load)
onMounted(load)
</script>

<template>
  <div class="page app-page resource-page">
    <SectionHeader :title="localize(feature.title, locale)" :description="localize(feature.description, locale)" :icon="feature.icon" :eyebrow="t('dataFrom')" />
    <AsyncNotice :loading="loading" :error="error" :empty="!loading && !error && !items.length" @retry="load" />
    <div v-if="!loading && !error" class="resource-grid">
      <article v-for="item in items" :key="item.id" class="resource-card">
        <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" loading="lazy" />
        <div><small v-if="item.meta">{{ item.meta }}</small><h2>{{ item.title }}</h2><p v-if="item.description">{{ item.description }}</p><a v-if="item.href" :href="item.href" target="_blank" rel="noopener noreferrer">{{ t('open') }} →</a></div>
      </article>
    </div>
  </div>
</template>
