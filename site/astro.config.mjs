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

// Each doc opens with a `# title` for GitHub; Starlight prints the title
// itself, so the site drops the heading from the body.
function dropTitle() {
  return () => (tree) => {
    const i = tree.children.findIndex((node) => node.type === 'heading' && node.depth === 1)
    if (i !== -1) tree.children.splice(i, 1)
  }
}

export default defineConfig({
  // canonical URLs and the sitemap
  site: 'https://nurblings.com',
  redirects: { '/docs': '/docs/getting-started/', '/brand': '/nurbi/' },
  markdown: { remarkPlugins: [repoLinks(), dropTitle()] },
  integrations: [
    starlight({
      title: 'Nurblings',
      description: 'Deterministic SVG avatars that stay themselves, wear your brand and react.',
      logo: { src: './src/assets/nurbi.svg', alt: 'Nurbi' },
      favicon: '/favicon.svg',
      social: [{ icon: 'github', label: 'GitHub', href: REPO }],
      // entries sit at `../docs/*.md` relative to site/, so the base points
      // into site/ for the `..` to land back on the repository root
      editLink: { baseUrl: `${REPO}/edit/develop/site/` },
      // preloads the site fonts on docs pages too, so text never blinks in
      // the header and theme switch are the marketing pages' own; the docs end
      // at Starlight's own footer (edit link, previous and next page)
      components: {
        Head: './src/components/DocsHead.astro',
        Header: './src/components/DocsHeader.astro',
        ThemeSelect: './src/components/ModeToggle.astro',
      },
      customCss: [
        './src/styles/fonts.css',
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
            { label: "Nurbi's story", link: '/nurbi/' },
          ],
        },
      ],
    }),
  ],
})
