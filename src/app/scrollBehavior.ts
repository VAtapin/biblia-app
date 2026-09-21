export function scrollBehavior(to: { path: string; hash: string }, from: { path: string; hash: string }) {
  if (to.path === from.path && to.hash !== from.hash) return false
  return to.hash ? { el: to.hash, top: 100 } : { top: 0 }
}
