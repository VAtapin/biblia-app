<script setup lang="ts">
import type { FeatureIcon } from '@/registry/types'

defineProps<{ name: FeatureIcon; size?: number }>()
</script>

<template>
  <svg class="app-icon" :width="size ?? 24" :height="size ?? 24" viewBox="0 0 24 24" aria-hidden="true">
    <g v-if="name === 'book'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
    </g>
    <g v-else-if="name === 'prayer'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <path d="M12 3v18M8.5 7h7M7 11h10" />
      <path d="M8.5 21c0-3 1.2-5 3.5-6 2.3 1 3.5 3 3.5 6" />
    </g>
    <g v-else-if="name === 'calendar'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" />
      <path d="m8 15 2 2 5-5" />
    </g>
    <g v-else-if="name === 'image'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m4 18 5-5 3 3 2-2 6 6" />
    </g>
    <g v-else-if="name === 'letters'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 20 10 4h4l5 16M7 14h10M12 2v5M9.5 4h5" />
    </g>
    <g v-else-if="name === 'search'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" />
    </g>
    <g v-else-if="name === 'food'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 4v7a3 3 0 0 0 6 0V4M7 4v17M15 21v-8a4 4 0 0 1 4-4v12M19 3v6" />
    </g>
    <g v-else-if="name === 'quiz'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 8a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4M12 17h.01" /><circle cx="12" cy="12" r="10" />
    </g>
    <g v-else-if="name === 'tour'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 6.5 8 4l8 2.5L21 4v13.5L16 20l-8-2.5L3 20V6.5ZM8 4v13.5M16 6.5V20" />
    </g>
    <g v-else fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1" />
    </g>
  </svg>
</template>
