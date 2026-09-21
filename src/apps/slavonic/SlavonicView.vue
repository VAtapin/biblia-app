<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { readyApps } from '@/registry/features'
import type { TranslationResult, TranslatorStatus } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AppIcon from '@/shared/components/AppIcon.vue'
import SectionHeader from '@/shared/components/SectionHeader.vue'

const { locale, t } = useI18n()
const app = readyApps.find((item) => item.id === 'slavonic')!
const status = ref<TranslatorStatus | null>(null)
const sourceText = ref('')
const direction = ref<'to_church_slavonic' | 'to_russian'>('to_church_slavonic')
const result = ref<TranslationResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const translatedText = computed(() => result.value?.translated_text ?? result.value?.translation ?? '')

onMounted(async () => {
  try {
    status.value = await bibleDesktopApi.translatorStatus()
  } catch {
    status.value = null
  }
})

async function submit(): Promise<void> {
  if (!sourceText.value.trim()) return
  loading.value = true
  error.value = null
  result.value = null
  try {
    result.value = await bibleDesktopApi.translate(sourceText.value, direction.value)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page app-page slavonic-page">
    <SectionHeader :title="localize(app.title, locale)" :description="localize(app.description, locale)" icon="letters" :eyebrow="t('dataFrom')" />
    <div class="tool-tabs">
      <span class="active"><AppIcon name="letters" />{{ t('translator') }}</span>
      <RouterLink to="/slavonic/recognize"><AppIcon name="image" />{{ t('recognizer') }}</RouterLink>
    </div>
    <section class="translator-workspace">
      <form class="translator-form" @submit.prevent="submit">
        <div class="direction-switch">
          <button type="button" :class="{ active: direction === 'to_church_slavonic' }" @click="direction = 'to_church_slavonic'">{{ t('toSlavonic') }}</button>
          <button type="button" :class="{ active: direction === 'to_russian' }" @click="direction = 'to_russian'">{{ t('toRussian') }}</button>
        </div>
        <label for="source-text">{{ t('sourceText') }}</label>
        <textarea id="source-text" v-model="sourceText" :maxlength="status?.max_characters ?? 2000" rows="9" :placeholder="t('translatorIntro')" />
        <div class="form-footer"><small>{{ sourceText.length }} / {{ status?.max_characters ?? 2000 }}</small><button class="primary-button" type="submit" :disabled="loading || !sourceText.trim()">{{ loading ? t('translating') : t('translate') }}</button></div>
      </form>
      <section class="translator-result" :class="{ empty: !translatedText }">
        <div class="result-heading"><h2>{{ t('result') }}</h2><span v-if="result" class="capability-badge">{{ result.source_type }}</span></div>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <p v-else-if="translatedText" class="slavonic-text">{{ translatedText }}</p>
        <p v-else>{{ t('translatorIntro') }}</p>
      </section>
    </section>
  </div>
</template>
