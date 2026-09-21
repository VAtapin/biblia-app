import { describe, expect, it } from 'vitest'
import { domainLocale } from './locale'

describe('domainLocale', () => {
  it('uses German only for the German project domain', () => {
    expect(domainLocale('biblia-app.de')).toBe('de')
    expect(domainLocale('www.biblia-app.de')).toBe('de')
    expect(domainLocale('biblia-app.ru')).toBe('ru')
    expect(domainLocale('localhost')).toBe('ru')
  })
})
