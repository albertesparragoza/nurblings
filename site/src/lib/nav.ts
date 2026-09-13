// One source for the site chrome, so the marketing pages and the docs show the
// same header links and the same footer.
export const REPO = 'https://github.com/albertesparragoza/nurblings'

/** Header links, in order. */
export const NAV = [
  ['Docs', '/docs/getting-started/'],
  ['Playground', '/playground/'],
  ['Gallery', '/gallery/'],
  ['AI skill', '/ai/'],
] as const

/** Footer columns. */
export const FOOTER = [
  {
    title: 'Docs',
    links: [
      ['Getting started', '/docs/getting-started/'],
      ['Customising', '/docs/customising/'],
      ['Motion', '/docs/motion/'],
      ['API reference', '/docs/api/'],
    ],
  },
  {
    title: 'Explore',
    links: [
      ['Playground', '/playground/'],
      ['Gallery', '/gallery/'],
      ['AI skill', '/ai/'],
      ['Meet Nurbi', '/brand/'],
    ],
  },
  {
    title: 'Project',
    links: [
      ['GitHub', REPO],
      ['Releases', `${REPO}/releases`],
      ['Security', `${REPO}/blob/develop/SECURITY.md`],
      ['Trademarks', `${REPO}/blob/develop/TRADEMARKS.md`],
    ],
  },
] as const

/** Docs is active on every /docs/ page. */
export const isActive = (href: string, path: string) =>
  href.startsWith('/docs/') ? path.startsWith('/docs/') : path === href
