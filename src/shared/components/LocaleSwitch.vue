<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'

const { locale, setLocale, t } = useI18n()
</script>

<template>
  <div class="locale-switch" :aria-label="t('language')">
    <button type="button" :class="{ active: locale === 'ru' }" :aria-pressed="locale === 'ru'" @click="setLocale('ru')">RU</button>
    <button type="button" :class="{ active: locale === 'de' }" :aria-pressed="locale === 'de'" @click="setLocale('de')">DE</button>
  </div>
</template>
