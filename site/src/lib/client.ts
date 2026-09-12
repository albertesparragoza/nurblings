// Browser side of the marketing pages: the shared avatar theme (remembered
// between pages), repainting avatars, copy buttons, reveal on scroll, the
// header and the light/dark switch (shared with the docs).
import { type RenderOptions, THEMES } from './themes'

const STORE = 'nb-theme'
let current = 'default'

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const currentTheme = () => current
export const theme = () =>
  THEMES[current] ?? (THEMES.default as NonNullable<(typeof THEMES)['default']>)

/** Options for an avatar placeholder, from its data attributes. */
export function optionsOf(el: HTMLElement): RenderOptions {
  const d = el.dataset
  const animate =
    d.still !== undefined
      ? false
      : d.motion
        ? (JSON.parse(d.motion) as RenderOptions['animate'])
        : undefined
  return {
    size: Number(d.size ?? 64),
    background: (d.bg ?? 'circle') as RenderOptions['background'],
    title: d.title ?? d.seed ?? 'Nurbling',
    ...(d.transition ? { transition: d.transition } : {}),
    ...(d.mood ? { mood: d.mood as RenderOptions['mood'] } : {}),
    ...(d.frame ? { frame: d.frame as RenderOptions['frame'] } : {}),
    ...(animate !== undefined ? { animate } : {}),
  }
}

/** Draws one `[data-av]` placeholder with the current theme. */
export function repaint(el: HTMLElement) {
  el.innerHTML = theme().render(el.dataset.seed || ' ', optionsOf(el))
}

export function paint(root: ParentNode = document) {
  for (const el of root.querySelectorAll<HTMLElement>('[data-av]')) repaint(el)
}

export function applyTheme(id: string, save = true) {
  const next = THEMES[id] ? id : 'default'
  const changed = next !== current
  current = next
  document.documentElement.style.setProperty('--accent', theme().accent)
  for (const chip of document.querySelectorAll<HTMLElement>('[data-theme-chip]')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.themeChip === next))
  }
  if (changed) paint()
  if (save) {
    try {
      localStorage.setItem(STORE, next)
    } catch {}
  }
  document.dispatchEvent(new CustomEvent('nb-theme', { detail: next }))
}

async function copyFrom(el: HTMLElement) {
  const raw =
    el.dataset.copy ?? (el.dataset.copyUrl ? await (await fetch(el.dataset.copyUrl)).text() : '')
  await navigator.clipboard.writeText(raw.replaceAll('{origin}', location.origin))
  const label = el.querySelector<HTMLElement>('[data-copy-label]') ?? el
  const was = label.textContent
  label.textContent = 'Copied'
  setTimeout(() => {
    label.textContent = was
  }, 1400)
}

function reveal() {
  const els = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window)) {
    for (const el of els) el.classList.add('in')
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('in')
        io.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  )
  for (const el of els) io.observe(el)
}

export function boot() {
  let saved = 'default'
  try {
    saved = localStorage.getItem(STORE) ?? 'default'
  } catch {}
  applyTheme(saved, false)

  document.addEventListener('click', (event) => {
    const target = event.target as Element
    const chip = target.closest<HTMLElement>('[data-theme-chip]')
    if (chip) {
      const go = () => applyTheme(chip.dataset.themeChip ?? 'default')
      if ('startViewTransition' in document && !reducedMotion()) document.startViewTransition(go)
      else go()
    }
    const copy = target.closest<HTMLElement>('[data-copy], [data-copy-url]')
    if (copy) void copyFrom(copy)
  })

  for (const el of document.querySelectorAll<HTMLElement>('[data-origin]')) {
    el.textContent = (el.textContent ?? '').replaceAll('{origin}', location.origin)
  }

  const header = document.querySelector('.site-header')
  const onScroll = () => header?.classList.toggle('scrolled', scrollY > 8)
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  const mode = document.getElementById('mode-toggle')
  mode?.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark'
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem('starlight-theme', dark ? 'dark' : 'light')
    } catch {}
  })

  reveal()
}
