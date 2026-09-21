<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { readyApps } from '@/registry/features'
import AppIcon from './AppIcon.vue'

const open = ref(false)
const { locale, t } = useI18n()
</script>

<template>
  <button class="switcher-trigger" type="button" :aria-label="t('allApps')" :aria-expanded="open" @click="open = true">
    <span class="switcher-grid" aria-hidden="true"><i v-for="n in 9" :key="n" /></span>
    <span>{{ t('allApps') }}</span>
  </button>

  <Teleport to="body">
    <div v-if="open" class="dialog-backdrop" @click.self="open = false">
      <section class="app-switcher-dialog" role="dialog" aria-modal="true" :aria-label="t('allApps')">
        <header>
          <h2>{{ t('allApps') }}</h2>
          <button class="icon-button" type="button" :aria-label="t('close')" @click="open = false">×</button>
        </header>
        <div class="switcher-list">
          <RouterLink v-for="app in readyApps" :key="app.id" :to="app.route" @click="open = false">
            <span class="feature-icon"><AppIcon :name="app.icon" /></span>
            <span><strong>{{ localize(app.title, locale) }}</strong><small>{{ localize(app.description, locale) }}</small></span>
          </RouterLink>
        </div>
        <RouterLink class="primary-button switcher-compose" to="/create" @click="open = false">
          {{ t('createOwn') }}
        </RouterLink>
      </section>
    </div>
  </Teleport>
</template>
