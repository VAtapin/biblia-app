<script setup lang="ts">
import { useI18n } from '@/i18n/useI18n'

defineProps<{ loading?: boolean; error?: string | null; empty?: boolean }>()
defineEmits<{ retry: [] }>()
const { t } = useI18n()
</script>

<template>
  <div v-if="loading" class="async-notice" role="status">
    <span class="spinner" aria-hidden="true" />
    <span>{{ t('loading') }}</span>
  </div>
  <div v-else-if="error" class="async-notice error-notice" role="alert">
    <span>{{ t('apiUnavailable') }}</span>
    <button class="text-button" type="button" @click="$emit('retry')">{{ t('retry') }}</button>
  </div>
  <div v-else-if="empty" class="async-notice">{{ t('empty') }}</div>
</template>
