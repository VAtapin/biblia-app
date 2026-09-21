import { describe, expect, it } from 'vitest'
import { scrollBehavior } from './scrollBehavior'

describe('Bible verse navigation', () => {
  it('keeps the page in place when only the selected verse changes', () => {
    expect(scrollBehavior(
      { path: '/scripture/ru/genesis/1', hash: '#v2' },
      { path: '/scripture/ru/genesis/1', hash: '#v1' },
    )).toBe(false)
  })

  it('scrolls to a verse when a chapter is opened through a direct link', () => {
    expect(scrollBehavior(
      { path: '/scripture/ru/genesis/1', hash: '#v2' },
      { path: '/scripture/ru/genesis/2', hash: '' },
    )).toEqual({ el: '#v2', top: 100 })
  })
})
