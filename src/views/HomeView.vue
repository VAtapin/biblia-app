<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { features, readyApps } from '@/registry/features'
import type { HomeSummary } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AppIcon from '@/shared/components/AppIcon.vue'

const { locale, t } = useI18n()
const summary = ref<HomeSummary | null>(null)
const apiState = ref<'loading' | 'online' | 'offline'>('loading')

const resourceFeatures = computed(() => features.filter((feature) => feature.group === 'resources' && feature.exposure.navigation))

onMounted(async () => {
  try {
    summary.value = await bibleDesktopApi.home()
    apiState.value = 'online'
  } catch {
    apiState.value = 'offline'
  }
})

function appCount(appId: string): number | undefined {
  if (!summary.value) return undefined
  if (appId === 'scripture') return summary.value.bibles
  if (appId === 'prayer') return summary.value.prayers + summary.value.canons + summary.value.akathists + summary.value.horologion
  return undefined
}

function featureCount(key?: string): number | undefined {
  if (!summary.value || !key) return undefined
  const value = summary.value[key as keyof HomeSummary]
  return typeof value === 'number' ? value : undefined
}
</script>

<template>
  <div class="page home-page">
    <div class="home-heading">
      <div>
        <p class="eyebrow">{{ t('brand') }}</p>
        <h1>{{ t('homeTitle') }}</h1>
        <p>{{ t('homeIntro') }}</p>
      </div>
      <span class="api-state" :class="apiState"><i />{{ apiState === 'offline' ? t('offline') : t('dataFrom') }}</span>
    </div>

    <section class="choice-grid" aria-label="Entry choices">
      <div class="ready-panel">
        <div class="panel-heading"><span>{{ t('openReady') }}</span><small>{{ readyApps.length }}</small></div>
        <div class="ready-app-grid">
          <RouterLink v-for="app in readyApps" :key="app.id" class="app-card" :to="app.route">
            <span class="feature-icon"><AppIcon :name="app.icon" :size="26" /></span>
            <span class="app-card-copy">
              <strong>{{ localize(app.title, locale) }}</strong>
              <small>{{ localize(app.description, locale) }}</small>
            </span>
            <span v-if="appCount(app.id) !== undefined" class="count-badge">{{ appCount(app.id) }}</span>
            <span class="card-arrow" aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </div>

      <RouterLink class="compose-panel" to="/create">
        <span class="compose-symbol" aria-hidden="true"><i>+</i><b /><b /><b /></span>
        <span>
          <small>{{ t('createOwn') }}</small>
          <strong>{{ t('composeTitle') }}</strong>
          <p>{{ t('composeText') }}</p>
        </span>
        <span class="compose-action">{{ t('createApp') }} <b aria-hidden="true">→</b></span>
      </RouterLink>
    </section>

    <section class="module-section">
      <div class="section-heading-row"><h2>{{ t('modulesTitle') }}</h2></div>
      <div class="module-grid">
        <RouterLink v-for="feature in resourceFeatures" :key="feature.id" :to="feature.route" class="module-card">
          <span class="feature-icon quiet"><AppIcon :name="feature.icon" /></span>
          <span><strong>{{ localize(feature.title, locale) }}</strong><small>{{ localize(feature.description, locale) }}</small></span>
          <span v-if="featureCount(feature.homeStatKey) !== undefined" class="count-badge">{{ featureCount(feature.homeStatKey) }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
