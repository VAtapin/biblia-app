<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '@/i18n/useI18n'
import type { InscriptionRecognitionResult } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AppIcon from '@/shared/components/AppIcon.vue'
import SectionHeader from '@/shared/components/SectionHeader.vue'

const { t } = useI18n()
const image = ref<File | null>(null)
const previewUrl = ref('')
const result = ref<InscriptionRecognitionResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function choose(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  image.value = file
  previewUrl.value = file ? URL.createObjectURL(file) : ''
  result.value = null
}

async function submit(): Promise<void> {
  if (!image.value) return
  loading.value = true
  error.value = null
  try {
    result.value = await bibleDesktopApi.recognizeInscription(image.value)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <div class="page app-page recognizer-page">
    <SectionHeader :title="t('recognizer')" :description="t('recognizerIntro')" icon="image" :eyebrow="t('dataFrom')" />
    <div class="tool-tabs">
      <RouterLink to="/slavonic"><AppIcon name="letters" />{{ t('translator') }}</RouterLink>
      <span class="active"><AppIcon name="image" />{{ t('recognizer') }}</span>
    </div>
    <section class="recognizer-workspace">
      <form class="upload-panel" @submit.prevent="submit">
        <label class="upload-drop">
          <input type="file" accept="image/jpeg,image/png,image/webp" @change="choose" />
          <img v-if="previewUrl" :src="previewUrl" alt="" />
          <span v-else><AppIcon name="image" :size="34" /><strong>{{ t('chooseImage') }}</strong><small>JPEG · PNG · WebP · 8 MB</small></span>
        </label>
        <button class="primary-button" type="submit" :disabled="loading || !image">{{ loading ? t('recognizing') : t('recognize') }}</button>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      </form>
      <div class="recognition-result">
        <section><small>01</small><h2>{{ t('recognizedText') }}</h2><p>{{ result?.recognized_text || '—' }}</p></section>
        <section><small>02</small><h2>{{ t('expandedText') }}</h2><p>{{ result?.expanded_text || '—' }}</p></section>
        <section><small>03</small><h2>{{ t('russianTranslation') }}</h2><p>{{ result?.russian_translation || '—' }}</p></section>
      </div>
    </section>
  </div>
</template>
