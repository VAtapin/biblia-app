<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { localize } from '@/domain/localization'
import { useI18n } from '@/i18n/useI18n'
import { readyApps } from '@/registry/features'
import type { CalendarDay, CalendarEvent } from '@/services/api/contracts'
import { bibleDesktopApi } from '@/services/api/bibleDesktopApi'
import AsyncNotice from '@/shared/components/AsyncNotice.vue'
import SectionHeader from '@/shared/components/SectionHeader.vue'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const app = readyApps.find((item) => item.id === 'calendar')!
const selectedDate = ref(routeDate() ?? localDate())
const day = ref<CalendarDay | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const formattedDate = computed(() => new Intl.DateTimeFormat(locale.value === 'de' ? 'de-DE' : 'ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${selectedDate.value}T12:00:00`)))

function localDate(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function routeDate(): string | null {
  const value = Array.isArray(route.params.date) ? route.params.date[0] : route.params.date
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function eventTitle(event: CalendarEvent): string {
  return event.name ?? event.title ?? ''
}

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    day.value = await bibleDesktopApi.calendarDay(selectedDate.value, locale.value)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : t('apiUnavailable')
  } finally {
    loading.value = false
  }
}

async function selectDate(): Promise<void> {
  if (routeDate() === selectedDate.value) {
    await load()
    return
  }
  await router.replace({ name: 'calendar-date', params: { date: selectedDate.value } })
}

watch(locale, load)
watch(() => route.params.date, () => {
  const date = routeDate()
  if (!date) return
  selectedDate.value = date
  void load()
})
onMounted(load)
</script>

<template>
  <div class="page app-page calendar-page">
    <SectionHeader :title="localize(app.title, locale)" :description="localize(app.description, locale)" icon="calendar" :eyebrow="t('dataFrom')" />
    <section class="date-strip">
      <div><small>{{ t('chooseDate') }}</small><strong>{{ formattedDate }}</strong></div>
      <input v-model="selectedDate" type="date" min="1900-01-01" max="2200-12-31" @change="selectDate" />
    </section>
    <AsyncNotice :loading="loading" :error="error" @retry="load" />
    <div v-if="day && !loading && !error" class="calendar-layout">
      <section class="calendar-primary workspace-card">
        <div class="workspace-toolbar"><div><h2>{{ t('events') }}</h2><span class="count-badge">{{ day.events.length }}</span></div></div>
        <div class="event-list">
          <article v-for="event in day.events" :key="event.id"><span class="event-marker" /><div><h3>{{ eventTitle(event) }}</h3><p v-if="event.description">{{ event.description }}</p></div></article>
        </div>
      </section>
      <aside class="calendar-aside">
        <section class="mini-panel"><h2>{{ t('fasting') }}</h2><p v-for="event in day.fasting_events" :key="event.id">{{ eventTitle(event) }}</p><p v-if="!day.fasting_events.length">—</p></section>
        <section class="mini-panel"><h2>{{ t('readings') }}</h2><p v-for="reading in day.readings" :key="reading.id">{{ reading.title }}</p><p v-if="!day.readings.length">—</p></section>
      </aside>
    </div>
  </div>
</template>
