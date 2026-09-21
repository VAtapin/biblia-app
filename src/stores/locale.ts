import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Locale } from '@/domain/localization'

const storageKey = 'biblia-app.locale'

function domainLocale(hostname: string): Locale {
  return hostname === 'biblia-app.de' || hostname.endsWith('.biblia-app.de') ? 'de' : 'ru'
}

function initialLocale(): Locale {
  if (typeof window === 'undefined') return 'ru'
  const stored = window.localStorage.getItem(storageKey)
  return stored === 'ru' || stored === 'de' ? stored : domainLocale(window.location.hostname)
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>(initialLocale())

  function setLocale(value: Locale): void {
    locale.value = value
    if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, value)
  }

  return { locale, setLocale }
})

export { domainLocale }
