<script setup lang="ts">
import type { FeatureIcon } from '@/registry/types'
import AppIcon from './AppIcon.vue'

defineProps<{ eyebrow?: string; title: string; description: string; icon: FeatureIcon }>()
</script>

<template>
  <header class="section-header">
    <span class="section-icon"><AppIcon :name="icon" :size="30" /></span>
    <div>
      <small v-if="eyebrow">{{ eyebrow }}</small>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
  </header>
</template>
