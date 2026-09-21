<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { createPersonalConfiguration, quickStartFeatures } from '@/personal/configuration'
import { storeProfileCredentials } from '@/personal/credentials'
import { featureGroups, features } from '@/registry/features'
import { removeFeatureWithDependents, resolveFeatureSelection } from '@/registry/resolveFeatures'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AppIcon from '@/shared/components/AppIcon.vue'

type Stage = 'landing' | 'customize' | 'restore' | 'created'

const router = useRouter()
const { locale, t } = useI18n()
const stage = ref<Stage>('landing')
const selected = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const recoveryCode = ref('')
const createdProfileId = ref('')

const builderGroups = computed(() => featureGroups.map((group) => ({
  ...group,
  features: features.filter((feature) => feature.group === group.id && feature.exposure.builder),
})).filter((group) => group.features.length))

function isSelected(id: string): boolean {
  return selected.value.includes(id)
}

function toggle(id: string): void {
  const feature = features.find((item) => item.id === id)
  if (!feature || feature.availability !== 'available') return
  selected.value = isSelected(id)
    ? removeFeatureWithDependents(selected.value, id)
    : resolveFeatureSelection([...selected.value, id])
}

async function create(ids: string[]): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const configuration = createPersonalConfiguration(ids, locale.value)
    const profile = await bibleDesktopApi.createProfile(configuration)
    storeProfileCredentials(profile)
    recoveryCode.value = profile.recovery_code
    createdProfileId.value = profile.profile_id
    stage.value = 'created'
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loading.value = false
  }
}

async function recover(): Promise<void> {
  if (!recoveryCode.value.trim()) return
  loading.value = true
  error.value = null
  try {
    const profile = await bibleDesktopApi.recoverProfile(recoveryCode.value)
    storeProfileCredentials(profile)
    await router.push(`/my/${profile.profile_id}`)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page builder-page">
    <header class="builder-heading">
      <button v-if="stage !== 'landing' && stage !== 'created'" class="back-button" type="button" @click="stage = 'landing'">← {{ t('back') }}</button>
      <p class="eyebrow">{{ t('createOwn') }}</p>
      <h1>{{ t('builderTitle') }}</h1>
      <p>{{ t('builderIntro') }}</p>
    </header>

    <div v-if="stage === 'landing'" class="builder-entry-grid">
      <button class="builder-entry featured" type="button" :disabled="loading" @click="create(quickStartFeatures)">
        <span class="entry-number">01</span><AppIcon name="book" :size="32" />
        <strong>{{ t('quickStart') }}</strong><p>{{ t('quickStartText') }}</p><span>{{ loading ? t('creatingApp') : t('continue') }} →</span>
      </button>
      <button class="builder-entry" type="button" @click="stage = 'customize'">
        <span class="entry-number">02</span><AppIcon name="letters" :size="32" />
        <strong>{{ t('customize') }}</strong><p>{{ t('customizeText') }}</p><span>{{ t('continue') }} →</span>
      </button>
      <button class="builder-entry" type="button" @click="stage = 'restore'">
        <span class="entry-number">03</span><AppIcon name="link" :size="32" />
        <strong>{{ t('restore') }}</strong><p>{{ t('restoreText') }}</p><span>{{ t('continue') }} →</span>
      </button>
    </div>

    <form v-else-if="stage === 'customize'" class="feature-builder" @submit.prevent="create(selected)">
      <section v-for="group in builderGroups" :key="group.id" class="builder-group">
        <div class="builder-group-heading">
          <span class="feature-icon"><AppIcon :name="group.icon" /></span>
          <span><h2>{{ localize(group.title, locale) }}</h2><p>{{ localize(group.description, locale) }}</p></span>
        </div>
        <div class="feature-choice-list">
          <button
            v-for="feature in group.features"
            :key="feature.id"
            class="feature-choice"
            :class="{ selected: isSelected(feature.id), planned: feature.availability === 'planned' }"
            type="button"
            :disabled="feature.availability === 'planned'"
            :aria-pressed="isSelected(feature.id)"
            @click="toggle(feature.id)"
          >
            <span class="check-mark">{{ isSelected(feature.id) ? '✓' : '+' }}</span>
            <span><strong>{{ localize(feature.title, locale) }}</strong><small>{{ localize(feature.description, locale) }}</small></span>
            <em v-if="feature.availability === 'planned'">{{ t('availableSoon') }}</em>
          </button>
        </div>
      </section>
      <div class="builder-submit-bar">
        <span><strong>{{ selected.length }}</strong> {{ t('selected').toLocaleLowerCase() }}<small>{{ t('dependencyAdded') }}</small></span>
        <button class="primary-button" type="submit" :disabled="!selected.length || loading">{{ loading ? t('creatingApp') : t('createApp') }}</button>
      </div>
    </form>

    <form v-else-if="stage === 'restore'" class="recovery-card" @submit.prevent="recover">
      <label for="recovery-code">{{ t('recoveryCode') }}</label>
      <input id="recovery-code" v-model="recoveryCode" autocomplete="off" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX" />
      <p>{{ t('recoveryHint') }}</p>
      <button class="primary-button" type="submit" :disabled="loading || !recoveryCode.trim()">{{ loading ? t('loading') : t('recoverApp') }}</button>
    </form>

    <section v-else class="recovery-card created-card">
      <span class="success-mark">✓</span>
      <h2>{{ t('keepRecovery') }}</h2>
      <p>{{ t('keepRecoveryText') }}</p>
      <code>{{ recoveryCode }}</code>
      <RouterLink class="primary-button" :to="`/my/${createdProfileId}`">{{ t('continue') }}</RouterLink>
    </section>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
  </div>
</template>
