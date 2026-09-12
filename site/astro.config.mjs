import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

const REPO = 'https://github.com/albertesparragoza/nurblings'

// The docs are written for GitHub, where `api.md` and `../TRADEMARKS.md` are
// relative files. On the site the pages live at /docs/<name>/, so point sibling
// pages at their route and everything above docs/ at the repository.
function repoLinks() {
  const visit = (node) => {
    if (node.type === 'link') {
      node.url = node.url
        .replace(/^(?:\.\/)?([\w-]+)\.md(#.*)?$/, '/docs/$1/$2')
        .replace(/^\.\.\/(.+)$/, `${REPO}/blob/develop/$1`)
    }
    node.children?.forEach(visit)
  }
  return () => visit
}

export default defineConfig({
  // ponytail: no `site` until the domain is chosen; add it then for canonical URLs and the sitemap.
  redirects: { '/docs': '/docs/getting-started/' },
  markdown: { remarkPlugins: [repoLinks()] },
  integrations: [
    starlight({
      title: 'Nurblings',
      description: 'Deterministic SVG avatars that stay themselves, wear your brand and react.',
      logo: { src: './src/assets/nurbi.svg', alt: 'Nurbi' },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: REPO }],
      editLink: { baseUrl: `${REPO}/edit/develop/` },
      customCss: [
        '@fontsource-variable/bricolage-grotesque',
        '@fontsource-variable/dm-sans',
        '@fontsource-variable/geist-mono',
        './src/styles/tokens.css',
        './src/styles/starlight.css',
      ],
      sidebar: [
        { label: 'Start here', items: [{ slug: 'docs/getting-started' }] },
        { label: 'Guides', items: [{ slug: 'docs/motion' }, { slug: 'docs/customising' }] },
        { label: 'Reference', items: [{ slug: 'docs/api' }] },
        {
          label: 'More',
          items: [
            { label: 'Home', link: '/' },
            { label: 'Playground', link: '/playground/' },
            { label: 'Gallery', link: '/gallery/' },
            { label: 'AI skill', link: '/ai/' },
            { label: 'Nurbi and the brand', link: '/brand/' },
          ],
        },
      ],
    }),
  ],
})
