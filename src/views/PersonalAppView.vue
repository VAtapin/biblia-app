<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { getProfileCredentials } from '@/personal/credentials'
import { navigationForConfiguration } from '@/personal/configuration'
import { featureById } from '@/registry/features'
import type { RemoteProfileData } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AppIcon from '@/shared/components/AppIcon.vue'
import AsyncNotice from '@/shared/components/AsyncNotice.vue'

const route = useRoute()
const { locale, t } = useI18n()
const profile = ref<RemoteProfileData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const profileId = computed(() => String(route.params.profileId ?? ''))
const navigation = computed(() => navigationForConfiguration(profile.value?.configuration).map(featureById).filter(Boolean))

async function load(): Promise<void> {
  const credentials = getProfileCredentials(profileId.value)
  if (!credentials) {
    error.value = 'credentials-required'
    loading.value = false
    return
  }
  loading.value = true
  error.value = null
  try {
    profile.value = await bibleDesktopApi.profile(profileId.value, credentials.secret)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page personal-page">
    <div class="personal-heading">
      <span class="personal-monogram">М</span>
      <div><p class="eyebrow">{{ t('personalApp') }}</p><h1>{{ t('personalApp') }}</h1></div>
      <RouterLink class="secondary-button" to="/create">{{ t('appSettings') }}</RouterLink>
    </div>

    <AsyncNotice v-if="loading" :loading="true" />
    <section v-else-if="error === 'credentials-required'" class="empty-panel">
      <h2>{{ t('restore') }}</h2><p>{{ t('restoreText') }}</p>
      <RouterLink class="primary-button" to="/create">{{ t('recoverApp') }}</RouterLink>
    </section>
    <AsyncNotice v-else-if="error" :error="error" @retry="load" />
    <div v-else-if="navigation.length" class="personal-feature-grid">
      <RouterLink v-for="feature in navigation" :key="feature!.id" :to="feature!.route" class="personal-feature-card">
        <span class="feature-icon"><AppIcon :name="feature!.icon" :size="28" /></span>
        <span><strong>{{ localize(feature!.title, locale) }}</strong><small>{{ localize(feature!.description, locale) }}</small></span>
        <span aria-hidden="true">→</span>
      </RouterLink>
    </div>
    <div v-else class="empty-panel">{{ t('noFeatures') }}</div>
  </div>
</template>
