// Accessible tabs: roving tabindex, arrow keys, Home and End.
// `select` shows the panel for the chosen tab.
export function tabs(list: HTMLElement, select: (tab: HTMLElement) => void) {
  const all = () => [...list.querySelectorAll<HTMLElement>('[role="tab"]')]
  const activate = (tab: HTMLElement, focus: boolean) => {
    for (const t of all()) {
      const on = t === tab
      t.setAttribute('aria-selected', String(on))
      t.tabIndex = on ? 0 : -1
    }
    if (focus) tab.focus()
    select(tab)
  }
  for (const t of all()) t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1
  list.addEventListener('click', (event) => {
    const tab = (event.target as Element).closest<HTMLElement>('[role="tab"]')
    if (tab) activate(tab, false)
  })
  list.addEventListener('keydown', (event) => {
    const items = all()
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (i < 0) return
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 }[event.key]
    if (next === undefined) return
    event.preventDefault()
    const tab = items[(next + items.length) % items.length]
    if (tab) activate(tab, true)
  })
}
