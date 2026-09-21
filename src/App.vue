<script setup lang="ts">
import { watchEffect } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import AppShell from '@/app/AppShell.vue'

const { locale } = useI18n()

watchEffect(() => {
  document.documentElement.lang = locale.value
  document.title = locale.value === 'de' ? 'Biblia App — Bibel und Tradition' : 'Biblia App — Писание и традиция'
})
</script>

<template>
  <AppShell />
</template>
