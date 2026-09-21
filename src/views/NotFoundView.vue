<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'
const { t } = useI18n()
</script>

<template>
  <div class="page not-found-page"><span>404</span><h1>{{ t('notFound') }}</h1><RouterLink class="primary-button" to="/">{{ t('goHome') }}</RouterLink></div>
</template>
