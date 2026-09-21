<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { readyApps } from '@/registry/features'
import AppIcon from '@/shared/components/AppIcon.vue'
import AppSwitcher from '@/shared/components/AppSwitcher.vue'
import LocaleSwitch from '@/shared/components/LocaleSwitch.vue'

const route = useRoute()
const { locale, t } = useI18n()
const activeApp = computed(() => readyApps.find((app) => route.path.startsWith(app.route)))
</script>

<template>
  <div class="app-shell">
    <header class="global-header">
      <RouterLink class="brand" to="/" aria-label="Biblia App">
        <span class="brand-mark" aria-hidden="true"><span /><i /></span>
        <span><strong>{{ t('brand') }}</strong><small v-if="activeApp">{{ localize(activeApp.title, locale) }}</small></span>
      </RouterLink>
      <div class="header-actions">
        <LocaleSwitch />
        <AppSwitcher />
      </div>
    </header>

    <main class="shell-main">
      <RouterView />
    </main>

    <nav class="mobile-navigation" aria-label="Primary">
      <RouterLink to="/"><AppIcon name="book" /><span>{{ t('home') }}</span></RouterLink>
      <RouterLink to="/calendar"><AppIcon name="calendar" /><span>{{ t('today') }}</span></RouterLink>
      <RouterLink to="/create"><AppIcon name="letters" /><span>{{ t('createOwn') }}</span></RouterLink>
    </nav>
  </div>
</template>
