import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { translate, type MessageKey } from './messages'

export function useI18n() {
  const store = useLocaleStore()
  const { locale } = storeToRefs(store)

  return {
    locale,
    setLocale: store.setLocale,
    t: (key: MessageKey): string => translate(locale.value, key),
  }
}
